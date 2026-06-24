class RenalRules:

    @staticmethod
    def detect_aki_stage_3(creatinine):

        if creatinine is None:
            return None

        if float(creatinine) >= 4.0:

            return {
                "diagnosis": "Acute Kidney Injury Stage 3",
                "confidence": 0.97,
                "reason": "Creatinine >= 4.0 mg/dL"
            }

        return None