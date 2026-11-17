from prototype.app.repositories.observation_repository import ObservationRepository
from prototype.app.repositories.medication_repository import MedicationRepository
from prototype.app.expert.inference_engine import InferenceEngine


class InferenceService:

    @staticmethod
    def infer(admission_id):

        creatinine = ObservationRepository.get_latest_creatinine(
            admission_id
        )

        medications = MedicationRepository.get_active_medications(
            admission_id
        )

        patient_data = {
            "creatinine": creatinine[0] if creatinine else None,
            "medications": medications
        }

        return InferenceEngine.run(patient_data)