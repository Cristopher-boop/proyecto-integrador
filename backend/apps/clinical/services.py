from apps.patients.models import Admision
from .models import ArchivoFuente, ObservacionBiomedica
from .ocr_service import MotorIngestaClinica

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
        """
        Toma el archivo físico, ejecuta el motor OCR determinista,
        le inyecta el ID de la admisión y guarda los resultados en bloque.
        Esta separación asegura que si el OCR falla, la API no colapse.
        """
        if not archivo.archivo_fisico:
            raise ValueError("El registro no tiene un archivo físico adjunto para procesar.")

        # 1. Extraer los datos crudos usando el motor
        ruta_absoluta = archivo.archivo_fisico.path
        resultados_crudos = MotorIngestaClinica.procesar_pdf(ruta_absoluta)

        if not resultados_crudos:
            return 0 # No se encontró nada para extraer

        # 2. Inyectar el ID de la admisión a cada diccionario de resultados
        id_admision = archivo.admision.pk
        id_archivo = archivo.pk
        
        for res in resultados_crudos:
            res['admision'] = id_admision
            res['archivo_fuente'] = id_archivo

        # 3. Guardar en bloque usando el servicio que ya teníamos
        # Importamos aquí para evitar referencias circulares si es necesario
        from .serializers import ObservacionBiomedicaSerializer
        
        serializer = ObservacionBiomedicaSerializer(data=resultados_crudos, many=True)
        if serializer.is_valid():
            # Inserción masiva
            from .models import ObservacionBiomedica
            observaciones = [ObservacionBiomedica(**datos) for datos in serializer.validated_data]
            ObservacionBiomedica.objects.bulk_create(observaciones)
            return len(observaciones)
        else:
            # Si el OCR extrajo algo mal formado, lanzamos error detallado
            raise ValueError(f"Fallo de validación en los datos extraídos: {serializer.errors}")


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