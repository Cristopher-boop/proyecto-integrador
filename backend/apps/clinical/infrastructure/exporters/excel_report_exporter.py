import io
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from apps.clinical.models import Admision, PuntajesEpisodio, ObservacionBiomedica


class ExcelReportExporter:
    """
    Generador desacoplado de hojas de cálculo Excel (.xlsx)
    con formato institucional INAAQC.
    """

    FONT_HEADER = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    FILL_PRIMARY = PatternFill(start_color="1E3040", end_color="1E3040", fill_type="solid")
    FILL_ZEBRA = PatternFill(start_color="F2F5F8", end_color="F2F5F8", fill_type="solid")
    BORDER_THIN = Border(
        left=Side(style='thin', color='D9D9D9'),
        right=Side(style='thin', color='D9D9D9'),
        top=Side(style='thin', color='D9D9D9'),
        bottom=Side(style='thin', color='D9D9D9')
    )

    @classmethod
    def generate(cls, report_type: str) -> io.BytesIO:
        wb = openpyxl.Workbook()
        ws = wb.active

        if report_type == 'pacientes':
            cls._build_pacientes_sheet(ws)
        elif report_type == 'gravedad':
            cls._build_gravedad_sheet(ws)
        elif report_type == 'extracciones':
            cls._build_extracciones_sheet(ws)
        else:
            cls._build_pacientes_sheet(ws)

        # Auto-ajustar ancho de columnas
        for col in ws.columns:
            max_len = max((len(str(cell.value or '')) for cell in col), default=10)
            ws.column_dimensions[col[0].column_letter].width = max(max_len + 5, 12)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return output

    @classmethod
    def _build_pacientes_sheet(cls, ws):
        ws.title = "Pacientes y Admisiones"
        headers = ["Nº Episodio", "Nombre Paciente", "Fecha Ingreso UCI", "Estado de Ingesta"]
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.font = cls.FONT_HEADER
            cell.fill = cls.FILL_PRIMARY

        for row_num, adm in enumerate(Admision.objects.select_related('paciente').all(), 2):
            ws.cell(row=row_num, column=1, value=adm.numero_episodio).border = cls.BORDER_THIN
            nombre = f"{adm.paciente.nombres} {adm.paciente.apellidos}" if adm.paciente else "Desconocido"
            ws.cell(row=row_num, column=2, value=nombre).border = cls.BORDER_THIN
            fecha = adm.fecha_ingreso.strftime("%Y-%m-%d") if adm.fecha_ingreso else "-"
            ws.cell(row=row_num, column=3, value=fecha).border = cls.BORDER_THIN
            ws.cell(row=row_num, column=4, value="PROCESADO").border = cls.BORDER_THIN

            if row_num % 2 == 1:
                for c in range(1, 5):
                    ws.cell(row=row_num, column=c).fill = cls.FILL_ZEBRA

    @classmethod
    def _build_gravedad_sheet(cls, ws):
        ws.title = "Métricas de Severidad"
        headers = ["Nº Episodio", "SOFA Total", "SAPS 3 Puntos", "Mortalidad Estimada (%)"]
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.font = cls.FONT_HEADER
            cell.fill = cls.FILL_PRIMARY

        for row_num, p in enumerate(PuntajesEpisodio.objects.select_related('admision').all(), 2):
            num_ep = p.admision.numero_episodio if p.admision else "-"
            ws.cell(row=row_num, column=1, value=num_ep).border = cls.BORDER_THIN
            ws.cell(row=row_num, column=2, value=p.sofa_total).border = cls.BORDER_THIN
            ws.cell(row=row_num, column=3, value=p.saps3_puntos).border = cls.BORDER_THIN
            mort = (p.saps3_mortalidad_estimada / 100.0) if p.saps3_mortalidad_estimada else 0
            c_mort = ws.cell(row=row_num, column=4, value=mort)
            c_mort.border = cls.BORDER_THIN
            c_mort.number_format = "0.0%"

            if row_num % 2 == 1:
                for c in range(1, 5):
                    ws.cell(row=row_num, column=c).fill = cls.FILL_ZEBRA

    @classmethod
    def _build_extracciones_sheet(cls, ws):
        ws.title = "Datos Extraidos OCR"
        headers = ["Nº Episodio", "Fecha Registro", "Categoría", "Parámetro", "Valor", "Unidad", "Rango Ref."]
        for col_num, header in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_num, value=header)
            cell.font = cls.FONT_HEADER
            cell.fill = cls.FILL_PRIMARY
            cell.alignment = Alignment(horizontal="center")

        observaciones = ObservacionBiomedica.objects.select_related('admision').all().order_by('-fecha_hora_registro')
        for row_num, obs in enumerate(observaciones, 2):
            num_ep = obs.admision.numero_episodio if obs.admision else "-"
            ws.cell(row=row_num, column=1, value=num_ep).border = cls.BORDER_THIN
            fecha_str = obs.fecha_hora_registro.strftime("%Y-%m-%d %H:%M") if obs.fecha_hora_registro else "-"
            ws.cell(row=row_num, column=2, value=fecha_str).border = cls.BORDER_THIN
            ws.cell(row=row_num, column=3, value="LAB").border = cls.BORDER_THIN
            ws.cell(row=row_num, column=4, value=obs.parametro).border = cls.BORDER_THIN
            valor = float(obs.valor_numerico) if obs.valor_numerico is not None else 0
            ws.cell(row=row_num, column=5, value=valor).border = cls.BORDER_THIN
            ws.cell(row=row_num, column=6, value=obs.unidad_medida or "-").border = cls.BORDER_THIN
            rango_str = f"[{obs.rango_referencia_min} - {obs.rango_referencia_max}]" if obs.rango_referencia_min else "-"
            ws.cell(row=row_num, column=7, value=rango_str).border = cls.BORDER_THIN

            if row_num % 2 == 1:
                for col in range(1, 8):
                    ws.cell(row=row_num, column=col).fill = cls.FILL_ZEBRA
