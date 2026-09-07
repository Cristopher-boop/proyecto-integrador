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