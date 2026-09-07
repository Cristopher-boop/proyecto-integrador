from django.test import SimpleTestCase
from apps.clinical.domain.entities.clinical_entities import PatientFacts
from apps.clinical.domain.calculators.saps3_calculator import Saps3Calculator


class Saps3CalculatorTestCase(SimpleTestCase):
    """Pruebas unitarias puras del calculador SAPS 3 (sin base de datos)."""

    def test_age_scoring(self):
        self.assertEqual(Saps3Calculator.calculate_age_points(None), 0)
        self.assertEqual(Saps3Calculator.calculate_age_points(35), 0)
        self.assertEqual(Saps3Calculator.calculate_age_points(45), 5)
        self.assertEqual(Saps3Calculator.calculate_age_points(65), 7)
        self.assertEqual(Saps3Calculator.calculate_age_points(72), 13)
        self.assertEqual(Saps3Calculator.calculate_age_points(77), 15)
        self.assertEqual(Saps3Calculator.calculate_age_points(85), 18)

    def test_comorbidity_scoring(self):
        # Cirrosis
        self.assertEqual(Saps3Calculator.calculate_comorbidity_points(["Cirrhosis"]), 14)
        # Inmunosupresión
        self.assertEqual(Saps3Calculator.calculate_comorbidity_points(["Immunosuppression"]), 10)
        # Tumor sólido
        self.assertEqual(Saps3Calculator.calculate_comorbidity_points(["Solid tumor"]), 9)
        # SIDA
        self.assertEqual(Saps3Calculator.calculate_comorbidity_points([], ["AIDS"]), 8)
        # Falla cardíaca (CHF)
        self.assertEqual(Saps3Calculator.calculate_comorbidity_points(["Chronic heart failure (CHF)"]), 5)
        # Sumatoria combinada
        combo = Saps3Calculator.calculate_comorbidity_points(
            ["Cirrhosis", "Solid tumor"],
            ["AIDS"]
        )
        self.assertEqual(combo, 14 + 9 + 8)

    def test_physiological_scoring(self):
        pts, ins = Saps3Calculator.calculate_physiological_points(
            pas=65.0,        # 11 pts (< 70)
            fc=165.0,        # 7 pts (>= 160)
            temp=39.5,       # 3 pts (>= 39)
            creatinina=4.0,  # 8 pts (>= 3.5)
            leucocitos=18.0  # 2 pts (>= 15)
        )
        self.assertEqual(pts, 11 + 7 + 3 + 8 + 2)
        self.assertFalse(ins)

        # Sin PAS debe marcar datos insuficientes
        pts_miss, ins_miss = Saps3Calculator.calculate_physiological_points(
            pas=None, fc=80.0, temp=36.5, creatinina=1.0, leucocitos=8.0
        )
        self.assertTrue(ins_miss)

    def test_mortality_logistic_formula(self):
        # Probabilidad de muerte debe ser un porcentaje válido entre 0% y 100%
        mort_baja = Saps3Calculator.calculate_mortality(10)
        mort_media = Saps3Calculator.calculate_mortality(50)
        mort_alta = Saps3Calculator.calculate_mortality(90)

        self.assertGreaterEqual(mort_baja, 0.0)
        self.assertLess(mort_baja, mort_media)
        self.assertLess(mort_media, mort_alta)
        self.assertLessEqual(mort_alta, 100.0)

    def test_full_saps3_calculation(self):
        facts = PatientFacts(
            edad=78,  # 15 pts
            comorbilidades_categorias=["Cirrhosis"],  # 14 pts
            pas=68.0,        # 11 pts
            fc=130.0,        # 5 pts
            temperatura=37.0, # 0 pts
            creatinina=2.5,  # 2 pts
            leucocitos=11.0  # 0 pts
        )
        res = Saps3Calculator.calculate(facts)
        esperado_puntos = 15 + 14 + 11 + 5 + 2
        self.assertEqual(res.puntos, esperado_puntos)
        self.assertGreater(res.mortalidad_estimada, 0.0)
        self.assertFalse(res.datos_insuficientes)
