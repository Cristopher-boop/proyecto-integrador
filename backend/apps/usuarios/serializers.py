from rest_framework import serializers
from .models import Usuario, Rol, Paciente, Admision

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    # Esto nos permite ver los detalles de los roles asignados, no solo su ID
    roles = RolSerializer(many=True, read_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id_usuario', 
            'nombre_usuario', 
            'nombre_completo', 
            'correo_electronico', 
            'estado', 
            'creado_en', 
            'roles'
        ]
        # Nota de seguridad: Omitimos la contraseña aquí. 
        # Las contraseñas nunca deben salir en las respuestas JSON.

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class AdmisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admision
        fields = '__all__'