import re
import unicodedata
import pdfplumber
import traceback
from apps.clinical.models import CatComorbilidad, CatSoporte, CatDiagnostico

class MotorNotaAdmision:
    
    @staticmethod
    def _normalizar_texto(texto):
        if not texto: return ""
        # Quita acentos, pasa a minúsculas y deja solo letras/números
        texto = unicodedata.normalize('NFKD', texto).encode('ASCII', 'ignore').decode('utf-8')
        texto = texto.lower()
        texto = re.sub(r'[^a-z0-9\s]', ' ', texto)
        texto = re.sub(r'\s+', ' ', texto).strip()
        return texto

    @staticmethod
    def _extraer_acronimos(nombre_catalogo):
        # Saca textos entre paréntesis ej: (CHF)
        matches = re.findall(r'\(([^)]+)\)', nombre_catalogo)
        return [m.lower() for m in matches if len(m) > 1]

    @staticmethod
    def procesar_pdf(ruta_archivo):
        try:
            texto_completo = ""
            with pdfplumber.open(ruta_archivo) as pdf:
                for pagina in pdf.pages:
                    # Extraemos respetando el layout
                    texto = pagina.extract_text(layout=True)
                    if texto:
                        texto_completo += texto + "\n"

            if not texto_completo.strip():
                raise ValueError("El PDF está vacío.")

            print("\n" + "="*60)
            print("📄 LECTURA DE NOTA DE ADMISIÓN (NA) EXITOSA")
            print("="*60)
            
            # Normalizamos el texto del PDF
            texto_normalizado = MotorNotaAdmision._normalizar_texto(texto_completo)
            
            # --- PRUEBA EN CONSOLA: COMORBILIDADES ---
            print("\n🔍 BUSCANDO COMORBILIDADES EN EL TEXTO...")
            comorbilidades = CatComorbilidad.objects.all()
            encontradas_com = 0
            
            for com in comorbilidades:
                nombre_norm = MotorNotaAdmision._normalizar_texto(com.nombre)
                acronimos = MotorNotaAdmision._extraer_acronimos(com.nombre)
                
                if nombre_norm and nombre_norm in texto_normalizado:
                    print(f"  ✅ MATCH EXACTO: {com.nombre}")
                    encontradas_com += 1
                else:
                    for acr in acronimos:
                        if re.search(rf'\b{acr}\b', texto_normalizado):
                            print(f"  ✅ MATCH ACRÓNIMO: {com.nombre} (Detectó: '{acr}')")
                            encontradas_com += 1
                            break
                            
            if encontradas_com == 0:
                print("  ❌ No se detectaron comorbilidades.")

            # --- PRUEBA EN CONSOLA: SOPORTES ---
            print("\n🔍 BUSCANDO SOPORTES Y COMPLICACIONES...")
            soportes = CatSoporte.objects.all()
            encontrados_sop = 0
            
            for sop in soportes:
                nombre_norm = MotorNotaAdmision._normalizar_texto(sop.nombre)
                acronimos = MotorNotaAdmision._extraer_acronimos(sop.nombre)
                
                if nombre_norm and nombre_norm in texto_normalizado:
                    print(f"  ✅ MATCH EXACTO: {sop.nombre}")
                    encontrados_sop += 1
                else:
                    for acr in acronimos:
                        if re.search(rf'\b{acr}\b', texto_normalizado):
                            print(f"  ✅ MATCH ACRÓNIMO: {sop.nombre} (Detectó: '{acr}')")
                            encontrados_sop += 1
                            break
                            
            if encontrados_sop == 0:
                print("  ❌ No se detectaron soportes/complicaciones.")

            print("="*60 + "\n")
            
            # Retornamos una lista vacía TEMPORALMENTE para que tu services.py no falle
            # esperando el formato antiguo de diccionarios de Laboratorio.
            return []

        except Exception as e:
            print("\n🔥 ERROR CRÍTICO EN MOTOR NA 🔥")
            traceback.print_exc()
            raise ValueError(f"Fallo al leer PDF: {str(e)}")