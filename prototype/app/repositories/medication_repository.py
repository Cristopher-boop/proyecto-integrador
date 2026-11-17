from sqlalchemy import text
from prototype.app.db import engine


class MedicationRepository:

    @staticmethod
    def get_active_medications(admission_id):

        query = text("""
            SELECT nombre
            FROM clinical_medicamentoadmision
            WHERE admision_id = :admission_id
        """)

        with engine.connect() as conn:
            results = conn.execute(
                query,
                {"admission_id": admission_id}
            ).fetchall()

        return [r[0] for r in results]