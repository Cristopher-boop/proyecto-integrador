export interface AuditLog {
  id: string;
  usuario: string | null;
  usuario_nombre: string;
  rol: string;
  accion: string;
  modulo: string;
  descripcion: string;
  ip_address: string | null;
  fecha_hora: string;
  fecha_formateada?: string;
  estado: 'EXITOSO' | 'EXITO' | 'ADVERTENCIA' | 'DENEGADO' | 'ERROR';
}

export interface AuditLogFilters {
  modulo?: string;
  rol?: string;
  accion?: string;
  estado?: string;
  search?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface SystemBackup {
  id_backup: string;
  tipo: 'PROGRAMADO_QUINCENAL' | 'MANUAL_SUPERADMIN';
  tipo_display: string;
  nombre_archivo: string;
  tamanio_bytes: number;
  tamanio_legible: string;
  checksum_sha256: string;
  total_registros: Record<string, number>;
  creado_por: string | null;
  creado_por_nombre: string;
  estado: 'COMPLETADO' | 'FALLIDO' | 'EN_PROCESO';
  periodo_inicio: string | null;
  periodo_fin: string | null;
  detalles: string;
  creado_en: string;
  fecha_formateada?: string;
}

export interface BackupScheduleStatus {
  proximo_corte: string;
  proximo_corte_legible: string;
  dias_restantes: number;
  ultimo_corte: {
    id_backup: string | null;
    nombre_archivo: string | null;
    fecha: string | null;
    tamanio_legible: string | null;
  } | null;
  ultimo_backup_general: {
    id_backup: string | null;
    nombre_archivo: string | null;
    tipo: string | null;
    fecha: string | null;
  } | null;
  total_backups: number;
  total_quincenales: number;
  total_manuales: number;
}
