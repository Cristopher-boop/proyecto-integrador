import re
import unicodedata
from django.utils import timezone
from .models import (
    CatComorbilidad, CatSoporte, CatDiagnostico,
    ComorbilidadAdmision, SoporteAdmision, DiagnosticoEpisodio
)

class SistemaExpertoService:
    """
    Servicio de Minería de Texto (NLP Determinista + Fuzzy Matching)
    AISLADO del resto de la lógica de archivos físicos.
    """
    
    @staticmethod
    def _normalizar_texto(texto):
        if not texto: return ""
        texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
        texto = texto.lower()
        texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
        return re.sub(r'\s+', ' ', texto).strip()

    @classmethod
    def extraer_y_guardar_hechos(cls, id_admision, id_archivo, texto_crudo, tipo_nota):
        """
        Analiza el texto de NA o NE y guarda los hallazgos en la BD.
        Retorna un diccionario con la cantidad de elementos encontrados.
        """
        texto_norm = cls._normalizar_texto(texto_crudo)
        resultados = {"comorbilidades": 0, "soportes": 0, "diagnosticos": 0}

        # --- 1. COMORBILIDADES ---
        for item in CatComorbilidad.objects.all():
            nombre_norm = cls._normalizar_texto(item.nombre)
            claves = [cls._normalizar_texto(k.strip()) for k in item.palabras_clave.split(',')] if item.palabras_clave else []
            
            match = False
            if nombre_norm and len(nombre_norm) > 4 and nombre_norm in texto_norm: 
                match = True
            else:
                for clave in claves:
                    if clave and len(clave) > 2 and re.search(rf'\b{clave}\b', texto_norm):
                        match = True
                        break
            
            if match:
                ComorbilidadAdmision.objects.get_or_create(
                    admision_id=id_admision,
                    comorbilidad=item,
                    defaults={
                        'presente': True,
                        'archivo_fuente_id': id_archivo,
                        'descripcion_original': f'Extraído auto de {tipo_nota}'
                    }
                )
                resultados["comorbilidades"] += 1

        # --- 2. SOPORTES --- 
        for item in CatSoporte.objects.all():
            nombre_norm = cls._normalizar_texto(item.nombre)
            claves = [cls._normalizar_texto(k.strip()) for k in item.palabras_clave.split(',')] if item.palabras_clave else []
            
            match = False
            if nombre_norm and len(nombre_norm) > 4 and nombre_norm in texto_norm: 
                match = True
            else:
                for clave in claves:
                    if clave and len(clave) > 2 and re.search(rf'\b{clave}\b', texto_norm):
                        match = True
                        break
            
            if match:
                SoporteAdmision.objects.get_or_create(
                    admision_id=id_admision,
                    soporte=item,
                    defaults={'en_primeras_24h': (tipo_nota == 'NA')}
                )
                resultados["soportes"] += 1

        # --- 3. DIAGNÓSTICOS ---
        for item in CatDiagnostico.objects.all():
            nombre_norm = cls._normalizar_texto(item.nombre_diagnostico)
            claves = [cls._normalizar_texto(k.strip()) for k in item.palabras_clave.split(',')] if item.palabras_clave else []
            
            match = False
            if nombre_norm and len(nombre_norm) > 4 and nombre_norm in texto_norm: 
                match = True
            else:
                for clave in claves:
                    if clave and len(clave) > 2 and re.search(rf'\b{clave}\b', texto_norm):
                        match = True
                        break
            
            if match:
                DiagnosticoEpisodio.objects.get_or_create(
                    admision_id=id_admision,
                    catalogo_dx=item,
                    defaults={
                        'es_inferido': True,
                        'confianza_ia': 0.85,
                        'auditado_por_medico': False,
                        'creado_en': timezone.now()
                    }
                )
                resultados["diagnosticos"] += 1

        return resultados