import os
import requests
import tempfile
from django.conf import settings
from .models import ArchivoFuente, ObservacionBiomedica, Admision
from .ocr_engines.lab_cyberlab_engine import MotorIngestaClinica 
from .ocr_engines.vit_engine import MotorVitales 
from .ocr_engines.glas_engine import MotorGlasgow
from .ocr_engines.pul_engine import MotorPulmonar
from .ocr_engines.na_engine import MotorNotaAdmision
from .ocr_engines.ne_engine import MotorNotaEvolucion
from .nlp_service import SistemaExpertoService
from .inference_service import MotorInferenciaService

class ArchivoFuenteService:
    @staticmethod
    def crear_archivo_fisico(archivo_fisico, tipo_documento, numero_episodio):
        """Busca el episodio y guarda el archivo físico (Lógica de Negocio pura)"""
        try:
            admision = Admision.objects.get(numero_episodio=numero_episodio)
            return ArchivoFuente.objects.create(
                admision=admision,
                nombre_archivo=archivo_fisico.name,
                tipo_documento=tipo_documento,
                archivo_fisico=archivo_fisico
            )
        except Admision.DoesNotExist:
            raise ValueError(f"No se encontró el episodio médico: {numero_episodio}")

    @staticmethod
    def obtener_por_admision(id_admision):
        """Devuelve todos los archivos adjuntos a un episodio"""
        return ArchivoFuente.objects.filter(admision_id=id_admision)

    @staticmethod
    def obtener_por_id(pk):
        try:
            return ArchivoFuente.objects.get(pk=pk)
        except ArchivoFuente.DoesNotExist:
            return None

    @staticmethod
    def eliminar_archivo(archivo):
        archivo.delete()
        return True
    
    @staticmethod
    def procesar_ocr_archivo(archivo):
        if not archivo.archivo_fisico:
            raise ValueError("El registro no tiene un archivo físico asociado.")
        
        url_cloudinary = archivo.archivo_fisico.url
        tipo = archivo.tipo_documento
        id_admision = archivo.admision_id
        id_archivo = archivo.id_archivo
        
        # 1. FIX CLOUDINARY: Aseguramos que la URL sea válida para requests.get()
        if url_cloudinary.startswith('//'):
            url_cloudinary = 'https:' + url_cloudinary
        elif url_cloudinary.startswith('/media/'):
            raise ValueError("El archivo se guardó localmente en lugar de Cloudinary. Verifica las credenciales en settings.py")
        
        # 2. DESCARGA A ARCHIVO TEMPORAL
        try:
            respuesta = requests.get(url_cloudinary, stream=True)
            respuesta.raise_for_status()
            
            extension = os.path.splitext(archivo.nombre_archivo)[1]
            if not extension: 
                extension = ".pdf" # FIX: Seguro por si Cloudinary oculta la extensión
                
            with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as temp_file:
                for chunk in respuesta.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                ruta_temporal = temp_file.name
                
        except Exception as e:
            raise ValueError(f"Fallo al descargar el archivo desde Cloudinary. Error: {str(e)}")
        
        # 3. PROCESAMIENTO OCR 
        resultados_crudos = []
        resumen_experto = None

        try:
            if tipo == 'VIT':
                resultados_crudos = MotorVitales.procesar_imagen(ruta_temporal)
            elif tipo == 'LAB':
                resultados_crudos = MotorIngestaClinica.procesar_pdf(ruta_temporal) 
            elif tipo == 'PUL':
                resultados_crudos = MotorPulmonar.procesar_imagen(ruta_temporal)
            elif tipo == 'GLAS':
                resultados_crudos = MotorGlasgow.procesar_imagen(ruta_temporal)

            # ---> NUEVA RAMA NLP (NA y NE) <---
            elif tipo == 'NA':
                from .ocr_engines.na_engine import MotorNotaAdmision
                from .nlp_service import SistemaExpertoService
                
                texto_crudo = MotorNotaAdmision.procesar_pdf(ruta_temporal)
                resumen_experto = SistemaExpertoService.extraer_y_guardar_hechos(id_admision, id_archivo, texto_crudo, 'NA')
                
            elif tipo == 'NE':
                from .ocr_engines.ne_engine import MotorNotaEvolucion
                from .nlp_service import SistemaExpertoService
                
                texto_crudo = MotorNotaEvolucion.procesar_pdf(ruta_temporal)
                resumen_experto = SistemaExpertoService.extraer_y_guardar_hechos(id_admision, id_archivo, texto_crudo, 'NE')
            else:
                raise ValueError("Tipo de documento no soportado para procesamiento OCR automático.")
        finally:
            # LIMPIEZA OBLIGATORIA DEL TEMPORAL
            if os.path.exists(ruta_temporal):
                os.remove(ruta_temporal)

        # 4. GUARDADO EN BASE DE DATOS (Manejo bifurcado)
        if tipo in ['VIT', 'LAB', 'PUL', 'GLAS']:
            # Lógica original para datos estructurados
            observaciones_a_crear = []
            for res in resultados_crudos:
                obs = ObservacionBiomedica(
                    admision_id=id_admision, archivo_fuente_id=id_archivo,
                    parametro=res.get('parametro'), valor_numerico=res.get('valor_numerico'),
                    unidad_medida=res.get('unidad_medida'), rango_referencia_min=res.get('rango_referencia_min'),
                    rango_referencia_max=res.get('rango_referencia_max'), fecha_hora_registro=res.get('fecha_hora_registro'),
                    es_diario=res.get('es_diario', False)
                )
                observaciones_a_crear.append(obs)
            ObservacionBiomedica.objects.bulk_create(observaciones_a_crear)
            cantidad_extraida = len(observaciones_a_crear)
            
        elif tipo in ['NA', 'NE']:
            if resumen_experto:
                cantidad_extraida = sum(resumen_experto.values())
            else:
                cantidad_extraida = 0

        try:
            MotorInferenciaService.calcular_sofa(id_admision)
            MotorInferenciaService.calcular_saps3(id_admision)
        except Exception as e:
            print(f"⚠️ Aviso: Los scores no pudieron calcularse completamente: {str(e)}")

        archivo.tipo_documento = f"{tipo}_AUDITADO"
        archivo.save()

        return cantidad_extraida


class ObservacionBiomedicaService:
    @staticmethod
    def crear_observacion(datos_validados):
        """Inserta un solo parámetro (ej. Glucosa manual)"""
        return ObservacionBiomedica.objects.create(**datos_validados)

    @staticmethod
    def crear_multiples_observaciones(lista_datos_validados):
        """
        EL MOTOR DEL OCR: Recibe una lista de diccionarios con los resultados
        del laboratorio extraídos por la IA y los guarda todos de golpe (Bulk Insert).
        """
        observaciones = [ObservacionBiomedica(**datos) for datos in lista_datos_validados]
        return ObservacionBiomedica.objects.bulk_create(observaciones)

    @staticmethod
    def obtener_por_admision(id_admision):
        """Extrae todos los signos vitales/laboratorios para el Gráfico Longitudinal"""
        return ObservacionBiomedica.objects.filter(admision_id=id_admision).order_by('fecha_hora_registro')
    
    @staticmethod
    def obtener_por_archivo(id_archivo):
        """Extrae las observaciones vinculadas a un PDF/Imagen específico"""
        return ObservacionBiomedica.objects.filter(archivo_fuente_id=id_archivo).order_by('fecha_hora_registro')

    @staticmethod
    def obtener_por_id(pk):
        """Busca un resultado biomédico específico por su ID"""
        try:
            return ObservacionBiomedica.objects.get(pk=pk)
        except ObservacionBiomedica.DoesNotExist:
            return None

    @staticmethod
    def actualizar_observacion(observacion, datos_validados):
        """Permite al médico corregir errores del OCR (ej. cambiar 14.2 por 11.2)"""
        for campo, valor in datos_validados.items():
            setattr(observacion, campo, valor)
        observacion.save()
        return observacion

    @staticmethod
    def eliminar_observacion(observacion):
        """Borra un registro que el OCR haya leído por error"""
        observacion.delete()
        return True