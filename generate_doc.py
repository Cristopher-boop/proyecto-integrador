import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_full_document(output_path):
    doc = docx.Document()

    # Set page margins (2.0 cm for a clean layout)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette
    PRIMARY = RGBColor(27, 54, 93)     # Navy Blue
    SECONDARY = RGBColor(43, 84, 126)  # Steel Blue
    DARK_TEXT = RGBColor(33, 37, 41)   # Charcoal
    MUTED_TEXT = RGBColor(108, 117, 125)

    def style_paragraph(p, space_before=0, space_after=6, line_spacing=1.15):
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing

    def add_title(text, subtitle=None):
        p = doc.add_paragraph()
        style_paragraph(p, space_before=12, space_after=4)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(18)
        run.font.bold = True
        run.font.color.rgb = PRIMARY

        if subtitle:
            p2 = doc.add_paragraph()
            style_paragraph(p2, space_before=0, space_after=14)
            p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run2 = p2.add_run(subtitle)
            run2.font.name = 'Arial'
            run2.font.size = Pt(11)
            run2.font.italic = True
            run2.font.color.rgb = SECONDARY

    def add_heading1(text):
        p = doc.add_paragraph()
        style_paragraph(p, space_before=14, space_after=6)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = PRIMARY

    def add_heading2(text):
        p = doc.add_paragraph()
        style_paragraph(p, space_before=10, space_after=4)
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(11)
        run.font.bold = True
        run.font.color.rgb = SECONDARY

    def add_body(text, bold_prefix=None, italic=False):
        p = doc.add_paragraph()
        style_paragraph(p, space_before=0, space_after=4)
        if bold_prefix:
            run_b = p.add_run(bold_prefix)
            run_b.font.name = 'Arial'
            run_b.font.size = Pt(10)
            run_b.font.bold = True
            run_b.font.color.rgb = DARK_TEXT
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.italic = italic
        run.font.color.rgb = DARK_TEXT
        return p

    def add_callout(text, prefix="NOTA: "):
        table = doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.cell(0, 0)
        cell.width = Inches(6.9)
        tcPr = cell._tc.get_or_add_tcPr()
        # Light blue background
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="EBF3FA"/>')
        tcPr.append(shd)
        # Left blue border
        borders = parse_xml(f'''
            <w:tcBorders {nsdecls("w")}>
                <w:top w:val="none"/>
                <w:left w:val="single" w:sz="24" w:space="0" w:color="1B365D"/>
                <w:bottom w:val="none"/>
                <w:right w:val="none"/>
            </w:tcBorders>
        ''')
        tcPr.append(borders)
        p = cell.paragraphs[0]
        style_paragraph(p, space_before=4, space_after=4)
        r_pre = p.add_run(prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(9.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = PRIMARY
        r_txt = p.add_run(text)
        r_txt.font.name = 'Arial'
        r_txt.font.size = Pt(9.5)
        r_txt.font.color.rgb = DARK_TEXT
        doc.add_paragraph() # Spacing

    def format_table(table, col_widths, headers, data, align_right_cols=[]):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Header Row
        hdr_cells = table.rows[0].cells
        for i, title in enumerate(headers):
            hdr_cells[i].text = title
            hdr_cells[i].width = col_widths[i]
            p = hdr_cells[i].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if i in align_right_cols else WD_ALIGN_PARAGRAPH.LEFT
            style_paragraph(p, space_before=3, space_after=3)
            for r in p.runs:
                r.font.name = 'Arial'
                r.font.size = Pt(9.5)
                r.font.bold = True
                r.font.color.rgb = RGBColor(255, 255, 255)
            # Header cell background
            tcPr = hdr_cells[i]._tc.get_or_add_tcPr()
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="1B365D"/>')
            tcPr.append(shd)
            hdr_cells[i].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        # Data Rows
        for r_idx, row_data in enumerate(data):
            row_cells = table.add_row().cells
            bg_color = "F8F9FA" if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                row_cells[c_idx].text = str(val)
                row_cells[c_idx].width = col_widths[c_idx]
                p = row_cells[c_idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if c_idx in align_right_cols else WD_ALIGN_PARAGRAPH.LEFT
                style_paragraph(p, space_before=2, space_after=2)
                for r in p.runs:
                    r.font.name = 'Arial'
                    r.font.size = Pt(9)
                    if "TOTAL" in str(row_data[0]).upper() or "VME" in str(row_data[0]):
                        r.font.bold = True
                    r.font.color.rgb = DARK_TEXT
                tcPr = row_cells[c_idx]._tc.get_or_add_tcPr()
                shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{bg_color}"/>')
                tcPr.append(shd)
                row_cells[c_idx].vertical_alignment = WD_ALIGN_VERTICAL.CENTER

        # Borders
        for row in table.rows:
            for cell in row.cells:
                tcPr = cell._tc.get_or_add_tcPr()
                borders = parse_xml(f'''
                    <w:tcBorders {nsdecls("w")}>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="D3D3D3"/>
                    </w:tcBorders>
                ''')
                tcPr.append(borders)

    # ==================== CONTENIDO ====================
    add_title("EVALUACIÓN ECONÓMICA, ESTIMACIÓN DE SOFTWARE Y GESTIÓN DE PROYECTO",
              "Universidad Privada Franz Tamayo (UNIFRANZ) | Ingeniería de Sistemas | La Paz, Bolivia - Gestión 2026")

    # Ficha Técnica
    add_body("SISTEMA EXPERTO PARA LA GESTIÓN Y ANÁLISIS DE DATOS BIOMÉDICOS MEDIANTE REDES NEURONALES ARTIFICIALES", "Proyecto: ")
    add_body("Instituto Académico-Científico Quispe-Cornejo (INAAQC) - Dr. Armin Álvaro Quispe Cornejo (Hospital Universitario Erasme, Bruselas).", "Institución / Caso: ")
    add_body("Cristopher Diego Rodriguez Ayala", "Postulante: ")
    add_body("Scrum con Desarrollador Único multifuncional (asume roles de Product Owner [20%], Scrum Master [10%] y Developer [70%]).", "Marco de Trabajo: ")
    add_body("8 meses calendario (16 Sprints de 2 semanas, abarcando trabajo continuo desde el semestre anterior).", "Tiempo de Ejecución: ")
    add_body("11.9 KSLOC (~12,000 líneas lógicas en FastAPI, React, PyTorch, OCR Tesseract y PostgreSQL).", "Tamaño del Software: ")

    add_callout("En estricto cumplimiento de los requerimientos, no se contempla ningún costo de hardware (0.00 Bs.). La institución cuenta con laptops Mac, HP, Lenovo y red de alta velocidad (>100 Mbps). El presupuesto se concentra exclusivamente en capital intelectual, desarrollo, servicios cloud, validación médica y gestión de proyectos.",
                "PREMISA FUNDAMENTAL (EXCLUSIÓN TOTAL DE HARDWARE): ")

    # 1. COSTOS FIJOS Y VARIABLES
    add_heading1("1. ANÁLISIS DE COSTOS FIJOS Y VARIABLES (PRESUPUESTO GENERAL)")
    add_body("Los costos se dimensionaron de forma realista para un estudiante/tesista en Bolivia, evitando sobrecostos innecesarios:")

    add_heading2("A. Costos Fijos (CF) - 8 Meses")
    cf_headers = ["Concepto Fijo", "Detalle / Función", "Mensual (Bs.)", "Meses", "Total (Bs.)"]
    cf_widths = [Inches(1.8), Inches(2.5), Inches(1.0), Inches(0.6), Inches(1.0)]
    cf_data = [
        ["Honorario del Desarrollador", "Tesista único asumiendo roles PO, SM y Dev", "1,800.00", "8", "14,400.00"],
        ["Conectividad y Servicios", "Internet simétrico y electricidad del espacio técnico", "150.00", "8", "1,200.00"],
        ["TOTAL COSTOS FIJOS (CF)", "Obligaciones fijas durante los 8 meses", "1,950.00", "8", "15,600.00"]
    ]
    cf_table = doc.add_table(rows=1, cols=len(cf_headers))
    format_table(cf_table, cf_widths, cf_headers, cf_data, align_right_cols=[2, 3, 4])

    doc.add_paragraph()

    add_heading2("B. Costos Variables (CV) - 8 Meses")
    cv_headers = ["Rubro Variable", "Propósito en el Proyecto", "Monto (Bs.)", "Monto (USD)"]
    cv_widths = [Inches(2.2), Inches(2.7), Inches(1.0), Inches(1.0)]
    cv_data = [
        ["Cómputo Cloud GPU (Spot)", "Google Cloud / Colab Pro para entrenamiento de RNA", "1,200.00", "172.41"],
        ["Validación Clínica y Médica", "Sesiones de ingeniería del conocimiento con Dr. Armin", "800.00", "114.94"],
        ["Insumos y Pruebas Piloto", "Impresiones de protocolos, encuestas y manuales", "400.00", "57.47"],
        ["TOTAL COSTOS VARIABLES (CV)", "Gastos dependientes de la intensidad técnica", "2,400.00", "344.82"]
    ]
    cv_table = doc.add_table(rows=1, cols=len(cv_headers))
    format_table(cv_table, cv_widths, cv_headers, cv_data, align_right_cols=[2, 3])

    doc.add_paragraph()
    add_body("CT = CF + CV = 15,600.00 Bs. + 2,400.00 Bs. = 18,000.00 Bs. (2,586.21 USD)", "Costo Total de Desarrollo (CT): ")

    # 2. PORCENTAJE DE GANANCIA Y PRECIO
    add_heading1("2. PORCENTAJE DE GANANCIA Y PRECIO DE VENTA (ENFOQUE CIENTÍFICO)")
    add_body("El INAAQC es una entidad académica-científica sin fines de lucro. Por ello, la 'ganancia' no representa lucro privado mercantil, sino que se formula bajo dos perspectivas:")
    add_body("Fondo estatutario del 15% sobre el Costo Total (2,700.00 Bs.) destinado al reentrenamiento semestral de redes neuronales, contingencias técnicas y tasas de publicación Open Access.", "1. Margen de Sostenibilidad y Reserva I+D: ")
    add_body("El valor real de retorno se manifiesta en los pacientes procesados: reducción del tiempo de admisión de 25 minutos a menos de 45 segundos (97% de ahorro), virtual eliminación de errores de tipeo manual (<0.5%) y construcción de un biobanco digital para investigaciones internacionales con el Hospital Erasme.", "2. Ganancia en Activos de Datos de Pacientes: ")
    
    add_body("Precio = CT * (1 + 0.15) = 18,000.00 * 1.15 = 20,700.00 Bs. (2,974.14 USD)", "Precio de Venta del Software (Valoración Integral): ")

    # 3. COCOMO II Y FÓRMULAS DE PEP
    add_heading1("3. ESTIMACIÓN PARAMÉTRICA MEDIANTE COCOMO II Y FÓRMULAS DE PEP")
    add_body("Se realiza la doble estimación del proyecto y se verifica la concordancia matemática:")

    add_heading2("A. Estimación mediante COCOMO II (Post-Architecture)")
    add_body("Size = 11.9 KSLOC | Exponente de escala E = 1.04 | Productoria de multiplicadores de esfuerzo Prod(EM) = 0.12 (cronograma extendido, herramientas modernas y desarrollador único).", "Parámetros COCOMO II: ")
    add_body("PM = 2.94 * (11.9)^1.04 * 0.12 = 2.94 * 13.08 * 0.12 = 4.60 Personas-Mes", "Esfuerzo Calculado (PM): ")
    add_body("Precio_COCOMO = 4.60 PM * 4,550.00 Bs./mes = 20,930.00 Bs. (3,007.18 USD)", "Precio COCOMO II: ")

    add_heading2("B. Estimación mediante Fórmulas de PEP (Punto de Equilibrio del Proyecto)")
    add_body("Precio_PEP = (CF + CV) * 1.15 = 18,000.00 * 1.15 = 20,700.00 Bs.", "Precio por PEP con Margen (15%): ")
    add_body("PEP (en Bs.) = CF / [1 - (CV / Precio_PEP)] = 15,600 / [1 - (2,400 / 20,700)] = 15,600 / 0.884 = 17,647.00 Bs.", "Fórmula de Punto de Equilibrio (PEP): ")
    add_body("Dado que el Precio (20,700 Bs.) supera al PEP (17,647 Bs.), el proyecto cubre sus costos y genera el margen de reserva proyectado.", "Interpretación: ", italic=True)

    add_heading2("C. Comparación y Verificación del Umbral de Variación (<= 10%)")
    comp_headers = ["Método de Estimación", "Monto Calculado (Bs.)", "Monto (USD)", "Diferencia Absoluta", "Variación Relativa (%)"]
    comp_widths = [Inches(2.2), Inches(1.3), Inches(1.1), Inches(1.2), Inches(1.1)]
    comp_data = [
        ["Modelo Paramétrico COCOMO II", "20,930.00", "3,007.18", "+230.00 Bs.", "1.11%"],
        ["Fórmula de Precio y PEP", "20,700.00", "2,974.14", "Base", "0.00%"]
    ]
    comp_table = doc.add_table(rows=1, cols=len(comp_headers))
    format_table(comp_table, comp_widths, comp_headers, comp_data, align_right_cols=[1, 2, 3, 4])

    doc.add_paragraph()
    add_body("Variación % = (|20,930.00 - 20,700.00| / 20,700.00) * 100% = (230 / 20,700) * 100% = 1.11%", "Cálculo de Variación: ")
    add_body("1.11% <= 10.00%  -->  CUMPLE ESTRICTAMENTE LA CONDICIÓN DE TOLERANCIA", "Resultado: ", italic=True)

    # 4. RIESGOS Y SENSIBILIDAD
    add_heading1("4. ANÁLISIS DE RIESGOS Y SENSIBILIDAD")

    add_heading2("A. Matriz de Riesgos del Proyecto")
    risk_headers = ["ID", "Riesgo Técnico / Operativo", "Prob.", "Imp.", "Nivel", "Estrategia de Mitigación"]
    risk_widths = [Inches(0.5), Inches(2.2), Inches(0.6), Inches(0.6), Inches(0.8), Inches(2.2)]
    risk_data = [
        ["R1", "Degradación en escaneos OCR (ruido visual)", "0.4", "0.8", "0.32 (Medio)", "Filtros OpenCV (binarización Otsu y contraste)"],
        ["R2", "Overfitting en Redes Neuronales", "0.3", "0.8", "0.24 (Medio)", "Regularización Dropout y validación cruzada k-fold"],
        ["R3", "Sobrecarga del desarrollador único (Scrum)", "0.4", "0.5", "0.20 (Bajo)", "Sprints de 2 semanas y priorización MoSCoW"],
        ["R4", "Sobregasto de créditos en Cloud GPU", "0.2", "0.4", "0.08 (Bajo)", "Uso de instancias Spot y preentrenamiento local"]
    ]
    risk_table = doc.add_table(rows=1, cols=len(risk_headers))
    format_table(risk_table, risk_widths, risk_headers, risk_data, align_right_cols=[2, 3])

    doc.add_paragraph()

    add_heading2("B. Análisis de Sensibilidad")
    add_body("CV sube a 3,120 Bs. --> Costo Total = 18,720 Bs. --> Nuevo Precio = 21,528 Bs. (Variación de solo +4.0%).", "1. Escenario Pesimista (+30% en Costos Variables): ")
    add_body("CV baja a 1,920 Bs. --> Costo Total = 17,520 Bs. --> Nuevo Precio = 20,148 Bs. (Variación de -2.7%).", "2. Escenario Optimista (-20% en Costos Variables): ")
    add_body("El honorario adicional (+3,600 Bs.) es amortiguado por el margen de sostenibilidad sin comprometer el proyecto.", "3. Escenario Retraso (+2 meses / 4 Sprints): ")

    # 5. MATRIZ Y ÁRBOL DE DECISIONES
    add_heading1("5. TOMA DE DECISIONES: MATRIZ Y ÁRBOL DE DECISIONES")
    add_body("Problema: Selección de la arquitectura de digitalización e inferencia para el INAAQC (2 años de horizonte).")

    add_heading2("A. Matriz de Decisiones con Valor Monetario Esperado (VME)")
    dec_headers = ["Alternativa de Arquitectura", "Demanda Alta (P=0.60)", "Demanda Moderada (P=0.40)", "Valor Monetario Esperado (VME)"]
    dec_widths = [Inches(2.5), Inches(1.4), Inches(1.5), Inches(1.5)]
    dec_data = [
        ["A1: Sistema Híbrido Propio (Elegido)", "+65,000 Bs.", "+42,000 Bs.", "VME = 55,800.00 Bs. (ÓPTIMO)"],
        ["A2: APIs Comerciales Pagas (Cloud)", "+30,000 Bs.", "+22,000 Bs.", "VME = 26,800.00 Bs."],
        ["A3: Procesamiento Manual Tradicional", "-15,000 Bs.", "-5,000 Bs.", "VME = -11,000.00 Bs."]
    ]
    dec_table = doc.add_table(rows=1, cols=len(dec_headers))
    format_table(dec_table, dec_widths, dec_headers, dec_data, align_right_cols=[1, 2, 3])

    doc.add_paragraph()

    add_heading2("B. Representación del Árbol de Decisiones")
    tree_text = (
        "[Nodo Decisión 1]\n"
        "   ├── A1: Sistema Híbrido Propio ─── [Nodo P]\n"
        "   │      ├── Alta (P=0.60) ───────────> +65,000 Bs.\n"
        "   │      └── Moderada (P=0.40) ───────> +42,000 Bs.  ==> VME = 55,800 Bs. (SELECCIONADA)\n"
        "   ├── A2: APIs Comerciales ───────── [Nodo P]\n"
        "   │      ├── Alta (P=0.60) ───────────> +30,000 Bs.\n"
        "   │      └── Moderada (P=0.40) ───────> +22,000 Bs.  ==> VME = 26,800 Bs.\n"
        "   └── A3: Sistema Manual en Papel ── [Nodo P]\n"
        "          ├── Alta (P=0.60) ───────────> -15,000 Bs.\n"
        "          └── Moderada (P=0.40) ───────>  -5,000 Bs.  ==> VME = -11,000 Bs."
    )
    p_tree = doc.add_paragraph()
    style_paragraph(p_tree, space_before=2, space_after=6)
    r_tr = p_tree.add_run(tree_text)
    r_tr.font.name = 'Consolas'
    r_tr.font.size = Pt(8.5)
    r_tr.font.color.rgb = PRIMARY

    # 6. PROGRAMACIÓN DE METAS
    add_heading1("6. PROGRAMACIÓN DE METAS (GOAL PROGRAMMING)")
    add_body("Variables de Decisión: X1 = Sprints de Desarrollo Nuclear (Dev) | X2 = Sprints de Validación Clínica (PO/SM).")
    add_body("Variables de Desviación: di- (desviación por defecto) | di+ (desviación por exceso).")

    add_heading2("A. Formulación de Restricciones de Meta y Prioridades")
    add_body("1,125 X1 + 1,125 X2 + d1- - d1+ = 18,000  -->  Minimizar d1+", "Meta 1 (P1 - Presupuesto <= 18,000 Bs.): ")
    add_body("X1 + X2 + d2- - d2+ = 16  -->  Minimizar d2+", "Meta 2 (P2 - Plazo de Entrega <= 16 Sprints): ")
    add_body("8.0 X1 + d3- - d3+ = 90  -->  Minimizar d3-", "Meta 3 (P3 - Precisión RNA >= 90%): ")
    add_body("35 X1 + 20 X2 + d4- - d4+ = 500  -->  Minimizar d4-", "Meta 4 (P4 - Pacientes Digitalizados >= 500): ")

    add_heading2("B. Función Objetivo del Modelo")
    add_body("Min Z = P1(d1+) + P2(d2+) + P3(d3-) + P4(d4-)", "Función Objetivo: ")

    add_heading2("C. Solución Óptima y Comprobación")
    add_body("X1 = 12 Sprints de Desarrollo Nuclear (75%)  |  X2 = 4 Sprints de Validación Clínica (25%).", "Asignación Óptima: ")
    add_body("1,125(12) + 1,125(4) = 18,000 Bs.  -->  d1+ = 0 (Cumplida al 100%)", "• Meta 1 (Presupuesto): ")
    add_body("12 + 4 = 16 Sprints  -->  d2+ = 0 (Cumplida al 100%)", "• Meta 2 (Tiempo): ")
    add_body("8.0 * 12 = 96% >= 90%  -->  d3- = 0 (Cumplida con holgura de +6%)", "• Meta 3 (Precisión IA): ")
    add_body("35(12) + 20(4) = 420 + 80 = 500 pacientes >= 500  -->  d4- = 0 (Cumplida al 100%)", "• Meta 4 (Pacientes): ")
    add_body("Z = 0 (Todas las metas prioritarias se satisfacen plenamente sin desviaciones no deseadas).", "Resultado Global: ", italic=True)

    # 7. CONCLUSIÓN GENERAL
    add_heading1("7. CONCLUSIÓN EJECUTIVA")
    add_body("El proyecto del Sistema Experto para el INAAQC demuestra viabilidad económica y metodológica plena. El presupuesto equilibrado de 18,000.00 Bs. (y precio de venta de 20,700.00 Bs.) coincide con el modelo COCOMO II (20,930.00 Bs.) con una variación de solo 1.11% (<= 10%). La arquitectura híbrida propia optimiza el Valor Monetario Esperado (55,800.00 Bs.) y la programación de metas valida que un único tesista bajo Scrum puede completar el sistema en 16 Sprints cumpliendo todos los objetivos clínicos y técnicos.")

    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    out_file = r"c:\Users\hp\Desktop\proyecto integrador\Evaluacion_Economica_y_Gestion_Proyecto.docx"
    create_full_document(out_file)
