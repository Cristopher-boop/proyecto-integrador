from datetime import date
from django.utils import timezone
from apps.clinical.models import (
    Admision, ObservacionBiomedica, SoporteAdmision,
    ComorbilidadAdmision, PuntajesEpisodio, DiagnosticoEpisodio, CatDiagnostico
)
from apps.clinical.domain.entities.clinical_entities import PatientFacts
from apps.clinical.domain.calculators.sofa_calculator import SofaCalculator
from apps.clinical.domain.calculators.saps3_calculator import Saps3Calculator
from apps.clinical.domain.rules.clinical_inference_engine import ClinicalInferenceEngine


class EvaluatePatientScoresUseCase:
    """
    Caso de Uso: Evalúa integralmente los puntajes clínicos (SOFA, SAPS 3)
    y ejecuta el motor de reglas clínicas para un episodio de internación.
    """

    @classmethod
    def _obtener_peor_valor(cls, id_admision, parametros, buscar_minimo=True):
        observaciones = ObservacionBiomedica.objects.filter(
            admision_id=id_admision,
            parametro__in=parametros
        ).values_list('valor_numerico', flat=True)

        valores = [float(v) for v in observaciones if v is not None]
        if not valores:
            return None
        return min(valores) if buscar_minimo else max(valores)

    @classmethod
    def extract_patient_facts(cls, admision: Admision) -> PatientFacts:
        id_admision = admision.id_admision

        # 1. Valores de laboratorio y monitores
        pao2 = cls._obtener_peor_valor(id_admision, ['pO2', 'PaO2'], buscar_minimo=True)
        plaquetas = cls._obtener_peor_valor(id_admision, ['Plaquetas', 'Platelets'], buscar_minimo=True)
        bilirrubina = cls._obtener_peor_valor(
            id_admision,
            ['Bilirrubina Total', 'Bilirrubina', 'Bilirubine totale'],
            buscar_minimo=False
        )
        pam = cls._obtener_peor_valor(id_admision, ['MAP', 'PAM', 'Presión Media'], buscar_minimo=True)
        gcs = cls._obtener_peor_valor(id_admision, ['Glasgow', 'GCS'], buscar_minimo=True)
        creatinina = cls._obtener_peor_valor(id_admision, ['Creatinina', 'Créatinine'], buscar_minimo=False)

        pas = cls._obtener_peor_valor(id_admision, ['PAS', 'Presión Sistólica', 'Systolic BP'], buscar_minimo=True)
        fc = cls._obtener_peor_valor(id_admision, ['FC', 'Frecuencia Cardíaca', 'Heart Rate'], buscar_minimo=False)
        temperatura = cls._obtener_peor_valor(id_admision, ['Temp', 'Temperatura', 'Temperature'], buscar_minimo=False)
        leucocitos = cls._obtener_peor_valor(id_admision, ['Glóbulos Blancos', 'WBC', 'Leucocytes'], buscar_minimo=False)

        # 2. Soportes clínicos
        soportes = SoporteAdmision.objects.filter(admision_id=id_admision).select_related('soporte')
        tiene_ventilacion = any(s.soporte.categoria == 'Respiratory' for s in soportes if s.soporte)
        tiene_dialisis = any(s.soporte.categoria == 'Renal' for s in soportes if s.soporte)
        tiene_vasoactivos = any(s.soporte.categoria == 'Cardiovascular' for s in soportes if s.soporte)
        meds = [s.soporte.nombre for s in soportes if s.soporte]

        # 3. Comorbilidades
        comorbilidades_qs = ComorbilidadAdmision.objects.filter(
            admision_id=id_admision,
            presente=True
        ).select_related('comorbilidad')

        comorb_cat = [c.comorbilidad.categoria for c in comorbilidades_qs if c.comorbilidad and c.comorbilidad.categoria]
        comorb_nom = [c.comorbilidad.nombre for c in comorbilidades_qs if c.comorbilidad and c.comorbilidad.nombre]

        # 4. Cálculo de edad
        edad = None
        if admision.paciente and admision.paciente.fecha_nacimiento:
            fn = admision.paciente.fecha_nacimiento
            fi = admision.fecha_ingreso.date() if admision.fecha_ingreso else date.today()
            edad = fi.year - fn.year - ((fi.month, fi.day) < (fn.month, fn.day))

        return PatientFacts(
            pao2=pao2,
            tiene_ventilacion=tiene_ventilacion,
            plaquetas=plaquetas,
            bilirrubina=bilirrubina,
            tiene_vasoactivos=tiene_vasoactivos,
            medications=meds,
            pam=pam,
            gcs=gcs,
            creatinina=creatinina,
            tiene_dialisis=tiene_dialisis,
            edad=edad,
            pas=pas,
            fc=fc,
            temperatura=temperatura,
            leucocitos=leucocitos,
            comorbilidades_categorias=comorb_cat,
            comorbilidades_nombres=comorb_nom
        )

    @classmethod
    def execute(cls, id_admision) -> dict:
        try:
            admision = Admision.objects.select_related('paciente').get(pk=id_admision)
        except Admision.DoesNotExist:
            return {"error": "Admisión no encontrada"}

        facts = cls.extract_patient_facts(admision)

        # 1. Cálculos de Dominio Puro
        sofa_res = SofaCalculator.calculate(facts)
        saps3_res = Saps3Calculator.calculate(facts)
        findings = ClinicalInferenceEngine.run(facts)

        # 2. Persistencia en Django ORM
        datos_insuficientes = sofa_res.datos_insuficientes or saps3_res.datos_insuficientes

        puntaje_obj, _ = PuntajesEpisodio.objects.update_or_create(
            admision_id=id_admision,
            defaults={
                'sofa_respiratorio': sofa_res.respiratorio,
                'sofa_coagulacion': sofa_res.coagulacion,
                'sofa_hepatico': sofa_res.hepatico,
                'sofa_cardiovascular': sofa_res.cardiovascular,
                'sofa_neurologico': sofa_res.neurologico,
                'sofa_renal': sofa_res.renal,
                'sofa_total': sofa_res.total,
                'saps3_puntos': saps3_res.puntos,
                'saps3_mortalidad_estimada': saps3_res.mortalidad_estimada,
                'datos_insuficientes': datos_insuficientes,
                'ultima_actualizacion': timezone.now()
            }
        )

        # 3. Guardar diagnósticos inferidos por las reglas clínicas si no existen
        for finding in findings:
            cat_dx, _ = CatDiagnostico.objects.get_or_create(
                nombre_diagnostico=finding.diagnosis,
                defaults={'codigo_cie10': 'INF-01'}
            )
            DiagnosticoEpisodio.objects.get_or_create(
                admision_id=id_admision,
                catalogo_dx=cat_dx,
                defaults={
                    'es_inferido': True,
                    'confianza_ia': finding.confidence,
                    'auditado_por_medico': False,
                    'creado_en': timezone.now()
                }
            )

        return {
            "sofa": sofa_res,
            "saps3": saps3_res,
            "findings": findings,
            "puntaje_id": puntaje_obj.id_puntaje
        }
