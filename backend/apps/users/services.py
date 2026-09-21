import os
import io
import json
import zipfile
import hashlib
from datetime import datetime, date, timedelta
from django.conf import settings
from django.core.management import call_command
from django.contrib.auth import get_user_model
from .models import AuditLog, SystemBackup

User = get_user_model()

class UserService:
    @staticmethod
    def obtener_activos():
        """Retorna usuarios que no tienen baja lógica."""
        return User.objects.filter(is_active=True)

    @staticmethod
    def crear_usuario(datos_validados):
        """Crea un usuario y encripta su contraseña de forma segura."""
        password = datos_validados.pop('password', None)
        usuario = User(**datos_validados)
        if password:
            usuario.set_password(password) # Encriptación (Regla de Negocio)
        usuario.save()
        return usuario

    @staticmethod
    def obtener_por_id(pk):
        try:
            return User.objects.get(pk=pk, is_active=True)
        except User.DoesNotExist:
            return None

    @staticmethod
    def actualizar_usuario(usuario, datos_validados):
        """Actualiza datos. Si mandan nueva contraseña, la encripta."""
        password = datos_validados.pop('password', None)
        for campo, valor in datos_validados.items():
            setattr(usuario, campo, valor)
            
        if password:
            usuario.set_password(password)
            
        usuario.save()
        return usuario

    @staticmethod
    def baja_logica(usuario):
        """Desactiva al usuario del sistema."""
        usuario.is_active = False
        usuario.save()
        return True

    @staticmethod
    def reactivar_usuario(pk):
        """Devuelve el acceso al usuario."""
        try:
            usuario = User.objects.get(pk=pk, is_active=False)
            usuario.is_active = True
            usuario.save()
            return usuario
        except User.DoesNotExist:
            return None


class AuditLogService:
    @staticmethod
    def get_client_ip(request):
        if not request:
            return None
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    @staticmethod
    def registrar(
        usuario=None,
        accion='',
        modulo='',
        descripcion='',
        request=None,
        estado='EXITO',
        rol=None
    ):
        """Registra un evento de auditoría en la base de datos de manera inmutable."""
        try:
            user_obj = None
            if usuario and getattr(usuario, 'is_authenticated', False):
                user_obj = usuario
            elif request and getattr(request, 'user', None) and request.user.is_authenticated:
                user_obj = request.user

            usuario_nombre = getattr(user_obj, 'username', 'Sistema / Anónimo')
            user_rol = rol or getattr(user_obj, 'rol', 'INVITADO')
            ip = AuditLogService.get_client_ip(request)

            return AuditLog.objects.create(
                usuario=user_obj,
                usuario_nombre=usuario_nombre,
                rol=user_rol,
                accion=accion,
                modulo=modulo,
                descripcion=descripcion,
                ip_address=ip,
                estado=estado
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Error al registrar log de auditoría: {e}")
            return None


class BackupService:
    @staticmethod
    def formatear_tamanio(tamanio_bytes):
        """Convierte bytes a formato legible (KB, MB, GB)."""
        if tamanio_bytes < 1024:
            return f"{tamanio_bytes} B"
        elif tamanio_bytes < 1024 * 1024:
            return f"{tamanio_bytes / 1024:.1f} KB"
        elif tamanio_bytes < 1024 * 1024 * 1024:
            return f"{tamanio_bytes / (1024 * 1024):.2f} MB"
        else:
            return f"{tamanio_bytes / (1024 * 1024 * 1024):.2f} GB"

    @staticmethod
    def obtener_resumen_registros():
        """Obtiene el conteo total de registros de cada módulo para el respaldo."""
        resumen = {}
        try:
            from apps.patients.models import Paciente, Admision
            resumen['pacientes'] = Paciente.objects.count()
            resumen['admisiones'] = Admision.objects.count()
        except Exception:
            resumen['pacientes'] = 0
            resumen['admisiones'] = 0

        try:
            from apps.clinical.models import (
                ObservacionBiomedica,
                ArchivoFuente,
                MedicamentoAdmision,
                ComorbilidadAdmision,
                DiagnosticoAdmision
            )
            resumen['observaciones_biomedicas'] = ObservacionBiomedica.objects.count()
            resumen['archivos_fuente'] = ArchivoFuente.objects.count()
            resumen['medicamentos'] = MedicamentoAdmision.objects.count()
            resumen['comorbilidades'] = ComorbilidadAdmision.objects.count()
            resumen['diagnosticos'] = DiagnosticoAdmision.objects.count()
        except Exception:
            resumen['observaciones_biomedicas'] = 0
            resumen['archivos_fuente'] = 0
            resumen['medicamentos'] = 0
            resumen['comorbilidades'] = 0
            resumen['diagnosticos'] = 0

        resumen['usuarios'] = User.objects.count()
        resumen['logs_auditoria'] = AuditLog.objects.count()
        return resumen

    @staticmethod
    def crear_backup(usuario=None, tipo='MANUAL_SUPERADMIN', periodo_inicio=None, periodo_fin=None, notas=''):
        """
        Genera un respaldo completo del sistema empaquetado en un archivo .zip:
        - Dump integral de base de datos (JSON portable)
        - Exportación de logs de auditoría
        - Archivos clínicos del almacenamiento local si existen
        - Manifest con checksum SHA-256
        """
        now = datetime.now()
        timestamp_str = now.strftime('%Y%m%d_%H%M%S')
        
        if tipo == 'PROGRAMADO_QUINCENAL':
            prefijo = 'backup_inaaqc_quincenal'
        else:
            prefijo = 'backup_inaaqc_full'
            
        nombre_archivo = f"{prefijo}_{timestamp_str}.zip"
        
        # Directorio de almacenamiento de backups
        backups_dir = os.path.join(settings.MEDIA_ROOT, 'backups')
        os.makedirs(backups_dir, exist_ok=True)
        ruta_zip = os.path.join(backups_dir, nombre_archivo)
        
        resumen_registros = BackupService.obtener_resumen_registros()
        
        # 1. Volcado completo de la base de datos vía dumpdata
        dump_buffer = io.StringIO()
        call_command('dumpdata', 'patients', 'clinical', 'users', format='json', indent=2, stdout=dump_buffer)
        json_dump_content = dump_buffer.getvalue()

        # 2. Exportación específica de logs de auditoría para trazabilidad rápida
        logs_buffer = io.StringIO()
        call_command('dumpdata', 'users.AuditLog', format='json', indent=2, stdout=logs_buffer)
        logs_dump_content = logs_buffer.getvalue()

        # 3. Metadatos del respaldo (Manifest)
        manifest_data = {
            'sistema': 'INAAQC UCI Platform',
            'version': '2.0.0',
            'fecha_generacion': now.isoformat(),
            'tipo_backup': tipo,
            'creado_por': usuario.username if usuario and getattr(usuario, 'is_authenticated', False) else 'Sistema Programado',
            'periodo_inicio': str(periodo_inicio) if periodo_inicio else None,
            'periodo_fin': str(periodo_fin) if periodo_fin else None,
            'total_registros': resumen_registros,
            'total_global_registros': sum(resumen_registros.values()),
            'notas': notas
        }
        manifest_json = json.dumps(manifest_data, indent=2, ensure_ascii=False)

        # 4. Creación del archivo comprimido ZIP
        with zipfile.ZipFile(ruta_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr('manifest.json', manifest_json)
            zipf.writestr('base_datos_inaaqc.json', json_dump_content)
            zipf.writestr('auditoria_logs.json', logs_dump_content)

            # Incluir archivos físicos de la carpeta media si existen
            archivos_dir = os.path.join(settings.MEDIA_ROOT, 'INAAQC')
            if os.path.exists(archivos_dir):
                for root, _, files in os.walk(archivos_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        rel_path = os.path.relpath(file_path, settings.MEDIA_ROOT)
                        zipf.write(file_path, arcname=os.path.join('archivos_clinicos', rel_path))

        # 5. Cálculo del checksum criptográfico SHA-256
        sha256 = hashlib.sha256()
        with open(ruta_zip, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)
        checksum = sha256.hexdigest()

        # 6. Tamaño del archivo
        tamanio_bytes = os.path.getsize(ruta_zip)
        tamanio_legible = BackupService.formatear_tamanio(tamanio_bytes)

        # 7. Persistir en base de datos
        backup = SystemBackup.objects.create(
            tipo=tipo,
            nombre_archivo=nombre_archivo,
            ruta_archivo=ruta_zip,
            tamanio_bytes=tamanio_bytes,
            tamanio_legible=tamanio_legible,
            checksum_sha256=checksum,
            total_registros=resumen_registros,
            creado_por=usuario if usuario and getattr(usuario, 'is_authenticated', False) else None,
            creado_por_nombre=usuario.username if usuario and getattr(usuario, 'is_authenticated', False) else 'Sistema Programado',
            estado='COMPLETADO',
            periodo_inicio=periodo_inicio or now.date(),
            periodo_fin=periodo_fin or now.date(),
            detalles=notas or f"Respaldo exitoso con {sum(resumen_registros.values())} registros en total."
        )

        # 8. Auditoría inmutable del evento
        AuditLogService.registrar(
            usuario=usuario,
            accion='CREAR_BACKUP_SISTEMA',
            modulo='BACKUPS',
            descripcion=f"Se generó el respaldo '{nombre_archivo}' ({tamanio_legible}) con {sum(resumen_registros.values())} registros y checksum SHA-256: {checksum[:12]}...",
            estado='EXITO'
        )

        return backup

    @staticmethod
    def verificar_y_ejecutar_corte_quincenal(forzar=False):
        """
        Evalúa y ejecuta el corte programado para los días 15 y 30 (o fin de mes).
        Si forzar=True, genera el corte inmediatamente.
        """
        hoy = date.today()
        es_dia_15 = (hoy.day == 15)
        manana = hoy + timedelta(days=1)
        es_fin_de_mes = (manana.month != hoy.month) or (hoy.day == 30)

        if not (forzar or es_dia_15 or es_fin_de_mes):
            return None

        # Si no se fuerza, verificar si ya se ejecutó un corte hoy
        if not forzar:
            ya_ejecutado = SystemBackup.objects.filter(
                tipo='PROGRAMADO_QUINCENAL',
                creado_en__date=hoy
            ).exists()
            if ya_ejecutado:
                return None

        # Determinar periodo quincenal
        if hoy.day <= 15:
            periodo_inicio = hoy.replace(day=1)
            periodo_fin = hoy.replace(day=15)
        else:
            periodo_inicio = hoy.replace(day=16)
            periodo_fin = hoy

        backup = BackupService.crear_backup(
            usuario=None,
            tipo='PROGRAMADO_QUINCENAL',
            periodo_inicio=periodo_inicio,
            periodo_fin=periodo_fin,
            notas=f"Corte quincenal automático correspondiente al periodo del {periodo_inicio} al {periodo_fin}."
        )
        return backup

    @staticmethod
    def obtener_estado_programacion():
        """Retorna información detallada sobre el calendario de cortes quincenales."""
        hoy = date.today()
        
        if hoy.day < 15:
            proximo_corte = hoy.replace(day=15)
        elif hoy.day < 30:
            proximo_corte = hoy.replace(day=30)
        else:
            if hoy.month == 12:
                proximo_corte = date(hoy.year + 1, 1, 15)
            else:
                proximo_corte = date(hoy.year, hoy.month + 1, 15)

        dias_restantes = (proximo_corte - hoy).days

        meses_es = [
            '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ]
        proximo_corte_legible = f"{proximo_corte.day} de {meses_es[proximo_corte.month]} de {proximo_corte.year}"

        ultimo_corte_obj = SystemBackup.objects.filter(tipo='PROGRAMADO_QUINCENAL').order_by('-creado_en').first()
        ultimo_backup_obj = SystemBackup.objects.order_by('-creado_en').first()

        return {
            'proximo_corte': proximo_corte.strftime('%Y-%m-%d'),
            'proximo_corte_legible': proximo_corte_legible,
            'dias_restantes': dias_restantes,
            'ultimo_corte': {
                'id_backup': str(ultimo_corte_obj.id_backup) if ultimo_corte_obj else None,
                'nombre_archivo': ultimo_corte_obj.nombre_archivo if ultimo_corte_obj else None,
                'fecha': ultimo_corte_obj.creado_en.isoformat() if ultimo_corte_obj else None,
                'tamanio_legible': ultimo_corte_obj.tamanio_legible if ultimo_corte_obj else None,
            } if ultimo_corte_obj else None,
            'ultimo_backup_general': {
                'id_backup': str(ultimo_backup_obj.id_backup) if ultimo_backup_obj else None,
                'nombre_archivo': ultimo_backup_obj.nombre_archivo if ultimo_backup_obj else None,
                'tipo': ultimo_backup_obj.get_tipo_display() if ultimo_backup_obj else None,
                'fecha': ultimo_backup_obj.creado_en.isoformat() if ultimo_backup_obj else None,
            } if ultimo_backup_obj else None,
            'total_backups': SystemBackup.objects.count(),
            'total_quincenales': SystemBackup.objects.filter(tipo='PROGRAMADO_QUINCENAL').count(),
            'total_manuales': SystemBackup.objects.filter(tipo='MANUAL_SUPERADMIN').count(),
        }