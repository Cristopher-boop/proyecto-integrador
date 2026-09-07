from typing import Optional, List
from apps.clinical.domain.entities.clinical_entities import ClinicalFinding


class CardiovascularRules:
    """Reglas de inferencia clínica para patologías hemodinámicas y cardiovasculares."""

    VASOACTIVE_DRUGS = {
        "noradrenaline", "norepinephrine", "noradrenalina",
        "dobutamine", "dobutamina",
        "adrenaline", "epinephrine", "adrenalina",
        "dopamine", "dopamina",
        "vasopressin", "vasopresina"
    }

    @classmethod
    def detect_shock(
        cls,
        medications: Optional[List[str]] = None,
        pam: Optional[float] = None,
        tiene_soporte_cv: bool = False
    ) -> Optional[ClinicalFinding]:
        """
        Detecta estado de Shock (Séptico, Cardiogénico o Distributivo).
        Criterios: Requerimiento de drogas vasoactivas o PAM persistente < 65-70 mmHg.
        """
        meds = medications or []
        detected_vasoactive = [
            m for m in meds
            if m.lower().strip() in cls.VASOACTIVE_DRUGS
        ]

        if detected_vasoactive:
            return ClinicalFinding(
                diagnosis="Shock",
                confidence=0.92,
                reason=f"Active vasoactive infusion detected: {', '.join(detected_vasoactive)}",
                category="Cardiovascular"
            )

        if tiene_soporte_cv:
            return ClinicalFinding(
                diagnosis="Shock",
                confidence=0.90,
                reason="Cardiovascular support recorded in clinical documentation",
                category="Cardiovascular"
            )

        if pam is not None and float(pam) < 65.0:
            return ClinicalFinding(
                diagnosis="Severe Hypotension / Shock State",
                confidence=0.85,
                reason=f"Mean Arterial Pressure (MAP) is critical ({pam:.1f} mmHg < 65 mmHg)",
                category="Cardiovascular"
            )

        return None
