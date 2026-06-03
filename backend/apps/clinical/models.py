import os
import uuid
from django.db import models
from datetime import datetime
from apps.patients.models import Admision

# ==========================================
# CATÁLOGOS (Requeridos para las tablas 6 y 7)
# ==========================================
class CatComorbilidad(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    # NUEVO CAMPO: Para agrupar (Ej: "Respiratory", "Severe Comorbidities")
    categoria = models.CharField(max_length=100, blank=True, null=True) 
    definicion_tecnica = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Catálogo de Comorbilidades"

    def __str__(self):
        return f"[{self.categoria}] {self.nombre}"

class CatDiagnostico(models.Model):
    codigo = models.CharField(max_length=100, unique=True)
    nombre_diagnostico = models.TextField()

    def __str__(self):
        return f"{self.codigo} - {self.nombre_diagnostico}"

# ==========================================
# 3. ARCHIVOS FUENTE (Trazabilidad)
# ==========================================
def ruta_dinamica_inaaqc(instance, filename):
    """
    Genera la ruta jerárquica para Cloudinary:
    INAAQC/Año/Mes/Día. Apellidos, Nombres (Episodio)/Archivo.pdf
    """
    # 1. Obtener fecha de la admisión (o actual si no hay)
    fecha = getattr(instance.admision, 'fecha_ingreso', datetime.now())
    año = fecha.strftime('%Y')
    
    # 2. Diccionario de meses en inglés (Formato: "02. FEBRUARY")
    meses = {
        1: 'JANUARY', 2: 'FEBRUARY', 3: 'MARCH', 4: 'APRIL', 5: 'MAY', 6: 'JUNE', 
        7: 'JULY', 8: 'AUGUST', 9: 'SEPTEMBER', 10: 'OCTOBER', 11: 'NOVEMBER', 12: 'DECEMBER'
    }
    mes_num = fecha.strftime('%m')
    mes_nombre = meses[fecha.month]
    carpeta_mes = f"{mes_num}. {mes_nombre}"
    
    # 3. Datos del Paciente (Formato: "14. PEREZ, JUAN (EP-001)")
    dia = fecha.strftime('%d')
    if instance.admision and instance.admision.paciente:
        nombres = instance.admision.paciente.nombres.upper()
        apellidos = instance.admision.paciente.apellidos.upper()
        paciente = f"{apellidos}, {nombres}"
        episodio = instance.admision.numero_episodio
    else:
        paciente = "PACIENTE_DESCONOCIDO"
        episodio = "SIN_EPISODIO"
        
    carpeta_paciente = f"{dia}. {paciente} ({episodio})"
    
    ruta_final = f"INAAQC/{año}/{carpeta_mes}/{carpeta_paciente}/{filename}"
    return ruta_final


class ArchivoFuente(models.Model):
    id_archivo = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admision = models.ForeignKey(Admision, on_delete=models.CASCADE, related_name='archivos')
    nombre_archivo = models.CharField(max_length=255)
    tipo_documento = models.CharField(max_length=20)
    
    archivo_fisico = models.FileField(upload_to=ruta_dinamica_inaaqc, null=True, blank=True)

    class Meta:
        verbose_name = "Archivo Fuente"
        verbose_name_plural = "Archivos Fuente"

    def __str__(self):
        return f"{self.tipo_documento} - {self.nombre_archivo}"

# ==========================================
# 4. OBSERVACIONES CLÍNICAS
# ==========================================
class ObservacionBiomedica(models.Model):
    id_observacion = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admision = models.ForeignKey(Admision, on_delete=models.CASCADE, related_name='observaciones')
    archivo_fuente = models.ForeignKey(ArchivoFuente, on_delete=models.SET_NULL, null=True, blank=True)
    
    parametro = models.CharField(max_length=100)
    valor_numerico = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    unidad_medida = models.CharField(max_length=20, null=True, blank=True)
    rango_referencia_min = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    rango_referencia_max = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    
    fecha_hora_registro = models.DateTimeField()
    coordenadas_zoom = models.JSONField(null=True, blank=True)
    es_diario = models.BooleanField(default=False)

# ==========================================
# 5. MEDICAMENTOS (Soporte Vital V8)
# ==========================================
class MedicamentoAdmision(models.Model):
    id_medicacion = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admision = models.ForeignKey(Admision, on_delete=models.CASCADE, related_name='medicamentos')
    archivo_fuente = models.ForeignKey(ArchivoFuente, on_delete=models.SET_NULL, null=True, blank=True)
    
    nombre = models.CharField(max_length=255)
    dosis_valor = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    dosis_unidad = models.CharField(max_length=20, null=True, blank=True)
    fecha_hora_inicio = models.DateTimeField(null=True, blank=True)
    coordenadas_zoom = models.JSONField(null=True, blank=True)

# ==========================================
# 6. INVESTIGACIÓN: COMORBILIDADES
# ==========================================
class ComorbilidadAdmision(models.Model):
    admision = models.ForeignKey(Admision, on_delete=models.CASCADE, related_name='comorbilidades_detectadas')
    comorbilidad = models.ForeignKey(CatComorbilidad, on_delete=models.RESTRICT)
    archivo_fuente = models.ForeignKey(ArchivoFuente, on_delete=models.SET_NULL, null=True, blank=True)
    
    presente = models.BooleanField(default=True)
    descripcion_original = models.TextField(null=True, blank=True)
    coordenadas_zoom = models.JSONField(null=True, blank=True)

    class Meta:
        unique_together = ('admision', 'comorbilidad')

# ==========================================
# 7. DIAGNÓSTICOS E INFERENCIAS
# ==========================================
class DiagnosticoEpisodio(models.Model):
    id_diagnostico_ep = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admision = models.ForeignKey(Admision, on_delete=models.CASCADE, related_name='diagnosticos_inferidos')
    catalogo_dx = models.ForeignKey(CatDiagnostico, on_delete=models.RESTRICT)
    
    es_inferido = models.BooleanField(default=False)
    confianza_ia = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    auditado_por_medico = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)

# ==========================================
# 8. SISTEMA EXPERTO (CATÁLOGOS Y PIVOTES)
# ==========================================

class CatSoporte(models.Model):
    """Catálogo de Soportes Orgánicos y Dispositivos Invasivos (Ej: VMI, TRR, ECMO)"""
    nombre = models.CharField(max_length=255, unique=True)
    categoria = models.CharField(max_length=100, blank=True, null=True) # Ej: 'Respiratorio', 'Renal'
    
    def __str__(self):
        return self.nombre

class SoporteAdmision(models.Model):
    """Relación de qué soportes requirió el paciente durante su episodio"""
    admision = models.ForeignKey('patients.Admision', on_delete=models.CASCADE)
    soporte = models.ForeignKey(CatSoporte, on_delete=models.CASCADE)
    fecha_hora_inicio = models.DateTimeField(null=True, blank=True)
    fecha_hora_fin = models.DateTimeField(null=True, blank=True)
    en_primeras_24h = models.BooleanField(default=True)

    class Meta:
        unique_together = ('admision', 'soporte')

class PuntajesEpisodio(models.Model):
    """Tabla para almacenar los cálculos matemáticos del Motor de Inferencia"""
    admision = models.OneToOneField('patients.Admision', on_delete=models.CASCADE, primary_key=True)
    
    # SOFA
    sofa_respiratorio = models.IntegerField(default=0)
    sofa_cardiovascular = models.IntegerField(default=0)
    sofa_renal = models.IntegerField(default=0)
    sofa_hepatico = models.IntegerField(default=0)
    sofa_coagulacion = models.IntegerField(default=0)
    sofa_neurologico = models.IntegerField(default=0)
    sofa_total = models.IntegerField(default=0)
    
    # SAPS 3
    saps3_puntos = models.IntegerField(default=0)
    saps3_mortalidad_estimada = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True) # Porcentaje %
    
    # Metadatos del cálculo
    ultima_actualizacion = models.DateTimeField(auto_now=True)
    datos_insuficientes = models.BooleanField(default=False) # Si falta Na, K, o GCS, se marca True

    def __str__(self):
        return f"Puntajes de Admisión {self.admision.numero_episodio}"