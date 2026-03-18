from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.exceptions import ValidationError

from .models import Rol, Paciente, Admision, Usuario
from .serializers import RolSerializer, PacienteSerializer, AdmisionSerializer, UsuarioSerializer
from .services import crear_usuario

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer

class AdmisionViewSet(viewsets.ModelViewSet):
    queryset = Admision.objects.all()
    serializer_class = AdmisionSerializer

class RegistroUsuarioAPI(APIView):
    def post(self, request):
        try:
            # Llamamos a nuestro servicio limpio en lugar de escribir la logica aqui
            usuario = crear_usuario(
                nombre_usuario=request.data.get('nombre_usuario'),
                contraseña=request.data.get('contraseña'),
                nombre_completo=request.data.get('nombre_completo'),
                correo_electronico=request.data.get('correo_electronico'),
                roles_ids=request.data.get('roles_ids')
            )
            # Traducimos el usuario creado a JSON
            serializer = UsuarioSerializer(usuario)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response({'error': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)