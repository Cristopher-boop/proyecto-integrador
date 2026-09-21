from django.core.management.base import BaseCommand
from apps.users.services import BackupService

class Command(BaseCommand):
    help = 'Genera un corte y respaldo automático de logs y base de datos (ejecutable los días 15 y 30)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--forzar',
            action='store_true',
            help='Fuerza la ejecución del corte quincenal sin importar el día del mes',
        )

    def handle(self, *args, **options):
        forzar = options.get('forzar', False)
        self.stdout.write(self.style.NOTICE("Iniciando verificación de corte quincenal de logs..."))
        
        backup = BackupService.verificar_y_ejecutar_corte_quincenal(forzar=forzar)
        if backup:
            self.stdout.write(self.style.SUCCESS(
                f"[OK] Corte quincenal generado exitosamente: {backup.nombre_archivo} "
                f"({backup.tamanio_legible}, Checksum: {backup.checksum_sha256[:12]}...)"
            ))
        else:
            estado = BackupService.obtener_estado_programacion()
            self.stdout.write(self.style.WARNING(
                f"No corresponde ejecutar corte hoy o ya fue generado previamente. "
                f"Próximo corte programado: {estado['proximo_corte_legible']} "
                f"({estado['dias_restantes']} días restantes). Usa --forzar para ejecutarlo manualmente."
            ))
