from django.test import TestCase
from apps.clinical.application.use_cases.export_reports_use_case import ExportReportsUseCase
from apps.clinical.application.use_cases.get_dashboard_stats_use_case import GetDashboardStatsUseCase
from apps.clinical.application.use_cases.get_reports_analytics_use_case import GetReportsAnalyticsUseCase
from apps.clinical.application.use_cases.get_expert_system_data_use_case import GetExpertSystemDataUseCase


class ClinicalUseCasesTestCase(TestCase):
    """
    Pruebas de orquestación de casos de uso del módulo clínico.
    (Excluyendo expresamente cualquier prueba sobre ingesta de datos u OCR).
    """

    def test_export_pdf_use_case(self):
        buffer, content_type, filename = ExportReportsUseCase.execute('auditoria_pdf')
        self.assertEqual(content_type, 'application/pdf')
        self.assertEqual(filename, 'Auditoria_IA_INAAQC.pdf')
        self.assertGreater(len(buffer.getvalue()), 0)

    def test_export_excel_use_case(self):
        buffer, content_type, filename = ExportReportsUseCase.execute('pacientes')
        self.assertEqual(content_type, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        self.assertEqual(filename, 'Reporte_INAAQC_Pacientes.xlsx')
        self.assertGreater(len(buffer.getvalue()), 0)

    def test_dashboard_stats_use_case_structure(self):
        stats = GetDashboardStatsUseCase.execute()
        self.assertIn('kpis', stats)
        self.assertIn('docTypesData', stats)
        self.assertIn('severityData', stats)
        self.assertIn('pacientes', stats['kpis'])
        self.assertIn('episodios', stats['kpis'])

    def test_reports_analytics_use_case_structure(self):
        reports = GetReportsAnalyticsUseCase.execute()
        self.assertIn('kpis', reports)
        self.assertIn('comorbiditiesData', reports)
        self.assertIn('sofaRadarData', reports)
        self.assertIn('mortalityData', reports)
        self.assertEqual(len(reports['sofaRadarData']), 6)

    def test_expert_system_data_nonexistent_episode(self):
        res = GetExpertSystemDataUseCase.execute('EPISODIO_INEXISTENTE_9999')
        self.assertIsNone(res)
