class CardiovascularRules:

    @staticmethod
    def detect_shock(medications):

        vasoactive = [
            "Noradrenaline",
            "Dobutamine",
            "Adrenaline",
            "Dopamine",
            "Vasopressin"
        ]

        detected = [
            med for med in medications
            if med in vasoactive
        ]

        if detected:

            return {
                "diagnosis": "Shock",
                "confidence": 0.90,
                "reason": f"Vasoactive drugs detected: {detected}"
            }

        return None