from typing import Optional
from apps.clinical.domain.entities.clinical_entities import ClinicalFinding


class RenalRules:
    """Reglas de inferencia clínica para patologías y disfunciones renales."""

    @staticmethod
    def detect_aki_stage_3(
        creatinine: Optional[float],
        tiene_dialisis: bool = False
    ) -> Optional[ClinicalFinding]:
        """
        Detecta Injuria Renal Aguda (AKI) Estadio 3 según criterios KDIGO.
        Criterios: Creatinina sérica >= 4.0 mg/dL o terapia de reemplazo renal iniciada.
        """
        if tiene_dialisis:
            return ClinicalFinding(
                diagnosis="Acute Kidney Injury Stage 3",
                confidence=0.99,
                reason="Renal replacement therapy (Dialysis) active",
                category="Renal"
            )

        if creatinine is None:
            return None

        val = float(creatinine)
        if val >= 4.0:
            return ClinicalFinding(
                diagnosis="Acute Kidney Injury Stage 3",
                confidence=0.97,
                reason=f"Serum creatinine {val:.1f} mg/dL >= 4.0 mg/dL",
                category="Renal"
            )

        return None
