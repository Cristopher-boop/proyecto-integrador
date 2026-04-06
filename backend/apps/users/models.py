from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class User(AbstractUser):
    # UUID por seguridad y escalabilidad
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Roles del Sistema INAAQC
    ROLE_CHOICES = (
        ('TI', 'Tecnologías de la Información'),
        ('DOCTOR', 'Médico Investigador'),
        ('ANALISTA', 'Analista Biomédico'),
        ('SUPERADMIN', 'Administrador Global'),
    )
    
    rol = models.CharField(max_length=15, choices=ROLE_CHOICES, default='ANALISTA')
    
    def __str__(self):
        return f"{self.username} - {self.get_rol_display()}"