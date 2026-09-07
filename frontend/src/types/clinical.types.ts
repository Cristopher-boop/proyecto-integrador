export type TipoDocumento = 'VIT' | 'LAB' | 'GLAS' | 'PUL' | 'NA' | 'NE';

export interface ZoomCoords {
  x: number;
  y: number;
  width: number;
  height: number;
  page?: number;
}

export interface ArchivoFuente {
  id_archivo: string;
  admision: string;
  nombre_archivo: string;
  tipo_documento: TipoDocumento | string;
  archivo_fisico?: string | null;
  creado_en?: string;
}

export interface ObservacionBiomedica {
  id_observacion: string;
  admision: string;
  archivo_fuente?: string | null;
  parametro: string;
  valor_numerico: number | string | null;
  unidad_medida?: string | null;
  rango_referencia_min?: number | string | null;
  rango_referencia_max?: number | string | null;
  fecha_hora_registro: string;
  coordenadas_zoom?: ZoomCoords | null;
  es_diario?: boolean;
  tipo_observacion?: string;
}

export interface ComorbilidadItem {
  nombre: string;
  categoria?: string;
  definicion_tecnica?: string;
}

export interface SoporteItem {
  nombre: string;
  categoria?: string;
  en_primeras_24h?: boolean;
}

export interface DiagnosticoItem {
  nombre: string;
  codigo?: string;
  confianza_ia?: number;
  auditado_por_medico?: boolean;
}
