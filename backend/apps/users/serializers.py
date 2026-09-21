from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import AuditLog, SystemBackup

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'is_active', 'password']
        # ¡Seguridad Crítica! La contraseña se puede escribir, pero NUNCA leer.
        extra_kwargs = {
            'password': {'write_only': True}
        }


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['rol'] = user.rol
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_superuser'] = user.is_superuser
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': str(self.user.id),
            'username': self.user.username,
            'email': self.user.email,
            'rol': self.user.rol,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_superuser': self.user.is_superuser,
        }
        return data


class AuditLogSerializer(serializers.ModelSerializer):
    fecha_formateada = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            'id', 'usuario', 'usuario_nombre', 'rol', 'accion',
            'modulo', 'descripcion', 'ip_address', 'fecha_hora',
            'fecha_formateada', 'estado'
        ]

    def get_fecha_formateada(self, obj):
        return obj.fecha_hora.strftime('%d/%m/%Y %H:%M:%S') if obj.fecha_hora else ''


class SystemBackupSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    fecha_formateada = serializers.SerializerMethodField()

    class Meta:
        model = SystemBackup
        fields = [
            'id_backup', 'tipo', 'tipo_display', 'nombre_archivo',
            'tamanio_bytes', 'tamanio_legible', 'checksum_sha256',
            'total_registros', 'creado_por', 'creado_por_nombre',
            'estado', 'periodo_inicio', 'periodo_fin', 'detalles',
            'creado_en', 'fecha_formateada'
        ]

    def get_fecha_formateada(self, obj):
        return obj.creado_en.strftime('%d/%m/%Y %H:%M:%S') if obj.creado_en else ''