from typing import Optional
from apps.clinical.domain.entities.clinical_entities import SofaScoreResult, PatientFacts


class SofaCalculator:
    """
    Calculador determinista del Sequential Organ Failure Assessment (SOFA).
    Puntuación de 0 a 24 puntos a través de 6 sistemas orgánicos.
    """

    @staticmethod
    def calculate_respiratory(pao2: Optional[float], tiene_ventilacion: bool = False) -> tuple[int, bool]:
        """
        Sub-score respiratorio (PaO2 o PaO2/FiO2 ratio).
        Retorna: (puntos, datos_insuficientes)
        """
        if pao2 is None:
            return 0, True

        val = float(pao2)
        if val < 100 and tiene_ventilacion:
            return 4, False
        if val < 200 and tiene_ventilacion:
            return 3, False
        if val < 300:
            return 2, False
        if val < 400:
            return 1, False
        return 0, False

    @staticmethod
    def calculate_coagulation(plaquetas: Optional[float]) -> tuple[int, bool]:
        """
        Sub-score hematológico/coagulación (Plaquetas x 10^3/mm^3).
        """
        if plaquetas is None:
            return 0, True

        val = float(plaquetas)
        if val < 20:
            return 4, False
        if val < 50:
            return 3, False
        if val < 100:
            return 2, False
        if val < 150:
            return 1, False
        return 0, False

    @staticmethod
    def calculate_hepatic(bilirrubina: Optional[float]) -> tuple[int, bool]:
        """
        Sub-score hepático (Bilirrubina mg/dL).
        """
        if bilirrubina is None:
            return 0, True

        val = float(bilirrubina)
        if val >= 12.0:
            return 4, False
        if val >= 6.0:
            return 3, False
        if val >= 2.0:
            return 2, False
        if val >= 1.2:
            return 1, False
        return 0, False

    @staticmethod
    def calculate_cardiovascular(tiene_vasoactivos: bool = False, pam: Optional[float] = None) -> tuple[int, bool]:
        """
        Sub-score cardiovascular (Vasopresores / Presión Arterial Media).
        """
        if tiene_vasoactivos:
            return 3, False

        if pam is not None:
            if float(pam) < 70:
                return 1, False
            return 0, False

        return 0, False

    @staticmethod
    def calculate_neurological(gcs: Optional[float]) -> tuple[int, bool]:
        """
        Sub-score neurológico (Escala de Coma de Glasgow).
        """
        if gcs is None:
            return 0, True

        val = float(gcs)
        if val < 6:
            return 4, False
        if val <= 9:
            return 3, False
        if val <= 12:
            return 2, False
        if val <= 14:
            return 1, False
        return 0, False

    @staticmethod
    def calculate_renal(creatinina: Optional[float], tiene_dialisis: bool = False) -> tuple[int, bool]:
        """
        Sub-score renal (Creatinina mg/dL o diálisis).
        """
        if tiene_dialisis:
            return 4, False

        if creatinina is None:
            return 0, True

        val = float(creatinina)
        if val >= 5.0:
            return 4, False
        if val >= 3.5:
            return 3, False
        if val >= 2.0:
            return 2, False
        if val >= 1.2:
            return 1, False
        return 0, False

    @classmethod
    def calculate(cls, facts: PatientFacts) -> SofaScoreResult:
        """
        Calcula el score SOFA completo integrando los 6 subsistemas.
        """
        sofa_res, ins_res = cls.calculate_respiratory(facts.pao2, facts.tiene_ventilacion)
        sofa_coag, ins_coag = cls.calculate_coagulation(facts.plaquetas)
        sofa_hep, ins_hep = cls.calculate_hepatic(facts.bilirrubina)
        sofa_cv, _ = cls.calculate_cardiovascular(facts.tiene_vasoactivos, facts.pam)
        sofa_gcs, ins_gcs = cls.calculate_neurological(facts.gcs)
        sofa_ren, ins_ren = cls.calculate_renal(facts.creatinina, facts.tiene_dialisis)

        total = sofa_res + sofa_coag + sofa_hep + sofa_cv + sofa_gcs + sofa_ren
        datos_insuficientes = any([ins_res, ins_coag, ins_hep, ins_gcs, ins_ren])

        return SofaScoreResult(
            respiratorio=sofa_res,
            coagulacion=sofa_coag,
            hepatico=sofa_hep,
            cardiovascular=sofa_cv,
            neurologico=sofa_gcs,
            renal=sofa_ren,
            total=total,
            datos_insuficientes=datos_insuficientes,
        )
