from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api import RolViewSet, PacienteViewSet, AdmisionViewSet, RegistroUsuarioAPI

router = DefaultRouter()
router.register(r'roles', RolViewSet)
router.register(r'pacientes', PacienteViewSet)
router.register(r'admisiones', AdmisionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('registro/', RegistroUsuarioAPI.as_view(), name='registro_usuario'),
]