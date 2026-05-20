from app.expert.renal_rules import RenalRules
from app.expert.cardiovascular_rules import CardiovascularRules


class InferenceEngine:

    @staticmethod
    def run(patient_data):

        results = []

        aki = RenalRules.detect_aki_stage_3(
            patient_data.get("creatinine")
        )

        if aki:
            results.append(aki)

        shock = CardiovascularRules.detect_shock(
            patient_data.get("medications", [])
        )

        if shock:
            results.append(shock)

        return results