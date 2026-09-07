from django.test import SimpleTestCase
from apps.clinical.domain.entities.clinical_entities import PatientFacts
from apps.clinical.domain.rules.renal_rules import RenalRules
from apps.clinical.domain.rules.cardiovascular_rules import CardiovascularRules
from apps.clinical.domain.rules.respiratory_rules import RespiratoryRules
from apps.clinical.domain.rules.clinical_inference_engine import ClinicalInferenceEngine


class ClinicalRulesTestCase(SimpleTestCase):
    """Pruebas unitarias de las reglas clínicas y motor de inferencia."""

    def test_renal_rules_aki_stage_3(self):
        # Creatinina >= 4.0
        finding = RenalRules.detect_aki_stage_3(creatinine=4.5)
        self.assertIsNotNone(finding)
        self.assertEqual(finding.diagnosis, "Acute Kidney Injury Stage 3")
        self.assertGreaterEqual(finding.confidence, 0.95)

        # Diálisis activa
        finding_dialysis = RenalRules.detect_aki_stage_3(creatinine=1.2, tiene_dialisis=True)
        self.assertIsNotNone(finding_dialysis)
        self.assertEqual(finding_dialysis.diagnosis, "Acute Kidney Injury Stage 3")

        # Creatinina normal
        finding_normal = RenalRules.detect_aki_stage_3(creatinine=1.1, tiene_dialisis=False)
        self.assertIsNone(finding_normal)

    def test_cardiovascular_rules_shock(self):
        # Drogas vasoactivas (noradrenalina)
        finding_med = CardiovascularRules.detect_shock(medications=["Noradrenaline", "Furosemide"])
        self.assertIsNotNone(finding_med)
        self.assertEqual(finding_med.diagnosis, "Shock")
        self.assertIn("Noradrenaline", finding_med.reason)

        # Dopamina en español
        finding_dopa = CardiovascularRules.detect_shock(medications=["dopamina"])
        self.assertIsNotNone(finding_dopa)
        self.assertEqual(finding_dopa.diagnosis, "Shock")

        # Hipotensión severa PAM < 65
        finding_pam = CardiovascularRules.detect_shock(medications=[], pam=58.0)
        self.assertIsNotNone(finding_pam)
        self.assertIn("Hypotension", finding_pam.diagnosis)

        # Estado cardiovascular normal
        finding_normal = CardiovascularRules.detect_shock(medications=["Omeprazol"], pam=85.0)
        self.assertIsNone(finding_normal)

    def test_respiratory_rules_acute_failure(self):
        # PaO2 crítica < 60
        finding_pao2 = RespiratoryRules.detect_respiratory_failure(pao2=52.0)
        self.assertIsNotNone(finding_pao2)
        self.assertEqual(finding_pao2.diagnosis, "Acute Respiratory Failure")

        # Soporte ventilatorio
        finding_vent = RespiratoryRules.detect_respiratory_failure(pao2=80.0, tiene_ventilacion=True)
        self.assertIsNotNone(finding_vent)
        self.assertIn("Mechanical Ventilation", finding_vent.diagnosis)

        # Respiratorio normal
        finding_normal = RespiratoryRules.detect_respiratory_failure(pao2=95.0, tiene_ventilacion=False)
        self.assertIsNone(finding_normal)

    def test_inference_engine_integration(self):
        facts = PatientFacts(
            pao2=55.0,                  # Insuficiencia respiratoria
            creatinina=4.8,             # AKI Stage 3
            medications=["Adrenaline"], # Shock
            pam=60.0
        )
        findings = ClinicalInferenceEngine.run(facts)
        diagnoses = [f.diagnosis for f in findings]

        self.assertEqual(len(findings), 3)
        self.assertIn("Acute Kidney Injury Stage 3", diagnoses)
        self.assertIn("Shock", diagnoses)
        self.assertIn("Acute Respiratory Failure", diagnoses)
