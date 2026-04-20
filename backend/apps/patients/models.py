from django.db import models
import uuid

# ==========================================
# 1. IDENTIDAD DEL PACIENTE
# ==========================================
class Paciente(models.Model):
    SEXO_CHOICES = (('M', 'Masculino'), ('F', 'Femenino'), ('U', 'Desconocido'))

    id_paciente = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dossier_erasme = models.CharField(max_length=20, unique=True)
    dossier_mpi = models.CharField(max_length=20, unique=True, null=True, blank=True)
    nombres = models.CharField(max_length=255)
    apellidos = models.CharField(max_length=255)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=1, choices=SEXO_CHOICES, null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    esta_activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.apellidos}, {self.nombres} ({self.dossier_erasme})"


# ==========================================
# 2. ADMISIONES (El Contexto)
# ==========================================
class Admision(models.Model):
    id_admision = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='admisiones')
    numero_episodio = models.CharField(max_length=9, unique=True)
    
    fecha_ingreso = models.DateTimeField()
    fecha_salida = models.DateTimeField(null=True, blank=True)
    
    cama_sala = models.CharField(max_length=50, null=True, blank=True)
    peso_ingreso_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    talla_ingreso_cm = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    esta_activo = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['fecha_ingreso', 'fecha_salida']),
        ]

    def __str__(self):
        return f"Episodio {self.numero_episodio} - {self.paciente.apellidos}"