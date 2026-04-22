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
                            # Extraemos todos los números de la línea (incluyendo decimales)
                            # Ignoramos la fecha dividiéndola primero si es necesario
                            partes = linea_limpia.split()
                            
                            # Buscamos el primer número válido después de la fecha/hora y material
                            valor_encontrado = None
                            for parte in partes[2:]: # Saltamos la fecha y la hora
                                # Limpiamos caracteres raros como 'H' de High o '<'
                                parte_limpia = re.sub(r'[Hh<>]', '', parte)
                                try:
                                    valor_encontrado = float(parte_limpia)
                                    break # Encontramos el valor del laboratorio
                                except ValueError:
                                    continue
                            
                            if valor_encontrado is not None:
                                resultados.append({
                                    "tipo_observacion": "LABORATORIO",
                                    "parametro": parametro_actual,
                                    "valor_numerico": valor_encontrado,
                                    # Extraemos la fecha del inicio de la línea
                                    "fecha_hora_registro": f"{partes[0][6:]}-{partes[0][3:5]}-{partes[0][0:2]}T12:00:00Z" 
                                })
            
            return resultados
            
        except Exception as e:
            raise ValueError(f"Fallo crítico en el motor OCR: {str(e)}")