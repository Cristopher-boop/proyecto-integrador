from django.urls import path
from .views import (
    PacienteListCreateAPIView, PacienteDetailAPIView, PacienteReactivarAPIView,
    AdmisionListCreateAPIView, AdmisionDetailAPIView, AdmisionReactivarAPIView
)

# apps/patients/urls.py
urlpatterns = [
    path('', PacienteListCreateAPIView.as_view(), name='paciente-list-create'),
    path('<uuid:pk>/', PacienteDetailAPIView.as_view(), name='paciente-detail'),
    path('<uuid:pk>/reactivar/', PacienteReactivarAPIView.as_view(), name='paciente-reactivar'),

    path('admisiones/', AdmisionListCreateAPIView.as_view(), name='admision-list-create'),
    path('admisiones/<str:pk>/', AdmisionDetailAPIView.as_view(), name='admision-detail'),
    path('admisiones/<str:pk>/reactivar/', AdmisionReactivarAPIView.as_view(), name='admision-reactivar'),
]