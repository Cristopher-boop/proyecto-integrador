from apps.clinical.application.use_cases.evaluate_patient_scores_use_case import EvaluatePatientScoresUseCase
from apps.clinical.models import PuntajesEpisodio


class MotorInferenciaService:
    """
    Fachada de Inferencia Clínica compatible con llamadas previas.
    Delega en los Casos de Uso y Calculadores de Clean Architecture.
    """

    @classmethod
    def calcular_sofa(cls, id_admision):
        """Calcula o actualiza el score SOFA delegando en EvaluatePatientScoresUseCase."""
        resultado = EvaluatePatientScoresUseCase.execute(id_admision)
        if "error" in resultado:
            return None
        return PuntajesEpisodio.objects.filter(admision_id=id_admision).first()

    @classmethod
    def calcular_saps3(cls, id_admision):
        """Calcula o actualiza el puntaje SAPS 3 delegando en EvaluatePatientScoresUseCase."""
        resultado = EvaluatePatientScoresUseCase.execute(id_admision)
        if "error" in resultado:
            return None
        return PuntajesEpisodio.objects.filter(admision_id=id_admision).first()

    @classmethod
    def evaluar_episodio_completo(cls, id_admision):
        """Evalúa SOFA, SAPS 3 y Reglas de Inferencia Clínica en un solo pase."""
        return EvaluatePatientScoresUseCase.execute(id_admision)