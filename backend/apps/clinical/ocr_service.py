import re
import pdfplumber

class MotorIngestaClinica:
    """
    Motor determinista para extracción de datos biomédicos de reportes CyberLab.
    Usa un lector de estados para leer tablas longitudinales.
    """

    # Diccionario oficial de mapeo (Francés/Inglés -> Español)
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
        """
        Abre el PDF digital y extrae las filas de laboratorios
        traduciendo los parámetros al español.
        """
        resultados = []
        parametro_actual = None  # Memoria del estado actual

        # Expresión regular para detectar una fila de resultados:
        # Busca una fecha (dd/mm/yyyy), ignora el texto del medio, y busca un número (ej. 14.2 o 517)
        # Patrón básico analítico para aislar fechas y valores en la misma línea
        patron_fecha = r"^(\d{2}/\d{2}/\d{4})"
        
        try:
            with pdfplumber.open(ruta_archivo) as pdf:
                for pagina in pdf.pages:
                    texto = pagina.extract_text()
                    if not texto:
                        continue
                        
                    lineas = texto.split('\n')
                    
                    for linea in lineas:
                        linea_limpia = linea.strip()

                        # --- NUEVO: FILTRO DE RUIDO (CABECERAS Y PIES DE PÁGINA) ---
                        # Si la línea tiene basura del sistema, la saltamos inmediatamente
                        if "CyberLab" in linea_limpia or "Consultation" in linea_limpia or "Bordet" in linea_limpia:
                            continue
                        # -----------------------------------------------------------
                        
                        # 1. ¿Esta línea es el título de un parámetro? (Ej: "Globules blancs")
                        for clave_frances, valor_espanol in MotorIngestaClinica.MAPEO_PARAMETROS.items():
                            if clave_frances.lower() in linea_limpia.lower():
                                parametro_actual = valor_espanol
                                break # Encontramos el bloque, pasamos a la siguiente línea
                        
                        # 2. Si ya sabemos en qué bloque estamos, buscamos fechas y valores
                        if parametro_actual and re.match(patron_fecha, linea_limpia):
                            partes = linea_limpia.split()
                            
                            valor_encontrado = None
                            indice_valor = -1
                            
                            # 1. Buscar el valor numérico
                            for i, parte in enumerate(partes[2:], start=2):
                                # Limpiamos basura del CyberLab (*, H, <, >)
                                parte_limpia = re.sub(r'[Hh<>\*]', '', parte)
                                try:
                                    valor_encontrado = float(parte_limpia)
                                    indice_valor = i
                                    break # Lo encontramos, guardamos su índice
                                except ValueError:
                                    continue
                            
                            # 2. Si encontramos el valor, atrapamos los rangos y unidades a su derecha
                            if valor_encontrado is not None and indice_valor != -1:
                                rango_min = None
                                rango_max = None
                                unidad = None
                                
                                # Miramos los elementos que están después del valor
                                resto_linea = partes[indice_valor + 1:]
                                
                                if len(resto_linea) >= 1:
                                    rango_str = resto_linea[0]
                                    # Si es un rango normal (ej. 150-440)
                                    if '-' in rango_str:
                                        limites = rango_str.split('-')
                                        try:
                                            rango_min = float(limites[0])
                                            rango_max = float(limites[1])
                                        except ValueError:
                                            pass
                                    # Si es un rango límite (ej. <1.2)
                                    elif '<' in rango_str:
                                        try:
                                            rango_max = float(rango_str.replace('<', ''))
                                        except:
                                            pass
                                
                                if len(resto_linea) >= 2:
                                    # La unidad es el resto (ej. mmol/L o x10^3/µL)
                                    unidad = " ".join(resto_linea[1:])
                                    # Limpiamos caracteres raros de formateo del PDF
                                    unidad = unidad.replace('$', '').replace('|', '').strip()

                                # 3. Guardamos todo el paquete completo
                                resultados.append({
                                    "tipo_observacion": "LABORATORIO",
                                    "parametro": parametro_actual,
                                    "valor_numerico": valor_encontrado,
                                    "unidad_medida": unidad,
                                    "rango_referencia_min": rango_min,
                                    "rango_referencia_max": rango_max,
                                    "fecha_hora_registro": f"{partes[0][6:]}-{partes[0][3:5]}-{partes[0][0:2]}T12:00:00Z" 
                                })
            
            if resultados:
                # Extraemos todas las fechas. Como están en formato ISO (YYYY-MM-DD), 
                # la función min() nos dará matemáticamente la fecha más antigua del PDF.
                fechas = [obs["fecha_hora_registro"] for obs in resultados]
                fecha_basal = min(fechas)
                
                # Iteramos y marcamos True a todo lo que sea posterior a la fecha basal
                for obs in resultados:
                    obs["es_diario"] = obs["fecha_hora_registro"] > fecha_basal

            return resultados
            
        except Exception as e:
            raise ValueError(f"Fallo crítico en el motor OCR: {str(e)}")