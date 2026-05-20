import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Microscope, Loader2, AlertCircle, FileText, ChevronDown, CheckCircle2, AlertTriangle, Activity, Brain, Droplet, Wind, Filter, Eye } from 'lucide-react';
import { useLaboratory } from '../hooks/useLaboratory';
import { INAAQC_THEME } from '../../../config/theme';
import { AuditSplitView } from '../../visualizer/views/AuditSplitView'; 

type FilterType = 'ALL' | 'VIT' | 'GLAS' | 'LAB' | 'PUL';

export const LaboratoryView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const [searchParams] = useSearchParams();
  const episodioUrl = searchParams.get('episodio') || undefined;

  const {
    admisiones, selectedAdmision, setSelectedAdmision,
    archivos, observaciones, activeFilter, setActiveFilter, isLoading, error
  } = useLaboratory(episodioUrl);

  const [archivoAuditoria, setArchivoAuditoria] = useState<any | null>(null);

  const getTipoCategoria = (parametro: string, tipoDb?: string): FilterType => {
    const p = (parametro || '').toLowerCase();
    if (p.includes('glasgow') || p.includes('coma')) return 'GLAS';
    if (p.includes('ph') || p.includes('pco2') || p.includes('po2') || p.includes('lactato') || p.includes('exceso de base') || p.includes('gases')) return 'PUL';
    if (p.includes('frecuencia') || p.includes('temperatura') || p.includes('presión arterial') || p.includes('saturación de oxígeno')) return 'VIT';
    if (tipoDb === 'SIGNOS_VITALES') return 'VIT';
    if (tipoDb === 'NEUROLOGICO') return 'GLAS';
    return 'LAB';
  };

  const getHeatmapStyle = (valorStr: string, minStr: string | null, maxStr: string | null) => {
    if (!minStr || !maxStr) return { rowColor: '#ffffff', badgeClass: 'bg-slate-100 text-slate-800', icon: <CheckCircle2 className="w-5 h-5 text-slate-400" /> };
    const value = parseFloat(valorStr), min = parseFloat(minStr), max = parseFloat(maxStr);
    
    if (value >= min && value <= max) return { rowColor: '#ffffff', badgeClass: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" /> };
    const deviation = value < min ? (min - value) / min : (value - max) / max;
    if (deviation <= 0.1) return { rowColor: '#fef3c7', badgeClass: 'bg-amber-100 text-amber-800 font-bold', icon: <AlertTriangle className="w-5 h-5 text-amber-600" /> };
    
    return { rowColor: '#fee2e2', badgeClass: 'bg-red-200 text-red-900 font-extrabold animate-pulse', icon: <AlertCircle className="w-5 h-5 text-red-700" /> };
  };

  const filteredObservaciones = observaciones.filter(obs => activeFilter === 'ALL' || getTipoCategoria(obs.parametro, obs.tipo_observacion) === activeFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans animate-fade-in-up">
      
      {/* 1. HEADER & SELECTOR DE EPISODIOS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ borderColor: adobe.lightTint }}>
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: adobe.base }}>
            <Microscope style={{ color: adobe.highlight }} className="w-8 h-8" /> Control de Laboratorio
          </h2>
          <p className="mt-1 font-medium text-sm" style={{ color: adobe.darkTint }}>Archivos originales y datos extraídos.</p>
        </div>
        
        <div className="w-full md:w-96">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: adobe.midTint }}>Episodio Activo</label>
          <div className="relative">
            <select 
              className="w-full appearance-none border-2 text-sm font-bold p-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer"
              style={{ backgroundColor: adobe.lightTint, borderColor: adobe.midTint, color: adobe.base }}
              value={selectedAdmision}
              onChange={(e) => setSelectedAdmision(e.target.value)}
            >
              <option value="">-- Selecciona un episodio --</option>
              {admisiones.map(a => <option key={a.id_admision} value={a.id_admision}>{a.numero_episodio} - {a.paciente_nombre}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: adobe.base }} />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-900 font-bold">{error}</div>}

      {/* 2. SECCIÓN DE ARCHIVOS (Con botón de Auditoría) */}
      {selectedAdmision && (
        <div className="space-y-3">
          <h3 className="font-bold uppercase tracking-widest text-xs" style={{ color: adobe.darkTint }}>Documentos Fuente</h3>
          {archivos.length === 0 && !isLoading ? (
            <p className="text-sm font-medium italic" style={{ color: adobe.midTint }}>No hay documentos subidos para este episodio.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {archivos.map(archivo => (
                <div key={archivo.id_archivo} className="bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm hover:shadow-md transition-all" style={{ borderColor: adobe.lightTint }}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: adobe.lightTint }}><FileText className="w-5 h-5" style={{ color: adobe.highlight }} /></div>
                    <div className="truncate">
                      <p className="text-sm font-bold truncate" style={{ color: adobe.base }}>{archivo.nombre_archivo}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: adobe.highlight }}>{archivo.tipo_documento.replace('_AUDITADO', '')}</p>
                    </div>
                  </div>
                  {/* BOTÓN MÁGICO PARA ABRIR EL SPLIT-SCREEN */}
                  <button onClick={() => setArchivoAuditoria(archivo)} className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Auditar Documento">
                    <Eye className="w-5 h-5" style={{ color: adobe.base }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SECCIÓN DE DATOS (Filtros y Tabla) */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: adobe.lightTint }}>
        
        {selectedAdmision && !isLoading && observaciones.length > 0 && (
          <div className="border-b p-4 flex flex-wrap gap-2" style={{ borderColor: adobe.lightTint, backgroundColor: '#f8fafc' }}>
             {/* Filtros estilizados con INAAQC_THEME */}
            {[
              { id: 'ALL', label: 'Todos', icon: <Filter size={16}/> },
              { id: 'VIT', label: 'Vitales', icon: <Activity size={16}/> },
              { id: 'GLAS', label: 'Neurológico', icon: <Brain size={16}/> },
              { id: 'PUL', label: 'Gasometría', icon: <Wind size={16}/> },
              { id: 'LAB', label: 'Laboratorio', icon: <Droplet size={16}/> }
            ].map(f => (
              <button 
                key={f.id} onClick={() => setActiveFilter(f.id as FilterType)} 
                className="px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all border"
                style={{ 
                  backgroundColor: activeFilter === f.id ? adobe.base : '#fff',
                  color: activeFilter === f.id ? '#fff' : adobe.base,
                  borderColor: activeFilter === f.id ? adobe.base : adobe.midTint
                }}
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
        )}

        {/* TABLA DE MAPA DE CALOR */}
        {isLoading ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-10 h-10 animate-spin" style={{ color: adobe.highlight }} /></div>
        ) : filteredObservaciones.length > 0 ? (
          <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 shadow-md z-10" style={{ backgroundColor: adobe.base, color: '#fff' }}>
                <tr className="text-[10px] uppercase tracking-widest font-black">
                  <th className="p-4 text-center">Estado</th>
                  <th className="p-4">Fecha / Hora</th>
                  <th className="p-4">Categoría</th>
                  <th className="p-4">Parámetro</th>
                  <th className="p-4 text-right">Valor Detectado</th>
                  <th className="p-4">Unidad</th>
                  <th className="p-4">Rangos Ref.</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-slate-700">
                {filteredObservaciones.map((obs) => {
                  const style = getHeatmapStyle(obs.valor_numerico, obs.rango_referencia_min, obs.rango_referencia_max);
                  const tipoTag = getTipoCategoria(obs.parametro, obs.tipo_observacion);

                  return (
                    <tr key={obs.id_observacion} className="border-b transition-colors" style={{ backgroundColor: style.rowColor, borderColor: adobe.lightTint }}>
                      <td className="p-4 flex justify-center items-center">{style.icon}</td>
                      <td className="p-4">{new Date(obs.fecha_hora_registro).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-black px-2 py-1 rounded" style={{ backgroundColor: adobe.lightTint, color: adobe.base }}>{tipoTag}</span>
                      </td>
                      <td className="p-4 font-bold" style={{ color: adobe.base }}>{obs.parametro}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-md border font-mono text-base ${style.badgeClass}`}>
                          {parseFloat(obs.valor_numerico).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{obs.unidad_medida || '-'}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">
                        {obs.rango_referencia_min && obs.rango_referencia_max ? `[${obs.rango_referencia_min} - ${obs.rango_referencia_max}]` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : selectedAdmision && (
          <div className="p-16 flex flex-col items-center text-center">
            <Filter className="w-12 h-12 mb-2" style={{ color: adobe.midTint }} />
            <p className="font-bold" style={{ color: adobe.base }}>No hay datos para mostrar.</p>
          </div>
        )}
      </div>

      {/* RENDERIZADO DEL MODAL SPLIT-SCREEN (Fase 3) */}
      {archivoAuditoria && (
        <AuditSplitView 
          idArchivo={archivoAuditoria.id_archivo}
          nombreArchivo={archivoAuditoria.nombre_archivo}
          documentoUrl={archivoAuditoria.archivo_fisico}
          tipo={archivoAuditoria.nombre_archivo.toLowerCase().includes('.pdf') ? 'PDF' : 'IMAGE'}
          onClose={() => setArchivoAuditoria(null)}
        />
      )}

    </div>
  );
};