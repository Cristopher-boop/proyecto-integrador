from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import PacienteSerializer
from .services import PacienteService

class PacienteListCreateAPIView(APIView):
    # Descomenta la siguiente línea cuando quieras proteger la ruta con Token JWT
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        pacientes = PacienteService.obtener_activos()
        serializer = PacienteSerializer(pacientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Crea un nuevo paciente"""
        serializer = PacienteSerializer(data=request.data)
        if serializer.is_valid():
            paciente = PacienteService.crear_paciente(serializer.validated_data)
            return Response(PacienteSerializer(paciente).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PacienteDetailAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """Obtiene un paciente por ID"""
        paciente = PacienteService.obtener_por_id(pk)
        if not paciente:
            return Response({"error": "Paciente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = PacienteSerializer(paciente)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        """Actualizar paciente (PUT o PATCH)"""
        paciente = PacienteService.obtener_por_id(pk)
        if not paciente:
            return Response({"error": "Paciente no encontrado o inactivo"}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = PacienteSerializer(paciente, data=request.data, partial=True)
        if serializer.is_valid():
            paciente_actualizado = PacienteService.actualizar_paciente(paciente, serializer.validated_data)
            return Response(PacienteSerializer(paciente_actualizado).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Baja lógica"""
        paciente = PacienteService.obtener_por_id(pk)
        if not paciente:
            return Response({"error": "Paciente no encontrado"}, status=status.HTTP_404_NOT_FOUND)
            
        PacienteService.baja_logica(paciente)
        return Response({"mensaje": "Paciente desactivado correctamente (Baja lógica)"}, status=status.HTTP_200_OK)
    
class PacienteReactivarAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        """Acción específica: Reactiva un paciente inactivo (Baja Lógica)"""
        paciente = PacienteService.reactivar_paciente(pk)
        
        if not paciente:
            return Response(
                {"error": "Paciente no encontrado o ya se encuentra activo actualmente."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        return Response(
            {"mensaje": f"El paciente {paciente.nombres} {paciente.apellidos} ha sido reactivado exitosamente."}, 
            status=status.HTTP_200_OK
        )