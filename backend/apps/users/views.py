from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from .services import UserService

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