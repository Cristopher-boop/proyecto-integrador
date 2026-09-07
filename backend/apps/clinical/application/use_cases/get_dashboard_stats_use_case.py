from typing import Dict, Any
from django.db.models import Q
from apps.patients.models import Paciente
from apps.clinical.models import Admision, ArchivoFuente, ObservacionBiomedica, PuntajesEpisodio


class GetDashboardStatsUseCase:
    """
    Caso de Uso: Agrega métricas globales del hospital para alimentar
    el Dashboard principal (KPIs, Gráfico de Dona y Gráfico de Barras de Severidad).
    """

    @classmethod
    def execute(cls) -> Dict[str, Any]:
        # 1. KPIs GLOBALES
        total_pacientes = Paciente.objects.count()
        total_episodios = Admision.objects.count()
        total_archivos = ArchivoFuente.objects.count()
        total_inferencias = ObservacionBiomedica.objects.count() + PuntajesEpisodio.objects.count()

        # 2. DATOS PARA EL GRÁFICO DE DONA (Clasificación de archivos)
        labs = ArchivoFuente.objects.filter(tipo_documento__contains='LAB').count()
        notas = ArchivoFuente.objects.filter(
            Q(tipo_documento__contains='NA') | Q(tipo_documento__contains='NE')
        ).count()
        vitales = ArchivoFuente.objects.filter(tipo_documento__contains='VIT').count()
        escalas = ArchivoFuente.objects.filter(
            Q(tipo_documento__contains='GLAS') | Q(tipo_documento__contains='PUL')
        ).count()

        doc_types_data = [
            {"name": "Laboratorios (LAB)", "value": labs},
            {"name": "Notas Clínicas (NA/NE)", "value": notas},
            {"name": "Signos Vitales (VIT)", "value": vitales},
            {"name": "Escalas (GLAS/PUL)", "value": escalas},
        ]

        # 3. DATOS PARA EL GRÁFICO DE BARRAS (Gravedad SOFA Global)
        sofa_scores = PuntajesEpisodio.objects.values_list('sofa_total', flat=True)
        leve = sum(1 for s in sofa_scores if s is not None and s < 5)
        moderado = sum(1 for s in sofa_scores if s is not None and 5 <= s <= 9)
        grave = sum(1 for s in sofa_scores if s is not None and s > 9)

        severity_data = [
            {"name": "Leve (<5 pts)", "Pacientes": leve},
            {"name": "Moderado (5-9 pts)", "Pacientes": moderado},
            {"name": "Grave (>9 pts)", "Pacientes": grave},
        ]

        return {
            "kpis": {
                "pacientes": total_pacientes,
                "episodios": total_episodios,
                "archivos": total_archivos,
                "inferencias": total_inferencias
            },
            "docTypesData": doc_types_data,
            "severityData": severity_data
        }
