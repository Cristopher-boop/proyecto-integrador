from typing import List
from apps.clinical.domain.entities.clinical_entities import ClinicalFinding, PatientFacts
from apps.clinical.domain.rules.renal_rules import RenalRules
from apps.clinical.domain.rules.cardiovascular_rules import CardiovascularRules
from apps.clinical.domain.rules.respiratory_rules import RespiratoryRules


class ClinicalInferenceEngine:
    """
    Motor de Inferencia de Reglas Clínicas Basado en Hechos.
    Orquesta la ejecución determinista de las reglas de los diferentes sistemas orgánicos.
    """

    @staticmethod
    def run(facts: PatientFacts) -> List[ClinicalFinding]:
        findings: List[ClinicalFinding] = []

        # 1. Reglas Renales
        aki = RenalRules.detect_aki_stage_3(
            creatinine=facts.creatinina,
            tiene_dialisis=facts.tiene_dialisis
        )
        if aki:
            findings.append(aki)

        # 2. Reglas Cardiovasculares
        shock = CardiovascularRules.detect_shock(
            medications=facts.medications,
            pam=facts.pam,
            tiene_soporte_cv=facts.tiene_vasoactivos
        )
        if shock:
            findings.append(shock)

        # 3. Reglas Respiratorias
        resp = RespiratoryRules.detect_respiratory_failure(
            pao2=facts.pao2,
            tiene_ventilacion=facts.tiene_ventilacion
        )
        if resp:
            findings.append(resp)

        return findings
