from fastapi import FastAPI
from prototype.app.services.inference_service import InferenceService

app = FastAPI()


@app.get("/infer/{admission_id}")
def infer_patient(admission_id: str):

    result = InferenceService.infer(admission_id)

    return {
        "admission_id": admission_id,
        "inferences": result
    }