from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsTIUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'TI')


class IsInvestigadorUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'INVESTIGADOR')


class IsDoctorUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol == 'DOCTOR')


class IsSuperAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.rol == 'SUPERADMIN' or request.user.is_superuser)
        )


class CanManagePatients(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.rol in ['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanManageAdmissions(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.rol in ['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanUploadClinicalDocuments(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.rol in ['TI', 'INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanModifyObservations(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.rol in ['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanAccessSimulations(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.rol == 'TI':
            return False
        return request.user.rol in ['INVESTIGADOR', 'DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanAccessExpertSystem(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.rol in ['DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanAccessReports(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.rol in ['DOCTOR', 'SUPERADMIN'] or request.user.is_superuser


class CanAccessAuditLogs(BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method not in SAFE_METHODS:
            return False
        return request.user.rol == 'SUPERADMIN' or request.user.is_superuser


class CanManageBackups(BasePermission):
    """Acceso exclusivo al SuperAdmin para listar, generar y descargar respaldos."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.rol == 'SUPERADMIN' or request.user.is_superuser

