import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import ArchivoFuenteSerializer, ObservacionBiomedicaSerializer
from .services import ArchivoFuenteService, ObservacionBiomedicaService
from .models import Admision, ComorbilidadAdmision, SoporteAdmision, DiagnosticoEpisodio, PuntajesEpisodio

class ArchivoUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        admision_id = request.query_params.get('admision_id')
        if not admision_id:
            return Response({"error": "Falta admision_id"}, status=status.HTTP_400_BAD_REQUEST)
            
        archivos = ArchivoFuenteService.obtener_por_admision(admision_id)
        serializer = ArchivoFuenteSerializer(archivos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Recibe el Multipart desde el Drag&Drop y delega al Servicio"""
        archivo_fisico = request.FILES.get('archivo_fisico')
        tipo_documento = request.data.get('tipo_documento')
        numero_episodio = request.data.get('numero_episodio')

        if not all([archivo_fisico, tipo_documento, numero_episodio]):
            return Response({"error": "Faltan datos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            archivo = ArchivoFuenteService.crear_archivo_fisico(archivo_fisico, tipo_documento, numero_episodio)
            serializer = ArchivoFuenteSerializer(archivo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        
class ObservacionBiomedicaListCreateAPIView(APIView):
    # FIX: Ponemos id_admision=None para que sea opcional
    def get(self, request, id_admision=None):
        """Atiende al Laboratorio Principal (por episodio) o al Visualizador (por archivo)"""
        
        # 1. ¿El Frontend está pidiendo datos de un PDF específico? (Split-Screen)
        archivo_id = request.query_params.get('archivo_fuente')
        if archivo_id:
            observaciones = ObservacionBiomedicaService.obtener_por_archivo(archivo_id)
            serializer = ObservacionBiomedicaSerializer(observaciones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # 2. ¿El Frontend está pidiendo todos los datos de un episodio? (Laboratorio Principal)
        elif id_admision:
            observaciones = ObservacionBiomedicaService.obtener_por_admision(id_admision)
            serializer = ObservacionBiomedicaSerializer(observaciones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        # 3. Si no mandan nada, devolvemos error
        return Response(
            {"error": "Se requiere id_admision en la URL o ?archivo_fuente en la query"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    def post(self, request):
        """El OCR llama a esta ruta: Recibe una LISTA de resultados médicos y los inserta de golpe."""
        if not isinstance(request.data, list):
            return Response({"error": "Se espera una lista de objetos JSON (Array)"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ObservacionBiomedicaSerializer(data=request.data, many=True)
        if serializer.is_valid():
            ObservacionBiomedicaService.crear_multiples_observaciones(serializer.validated_data)
            return Response(
                {"mensaje": f"El OCR guardó {len(serializer.validated_data)} resultados biomédicos exitosamente."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ObservacionBiomedicaDetailAPIView(APIView):
    def get(self, request, pk):
        """Ver el detalle de un resultado biomédico"""
        observacion = ObservacionBiomedicaService.obtener_por_id(pk)
        if not observacion:
            return Response({"error": "Resultado no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ObservacionBiomedicaSerializer(observacion).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """CORRECCIÓN MANUAL: Actualizar un dato que el OCR leyó mal"""
        observacion = ObservacionBiomedicaService.obtener_por_id(pk)
        if not observacion:
            return Response({"error": "Resultado no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ObservacionBiomedicaSerializer(observacion, data=request.data, partial=True)
        if serializer.is_valid():
            obs_act = ObservacionBiomedicaService.actualizar_observacion(observacion, serializer.validated_data)
            return Response(ObservacionBiomedicaSerializer(obs_act).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """ELIMINACIÓN: Borrar un dato inventado por el OCR"""
        observacion = ObservacionBiomedicaService.obtener_por_id(pk)
        if not observacion:
            return Response({"error": "Resultado no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        ObservacionBiomedicaService.eliminar_observacion(observacion)
        return Response({"mensaje": "Resultado clínico eliminado correctamente"}, status=status.HTTP_200_OK)
    
class ArchivoProcesarOCRAPIView(APIView):
    ## permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        """Gatillo manual para iniciar la lectura OCR de un documento específico"""
        archivo = ArchivoFuenteService.obtener_por_id(pk)
        if not archivo:
            return Response({"error": "Archivo no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        try:
            cantidad_registros = ArchivoFuenteService.procesar_ocr_archivo(archivo)
            if cantidad_registros == 0:
                return Response({
                    "mensaje": "El OCR finalizó, pero no se detectaron parámetros médicos conocidos en este documento."
                }, status=status.HTTP_200_OK)
                
            return Response({
                "mensaje": f"¡Éxito! El motor OCR extrajo y guardó {cantidad_registros} resultados biomédicos."
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            print(f"\n❌ [ERROR 400] MOTIVO DEL RECHAZO: {str(e)}\n")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            print("\n🔥 [ERROR 500] CAÍDA DEL SERVIDOR:")
            traceback.print_exc() 
            return Response({"error": f"Error interno del motor OCR: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ExpertSystemDataAPIView(APIView):
    """
    Endpoint que expone la Base de Hechos completa y los puntajes inferidos
    de un episodio clínico para alimentar la Super-Vista.
    """
    def get(self, request):
        numero_episodio = request.query_params.get('numero_episodio')
        if not numero_episodio:
            return Response({"error": "Falta el parámetro numero_episodio"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Buscamos la admisión por su número de episodio
            admision = Admision.objects.get(numero_episodio=numero_episodio)
        except Admision.DoesNotExist:
            return Response({"error": "Episodio clínico no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # 1. Obtener puntajes inferidos matemáticamente
        puntajes = PuntajesEpisodio.objects.filter(admision_id=admision.id_admision).first()
        
        # 2. Obtener Comorbilidades detectadas por el NLP
        comorbilidades_qs = ComorbilidadAdmision.objects.filter(admision_id=admision.id_admision, presente=True).select_related('comorbilidad')
        comorbilidades = [
            {"nombre": c.comorbilidad.nombre, "categoria": c.comorbilidad.categoria}
            for c in comorbilidades_qs
        ]

        # 3. Obtener Soportes detectados por el NLP
        soportes_qs = SoporteAdmision.objects.filter(admision_id=admision.id_admision).select_related('soporte')
        soportes = [
            {"nombre": s.soporte.nombre, "categoria": s.soporte.categoria}
            for s in soportes_qs
        ]

        # 4. Obtener Diagnósticos extraídos
        diagnosticos_qs = DiagnosticoEpisodio.objects.filter(admision_id=admision.id_admision).select_related('catalogo_dx')
        diagnosticos = [
            {"nombre": d.catalogo_dx.nombre_diagnostico}
            for d in diagnosticos_qs
        ]

        # Construimos el payload unificado de respuesta real
        payload = {
            "sofa": puntajes.sofa_total if puntajes else 0,
            "saps3": puntajes.saps3_puntos if puntajes else 0,
            "mortalidad": puntajes.saps3_mortalidad_estimada if puntajes else 0.0,
            "datosInsuficientes": puntajes.datos_insuficientes if puntajes else True,
            "comorbilidades": comorbilidades,
            "soportes": soportes,
            "diagnosticos": diagnosticos
        }

        return Response(payload, status=status.HTTP_200_OK)