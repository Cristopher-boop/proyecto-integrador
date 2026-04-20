from rest_framework import serializers
from django.contrib.auth import get_user_model

# Obtenemos tu modelo personalizado de forma segura
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'rol', 'is_active', 'password']
        # ¡Seguridad Crítica! La contraseña se puede escribir, pero NUNCA leer.
        extra_kwargs = {
            'password': {'write_only': True}
        }