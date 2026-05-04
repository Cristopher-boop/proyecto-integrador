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
    Motor de Visión Computacional dinámico para VIT.
    Aplica 'Crop & Read' a cada celda de la matriz.
    """

    MAPEO_VIT = {
        "FC": "Frecuencia Cardíaca",
        "SpO2": "Saturación de Oxígeno",
        "Température": "Temperatura",
        "FR / min.": "Frecuencia Respiratoria",
        
        # Presión Invasiva (Línea Arterial)
        "Pa s.": "Presión Arterial Sistólica (Invasiva)",
        "Pa d.": "Presión Arterial Diastólica (Invasiva)",
        "Pa m.": "Presión Arterial Media (Invasiva)",
        
        # Presión No Invasiva (Brazalete)
        "PNI s.": "Presión Arterial Sistólica (No Invasiva)",
        "PNI d.": "Presión Arterial Diastólica (No Invasiva)",
        "PNI m.": "Presión Arterial Media (No Invasiva)"
    }

    @staticmethod
    def procesar_imagen(ruta_imagen):
        resultados = []
        
        imagen = cv2.imread(ruta_imagen)
        if imagen is None:
            raise ValueError("No se pudo leer la imagen de Signos Vitales.")

        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        
        binaria = cv2.adaptiveThreshold(
            gris, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5
        )

        ancho = binaria.shape[1]
        alto = binaria.shape[0]
        
        kernel_horizontal = cv2.getStructuringElement(cv2.MORPH_RECT, (ancho // 60, 1))
        kernel_vertical = cv2.getStructuringElement(cv2.MORPH_RECT, (1, alto // 60))

        lineas_horizontales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_horizontal)
        lineas_verticales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_vertical)
        cuadricula = cv2.addWeighted(lineas_horizontales, 0.5, lineas_verticales, 0.5, 0.0)

        contornos, _ = cv2.findContours(cuadricula, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        cajitas_validas = 0
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
                        cajitas_validas += 1
                        
                        # --- PARCHE 1: LA LUPA DIGITAL ---
                        # Agrandamos la imagen 2.5x para que no se pierdan los "1" y los puntos decimales
                        recorte_grande = cv2.resize(recorte, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
                        
                        configuracion = r'--psm 7 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789. /:-"'
                        texto_celda = pytesseract.image_to_string(recorte_grande, config=configuracion).strip()
                        
                        if texto_celda and texto_celda not in ['il', 'ee', 'Oe', 'a', 'l', 'i']:
                            datos_extraidos.append({
                                "x": x, "y": y, "valor": texto_celda
                            })

        print(f"\n=== SE LEYERON {cajitas_validas} CELDAS CON TINTA ===")
        
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
        
        resultados_finales = []
        fila_horas_encontrada = False
        coordenadas_horas = {}  

        for altura in alturas_ordenadas:
            celdas_fila = sorted(filas_matriz[altura], key=lambda x: x['x'])
            textos = [c['valor'] for c in celdas_fila]
            
            # --- PARCHE 2: MATEMÁTICAS EN VEZ DE OCR PARA EL TIEMPO ---
            if not fila_horas_encontrada and len(textos) >= 12:
                fila_horas_encontrada = True
                
                # Buscamos la primera hora válida para usarla como "semilla"
                hora_semilla = 12 # Valor seguro por defecto
                for celda in celdas_fila:
                    texto_hora = "".join(c for c in celda['valor'][:2] if c.isdigit())
                    if texto_hora and 0 <= int(texto_hora) <= 23:
                        hora_semilla = int(texto_hora)
                        break
                
                # Sabiendo la semilla, generamos la línea de tiempo matemáticamente sumando +1
                for celda in celdas_fila:
                    hora_formateada = str(hora_semilla).zfill(2)
                    coordenadas_horas[celda['x']] = f"{hora_formateada}:00"
                    hora_semilla = (hora_semilla + 1) % 24
                continue 
                
            if not fila_horas_encontrada:
                continue
                
            if len(celdas_fila) < 2:
                continue 
                
            parametro_crudo = celdas_fila[0]['valor']
            
            posibles_matches = difflib.get_close_matches(
                parametro_crudo, MotorVitales.MAPEO_VIT.keys(), n=1, cutoff=0.4
            )
            
            if posibles_matches:
                clave_francesa = posibles_matches[0]
                parametro_oficial = MotorVitales.MAPEO_VIT[clave_francesa]
                
                for celda in celdas_fila[1:]:
                    valor_str = celda['valor']
                    
                    if parametro_oficial == "Temperatura" and valor_str.isdigit():
                        if len(valor_str) == 3: 
                            valor_str = f"{valor_str[:2]}.{valor_str[2]}"
                        elif len(valor_str) == 2: 
                            valor_str = f"{valor_str}.0"
                    
                    valor_limpio = "".join(c for c in valor_str if c.isdigit() or c == '.')
                    
                    if valor_limpio:
                        try:
                            if valor_limpio == '.': continue
                            if valor_limpio.count('.') > 1:
                                partes = valor_limpio.split('.')
                                valor_limpio = f"{partes[0]}.{partes[1]}"
                                
                            valor_numerico = float(valor_limpio) if '.' in valor_limpio else int(valor_limpio)
                        except ValueError:
                            continue

                        x_actual = celda['x']
                        hora_asignada = "00:00"
                        min_distancia = 9999
                        
                        for x_hora, hora_texto in coordenadas_horas.items():
                            distancia = abs(x_actual - x_hora)
                            if distancia < min_distancia:
                                min_distancia = distancia
                                hora_asignada = hora_texto
                                
                        fecha_hora_iso = f"2026-02-08T{hora_asignada}:00Z"
                        
                        resultados_finales.append({
                            "parametro": parametro_oficial,
                            "fecha_hora_registro": fecha_hora_iso,
                            "valor_numerico": valor_numerico,
                            "unidad_medida": None, 
                        })

        print("\n=== DATOS CLÍNICOS ESTRUCTURADOS (LISTOS PARA DB) ===")
        # Quitamos el límite [:35] para que imprima absolutamente todo
        for r in resultados_finales:
            print(f"{r['parametro']:<35} | Fecha/Hora: {r['fecha_hora_registro']:<20} | Valor: {r['valor_numerico']}")
        
        print(f"\n=== TOTAL: {len(resultados_finales)} REGISTROS LISTOS PARA INSERCIÓN ===")
        print("====================================================\n")

        # --- INSERCIÓN A BASE DE DATOS ---
        return resultados_finales