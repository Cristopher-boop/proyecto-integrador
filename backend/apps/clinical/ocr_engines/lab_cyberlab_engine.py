import re
import pdfplumber
import traceback

class MotorIngestaClinica:
    """
    Motor determinista para extracción de datos biomédicos de reportes CyberLab.
    """

    MAPEO_PARAMETROS = {
        "Créatinine": "Creatinina",
        "Calcium": "Calcio", 
        "Globules blancs": "Glóbulos Blancos",
        "Bilirubine totale": "Bilirrubina Total",
        "Hématocrite": "Hematocrito",
        "INR": "INR",
        "Lactate": "Lactato",
        "Sodium": "Sodio",
        "Plaquettes": "Plaquetas",
        "Urée": "Urea",
        "PH": "pH",
        "pCO2": "pCO2",
        "p02": "pO2",
        "pO2": "pO2",
        "Potassium": "Potasio"
    }

    @staticmethod
    def procesar_pdf(ruta_archivo):
        resultados = []
        parametro_actual = None  

        patron_fecha = r"^(\d{2}/\d{2}/\d{4})"
        patron_hora = r"\b([01]\d|2[0-3]):([0-5]\d)\b"
        
        try:
            with pdfplumber.open(ruta_archivo) as pdf:
                for pagina in pdf.pages:
                    texto = pagina.extract_text()
                    if not texto: continue
                        
                    lineas = texto.split('\n')
                    
                    for i_linea, linea in enumerate(lineas):
                        linea_limpia = linea.strip()

                        if "CyberLab" in linea_limpia or "Consultation" in linea_limpia or "Bordet" in linea_limpia:
                            continue
                        
                        for clave_frances, valor_espanol in MotorIngestaClinica.MAPEO_PARAMETROS.items():
                            if clave_frances.lower() in linea_limpia.lower():
                                parametro_actual = valor_espanol
                                break 
                        
                        match_fecha = re.match(patron_fecha, linea_limpia)
                        if parametro_actual and match_fecha:
                            # FIX: Aseguramos extraer exactamente 10 caracteres
                            fecha_str = match_fecha.group(1) 
                            partes = linea_limpia.split()
                            
                            hora_encontrada = "00:00" 
                            for offset in range(4):
                                if i_linea + offset < len(lineas):
                                    candidata = lineas[i_linea + offset]
                                    match_hora = re.search(patron_hora, candidata)
                                    if match_hora:
                                        hora_encontrada = match_hora.group(0)
                                        break
                            
                            valor_encontrado = None
                            indice_valor = -1
                            
                            for i, parte in enumerate(partes[2:], start=2):
                                parte_limpia = re.sub(r'[Hh<>\*]', '', parte)
                                try:
                                    valor_encontrado = float(parte_limpia)
                                    indice_valor = i
                                    break 
                                except ValueError:
                                    continue
                            
                            if valor_encontrado is not None and indice_valor != -1:
                                rango_min, rango_max, unidad = None, None, None
                                resto_linea = partes[indice_valor + 1:]
                                
                                if len(resto_linea) >= 1:
                                    rango_str = resto_linea[0]
                                    if '-' in rango_str:
                                        limites = rango_str.split('-')
                                        try:
                                            rango_min = float(limites[0])
                                            rango_max = float(limites[1])
                                        except: pass
                                    elif '<' in rango_str:
                                        try: rango_max = float(rango_str.replace('<', ''))
                                        except: pass
                                
                                if len(resto_linea) >= 2:
                                    unidad = " ".join(resto_linea[1:]).replace('$', '').replace('|', '').strip()

                                fecha_iso = f"{fecha_str[6:]}-{fecha_str[3:5]}-{fecha_str[0:2]}T{hora_encontrada}:00-04:00"
                                print(f"[{parametro_actual}] Fecha/Hora Real: {fecha_iso} | Valor: {valor_encontrado}")

                                resultados.append({
                                    "parametro": parametro_actual,
                                    "valor_numerico": valor_encontrado,
                                    "unidad_medida": unidad,
                                    "rango_referencia_min": rango_min,
                                    "rango_referencia_max": rango_max,
                                    "fecha_hora_registro": fecha_iso
                                })
            
            if resultados:
                fechas = [obs["fecha_hora_registro"] for obs in resultados]
                fecha_basal = min(fechas)
                for obs in resultados:
                    obs["es_diario"] = obs["fecha_hora_registro"] > fecha_basal

            print(f"\n=== SE EXTRAJERON {len(resultados)} RESULTADOS CON HORA EXACTA ===\n")
            return resultados 
            
        except Exception as e:
            print("\n🔥 ERROR CRÍTICO EN MOTOR LAB (PDFPLUMBER) 🔥")
            traceback.print_exc()
            raise ValueError(f"El Motor LAB falló al leer el PDF: {str(e)}")