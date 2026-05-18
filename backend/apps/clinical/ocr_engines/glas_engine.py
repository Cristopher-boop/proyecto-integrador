import cv2
import pytesseract
import numpy as np
import os
import difflib
from django.conf import settings
from .base_engine import MotorOCRBase


class MotorGlasgow(MotorOCRBase):
    """
    Motor de Visión Computacional específico para la Escala de Coma de Glasgow (GLAS).
    Construido EXACTAMENTE sobre la base estable de VIT.
    """

    MAPEO_GLAS = {
        "Glascow Coma Score": "Escala de Coma de Glasgow",
        "Glasgow Coma Score": "Escala de Coma de Glasgow",
        "Glasgow": "Escala de Coma de Glasgow"
    }

    ESTANDARES_GLAS = {
        "Escala de Coma de Glasgow": {"u": "pts", "min": 3, "max": 15}
    }

    @staticmethod
    def procesar_imagen(ruta_imagen):
        resultados_finales = []
        
        imagen = cv2.imread(ruta_imagen)
        if imagen is None:
            raise ValueError("No se pudo leer la imagen de GLAS.")

        gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
        
        binaria = cv2.adaptiveThreshold(gris, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 5)

        ancho = binaria.shape[1]
        alto = binaria.shape[0]
        
        kernel_horizontal = cv2.getStructuringElement(cv2.MORPH_RECT, (ancho // 60, 1))
        kernel_vertical = cv2.getStructuringElement(cv2.MORPH_RECT, (1, alto // 60))

        lineas_horizontales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_horizontal)
        lineas_verticales = cv2.morphologyEx(binaria, cv2.MORPH_OPEN, kernel_vertical)
        cuadricula = cv2.addWeighted(lineas_horizontales, 0.5, lineas_verticales, 0.5, 0.0)

        # --- SOLUCIÓN GENERAL: SELLADO DE CUADRÍCULA ---
        # Si la imagen tiene aberturas en las líneas, este filtro "engrosa" 
        # sutilmente las líneas para cerrar las celdas, garantizando que el contorno funcione.
        kernel_cierre = np.ones((3, 3), np.uint8)
        cuadricula = cv2.dilate(cuadricula, kernel_cierre, iterations=1)

        contornos, _ = cv2.findContours(cuadricula, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        datos_extraidos = []
        
        # --- VOLVEMOS AL ESTÁNDAR VIT 100% ORIGINAL ---
        for c in contornos:
            x, y, w, h = cv2.boundingRect(c)
            
            if (ancho * 0.02) < w < (ancho * 0.2) and (alto * 0.01) < h < (alto * 0.15):
                recorte = gris[y+3 : y+h-3, x+3 : x+w-3]
                
                if recorte.shape[0] > 0 and recorte.shape[1] > 0:
                    _, mascara_tinta = cv2.threshold(recorte, 150, 255, cv2.THRESH_BINARY_INV)
                    if cv2.countNonZero(mascara_tinta) > (recorte.shape[0] * recorte.shape[1] * 0.015):
                        recorte_grande = cv2.resize(recorte, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
                        
                        configuracion = r'--psm 7 -c tessedit_char_whitelist="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789. /:-"'
                        texto_celda = pytesseract.image_to_string(recorte_grande, config=configuracion).strip()
                        
                        if texto_celda and texto_celda not in ['il', 'ee', 'Oe', 'a', 'l', 'i']:
                            datos_extraidos.append({"x": x, "y": y, "w": w, "h": h, "valor": texto_celda})

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
            
            # --- ALGORITMO DE HORAS DINÁMICAS ---
            if not fila_horas_encontrada and len(textos) >= 8:
                primer_valor = str(celdas_fila[0]['valor']).lower()
                if any(palabra in primer_valor for palabra in ["glas", "score", "ocular", "verbal"]):
                    continue 

                fila_horas_encontrada = True
                horas_detectadas = []
                for i, celda in enumerate(celdas_fila):
                    texto_hora = "".join(c for c in celda['valor'][:2] if c.isdigit())
                    if texto_hora and 0 <= int(texto_hora) <= 23:
                        horas_detectadas.append((i, int(texto_hora)))
                
                if horas_detectadas:
                    indice_base, hora_base = horas_detectadas[0]
                    for i, celda in enumerate(celdas_fila):
                        diferencia = i - indice_base
                        hora_calculada = (hora_base + diferencia) % 24
                        coordenadas_horas[celda['x']] = f"{str(hora_calculada).zfill(2)}:00"
                continue 
                
            if not fila_horas_encontrada or len(celdas_fila) < 2:
                continue
                
            parametro_crudo = celdas_fila[0]['valor']
            es_huerfano = False
            
            # --- LOGICA ANÁLOGA A LA FILA HUÉRFANA DE VIT ---
            # Caso 1: El título se omitió y solo leyó el número (ej: "14").
            if parametro_crudo.replace('.', '').replace('-', '').isdigit():
                parametro_crudo = "Glasgow Coma Score"
                es_huerfano = True
            
            # Caso 2: El título se fusionó con el número (ej: "Glasgow Coma Score 14").
            else:
                numeros_al_final = "".join([c for c in parametro_crudo if c.isdigit()])
                letras_al_inicio = "".join([c for c in parametro_crudo if not c.isdigit()]).strip()
                
                if numeros_al_final and letras_al_inicio:
                    parametro_crudo = letras_al_inicio
                    # Inyectamos el valor rescatado para procesarlo como una celda más
                    celdas_fila.insert(1, {'x': celdas_fila[0]['x'] + celdas_fila[0]['w'], 'y': celdas_fila[0]['y'], 'w': 10, 'h': 10, 'valor': numeros_al_final})

            posibles_matches = difflib.get_close_matches(
                parametro_crudo, MotorGlasgow.MAPEO_GLAS.keys(), n=1, cutoff=0.4
            )
            
            if posibles_matches:
                parametro_oficial = MotorGlasgow.MAPEO_GLAS[posibles_matches[0]]
                estandar = MotorGlasgow.ESTANDARES_GLAS.get(parametro_oficial, {})
                
                celdas_valores = celdas_fila if es_huerfano else celdas_fila[1:]
                
                for celda in celdas_valores:
                    valor_str = celda['valor']

                    # Traductor de errores ópticos (ej: Tesseract lee "3" como "e")
                    diccionario_errores = {'S': '5', 's': '5', 'e': '3', 'E': '3', 'l': '1', 'I': '1', 'O': '0', 'o': '0'}
                    for error, correcion in diccionario_errores.items():
                        valor_str = valor_str.replace(error, correcion)
                    
                    valor_limpio = "".join(c for c in valor_str if c.isdigit())
                    
                    if valor_limpio:
                        try:
                            v_num = int(valor_limpio)
                            if not (3 <= v_num <= 15):
                                continue
                                
                            x_actual = celda['x']
                            hora_asignada = "00:00"
                            if coordenadas_horas:
                                hora_asignada = min(coordenadas_horas.items(), key=lambda h: abs(x_actual - h[0]))[1]
                            
                            resultados_finales.append({
                                "tipo_observacion": "NEUROLOGICO",
                                "parametro": parametro_oficial,
                                "fecha_hora_registro": f"2026-02-08T{hora_asignada}:00Z",
                                "valor_numerico": v_num,
                                "unidad_medida": estandar.get("u"),
                                "rango_referencia_min": estandar.get("min"),
                                "rango_referencia_max": estandar.get("max"),
                                "coordenadas_zoom": {"x": celda['x'], "y": celda['y'], "w": celda['w'], "h": celda['h']},
                                "es_diario": False
                            })
                        except: continue

        # --- LÓGICA DE es_diario (Temporalmente estático en False) ---
        if resultados_finales:
            for obs in resultados_finales:
                obs["es_diario"] = False

        # =========================================================
        # --- MODO PRUEBA EN CONSOLA (Descomentar para depurar) ---
        # =========================================================
        # print("\n=== DATOS GLASGOW EXTRAÍDOS (MODO PRUEBA) ===")
        # for r in resultados_finales:
        #     print(f"{r['parametro']:<30} | Hora: {r['fecha_hora_registro'][-9:-1]} | Valor: {r['valor_numerico']} {r['unidad_medida']}")
        # 
        # print(f"\n=== TOTAL: {len(resultados_finales)} REGISTROS DETECTADOS ===")
        # print("=========================================================\n")
        # return []

        # =========================================================
        # --- INSERCIÓN REAL A LA BASE DE DATOS ---
        # =========================================================
        return resultados_finales