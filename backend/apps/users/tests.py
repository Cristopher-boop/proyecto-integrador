from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import AuditLog
from apps.users.services import AuditLogService

User = get_user_model()

class AuditLogAndRBACUnitTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user_ti = User.objects.create_user(
            username='user_ti',
            password='Password123*',
            rol='TI',
            first_name='Tecnico',
            last_name='TI'
        )

        self.user_doctor = User.objects.create_user(
            username='user_doc',
            password='Password123*',
            rol='DOCTOR',
            first_name='Doctor',
            last_name='Clinico'
        )

        self.user_superadmin = User.objects.create_user(
            username='user_super',
            password='Password123*',
            rol='SUPERADMIN',
            first_name='Super',
            last_name='Admin'
        )

    def test_audit_log_service_creates_log(self):
        log = AuditLogService.registrar(
            accion='VINCULAR_DOCUMENTO_EPISODIO',
            modulo='INGESTA',
            descripcion='Vinculación de prueba para laboratorio',
            usuario=self.user_ti,
            estado='EXITOSO'
        )
        self.assertIsNotNone(log.id)
        self.assertEqual(log.usuario, self.user_ti)
        self.assertEqual(log.rol, 'TI')
        self.assertEqual(log.accion, 'VINCULAR_DOCUMENTO_EPISODIO')
        self.assertEqual(log.modulo, 'INGESTA')
        self.assertEqual(log.estado, 'EXITOSO')

    def test_superadmin_can_access_audit_logs(self):
        # Create a sample log
        AuditLog.objects.create(
            usuario=self.user_superadmin,
            usuario_nombre='Super Admin',
            rol='SUPERADMIN',
            accion='LOGIN',
            modulo='AUTENTICACION',
            descripcion='Inicio de sesión exitoso'
        )

        self.client.force_authenticate(user=self.user_superadmin)
        response = self.client.get('/api/v1/users/logs/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_doctor_forbidden_from_audit_logs(self):
        self.client.force_authenticate(user=self.user_doctor)
        response = self.client.get('/api/v1/users/logs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ti_forbidden_from_audit_logs(self):
        self.client.force_authenticate(user=self.user_ti)
        response = self.client.get('/api/v1/users/logs/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_audit_logs_are_immutable_superadmin_cannot_post(self):
        self.client.force_authenticate(user=self.user_superadmin)
        # Even superadmin cannot create logs via POST (it's read-only)
        response = self.client.post('/api/v1/users/logs/', {'accion': 'TEST'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
