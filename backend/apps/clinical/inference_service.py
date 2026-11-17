from django.utils import timezone
from decimal import Decimal
from .models import Admision, ObservacionBiomedica, SoporteAdmision, PuntajesEpisodio

class MotorInferenciaService:
    """
    Sistema Experto Matemático: Calcula scores de gravedad (SOFA, SAPS 3)
    consultando la Base de Hechos del paciente.
    """

    @staticmethod
    def _obtener_peor_valor(id_admision, parametros, buscar_minimo=True):
        """
        Busca en ObservacionBiomedica el peor valor registrado.
        buscar_minimo=True (ej. Glasgow, Plaquetas)
        buscar_minimo=False (ej. Creatinina, Bilirrubina)
        """
        observaciones = ObservacionBiomedica.objects.filter(
            admision_id=id_admision,
            parametro__in=parametros
        ).values_list('valor_numerico', flat=True)
        
        valores = [v for v in observaciones if v is not None]
        
        if not valores:
            return None
            
        return min(valores) if buscar_minimo else max(valores)

    @classmethod
    def calcular_sofa(cls, id_admision):
        """
        Calcula el SOFA Score (0 a 24 puntos) basado en las primeras 24h.
        """
        puntaje, sofa_res, sofa_coag, sofa_hep, sofa_cv, sofa_gcs, sofa_ren = 0, 0, 0, 0, 0, 0, 0
        datos_insuficientes = False

        # ---------------------------------------------------------
        # 1. RESPIRATORIO (PaO2/FiO2) y Soporte Ventilatorio
        # ---------------------------------------------------------
        # Nota: Idealmente necesitas el ratio PaO2/FiO2. Si el OCR extrae pO2, usaremos eso como proxy o necesitamos el ratio.
        po2 = cls._obtener_peor_valor(id_admision, ['pO2', 'PaO2'], buscar_minimo=True)
        tiene_ventilacion = SoporteAdmision.objects.filter(
            admision_id=id_admision, 
            soporte__categoria='Respiratory'
        ).exists()

        if po2 is not None:
            # Asumiendo que el valor extraído es el ratio o lo calculamos (Ejemplo simplificado)
            ratio = po2 # Aquí luego ajustaremos si tienes FiO2 por separado
            if ratio < 100 and tiene_ventilacion: sofa_res = 4
            elif ratio < 200 and tiene_ventilacion: sofa_res = 3
            elif ratio < 300: sofa_res = 2
            elif ratio < 400: sofa_res = 1
        else:
            datos_insuficientes = True

        # ---------------------------------------------------------
        # 2. COAGULACIÓN (Plaquetas x 10³/mm³)
        # ---------------------------------------------------------
        plaquetas = cls._obtener_peor_valor(id_admision, ['Plaquetas', 'Platelets'], buscar_minimo=True)
        if plaquetas is not None:
            if plaquetas < 20: sofa_coag = 4
            elif plaquetas < 50: sofa_coag = 3
            elif plaquetas < 100: sofa_coag = 2
            elif plaquetas < 150: sofa_coag = 1
        else:
            datos_insuficientes = True

        # ---------------------------------------------------------
        # 3. HEPÁTICO (Bilirrubina mg/dL)
        # ---------------------------------------------------------
        bilirrubina = cls._obtener_peor_valor(id_admision, ['Bilirrubina Total', 'Bilirrubina', 'Bilirubine totale'], buscar_minimo=False)
        if bilirrubina is not None:
            if bilirrubina >= 12.0: sofa_hep = 4
            elif bilirrubina >= 6.0: sofa_hep = 3
            elif bilirrubina >= 2.0: sofa_hep = 2
            elif bilirrubina >= 1.2: sofa_hep = 1
        else:
            datos_insuficientes = True

        # ---------------------------------------------------------
        # 4. CARDIOVASCULAR (Drogas vasoactivas)
        # ---------------------------------------------------------
        soportes_cv = SoporteAdmision.objects.filter(admision_id=id_admision, soporte__categoria='Cardiovascular')
        # Si el NLP detectó el uso de noradrenalina/dopamina:
        if soportes_cv.exists():
            # Asignamos un 3 o 4 genérico si hay soporte vasopresor detectado por NLP
            # (El cálculo exacto de dosis requiere datos muy granulares, asumiremos 3 por uso de Noradrenalina)
            sofa_cv = 3 
        else:
            # Si no hay drogas, evaluamos Presión Arterial Media (PAM / MAP) si existe
            pam = cls._obtener_peor_valor(id_admision, ['MAP', 'PAM', 'Presión Media'], buscar_minimo=True)
            if pam is not None and pam < 70:
                sofa_cv = 1

        # ---------------------------------------------------------
        # 5. NEUROLÓGICO (Escala de Glasgow)
        # ---------------------------------------------------------
        gcs = cls._obtener_peor_valor(id_admision, ['Glasgow', 'GCS'], buscar_minimo=True)
        if gcs is not None:
            if gcs < 6: sofa_gcs = 4
            elif gcs <= 9: sofa_gcs = 3
            elif gcs <= 12: sofa_gcs = 2
            elif gcs <= 14: sofa_gcs = 1
        else:
            datos_insuficientes = True

        # ---------------------------------------------------------
        # 6. RENAL (Creatinina mg/dL)
        # ---------------------------------------------------------
        creatinina = cls._obtener_peor_valor(id_admision, ['Creatinina', 'Créatinine'], buscar_minimo=False)
        tiene_dialisis = SoporteAdmision.objects.filter(admision_id=id_admision, soporte__categoria='Renal').exists()
        
        if tiene_dialisis:
            sofa_ren = 4
        elif creatinina is not None:
            if creatinina >= 5.0: sofa_ren = 4
            elif creatinina >= 3.5: sofa_ren = 3
            elif creatinina >= 2.0: sofa_ren = 2
            elif creatinina >= 1.2: sofa_ren = 1
        else:
            datos_insuficientes = True

        # SUMATORIA TOTAL
        sofa_total = sofa_res + sofa_coag + sofa_hep + sofa_cv + sofa_gcs + sofa_ren

        # GUARDAR EN BASE DE DATOS
        puntaje_obj, created = PuntajesEpisodio.objects.update_or_create(
            admision_id=id_admision,
            defaults={
                'sofa_respiratorio': sofa_res,
                'sofa_coagulacion': sofa_coag,
                'sofa_hepatico': sofa_hep,
                'sofa_cardiovascular': sofa_cv,
                'sofa_neurologico': sofa_gcs,
                'sofa_renal': sofa_ren,
                'sofa_total': sofa_total,
                'datos_insuficientes': datos_insuficientes,
                'ultima_actualizacion': timezone.now()
            }
        )

    @classmethod
    def calcular_saps3(cls, id_admision):
        """
        Calcula el puntaje SAPS 3 y estima la Tasa de Mortalidad.
        """
        import math
        from datetime import date
        from .models import Admision, ComorbilidadAdmision, PuntajesEpisodio

        try:
            # Traemos la admisión y los datos del paciente anidado
            admision = Admision.objects.select_related('paciente').get(pk=id_admision)
        except Admision.DoesNotExist:
            return None

        puntos = 0
        datos_insuficientes = False

        # =========================================================
        # CAJA 1: CARACTERÍSTICAS PREVIAS DEL PACIENTE
        # =========================================================
        # A) CÁLCULO DINÁMICO DE EDAD AL INGRESO
        try:
            fecha_nac = admision.paciente.fecha_nacimiento
            fecha_ingreso = admision.fecha_ingreso.date() if admision.fecha_ingreso else date.today()
            
            # Cálculo exacto de años
            edad = fecha_ingreso.year - fecha_nac.year - ((fecha_ingreso.month, fecha_ingreso.day) < (fecha_nac.month, fecha_nac.day))
            
            if edad >= 80: puntos += 18
            elif edad >= 75: puntos += 15
            elif edad >= 70: puntos += 13
            elif edad >= 60: puntos += 7
            elif edad >= 40: puntos += 5
        except Exception:
            pass # Si no hay fecha de nacimiento, no sumamos puntos.

        # B) COMORBILIDADES SEVERAS (SAPS 3 solo puntúa enfermedades graves específicas)
        comorbilidades = ComorbilidadAdmision.objects.filter(admision_id=id_admision).values_list('comorbilidad__categoria', 'comorbilidad__nombre')
        categorias_comorbilidad = [c[0] for c in comorbilidades]
        nombres_comorbilidad = [c[1] for c in comorbilidades]

        # Reglas oficiales del SAPS 3 mapeadas a tus categorías exactas:
        if "Solid tumor" in categorias_comorbilidad or "Hematological malignancy" in categorias_comorbilidad:
            puntos += 9
        if "Cirrhosis" in categorias_comorbilidad or "Hepatic failure" in categorias_comorbilidad:
            puntos += 14
        if "AIDS" in categorias_comorbilidad or "AIDS" in nombres_comorbilidad:
            puntos += 8
        if "Immunosuppression" in categorias_comorbilidad:
            puntos += 10
        if "Chronic heart failure (CHF)" in categorias_comorbilidad:
            puntos += 5

        # =========================================================
        # CAJA 2: VARIABLES FISIOLÓGICAS (Extraídas por OCR LAB/VIT)
        # =========================================================
        pas = cls._obtener_peor_valor(id_admision, ['PAS', 'Presión Sistólica', 'Systolic BP'], buscar_minimo=True)
        if pas is not None:
            if pas < 70: puntos += 11
            elif pas <= 119: puntos += 3
        else: datos_insuficientes = True

        fc = cls._obtener_peor_valor(id_admision, ['FC', 'Frecuencia Cardíaca', 'Heart Rate'], buscar_minimo=False)
        if fc is not None:
            if fc >= 160: puntos += 7
            elif fc >= 120: puntos += 5
        
        temp = cls._obtener_peor_valor(id_admision, ['Temp', 'Temperatura', 'Temperature'], buscar_minimo=False)
        if temp is not None:
            if temp >= 39.0: puntos += 3

        creatinina = cls._obtener_peor_valor(id_admision, ['Creatinina', 'Créatinine'], buscar_minimo=False)
        if creatinina is not None:
            if creatinina >= 3.5: puntos += 8
            elif creatinina >= 2.0: puntos += 2

        leucocitos = cls._obtener_peor_valor(id_admision, ['Glóbulos Blancos', 'WBC', 'Leucocytes'], buscar_minimo=False)
        if leucocitos is not None:
            if leucocitos >= 15.0: puntos += 2

        # =========================================================
        # CAJA 3: CÁLCULO ESTADÍSTICO DE MORTALIDAD
        # =========================================================
        mortalidad_estimada = 0.0
        try:
            # Ecuación logística estándar del SAPS 3
            logit = -32.6659 + (7.3068 * math.log(puntos + 20.5958))
            probabilidad = math.exp(logit) / (1 + math.exp(logit))
            mortalidad_estimada = round(probabilidad * 100, 2)
        except Exception:
            pass 

        # =========================================================
        # GUARDAR EN BASE DE DATOS
        # =========================================================
        puntaje_obj, created = PuntajesEpisodio.objects.update_or_create(
            admision_id=id_admision,
            defaults={
                'saps3_puntos': puntos,
                'saps3_mortalidad_estimada': mortalidad_estimada,
                'datos_insuficientes': datos_insuficientes,
                'ultima_actualizacion': timezone.now()
            }
        )

        return puntaje_obj