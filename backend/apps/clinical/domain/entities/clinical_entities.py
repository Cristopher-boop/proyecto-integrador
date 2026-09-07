from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any


@dataclass(frozen=True)
class SofaScoreResult:
    """Resultado del cálculo de falla orgánica secuencial (SOFA)."""
    respiratorio: int
    coagulacion: int
    hepatico: int
    cardiovascular: int
    neurologico: int
    renal: int
    total: int
    datos_insuficientes: bool


@dataclass(frozen=True)
class Saps3ScoreResult:
    """Resultado del puntaje de severidad fisiológica y mortalidad (SAPS 3)."""
    puntos: int
    mortalidad_estimada: float
    datos_insuficientes: bool


@dataclass(frozen=True)
class ClinicalFinding:
    """Hallazgo o diagnóstico inferido por el motor de reglas clínicas."""
    diagnosis: str
    confidence: float
    reason: str
    category: str = "general"


@dataclass
class PatientFacts:
    """Base de hechos fisiológicos y clínicos necesarios para la evaluación médica."""
    pao2: Optional[float] = None
    tiene_ventilacion: bool = False
    plaquetas: Optional[float] = None
    bilirrubina: Optional[float] = None
    tiene_vasoactivos: bool = False
    medications: List[str] = field(default_factory=list)
    pam: Optional[float] = None
    gcs: Optional[float] = None
    creatinina: Optional[float] = None
    tiene_dialisis: bool = False
    edad: Optional[int] = None
    pas: Optional[float] = None
    fc: Optional[float] = None
    temperatura: Optional[float] = None
    leucocitos: Optional[float] = None
    comorbilidades_categorias: List[str] = field(default_factory=list)
    comorbilidades_nombres: List[str] = field(default_factory=list)
