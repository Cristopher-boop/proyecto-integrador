from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import ArchivoFuenteSerializer, ObservacionBiomedicaSerializer
from .services import ArchivoFuenteService, ObservacionBiomedicaService
from apps.users.permissions import (
    CanUploadClinicalDocuments,
    CanModifyObservations,
    CanAccessExpertSystem,
    CanAccessReports,
)
from apps.users.services import AuditLogService
from apps.clinical.application.use_cases import (
    GetExpertSystemDataUseCase,
    GetDashboardStatsUseCase,
    GetReportsAnalyticsUseCase,
    ExportReportsUseCase,
)


class ArchivoUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [CanUploadClinicalDocuments]

    def get(self, request, id_admision=None):
        target_admision = id_admision or request.query_params.get('admision_id')
        if not target_admision:
            return Response({"error": "Falta admision_id"}, status=status.HTTP_400_BAD_REQUEST)

        archivos = ArchivoFuenteService.obtener_por_admision(target_admision)
        serializer = ArchivoFuenteSerializer(archivos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        """Recibe el archivo Multipart y delega al servicio."""
        archivo_fisico = request.FILES.get('archivo_fisico')
        tipo_documento = request.data.get('tipo_documento')
        numero_episodio = request.data.get('numero_episodio')

        if not all([archivo_fisico, tipo_documento, numero_episodio]):
            return Response({"error": "Faltan datos obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            archivo = ArchivoFuenteService.crear_archivo_fisico(archivo_fisico, tipo_documento, numero_episodio)
            
            # Registrar auditoría detallada de vinculación de documento a paciente/episodio
            paciente_nombre = ""
            if archivo.admision and archivo.admision.paciente:
                paciente_nombre = f" del paciente {archivo.admision.paciente.apellidos} {archivo.admision.paciente.nombres}"
            
            AuditLogService.registrar(
                request=request,
                accion='VINCULAR_DOCUMENTO_EPISODIO',
                modulo='INGESTA',
                descripcion=(
                    f"Subió y vinculó el documento '{archivo.nombre_archivo}' ({archivo.tipo_documento}) "
                    f"al episodio {numero_episodio}{paciente_nombre}."
                )
            )

            serializer = ArchivoFuenteSerializer(archivo)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)


class ObservacionBiomedicaListCreateAPIView(APIView):
    permission_classes = [CanModifyObservations]

    def get(self, request, id_admision=None):
        """Atiende al Laboratorio Principal (por episodio) o al Visualizador (por archivo)."""
        archivo_id = request.query_params.get('archivo_fuente')
        if archivo_id:
            observaciones = ObservacionBiomedicaService.obtener_por_archivo(archivo_id)
            serializer = ObservacionBiomedicaSerializer(observaciones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif id_admision:
            observaciones = ObservacionBiomedicaService.obtener_por_admision(id_admision)
            serializer = ObservacionBiomedicaSerializer(observaciones, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            {"error": "Se requiere id_admision en la URL o ?archivo_fuente en la query"},
            status=status.HTTP_400_BAD_REQUEST
        )

    def post(self, request):
        """Recibe lista de observaciones biomédicas y ejecuta inserción masiva."""
        if not isinstance(request.data, list):
            return Response({"error": "Se espera una lista de objetos JSON (Array)"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ObservacionBiomedicaSerializer(data=request.data, many=True)
        if serializer.is_valid():
            ObservacionBiomedicaService.crear_multiples_observaciones(serializer.validated_data)
            
            AuditLogService.registrar(
                request=request,
                accion='CREACION',
                modulo='LABORATORIOS',
                descripcion=f"Registró masivamente {len(serializer.validated_data)} resultados biomédicos."
            )

            return Response(
                {"mensaje": f"Se guardaron {len(serializer.validated_data)} resultados biomédicos exitosamente."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ObservacionBiomedicaDetailAPIView(APIView):
    permission_classes = [CanModifyObservations]

    def get(self, request, pk):
        observacion = ObservacionBiomedicaService.obtener_por_id(pk)
        if not observacion:
            return Response({"error": "Resultado no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        return Response(ObservacionBiomedicaSerializer(observacion).data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        observacion = ObservacionBiomedicaService.obtener_por_id(pk)
        if not observacion:
            return Response({"error": "Resultado no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ObservacionBiomedicaSerializer(observacion, data=request.data, partial=True)
        if serializer.is_valid():
            obs_act = ObservacionBiomedicaService.actualizar_observacion(observacion, serializer.validated_data)
            param_nombre = obs_act.parametro_biomedico.nombre if obs_act.parametro_biomedico else f"ID {pk}"
            
            AuditLogService.registrar(
                request=request,
                accion='EDICION',
                modulo='LABORATORIOS',
                descripcion=f"Modificó el resultado de '{param_nombre}' (ID: {pk}) a valor '{obs_act.valor_numerico}'."
            )

            return Response(ObservacionBiomedicaSerializer(obs_act).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        observacion = ObservacionBiomedicaService.obtener_por_id(pk)
        if not observacion:
            return Response({"error": "Resultado no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        param_nombre = observacion.parametro_biomedico.nombre if observacion.parametro_biomedico else f"ID {pk}"
        ObservacionBiomedicaService.eliminar_observacion(observacion)

        AuditLogService.registrar(
            request=request,
            accion='ELIMINACION',
            modulo='LABORATORIOS',
            descripcion=f"Eliminó el resultado de '{param_nombre}' (ID: {pk})."
        )

        return Response({"mensaje": "Resultado clínico eliminado correctamente"}, status=status.HTTP_200_OK)


class ArchivoProcesarOCRAPIView(APIView):
    permission_classes = [CanUploadClinicalDocuments]

    def post(self, request, pk):
        """Inicia el procesamiento OCR del archivo físico."""
        archivo = ArchivoFuenteService.obtener_por_id(pk)
        if not archivo:
            return Response({"error": "Archivo no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        try:
            cantidad_registros = ArchivoFuenteService.procesar_ocr_archivo(archivo)
            
            AuditLogService.registrar(
                request=request,
                accion='PROCESAR_OCR',
                modulo='INGESTA',
                descripcion=(
                    f"Procesó OCR para el documento '{archivo.nombre_archivo}' "
                    f"(Episodio {archivo.admision.numero_episodio}). Se extrajeron {cantidad_registros} resultados."
                )
            )

            if cantidad_registros == 0:
                return Response({
                    "mensaje": "El procesamiento finalizó sin detectar nuevos parámetros biomédicos conocidos."
                }, status=status.HTTP_200_OK)

            return Response({
                "mensaje": f"¡Éxito! Se extrajeron y procesaron {cantidad_registros} resultados biomédicos."
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error interno en procesamiento: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExpertSystemDataAPIView(APIView):
    """Endpoint delegado que expone hechos y puntajes inferidos del episodio clínico."""
    permission_classes = [CanAccessExpertSystem]

    def get(self, request):
        numero_episodio = request.query_params.get('numero_episodio')
        if not numero_episodio:
            return Response({"error": "Falta el parámetro numero_episodio"}, status=status.HTTP_400_BAD_REQUEST)

        payload = GetExpertSystemDataUseCase.execute(numero_episodio)
        if payload is None:
            return Response({"error": "Episodio clínico no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        return Response(payload, status=status.HTTP_200_OK)


class DashboardGlobalStatsAPIView(APIView):
    """Endpoint delegado de analítica global para el dashboard principal."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            payload = GetDashboardStatsUseCase.execute()
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error al calcular estadísticas: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ReportsDataAPIView(APIView):
    """Endpoint delegado de Inteligencia de Negocios y Analítica Avanzada."""
    permission_classes = [CanAccessReports]

    def get(self, request):
        try:
            payload = GetReportsAnalyticsUseCase.execute()
            return Response(payload, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"Error al calcular reportes: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExportReportsAPIView(APIView):
    """Endpoint delegado para generación y descarga de reportes Excel (.xlsx) o PDF (.pdf)."""
    permission_classes = [CanAccessReports]

    def get(self, request):
        report_type = request.query_params.get('type', 'pacientes')
        try:
            buffer, content_type, filename = ExportReportsUseCase.execute(report_type)
            
            AuditLogService.registrar(
                request=request,
                accion='EXPORTACION',
                modulo='REPORTES',
                descripcion=f"Exportó reporte clínico '{filename}' (tipo: {report_type})."
            )

            response = HttpResponse(buffer.getvalue(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        except Exception as e:
            return Response({"error": f"Error al exportar reporte: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)