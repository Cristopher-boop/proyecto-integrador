class RespiratoryRules:

    @staticmethod
    def detect_respiratory_failure(pao2):

        if pao2 is None:
            return None

        if float(pao2) < 60:

            return {
                "diagnosis": "Acute Respiratory Failure",
                "confidence": 0.88,
                "reason": "PaO2 < 60 mmHg"
            }

        return None