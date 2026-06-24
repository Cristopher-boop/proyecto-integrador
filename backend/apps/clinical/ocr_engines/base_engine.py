import pytesseract
from django.conf import settings

# 1. Intentamos leer la ruta desde el settings.py (para cuando estemos en la nube/Linux)
# 2. Si no existe, usamos tu ruta local de Windows como "Fallback" seguro.
ruta_tesseract = getattr(
    settings, 
    'TESSERACT_PATH', 
    r'C:\Users\crist\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
)

pytesseract.pytesseract.tesseract_cmd = ruta_tesseract

class MotorOCRBase:
    """
    Clase padre para todos los motores de Visión Computacional.
    Aquí centralizamos la configuración de Tesseract y, en el futuro,
    podemos meter aquí los algoritmos de OpenCV que se repitan.
    """
    pass