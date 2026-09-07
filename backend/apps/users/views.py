from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, AuditLogSerializer
from .services import UserService, AuditLogService
from .permissions import CanAccessAuditLogs
from .models import AuditLog

class UserListCreateAPIView(APIView):
    def get(self, request):
        usuarios = UserService.obtener_activos()
        serializer = UserSerializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            usuario = UserService.crear_usuario(serializer.validated_data)
            return Response(UserSerializer(usuario).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailAPIView(APIView):
    def get(self, request, pk):
        usuario = UserService.obtener_por_id(pk)
        if not usuario:
            return Response({"error": "Usuario no encontrado o inactivo"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserSerializer(usuario)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        usuario = UserService.obtener_por_id(pk)
        if not usuario:
            return Response({"error": "Usuario no encontrado o inactivo"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = UserSerializer(usuario, data=request.data, partial=True)
        if serializer.is_valid():
            usuario_act = UserService.actualizar_usuario(usuario, serializer.validated_data)
            return Response(UserSerializer(usuario_act).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        usuario = UserService.obtener_por_id(pk)
        if not usuario:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
        UserService.baja_logica(usuario)
        return Response({"mensaje": "Usuario dado de baja exitosamente"}, status=status.HTTP_200_OK)


class UserReactivarAPIView(APIView):
    def post(self, request, pk):
        usuario = UserService.reactivar_usuario(pk)
        if not usuario:
            return Response({"error": "Usuario no encontrado o ya activo"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"mensaje": f"El usuario {usuario.username} ha sido reactivado."}, status=status.HTTP_200_OK)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            username = request.data.get('username', '')
            user_data = response.data.get('user', {})
            rol = user_data.get('rol', '')
            AuditLogService.registrar(
                usuario=None,
                rol=rol,
                accion='LOGIN',
                modulo='AUTH',
                descripcion=f"Inicio de sesión exitoso del usuario '{username}' con rol '{rol}'.",
                request=request,
                estado='EXITO'
            )
        return response


class AuditLogListAPIView(APIView):
    permission_classes = [IsAuthenticated, CanAccessAuditLogs]

    def get(self, request):
        modulo = request.query_params.get('modulo', '').strip()
        rol = request.query_params.get('rol', '').strip()
        accion = request.query_params.get('accion', '').strip()
        estado = request.query_params.get('estado', '').strip()
        search = request.query_params.get('search', '').strip()

        logs = AuditLog.objects.all()

        if modulo:
            logs = logs.filter(modulo__iexact=modulo)
        if rol:
            logs = logs.filter(rol__iexact=rol)
        if accion:
            logs = logs.filter(accion__iexact=accion)
        if estado:
            logs = logs.filter(estado__iexact=estado)
        if search:
            logs = logs.filter(
                Q(usuario_nombre__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(ip_address__icontains=search)
            )

        # Limitar a los últimos 300 logs para alta performance
        logs = logs[:300]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)