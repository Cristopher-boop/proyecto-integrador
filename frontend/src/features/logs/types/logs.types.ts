export interface AuditLog {
  id: string;
  usuario: number | null;
  usuario_nombre: string;
  rol: string;
  accion: string;
  modulo: string;
  descripcion: string;
  ip_address: string | null;
  fecha_hora: string;
  estado: 'EXITOSO' | 'DENEGADO' | 'ERROR';
}

export interface AuditLogFilters {
  modulo?: string;
  rol?: string;
  accion?: string;
  estado?: string;
  search?: string;
}
