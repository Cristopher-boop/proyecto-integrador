import math
from typing import Optional, List
from apps.clinical.domain.entities.clinical_entities import Saps3ScoreResult, PatientFacts


class Saps3Calculator:
    """
    Calculador determinista del Simplified Acute Physiology Score III (SAPS 3).
    Estima la probabilidad de mortalidad hospitalaria mediante modelo logístico estándar.
    """

    @staticmethod
    def calculate_age_points(edad: Optional[int]) -> int:
        if edad is None:
            return 0
        if edad >= 80:
            return 18
        if edad >= 75:
            return 15
        if edad >= 70:
            return 13
        if edad >= 60:
            return 7
        if edad >= 40:
            return 5
        return 0

    @staticmethod
    def calculate_comorbidity_points(
        categorias: List[str],
        nombres: Optional[List[str]] = None
    ) -> int:
        puntos = 0
        nombres_set = set(nombres or [])
        cat_set = set(categorias)

        # Cirrosis o falla hepática severa
        if "Cirrhosis" in cat_set or "Hepatic failure" in cat_set:
            puntos += 14

        # Inmunosupresión
        if "Immunosuppression" in cat_set:
            puntos += 10

        # Cáncer / Tumor sólido / Malignidad hematológica
        if "Solid tumor" in cat_set or "Hematological malignancy" in cat_set:
            puntos += 9

        # SIDA (en categorías o en nombres detectados)
        if "AIDS" in cat_set or "AIDS" in nombres_set:
            puntos += 8

        # Falla cardíaca crónica (CHF)
        if "Chronic heart failure (CHF)" in cat_set:
            puntos += 5

        return puntos

    @staticmethod
    def calculate_physiological_points(
        pas: Optional[float],
        fc: Optional[float],
        temp: Optional[float],
        creatinina: Optional[float],
        leucocitos: Optional[float],
    ) -> tuple[int, bool]:
        puntos = 0
        datos_insuficientes = False

        if pas is not None:
            val_pas = float(pas)
            if val_pas < 70:
                puntos += 11
            elif val_pas <= 119:
                puntos += 3
        else:
            datos_insuficientes = True

        if fc is not None:
            val_fc = float(fc)
            if val_fc >= 160:
                puntos += 7
            elif val_fc >= 120:
                puntos += 5

        if temp is not None:
            if float(temp) >= 39.0:
                puntos += 3

        if creatinina is not None:
            val_cr = float(creatinina)
            if val_cr >= 3.5:
                puntos += 8
            elif val_cr >= 2.0:
                puntos += 2

        if leucocitos is not None:
            if float(leucocitos) >= 15.0:
                puntos += 2

        return puntos, datos_insuficientes

    @staticmethod
    def calculate_mortality(puntos: int) -> float:
        """
        Aplica la ecuación logística internacional del SAPS 3:
        Logit = -32.6659 + 7.3068 * ln(Score + 20.5958)
        P(Muerte) = e^Logit / (1 + e^Logit)
        """
        try:
            logit = -32.6659 + (7.3068 * math.log(puntos + 20.5958))
            probabilidad = math.exp(logit) / (1.0 + math.exp(logit))
            return round(probabilidad * 100.0, 2)
        except (ValueError, OverflowError):
            return 0.0

    @classmethod
    def calculate(cls, facts: PatientFacts) -> Saps3ScoreResult:
        puntos_edad = cls.calculate_age_points(facts.edad)
        puntos_comorb = cls.calculate_comorbidity_points(
            facts.comorbilidades_categorias,
            facts.comorbilidades_nombres
        )
        puntos_fisio, datos_insuficientes = cls.calculate_physiological_points(
            facts.pas,
            facts.fc,
            facts.temperatura,
            facts.creatinina,
            facts.leucocitos
        )

        puntos_totales = puntos_edad + puntos_comorb + puntos_fisio
        mortalidad = cls.calculate_mortality(puntos_totales)

        return Saps3ScoreResult(
            puntos=puntos_totales,
            mortalidad_estimada=mortalidad,
            datos_insuficientes=datos_insuficientes,
        )
