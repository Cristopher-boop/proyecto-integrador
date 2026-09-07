from typing import Tuple
import io
from apps.clinical.infrastructure.exporters.excel_report_exporter import ExcelReportExporter
from apps.clinical.infrastructure.exporters.pdf_report_exporter import PdfReportExporter


class ExportReportsUseCase:
    """
    Caso de Uso: Orquesta la generación y exportación de reportes clínicos
    retornando (buffer_bytes, content_type, filename).
    """

    @classmethod
    def execute(cls, report_type: str = 'pacientes') -> Tuple[io.BytesIO, str, str]:
        if report_type == 'auditoria_pdf':
            buffer = PdfReportExporter.generate_audit_report()
            content_type = 'application/pdf'
            filename = 'Auditoria_IA_INAAQC.pdf'
            return buffer, content_type, filename

        # Por defecto Excel
        buffer = ExcelReportExporter.generate(report_type)
        content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        filename = f'Reporte_INAAQC_{report_type.capitalize()}.xlsx'
        return buffer, content_type, filename
