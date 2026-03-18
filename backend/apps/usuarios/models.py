import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

class Rol(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre_rol = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.nombre_rol

# Adaptación del usuario integrando el sistema base de Django
class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre_usuario = models.CharField(max_length=150, unique=True)
    nombre_completo = models.CharField(max_length=255)
    correo_electronico = models.EmailField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='activo')
    roles = models.ManyToManyField(Rol, related_name='usuarios')

    USERNAME_FIELD = 'nombre_usuario'

    def __str__(self):
        return self.nombre_completo

class Paciente(models.Model):
    id_paciente = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_externo = models.CharField(max_length=100, null=True, blank=True)
    nombre = models.CharField(max_length=150)
    apellido = models.CharField(max_length=150)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    sexo = models.CharField(max_length=20, null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='activo')

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

class Admision(models.Model):
    id_admision = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    id_paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='admisiones')
    fecha_ingreso = models.DateTimeField()
    fecha_salida = models.DateTimeField(null=True, blank=True)
    diagnostico_principal = models.TextField(null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, default='activo')

    def __str__(self):
        return f"Admisión {self.id_admision} - Paciente {self.id_paciente.nombre}"