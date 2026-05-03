import cv2
import pytesseract
import numpy as np
import os
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
        "Pa s.": "Presión Arterial Sistólica (Pa)",
        "Pa d.": "Presión Arterial Diastólica (Pa)",
        "Pa m.": "Presión Arterial Media (Pa)"
    }

    @staticmethod
    def procesar_imagen(ruta_imagen):
        resultados = []
        
        imagen = cv2.imread(ruta_imagen)
        if imagen is None:
            raise ValueError("No se pudo leer la imagen de Signos Vitales.")

        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        
        # 1. Visión Adaptativa
        binaria = cv2.adaptiveThreshold(
            gris, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5
        )

        # 2. Extracción de la Jaula (Cuadrícula relativa que se auto-regula)
        ancho = binaria.shape[1]
        alto = binaria.shape[0]
        
        kernel_horizontal = cv2.getStructuringElement(cv2.MORPH_RECT, (ancho // 60, 1))
        kernel_vertical = cv2.getStructuringElement(cv2.MORPH_RECT, (1, alto // 60))

        lineas_horizontales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_horizontal)
        lineas_verticales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_vertical)
        cuadricula = cv2.addWeighted(lineas_horizontales, 0.5, lineas_verticales, 0.5, 0.0)

        # 3. Detección de Contornos (Celdas)
        contornos, _ = cv2.findContours(cuadricula, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        
        cajitas_validas = 0
        datos_extraidos = []
        
        for c in contornos:
            x, y, w, h = cv2.boundingRect(c)
            
            # Filtro de tamaño (Auto-regulado)
            if (ancho * 0.02) < w < (ancho * 0.2) and (alto * 0.01) < h < (alto * 0.08):
                
                # LA TIJERA: Recortamos la celda
                recorte = gris[y+3 : y+h-3, x+3 : x+w-3]
                
                if recorte.shape[0] > 0 and recorte.shape[1] > 0:
                    
                    # --- NUEVO: FILTRO DE TINTA (ANTI-ALUCINACIONES) ---
                    # Binarizamos solo este cuadradito para ver la "tinta"
                    _, recorte_binario = cv2.threshold(recorte, 150, 255, cv2.THRESH_BINARY_INV)
                    
                    # Contamos cuántos píxeles de texto/números existen
                    pixeles_tinta = cv2.countNonZero(recorte_binario)
                    area_total = recorte.shape[0] * recorte.shape[1]
                    
                    # Solo leemos si hay más de un 1.5% de tinta en la celda
                    if pixeles_tinta > (area_total * 0.015):
                        cajitas_validas += 1
                        
                        configuracion = r'--psm 7 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789. /:-"'
                        texto_celda = pytesseract.image_to_string(recorte, config=configuracion).strip()
                        
                        # Doble filtro: Ignoramos si Tesseract escupe 1 sola letra minúscula por error
                        if texto_celda and texto_celda not in ['il', 'ee', 'Oe', 'a', 'l', 'i']:
                            datos_extraidos.append({
                                "x": x, 
                                "y": y, 
                                "valor": texto_celda
                            })

        print(f"\n=== SE LEYERON {cajitas_validas} CELDAS CON TINTA ===")
        
        # --- NUEVA FASE 4: RECONSTRUCCIÓN DE LA MATRIZ (CLUSTERING) ---
        filas_matriz = {}
        
        for d in datos_extraidos:
            # Agrupamos por altura (Y). Damos un margen de +/- 15 píxeles 
            # por si la línea del escaneo salió un poco chueca.
            fila_encontrada = None
            for y_clave in filas_matriz.keys():
                if abs(d['y'] - y_clave) < 15:
                    fila_encontrada = y_clave
                    break
            
            if fila_encontrada is None:
                filas_matriz[d['y']] = []
                fila_encontrada = d['y']
                
            filas_matriz[fila_encontrada].append(d)

        # Ordenamos las filas de arriba hacia abajo
        alturas_ordenadas = sorted(filas_matriz.keys())
        
        print("\n=== MATRIZ CLÍNICA RECONSTRUIDA ===")
        for altura in alturas_ordenadas:
            # Ordenamos las celdas de la fila de izquierda a derecha (X)
            celdas_fila = sorted(filas_matriz[altura], key=lambda x: x['x'])
            
            # Extraemos solo el texto para imprimirlo
            textos = [c['valor'] for c in celdas_fila]
            
            # Si la fila tiene más de 2 datos, la imprimimos (ignoramos ruido suelto)
            if len(textos) > 2:
                print(f"Fila Y:{altura:<4} | " + " \t ".join(textos))
                
        print("==============================================\n")

        return resultados