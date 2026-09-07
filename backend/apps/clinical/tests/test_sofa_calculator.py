from django.test import SimpleTestCase
from apps.clinical.domain.entities.clinical_entities import PatientFacts
from apps.clinical.domain.calculators.sofa_calculator import SofaCalculator


class SofaCalculatorTestCase(SimpleTestCase):
    """Pruebas unitarias puras del calculador SOFA (sin base de datos)."""

    def test_respiratory_scoring(self):
        # Normal
        pts, ins = SofaCalculator.calculate_respiratory(450.0, False)
        self.assertEqual(pts, 0)
        self.assertFalse(ins)

        # Grados progresivos
        pts, _ = SofaCalculator.calculate_respiratory(350.0, False)
        self.assertEqual(pts, 1)

        pts, _ = SofaCalculator.calculate_respiratory(250.0, False)
        self.assertEqual(pts, 2)

        # Con soporte ventilatorio
        pts, _ = SofaCalculator.calculate_respiratory(180.0, True)
        self.assertEqual(pts, 3)

        pts, _ = SofaCalculator.calculate_respiratory(90.0, True)
        self.assertEqual(pts, 4)

        # Sin ventilación, PaO2 < 100 da 2 puntos
        pts, _ = SofaCalculator.calculate_respiratory(90.0, False)
        self.assertEqual(pts, 2)

        # Valor nulo
        pts, ins = SofaCalculator.calculate_respiratory(None, False)
        self.assertEqual(pts, 0)
        self.assertTrue(ins)

    def test_coagulation_scoring(self):
        self.assertEqual(SofaCalculator.calculate_coagulation(200.0)[0], 0)
        self.assertEqual(SofaCalculator.calculate_coagulation(140.0)[0], 1)
        self.assertEqual(SofaCalculator.calculate_coagulation(80.0)[0], 2)
        self.assertEqual(SofaCalculator.calculate_coagulation(40.0)[0], 3)
        self.assertEqual(SofaCalculator.calculate_coagulation(15.0)[0], 4)

        pts, ins = SofaCalculator.calculate_coagulation(None)
        self.assertEqual(pts, 0)
        self.assertTrue(ins)

    def test_hepatic_scoring(self):
        self.assertEqual(SofaCalculator.calculate_hepatic(0.8)[0], 0)
        self.assertEqual(SofaCalculator.calculate_hepatic(1.5)[0], 1)
        self.assertEqual(SofaCalculator.calculate_hepatic(3.0)[0], 2)
        self.assertEqual(SofaCalculator.calculate_hepatic(8.0)[0], 3)
        self.assertEqual(SofaCalculator.calculate_hepatic(15.0)[0], 4)

        pts, ins = SofaCalculator.calculate_hepatic(None)
        self.assertEqual(pts, 0)
        self.assertTrue(ins)

    def test_cardiovascular_scoring(self):
        # Con vasopresores
        self.assertEqual(SofaCalculator.calculate_cardiovascular(tiene_vasoactivos=True)[0], 3)
        # Sin vasopresores, PAM < 70
        self.assertEqual(SofaCalculator.calculate_cardiovascular(tiene_vasoactivos=False, pam=60.0)[0], 1)
        # Sin vasopresores, PAM normal
        self.assertEqual(SofaCalculator.calculate_cardiovascular(tiene_vasoactivos=False, pam=85.0)[0], 0)

    def test_neurological_scoring(self):
        self.assertEqual(SofaCalculator.calculate_neurological(15)[0], 0)
        self.assertEqual(SofaCalculator.calculate_neurological(14)[0], 1)
        self.assertEqual(SofaCalculator.calculate_neurological(11)[0], 2)
        self.assertEqual(SofaCalculator.calculate_neurological(8)[0], 3)
        self.assertEqual(SofaCalculator.calculate_neurological(4)[0], 4)

        pts, ins = SofaCalculator.calculate_neurological(None)
        self.assertEqual(pts, 0)
        self.assertTrue(ins)

    def test_renal_scoring(self):
        self.assertEqual(SofaCalculator.calculate_renal(0.9, False)[0], 0)
        self.assertEqual(SofaCalculator.calculate_renal(1.5, False)[0], 1)
        self.assertEqual(SofaCalculator.calculate_renal(2.5, False)[0], 2)
        self.assertEqual(SofaCalculator.calculate_renal(4.0, False)[0], 3)
        self.assertEqual(SofaCalculator.calculate_renal(5.5, False)[0], 4)
        # Diálisis otorga 4 puntos directamente
        self.assertEqual(SofaCalculator.calculate_renal(1.0, tiene_dialisis=True)[0], 4)

        pts, ins = SofaCalculator.calculate_renal(None, False)
        self.assertEqual(pts, 0)
        self.assertTrue(ins)

    def test_total_sofa_calculation(self):
        facts = PatientFacts(
            pao2=85.0,
            tiene_ventilacion=True,  # 4 pts
            plaquetas=45.0,          # 3 pts
            bilirrubina=7.0,         # 3 pts
            tiene_vasoactivos=True,  # 3 pts
            gcs=5.0,                 # 4 pts
            creatinina=4.2,          # 3 pts
            tiene_dialisis=False
        )
        res = SofaCalculator.calculate(facts)
        self.assertEqual(res.respiratorio, 4)
        self.assertEqual(res.coagulacion, 3)
        self.assertEqual(res.hepatico, 3)
        self.assertEqual(res.cardiovascular, 3)
        self.assertEqual(res.neurologico, 4)
        self.assertEqual(res.renal, 3)
        self.assertEqual(res.total, 20)
        self.assertFalse(res.datos_insuficientes)

    def test_total_sofa_missing_data(self):
        facts = PatientFacts(
            pao2=None,
            plaquetas=100.0,
            bilirrubina=None,
            gcs=15.0,
            creatinina=1.0
        )
        res = SofaCalculator.calculate(facts)
        self.assertTrue(res.datos_insuficientes)
