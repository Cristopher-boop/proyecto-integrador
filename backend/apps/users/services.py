from django.contrib.auth import get_user_model
from .models import AuditLog

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


class AuditLogService:
    @staticmethod
    def get_client_ip(request):
        if not request:
            return None
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @staticmethod
    def registrar(
        usuario=None,
        accion='',
        modulo='',
        descripcion='',
        request=None,
        estado='EXITO',
        rol=None
    ):
        """Registra un evento de auditoría en la base de datos de manera inmutable."""
        try:
            user_obj = None
            if usuario and getattr(usuario, 'is_authenticated', False):
                user_obj = usuario
            elif request and getattr(request, 'user', None) and request.user.is_authenticated:
                user_obj = request.user

            usuario_nombre = getattr(user_obj, 'username', 'Sistema / Anónimo')
            user_rol = rol or getattr(user_obj, 'rol', 'INVITADO')
            ip = AuditLogService.get_client_ip(request)

            return AuditLog.objects.create(
                usuario=user_obj,
                usuario_nombre=usuario_nombre,
                rol=user_rol,
                accion=accion,
                modulo=modulo,
                descripcion=descripcion,
                ip_address=ip,
                estado=estado
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error al registrar log de auditoría: {e}")
            return None