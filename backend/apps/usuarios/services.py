from django.core.exceptions import ValidationError
from .models import Usuario, Rol

def crear_usuario(nombre_usuario, contraseña, nombre_completo, correo_electronico=None, roles_ids=None):
    """
    Servicio centralizado para la creación de usuarios en el INAAQC.
    Aplica las reglas de negocio y encripta la contraseña de forma segura.
    """
    
    # 1. Regla de negocio: No pueden existir dos usuarios con el mismo nombre
    if Usuario.objects.filter(nombre_usuario=nombre_usuario).exists():
        raise ValidationError("El nombre de usuario ya está registrado en el sistema.")

    # 2. Creación de la instancia en memoria
    usuario = Usuario(
        nombre_usuario=nombre_usuario,
        nombre_completo=nombre_completo,
        correo_electronico=correo_electronico
    )
    
    # 3. Encriptación obligatoria de la contraseña
    usuario.set_password(contraseña)
    
    # 4. Guardado en la base de datos PostgreSQL
    usuario.save()

    # 5. Asignación de roles (si se proporcionaron)
    if roles_ids:
        roles = Rol.objects.filter(id_rol__in=roles_ids)
        usuario.roles.set(roles)

    return usuario