from typing import Optional
from apps.clinical.domain.entities.clinical_entities import ClinicalFinding


class RespiratoryRules:
    """Reglas de inferencia clínica para patologías del sistema respiratorio."""

    @staticmethod
    def detect_respiratory_failure(
        pao2: Optional[float],
        tiene_ventilacion: bool = False
    ) -> Optional[ClinicalFinding]:
        """
        Detecta Insuficiencia Respiratoria Aguda.
        Criterios: PaO2 < 60 mmHg en sangre arterial o soporte invasivo ventilatorio.
        """
        if pao2 is not None and float(pao2) < 60.0:
            return ClinicalFinding(
                diagnosis="Acute Respiratory Failure",
                confidence=0.91,
                reason=f"Severe arterial hypoxemia (PaO2 {pao2:.1f} mmHg < 60 mmHg)",
                category="Respiratory"
            )

        if tiene_ventilacion:
            return ClinicalFinding(
                diagnosis="Acute Respiratory Failure (Mechanical Ventilation)",
                confidence=0.95,
                reason="Invasive/Non-invasive mechanical respiratory support active",
                category="Respiratory"
            )

        return None
