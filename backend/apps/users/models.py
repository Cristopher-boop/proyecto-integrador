from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    # UUID por seguridad y escalabilidad
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Roles del Sistema INAAQC
    ROLE_CHOICES = (
        ('TI', 'Área de TI'),
        ('INVESTIGADOR', 'Investigador'),
        ('DOCTOR', 'Doctor / Médico'),
        ('SUPERADMIN', 'Superadministrador'),
        ('ANALISTA', 'Analista Biomédico'), # Compatibilidad retroactiva
    )
    
    rol = models.CharField(max_length=15, choices=ROLE_CHOICES, default='DOCTOR')
    
    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    usuario = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='logs'
    )
    usuario_nombre = models.CharField(max_length=150)
    rol = models.CharField(max_length=20)
    accion = models.CharField(max_length=60)
    modulo = models.CharField(max_length=50)
    descripcion = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=15,
        choices=(('EXITO', 'Éxito'), ('ADVERTENCIA', 'Advertencia'), ('ERROR', 'Error')),
        default='EXITO'
    )

    class Meta:
        ordering = ['-fecha_hora']
        verbose_name = 'Log de Auditoría'
        verbose_name_plural = 'Logs de Auditoría'
        indexes = [
            models.Index(fields=['-fecha_hora']),
            models.Index(fields=['modulo', 'accion']),
            models.Index(fields=['rol']),
        ]

    def __str__(self):
        return f"[{self.fecha_hora.strftime('%Y-%m-%d %H:%M:%S')}] {self.usuario_nombre} ({self.rol}) - {self.modulo} / {self.accion} [{self.estado}]"


class SystemBackup(models.Model):
    TIPO_CHOICES = (
        ('PROGRAMADO_QUINCENAL', 'Corte Quincenal Automático (15/30)'),
        ('MANUAL_SUPERADMIN', 'Respaldo Completo Superadmin'),
    )
    ESTADO_CHOICES = (
        ('COMPLETADO', 'Completado'),
        ('FALLIDO', 'Fallido'),
        ('EN_PROCESO', 'En Proceso'),
    )

    id_backup = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES, default='MANUAL_SUPERADMIN')
    nombre_archivo = models.CharField(max_length=255)
    ruta_archivo = models.CharField(max_length=500)
    tamanio_bytes = models.BigIntegerField(default=0)
    tamanio_legible = models.CharField(max_length=50, blank=True)
    checksum_sha256 = models.CharField(max_length=64)
    total_registros = models.JSONField(default=dict, blank=True)
    creado_por = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='backups_generados'
    )
    creado_por_nombre = models.CharField(max_length=150, default='Sistema Programado')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='COMPLETADO')
    periodo_inicio = models.DateField(null=True, blank=True)
    periodo_fin = models.DateField(null=True, blank=True)
    detalles = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-creado_en']
        verbose_name = 'Respaldo del Sistema'
        verbose_name_plural = 'Respaldos del Sistema'
        indexes = [
            models.Index(fields=['-creado_en']),
            models.Index(fields=['tipo']),
            models.Index(fields=['estado']),
        ]

    def __str__(self):
        return f"[{self.creado_en.strftime('%Y-%m-%d %H:%M')}] {self.nombre_archivo} ({self.get_tipo_display()}) - {self.tamanio_legible}"