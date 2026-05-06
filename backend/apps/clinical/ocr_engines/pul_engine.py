import cv2
import pytesseract
import numpy as np
import difflib
from django.conf import settings

# --- RUTA OBLIGATORIA PARA WINDOWS ---
pytesseract.pytesseract.tesseract_cmd = r'C:\Users\hp\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'

class MotorPulmonar:
    """
    Motor OCR para Gasometría (PUL).
    Detecta columnas (A/V) y repara ruido clínico (pH sin punto, SBE negativos).
    """

    MAPEO_PUL = {
        "pH": "pH", 
        "PCO2": "pCO2", "pCO2": "pCO2",
        "PO2": "pO2", "pO2": "pO2",
        "SO2": "Saturación de Oxígeno (Gases)",
        "S02": "Saturación de Oxígeno (Gases)", # OCR lee Cero
        "sO2": "Saturación de Oxígeno (Gases)", # OCR lee minúscula
        "SBE": "Exceso de Base",
        "Lact": "Lactato"
    }

    ESTANDARES_PUL = {
        "pH": {"u": "units", "min": 7.35, "max": 7.45},
        "pCO2": {"u": "mmHg", "min": 35, "max": 45},
        "pO2": {"u": "mmHg", "min": 80, "max": 100},
        "Saturación de Oxígeno (Gases)": {"u": "%", "min": 95, "max": 100},
        "Exceso de Base": {"u": "mEq/L", "min": -2, "max": 2},
        "Lactato": {"u": "mmol/L", "min": 0.5, "max": 2.2},
    }

    @staticmethod
    def procesar_imagen(ruta_imagen):
        resultados_finales = []
        imagen = cv2.imread(ruta_imagen)
        if imagen is None: raise ValueError("No se pudo leer la imagen PUL.")

        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        binaria = cv2.adaptiveThreshold(gris, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5)
        
        ancho = binaria.shape[1]
        alto = binaria.shape[0]

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (ancho // 60, 1))
        kernel_v = cv2.getStructuringElement(cv2.MORPH_RECT, (1, alto // 60))
        cuadricula = cv2.addWeighted(cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel), 0.5, 
                                     cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_v), 0.5, 0.0)
        cuadricula = cv2.dilate(cuadricula, np.ones((3,3), np.uint8), iterations=1)

        contornos, _ = cv2.findContours(cuadricula, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        datos_extraidos = []

        for c in contornos:
            x, y, w, h = cv2.boundingRect(c)
            if (ancho * 0.015) < w < (ancho * 0.25) and (alto * 0.01) < h < (alto * 0.15):
                recorte = gris[y+3 : y+h-3, x+3 : x+w-3]
                if recorte.shape[0] > 0 and recorte.shape[1] > 0:
                    _, mascara_tinta = cv2.threshold(recorte, 150, 255, cv2.THRESH_BINARY_INV)
                    if cv2.countNonZero(mascara_tinta) > (recorte.shape[0] * recorte.shape[1] * 0.010):
                        recorte_grande = cv2.resize(recorte, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
                        texto = pytesseract.image_to_string(recorte_grande, config=r'--psm 7').strip()
                        if texto and texto not in ['il', 'ee', 'Oe', 'a', 'l', 'i']: 
                            datos_extraidos.append({"x": x, "y": y, "w": w, "h": h, "valor": texto})

        filas_matriz = {}
        for d in datos_extraidos:
            y_key = next((k for k in filas_matriz if abs(d['y'] - k) < 15), None)
            if y_key is None:
                filas_matriz[d['y']] = []
                y_key = d['y']
            filas_matriz[y_key].append(d)

        alturas_ordenadas = sorted(filas_matriz.keys())
        
        coordenadas_horas = {}
        tipo_sangre_por_columna = {} 
        h_encontrada = False

        for altura in alturas_ordenadas:
            celdas = sorted(filas_matriz[altura], key=lambda x: x['x'])
            textos = [c['valor'] for c in celdas]

            # 1. Buscar Horas
            if not h_encontrada and len(textos) >= 5:
                if any(p in str(celdas[0]['valor']).lower() for p in ["ph", "pco2", "po2", "sang"]): continue
                
                h_encontrada = True
                horas = []
                for i, c in enumerate(celdas):
                    txt = "".join(filter(str.isdigit, c['valor'][:2]))
                    if txt and 0 <= int(txt) <= 23: horas.append((i, int(txt)))
                
                if horas:
                    idx_b, h_base = horas[0]
                    for i, c in enumerate(celdas):
                        coordenadas_horas[c['x']] = f"{str((h_base + (i - idx_b)) % 24).zfill(2)}:00"
                continue

            if not h_encontrada or len(celdas) < 2: continue

            titulo_crudo = celdas[0]['valor']

            # 2. Memoria de Arterial / Venoso
            if difflib.get_close_matches(titulo_crudo, ["Sang A o V", "Sang", "Sangre"], n=1, cutoff=0.5):
                for celda in celdas[1:]:
                    letra = celda['valor'].upper().replace('.', '').strip()
                    if 'A' in letra:
                        tipo_sangre_por_columna[celda['x']] = " (Arterial)"
                    elif 'V' in letra:
                        tipo_sangre_por_columna[celda['x']] = " (Venoso)"
                continue 

            # 3. Mapeo de Parámetros
            match = difflib.get_close_matches(titulo_crudo, MotorPulmonar.MAPEO_PUL.keys(), n=1, cutoff=0.5)
            
            if match:
                nombre_base = MotorPulmonar.MAPEO_PUL[match[0]]
                estandar = MotorPulmonar.ESTANDARES_PUL.get(nombre_base, {})

                for celda in celdas[1:]:
                    prefijo = ""
                    if tipo_sangre_por_columna:
                        closest_x = min(tipo_sangre_por_columna.keys(), key=lambda k: abs(k - celda['x']))
                        if abs(closest_x - celda['x']) < 30: 
                            prefijo = tipo_sangre_por_columna[closest_x]
                    
                    nombre_final = f"{nombre_base}{prefijo}"

                    # --- LIMPIEZA ANTI-RUIDO AVANZADA ---
                    val_str = celda['valor'].replace(',', '.').replace(' ', '.')
                    
                    # FIX: Permitimos el signo negativo para el Exceso de Base (SBE)
                    val_limpio = "".join(c for c in val_str if c.isdigit() or c == '.' or c == '-')
                    
                    es_negativo = val_limpio.startswith('-')
                    val_limpio = val_limpio.replace('-', '') # Quitamos guiones del medio si los hay
                    
                    # Arreglamos si el OCR metió más de un punto (Ej: 7..42)
                    partes = val_limpio.split('.')
                    if len(partes) > 2:
                        val_limpio = partes[0] + '.' + "".join(partes[1:])

                    # Restauramos el signo negativo si lo tenía
                    if es_negativo:
                        val_limpio = '-' + val_limpio

                    if val_limpio and val_limpio != '.' and val_limpio != '-':
                        try:
                            v_num = float(val_limpio)
                            
                            # --- FIX MATEMÁTICO PARA pH (742 -> 7.42) ---
                            if nombre_base == "pH" and v_num > 100:
                                v_num = round(v_num / 100.0, 2)
                                
                            # --- FIX ÓPTICO PARA LACTATO Y SBE (17 -> 1.7 | -14 -> -1.4) ---
                            # Si no hay punto y tiene 2 o más dígitos (ignorando el signo negativo)
                            val_sin_signo = val_limpio.replace('-', '')
                            if nombre_base in ["Lactato", "Exceso de Base"] and '.' not in val_limpio and len(val_sin_signo) >= 2:
                                v_num = round(v_num / 10.0, 1)
                                
                            x_act = celda['x']
                            hora = "00:00"
                            if coordenadas_horas:
                                hora = min(coordenadas_horas.items(), key=lambda h: abs(x_act - h[0]))[1]
                            
                            resultados_finales.append({
                                "tipo_observacion": "LABORATORIO",
                                "parametro": nombre_final,
                                "fecha_hora_registro": f"2026-02-08T{hora}:00Z",
                                "valor_numerico": v_num,
                                "unidad_medida": estandar.get("u"),
                                "rango_referencia_min": estandar.get("min"),
                                "rango_referencia_max": estandar.get("max"),
                                "coordenadas_zoom": {"x": celda['x'], "y": celda['y'], "w": celda['w'], "h": celda['h']},
                                "es_diario": False
                            })
                        except: continue

        # --- MODO PRUEBA EN CONSOLA (Descomentar para depurar) ---
        # print("\n=== DATOS PULMONARES (MODO PRUEBA) ===")
        # for r in resultados_finales:
        #     print(f"{r['parametro']:<40} | Hora: {r['fecha_hora_registro'][-9:-1]} | Valor: {r['valor_numerico']} {r['unidad_medida']}")
        # print(f"=== TOTAL: {len(resultados_finales)} REGISTROS ===\n")
        
        # --- INSERCIÓN REAL A LA BASE DE DATOS ---
        return resultados_finales