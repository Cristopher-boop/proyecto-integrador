from django.contrib.auth import get_user_model

User = get_user_model()

class UserService:
    @staticmethod
    def obtener_activos():
        """Retorna usuarios que no tienen baja lógica."""
        return User.objects.filter(is_active=True)

    @staticmethod
    def crear_usuario(datos_validados):
        """Crea un usuario y encripta su contraseña de forma segura."""
        password = datos_validados.pop('password', None)
        usuario = User(**datos_validados)
        if password:
            usuario.set_password(password) # Encriptación (Regla de Negocio)
        usuario.save()
        return usuario

    @staticmethod
    def obtener_por_id(pk):
        try:
            return User.objects.get(pk=pk, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def actualizar_usuario(usuario, datos_validados):
        """Actualiza datos. Si mandan nueva contraseña, la encripta."""
        password = datos_validados.pop('password', None)
        for campo, valor in datos_validados.items():
            setattr(usuario, campo, valor)
            
        if password:
            usuario.set_password(password)
            
        usuario.save()
        return usuario

    @staticmethod
    def baja_logica(usuario):
        """Desactiva al usuario del sistema."""
        usuario.is_active = False
        usuario.save()
        return True

    @staticmethod
    def reactivar_usuario(pk):
        """Devuelve el acceso al usuario."""
        try:
            usuario = User.objects.get(pk=pk, is_active=False)
            usuario.is_active = True
            usuario.save()
            return usuario
        except User.DoesNotExist:
            return None