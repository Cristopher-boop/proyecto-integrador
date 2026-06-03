import pdfplumber
import traceback

class MotorNotaEvolucion:
    """
    Motor determinista para abrir e ingerir el texto de las Notas de Evolución (Journalier).
    """
    @staticmethod
    def procesar_pdf(ruta_archivo):
        texto_completo = ""
        try:
            with pdfplumber.open(ruta_archivo) as pdf:
                for pagina in pdf.pages:
                    texto = pagina.extract_text(layout=True)
                    if texto:
                        texto_completo += texto + "\n"

            if not texto_completo.strip():
                raise ValueError("El PDF de la Nota de Evolución parece estar vacío.")

            print(f"\n=== MOTOR NE: EXTRAÍDOS {len(texto_completo)} CARACTERES DEL DOCUMENTO ===")
            return texto_completo
            
        except Exception as e:
            print("\n🔥 ERROR CRÍTICO EN MOTOR NE (PDFPLUMBER) 🔥")
            traceback.print_exc()
            raise ValueError(f"El Motor NE falló al leer el PDF: {str(e)}")