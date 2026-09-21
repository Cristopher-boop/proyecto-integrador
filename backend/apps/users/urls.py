from django.urls import path
from .views import (
    UserListCreateAPIView, 
    UserDetailAPIView, 
    UserReactivarAPIView, 
    AuditLogListAPIView,
    AuditLogExportAPIView,
    SystemBackupListCreateAPIView,
    SystemBackupDownloadAPIView,
    SystemBackupScheduleStatusAPIView,
)

urlpatterns = [
    path('', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('logs/', AuditLogListAPIView.as_view(), name='audit-logs-list'),
    path('logs/exportar/', AuditLogExportAPIView.as_view(), name='audit-logs-export'),
    path('backups/', SystemBackupListCreateAPIView.as_view(), name='system-backups-list-create'),
    path('backups/estado-programacion/', SystemBackupScheduleStatusAPIView.as_view(), name='system-backups-schedule-status'),
    path('backups/<uuid:pk>/descargar/', SystemBackupDownloadAPIView.as_view(), name='system-backups-download'),
    path('<uuid:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('<uuid:pk>/reactivar/', UserReactivarAPIView.as_view(), name='user-reactivar'),
]