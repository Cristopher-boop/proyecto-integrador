import re
import unicodedata
import pdfplumber
import traceback
from apps.clinical.models import CatComorbilidad, CatSoporte, CatDiagnostico

class MotorNotaAdmision:
    
    @staticmethod
    def _normalizar_texto(texto):
        if not texto: return ""
        texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
        texto = texto.lower()
        texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
        texto = re.sub(r'\s+', ' ', texto).strip()
        return texto

    @staticmethod
    def procesar_pdf(ruta_archivo):
        try:
            texto_completo = ""
            with pdfplumber.open(ruta_archivo) as pdf:
                for pagina in pdf.pages:
                    texto = pagina.extract_text(layout=True)
                    if texto: texto_completo += texto + "\n"

            if not texto_completo.strip(): raise ValueError("PDF vacío.")

            return texto_completo

        except Exception as e:
            traceback.print_exc()
            raise ValueError(f"Fallo al leer PDF: {str(e)}")