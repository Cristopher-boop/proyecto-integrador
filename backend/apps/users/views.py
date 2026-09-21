import os
import csv
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Q
from django.http import FileResponse, Http404, HttpResponse
from .serializers import (
    UserSerializer, 
    CustomTokenObtainPairSerializer, 
    AuditLogSerializer,
    SystemBackupSerializer
)
from .services import UserService, AuditLogService, BackupService
from .permissions import CanAccessAuditLogs, CanManageBackups
from .models import AuditLog, SystemBackup

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
        fecha_desde = request.query_params.get('fecha_desde', '').strip()
        fecha_hasta = request.query_params.get('fecha_hasta', '').strip()

        logs = AuditLog.objects.all()

        if modulo:
            logs = logs.filter(modulo__iexact=modulo)
        if rol:
            logs = logs.filter(rol__iexact=rol)
        if accion:
            logs = logs.filter(accion__iexact=accion)
        if estado:
            logs = logs.filter(estado__iexact=estado)
        if fecha_desde:
            logs = logs.filter(fecha_hora__date__gte=fecha_desde)
        if fecha_hasta:
            logs = logs.filter(fecha_hora__date__lte=fecha_hasta)
        if search:
            logs = logs.filter(
                Q(usuario_nombre__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(ip_address__icontains=search)
            )

        limit = request.query_params.get('limit')
        try:
            limit = int(limit) if limit else 300
        except ValueError:
            limit = 300

        logs = logs[:limit]
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuditLogExportAPIView(APIView):
    permission_classes = [IsAuthenticated, CanAccessAuditLogs]

    def get(self, request):
        modulo = request.query_params.get('modulo', '').strip()
        rol = request.query_params.get('rol', '').strip()
        accion = request.query_params.get('accion', '').strip()
        estado = request.query_params.get('estado', '').strip()
        search = request.query_params.get('search', '').strip()
        fecha_desde = request.query_params.get('fecha_desde', '').strip()
        fecha_hasta = request.query_params.get('fecha_hasta', '').strip()
        formato = request.query_params.get('formato', 'csv').lower().strip()

        logs = AuditLog.objects.all()
        if modulo: logs = logs.filter(modulo__iexact=modulo)
        if rol: logs = logs.filter(rol__iexact=rol)
        if accion: logs = logs.filter(accion__iexact=accion)
        if estado: logs = logs.filter(estado__iexact=estado)
        if fecha_desde: logs = logs.filter(fecha_hora__date__gte=fecha_desde)
        if fecha_hasta: logs = logs.filter(fecha_hora__date__lte=fecha_hasta)
        if search:
            logs = logs.filter(
                Q(usuario_nombre__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(ip_address__icontains=search)
            )

        if formato == 'json':
            serializer = AuditLogSerializer(logs[:1000], many=True)
            response = HttpResponse(
                json.dumps(serializer.data, indent=2, ensure_ascii=False),
                content_type='application/json'
            )
            response['Content-Disposition'] = 'attachment; filename="logs_auditoria_inaaqc.json"'
            return response

        # Default CSV
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="logs_auditoria_inaaqc.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Fecha y Hora', 'Usuario', 'Rol', 'Módulo', 'Acción', 'Descripción', 'IP', 'Estado'])
        for log in logs[:2000]:
            writer.writerow([
                log.fecha_hora.strftime('%d/%m/%Y %H:%M:%S') if log.fecha_hora else '',
                log.usuario_nombre,
                log.rol,
                log.modulo,
                log.accion,
                log.descripcion,
                log.ip_address or '',
                log.estado
            ])
        return response


class SystemBackupListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated, CanManageBackups]

    def get(self, request):
        backups = SystemBackup.objects.all().order_by('-creado_en')
        serializer = SystemBackupSerializer(backups, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        notas = request.data.get('notas', '').strip()
        tipo = request.data.get('tipo', 'MANUAL_SUPERADMIN')
        try:
            backup = BackupService.crear_backup(
                usuario=request.user,
                tipo=tipo,
                notas=notas
            )
            serializer = SystemBackupSerializer(backup)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"Error al generar el respaldo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SystemBackupDownloadAPIView(APIView):
    permission_classes = [IsAuthenticated, CanManageBackups]

    def get(self, request, pk):
        try:
            backup = SystemBackup.objects.get(pk=pk)
        except SystemBackup.DoesNotExist:
            raise Http404("Respaldo no encontrado")

        if not os.path.exists(backup.ruta_archivo):
            return Response(
                {"error": "El archivo de respaldo no se encuentra en el almacenamiento."},
                status=status.HTTP_404_NOT_FOUND
            )

        AuditLogService.registrar(
            usuario=request.user,
            accion='DESCARGAR_BACKUP',
            modulo='BACKUPS',
            descripcion=f"El Superadmin {request.user.username} descargó el archivo de respaldo '{backup.nombre_archivo}'.",
            estado='EXITO'
        )

        response = FileResponse(
            open(backup.ruta_archivo, 'rb'),
            as_attachment=True,
            filename=backup.nombre_archivo,
            content_type='application/zip'
        )
        return response


class SystemBackupScheduleStatusAPIView(APIView):
    permission_classes = [IsAuthenticated, CanManageBackups]

    def get(self, request):
        estado = BackupService.obtener_estado_programacion()
        return Response(estado, status=status.HTTP_200_OK)