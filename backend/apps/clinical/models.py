from django.db import models
import uuid
# Importamos la Admisión desde nuestra app de pacientes
from apps.patients.models import Admision

# ==========================================
# CATÁLOGOS (Requeridos para las tablas 6 y 7)
# ==========================================
class CatComorbilidad(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    definicion_tecnica = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class CatDiagnostico(models.Model):
    codigo = models.CharField(max_length=100, unique=True)
    nombre_diagnostico = models.TextField()

    def __str__(self):
        return f"{self.codigo} - {self.nombre_diagnostico}"

# ==========================================
# 3. ARCHIVOS FUENTE (Trazabilidad)
# ==========================================
class ArchivoFuente(models.Model):
    id_archivo = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admision = models.ForeignKey(Admision, on_delete=models.CASCADE, related_name='archivos')
    nombre_archivo = models.CharField(max_length=255)
    tipo_documento = models.CharField(max_length=20) # NA, NE, VIT, LAB, PUL, MED
    ruta_almacenamiento = models.TextField()

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