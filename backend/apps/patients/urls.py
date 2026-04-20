from django.urls import path
from .views import PacienteListCreateAPIView, PacienteDetailAPIView, PacienteReactivarAPIView

# apps/patients/urls.py
urlpatterns = [
    path('', PacienteListCreateAPIView.as_view(), name='paciente-list-create'),
    path('<uuid:pk>/', PacienteDetailAPIView.as_view(), name='paciente-detail'),
    
    path('<uuid:pk>/reactivar/', PacienteReactivarAPIView.as_view(), name='paciente-reactivar'),
]