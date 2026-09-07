from django.urls import path
from .views import UserListCreateAPIView, UserDetailAPIView, UserReactivarAPIView, AuditLogListAPIView

urlpatterns = [
    path('', UserListCreateAPIView.as_view(), name='user-list-create'),
    path('logs/', AuditLogListAPIView.as_view(), name='audit-logs-list'),
    path('<uuid:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('<uuid:pk>/reactivar/', UserReactivarAPIView.as_view(), name='user-reactivar'),
]