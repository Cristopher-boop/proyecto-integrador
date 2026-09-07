from typing import Optional, Dict, Any
from apps.clinical.models import (
    Admision, PuntajesEpisodio, ComorbilidadAdmision,
    SoporteAdmision, DiagnosticoEpisodio
)


class GetExpertSystemDataUseCase:
    """
    Caso de Uso: Recupera la base de hechos, comorbilidades, soportes
    y métricas inferidas para alimentar la vista del Sistema Experto en el Frontend.
    """

    @classmethod
    def execute(cls, numero_episodio: str) -> Optional[Dict[str, Any]]:
        try:
            admision = Admision.objects.get(numero_episodio=numero_episodio)
        except Admision.DoesNotExist:
            return None

        # 1. Obtener puntajes calculados
        puntajes = PuntajesEpisodio.objects.filter(admision_id=admision.id_admision).first()

        # 2. Comorbilidades detectadas
        comorbilidades_qs = ComorbilidadAdmision.objects.filter(
            admision_id=admision.id_admision,
            presente=True
        ).select_related('comorbilidad')

        comorbilidades = [
            {"nombre": c.comorbilidad.nombre, "categoria": c.comorbilidad.categoria}
            for c in comorbilidades_qs if c.comorbilidad
        ]

        # 3. Soportes clínicos
        soportes_qs = SoporteAdmision.objects.filter(
            admision_id=admision.id_admision
        ).select_related('soporte')

        soportes = [
            {"nombre": s.soporte.nombre, "categoria": s.soporte.categoria}
            for s in soportes_qs if s.soporte
        ]

        # 4. Diagnósticos extraídos o inferidos
        diagnosticos_qs = DiagnosticoEpisodio.objects.filter(
            admision_id=admision.id_admision
        ).select_related('catalogo_dx')

        diagnosticos = [
            {"nombre": d.catalogo_dx.nombre_diagnostico}
            for d in diagnosticos_qs if d.catalogo_dx
        ]

        return {
            "sofa": puntajes.sofa_total if puntajes else 0,
            "saps3": puntajes.saps3_puntos if puntajes else 0,
            "mortalidad": puntajes.saps3_mortalidad_estimada if puntajes else 0.0,
            "datosInsuficientes": puntajes.datos_insuficientes if puntajes else True,
            "comorbilidades": comorbilidades,
            "soportes": soportes,
            "diagnosticos": diagnosticos
        }
