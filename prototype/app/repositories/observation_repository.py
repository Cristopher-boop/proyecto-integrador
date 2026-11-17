from sqlalchemy import text
from prototype.app.db import engine


class ObservationRepository:

    @staticmethod
    def get_latest_creatinine(admission_id):

        query = text("""
            SELECT valor_numerico
            FROM clinical_observacionbiomedica
            WHERE admision_id = :admission_id
            AND LOWER(parametro) LIKE '%creatinine%'
            ORDER BY fecha_hora_registro DESC
            LIMIT 1
        """)

        with engine.connect() as conn:
            result = conn.execute(
                query,
                {"admission_id": admission_id}
            ).fetchone()

        return result