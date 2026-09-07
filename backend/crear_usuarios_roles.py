import os
import sys
import django

# Configurar entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

USUARIOS_A_CREAR = [
    {
        'username': 'ti',
        'password': '1234',
        'email': 'ti@inaaqc.edu.bo',
        'first_name': 'Área de',
        'last_name': 'TI',
        'rol': 'TI',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'investigador',
        'password': '1234',
        'email': 'investigador@inaaqc.edu.bo',
        'first_name': 'Pedro',
        'last_name': 'Investigador',
        'rol': 'INVESTIGADOR',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'doctor',
        'password': '1234',
        'email': 'doctor@inaaqc.edu.bo',
        'first_name': 'Armin',
        'last_name': 'Doctor',
        'rol': 'DOCTOR',
        'is_staff': False,
        'is_superuser': False,
    },
    {
        'username': 'superadmin',
        'password': '1234',
        'email': 'superadmin@inaaqc.edu.bo',
        'first_name': 'Super',
        'last_name': 'Admin',
        'rol': 'SUPERADMIN',
        'is_staff': True,
        'is_superuser': True,
    }
]

def crear_o_actualizar_usuarios():
    print("=========================================================")
    print(" INAAQC - Creando / Actualizando Usuarios de Prueba")
    print("=========================================================")
    for datos in USUARIOS_A_CREAR:
        username = datos['username']
        password = datos['password']
        rol = datos['rol']
        
        user, created = User.objects.get_or_create(username=username)
        user.set_password(password)
        user.rol = rol
        user.first_name = datos['first_name']
        user.last_name = datos['last_name']
        user.email = datos['email']
        user.is_staff = datos.get('is_staff', False)
        user.is_superuser = datos.get('is_superuser', False)
        user.is_active = True
        user.save()
        
        estado = "NUEVO CREADO" if created else "ACTUALIZADO"
        print(f" -> [{estado}] Usuario: {username:<14} | Contraseña: {password:<6} | Rol: {rol}")
    
    print("=========================================================")
    print(" Proceso finalizado con éxito.")

if __name__ == '__main__':
    crear_o_actualizar_usuarios()
