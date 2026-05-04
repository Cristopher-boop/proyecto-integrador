import cv2
import pytesseract
import numpy as np
import os
import difflib
from django.conf import settings

# --- RUTA OBLIGATORIA PARA WINDOWS ---
pytesseract.pytesseract.tesseract_cmd = r'C:\Users\crist\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'

class MotorVitales:
    """
    Motor de Visión Computacional dinámico para VIT con estándares médicos.
    """

    MAPEO_VIT = {
        "FC": "Frecuencia Cardíaca",
        "SpO2": "Saturación de Oxígeno",
        "Température": "Temperatura",
        "FR / min.": "Frecuencia Respiratoria",
        "Pa s.": "Presión Arterial Sistólica (Invasiva)",
        "Pa d.": "Presión Arterial Diastólica (Invasiva)",
        "Pa m.": "Presión Arterial Media (Invasiva)",
        "PNI s.": "Presión Arterial Sistólica (No Invasiva)",
        "PNI d.": "Presión Arterial Diastólica (No Invasiva)",
        "PNI m.": "Presión Arterial Media (No Invasiva)"
    }

    # --- NUEVO: DICCIONARIO DE ESTÁNDARES MÉDICOS ---
    ESTANDARES_VIT = {
        "Frecuencia Cardíaca": {"u": "lpm", "min": 60, "max": 100},
        "Saturación de Oxígeno": {"u": "%", "min": 95, "max": 100},
        "Temperatura": {"u": "°C", "min": 36.1, "max": 37.2},
        "Frecuencia Respiratoria": {"u": "rpm", "min": 12, "max": 20},
        "Presión Arterial Sistólica (Invasiva)": {"u": "mmHg", "min": 90, "max": 120},
        "Presión Arterial Diastólica (Invasiva)": {"u": "mmHg", "min": 60, "max": 80},
        "Presión Arterial Media (Invasiva)": {"u": "mmHg", "min": 70, "max": 105},
        "Presión Arterial Sistólica (No Invasiva)": {"u": "mmHg", "min": 90, "max": 120},
        "Presión Arterial Diastólica (No Invasiva)": {"u": "mmHg", "min": 60, "max": 80},
        "Presión Arterial Media (No Invasiva)": {"u": "mmHg", "min": 70, "max": 105},
    }

    @staticmethod
    def procesar_imagen(ruta_imagen):
        resultados_finales = []
        
        imagen = cv2.imread(ruta_imagen)
        if imagen is None:
            raise ValueError("No se pudo leer la imagen de Signos Vitales.")

        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        
        # 1. Visión Adaptativa
        binaria = cv2.adaptiveThreshold(
            gris, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5
        )

        ancho = binaria.shape[1]
        alto = binaria.shape[0]
        
        # 2. Extracción de la Jaula
        kernel_horizontal = cv2.getStructuringElement(cv2.MORPH_RECT, (ancho // 60, 1))
        kernel_vertical = cv2.getStructuringElement(cv2.MORPH_RECT, (1, alto // 60))

        lineas_horizontales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_horizontal)
        lineas_verticales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_vertical)
        cuadricula = cv2.addWeighted(lineas_horizontales, 0.5, lineas_verticales, 0.5, 0.0)

        # 3. Detección de Contornos (Celdas)
        contornos, _ = cv2.findContours(cuadricula, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        datos_extraidos = []
        
        for c in contornos:
            x, y, w, h = cv2.boundingRect(c)
            
            if (ancho * 0.02) < w < (ancho * 0.2) and (alto * 0.01) < h < (alto * 0.08):
                recorte = gris[y+3 : y+h-3, x+3 : x+w-3]
                
                if recorte.shape[0] > 0 and recorte.shape[1] > 0:
                    _, mascara_tinta = cv2.threshold(recorte, 150, 255, cv2.THRESH_BINARY_INV)
                    pixeles_tinta = cv2.countNonZero(mascara_tinta)
                    area_total = recorte.shape[0] * recorte.shape[1]
                    
                    if pixeles_tinta > (area_total * 0.015):
                        recorte_grande = cv2.resize(recorte, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
                        
                        configuracion = r'--psm 7 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789. /:-"'
                        texto_celda = pytesseract.image_to_string(recorte_grande, config=configuracion).strip()
                        
                        if texto_celda and texto_celda not in ['il', 'ee', 'Oe', 'a', 'l', 'i']:
                            datos_extraidos.append({
                                "x": x, "y": y, "w": w, "h": h, "valor": texto_celda
                            })

        # 4. Clustering (Agrupación por filas)
        filas_matriz = {}
        for d in datos_extraidos:
            fila_encontrada = None
            for y_clave in filas_matriz.keys():
                if abs(d['y'] - y_clave) < 15:
                    fila_encontrada = y_clave
                    break
            
            if fila_encontrada is None:
                filas_matriz[d['y']] = []
                fila_encontrada = d['y']
            filas_matriz[fila_encontrada].append(d)

        alturas_ordenadas = sorted(filas_matriz.keys())
        
        fila_horas_encontrada = False
        coordenadas_horas = {}  

        for altura in alturas_ordenadas:
            celdas_fila = sorted(filas_matriz[altura], key=lambda x: x['x'])
            textos = [c['valor'] for c in celdas_fila]
            
            # Matriz de tiempo
            if not fila_horas_encontrada and len(textos) >= 12:
                fila_horas_encontrada = True
                hora_semilla = 12 
                for celda in celdas_fila:
                    texto_hora = "".join(c for c in celda['valor'][:2] if c.isdigit())
                    if texto_hora and 0 <= int(texto_hora) <= 23:
                        hora_semilla = int(texto_hora)
                        break
                
                for celda in celdas_fila:
                    coordenadas_horas[celda['x']] = f"{str(hora_semilla).zfill(2)}:00"
                    hora_semilla = (hora_semilla + 1) % 24
                continue 
                
            if not fila_horas_encontrada or len(celdas_fila) < 2:
                continue
                
            parametro_crudo = celdas_fila[0]['valor']
            posibles_matches = difflib.get_close_matches(
                parametro_crudo, MotorVitales.MAPEO_VIT.keys(), n=1, cutoff=0.4
            )
            
            if posibles_matches:
                parametro_oficial = MotorVitales.MAPEO_VIT[posibles_matches[0]]
                estandar = MotorVitales.ESTANDARES_VIT.get(parametro_oficial, {})
                
                for celda in celdas_fila[1:]:
                    valor_str = celda['valor']
                    
                    # Corrección de temperatura
                    if parametro_oficial == "Temperatura" and valor_str.isdigit():
                        if len(valor_str) == 3: valor_str = f"{valor_str[:2]}.{valor_str[2]}"
                        elif len(valor_str) == 2: valor_str = f"{valor_str}.0"
                    
                    valor_limpio = "".join(c for c in valor_str if c.isdigit() or c == '.')
                    
                    if valor_limpio:
                        try:
                            if valor_limpio == '.': continue
                            v_num = float(valor_limpio) if '.' in valor_limpio else int(valor_limpio)
                            
                            # Mapeo de hora por cercanía X
                            x_actual = celda['x']
                            hora_asignada = min(coordenadas_horas.items(), key=lambda h: abs(x_actual - h[0]))[1]
                            
                            # Construcción del objeto final
                            resultados_finales.append({
                                "tipo_observacion": "SIGNOS_VITALES",
                                "parametro": parametro_oficial,
                                "fecha_hora_registro": f"2026-02-08T{hora_asignada}:00Z",
                                "valor_numerico": v_num,
                                "unidad_medida": estandar.get("u"),
                                "rango_referencia_min": estandar.get("min"),
                                "rango_referencia_max": estandar.get("max"),
                                "coordenadas_zoom": {"x": celda['x'], "y": celda['y'], "w": celda['w'], "h": celda['h']},
                            })
                        except: continue

        # --- LÓGICA DE es_diario (Temporalmente estático en False) ---
        if resultados_finales:
            for obs in resultados_finales:
                obs["es_diario"] = False

        # =========================================================
        # --- MODO PRUEBA EN CONSOLA (SIN GUARDAR EN BD) ---
        # =========================================================
        print("\n=== DATOS CLÍNICOS EXTRAÍDOS (MODO PRUEBA) ===")
        for r in resultados_finales:
            # Imprimimos el parámetro, la hora, el valor numérico y la unidad
            print(f"{r['parametro']:<42} | Hora: {r['fecha_hora_registro'][-9:-1]} | Valor: {r['valor_numerico']} {r['unidad_medida']}")
        
        print(f"\n=== TOTAL: {len(resultados_finales)} REGISTROS DETECTADOS ===")
        print("=========================================================\n")

        # Devolvemos una lista vacía para que Django NO guarde nada en PostgreSQL
        return []