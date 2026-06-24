import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Microscope, Loader2, AlertCircle, FileText, ChevronDown, CheckCircle2, AlertTriangle, Activity, Brain, Droplet, Wind, Filter, Eye } from 'lucide-react';
import { useLaboratory } from '../hooks/useLaboratory';
import { INAAQC_THEME } from '../../../config/theme';
import { AuditSplitView } from '../../visualizer/views/AuditSplitView'; 

const LAB_ORDER = [
  'bilirubina total', 'calcio', 'creatinina', 'globulos blancos', 
  'hematocritos', 'inr', 'lactate', 'pco2', 'ph', 'plaquetas', 
  'po2', 'potasio', 'sodio', 'urea'
];

type FilterType = 'ALL' | 'VIT' | 'GLAS' | 'LAB' | 'PUL';

export const LaboratoryView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const themeStatus = INAAQC_THEME.status; // Importamos los estados HSL puros
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

  // FIX: Uso estricto de colores del INAAQC_THEME
  const getHeatmapStyle = (valorStr: string, minStr: string | null, maxStr: string | null) => {
    if (!minStr || !maxStr) return { rowColor: '#ffffff', badgeStyle: { backgroundColor: '#f1f5f9', color: '#334155', borderColor: '#e2e8f0' }, iconColor: '#94a3b8', icon: <CheckCircle2 className="w-5 h-5" /> };
    const value = parseFloat(valorStr), min = parseFloat(minStr), max = parseFloat(maxStr);
    
    // Normal (Success)
    if (value >= min && value <= max) return { rowColor: '#ffffff', badgeStyle: { backgroundColor: themeStatus.success.bg, color: themeStatus.success.text, borderColor: themeStatus.success.border }, iconColor: themeStatus.success.text, icon: <CheckCircle2 className="w-5 h-5" /> };
    // Límite (Alert)
    const deviation = value < min ? (min - value) / min : (value - max) / max;
    if (deviation <= 0.1) return { rowColor: themeStatus.alert.bg, badgeStyle: { backgroundColor: themeStatus.alert.bg, color: themeStatus.alert.text, borderColor: themeStatus.alert.border }, iconColor: themeStatus.alert.text, icon: <AlertTriangle className="w-5 h-5" /> };
    // Crítico (Warning)
    return { rowColor: themeStatus.warning.bg, badgeStyle: { backgroundColor: themeStatus.warning.bg, color: themeStatus.warning.text, borderColor: themeStatus.warning.border }, iconColor: themeStatus.warning.text, icon: <AlertCircle className="w-5 h-5" /> };
  };

  const filteredObservaciones = observaciones.filter(obs => 
    activeFilter === 'ALL' || getTipoCategoria(obs.parametro, obs.tipo_observacion) === activeFilter
  );

  // Ordenamos primero por nuestra lista personalizada y luego por fecha (más reciente primero)
  const sortedObservaciones = [...filteredObservaciones].sort((a, b) => {
    const paramA = a.parametro.toLowerCase();
    const paramB = b.parametro.toLowerCase();

    let indexA = LAB_ORDER.findIndex(p => paramA.includes(p));
    let indexB = LAB_ORDER.findIndex(p => paramB.includes(p));

    if (indexA === -1) indexA = 999; // Si no está en la lista, se va al final
    if (indexB === -1) indexB = 999;

    if (indexA !== indexB) return indexA - indexB; // Orden del arreglo
    if (indexA === 999 && indexB === 999 && paramA !== paramB) return paramA.localeCompare(paramB); // Alfabético para desconocidos

    // Si es el mismo parámetro, ordenamos por fecha de mayor a menor
    const dateA = new Date(a.fecha_hora_registro).getTime();
    const dateB = new Date(b.fecha_hora_registro).getTime();
    return dateB - dateA;
  });

  // Agrupamos visualmente los parámetros iguales
  const groupedObservaciones = sortedObservaciones.reduce((acc, obs) => {
    const lastGroup = acc[acc.length - 1];
    if (lastGroup && lastGroup.parametro === obs.parametro) {
      lastGroup.items.push(obs);
    } else {
      acc.push({ parametro: obs.parametro, tipo: getTipoCategoria(obs.parametro, obs.tipo_observacion), items: [obs] });
    }
    return acc;
  }, [] as { parametro: string, tipo: string, items: typeof observaciones }[]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans animate-fade-in-up">
      
      {/* HEADER UNIFICADO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: adobe.base }}>
            <Microscope style={{ color: adobe.highlight }} className="w-8 h-8" /> Control de Laboratorio
          </h2>
          <p className="mt-1 font-medium text-sm" style={{ color: adobe.darkTint }}>Archivos originales y datos extraídos.</p>
        </div>
        
        <div className="w-full md:w-96">
          <label className="block text-xs font-bold uppercase mb-1" style={{ color: adobe.midTint }}>Episodio Activo</label>
          <div className="relative">
            {/* FIX: Bg-white aplicado */}
            <select 
              className="w-full appearance-none border-2 text-sm font-bold p-3 pl-4 pr-10 rounded-lg outline-none cursor-pointer bg-white"
              style={{ borderColor: adobe.midTint, color: adobe.base }}
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

      {/* SECCIÓN DE ARCHIVOS */}
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
                    {/* FIX: Contraste de Ícono Blanco sobre Highlight */}
                    <div className="p-2.5 rounded-lg shadow-inner" style={{ backgroundColor: adobe.highlight }}><FileText className="w-5 h-5 text-white" /></div>
                    <div className="truncate">
                      <p className="text-sm font-bold truncate" style={{ color: adobe.base }}>{archivo.nombre_archivo}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: adobe.highlight }}>{archivo.tipo_documento.replace('_AUDITADO', '')}</p>
                    </div>
                  </div>
                  <button onClick={() => setArchivoAuditoria(archivo)} className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Auditar Documento">
                    <Eye className="w-5 h-5" style={{ color: adobe.base }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECCIÓN DE DATOS */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: adobe.lightTint }}>
        {selectedAdmision && !isLoading && observaciones.length > 0 && (
          <div className="border-b p-4 flex flex-wrap gap-2" style={{ borderColor: adobe.lightTint, backgroundColor: '#f8fafc' }}>
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
                {groupedObservaciones.map((group, gIdx) => (
                  <React.Fragment key={`group-${gIdx}`}>
                    {/* CABECERA DEL GRUPO (Mejora visual) */}
                    <tr style={{ backgroundColor: adobe.lightTint + '20' }}>
                      <td colSpan={7} className="px-4 py-2 border-y" style={{ borderColor: adobe.lightTint }}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black px-2 py-1 rounded bg-white border" style={{ color: adobe.base, borderColor: adobe.lightTint }}>
                            {group.tipo}
                          </span>
                          <span className="font-black uppercase tracking-widest text-xs" style={{ color: adobe.base }}>
                            {group.parametro}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: adobe.lightTint, color: adobe.base }}>
                            {group.items.length} {group.items.length === 1 ? 'registro' : 'registros'}
                          </span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* REGISTROS ORDENADOS POR FECHA (MÁS RECIENTE PRIMERO) */}
                    {group.items.map((obs) => {
                      const style = getHeatmapStyle(obs.valor_numerico, obs.rango_referencia_min, obs.rango_referencia_max);
                      return (
                        <tr key={obs.id_observacion} className="border-b transition-colors hover:brightness-95" style={{ backgroundColor: style.rowColor, borderColor: adobe.lightTint }}>
                          <td className="p-3 flex justify-center items-center" style={{ color: style.iconColor }}>{style.icon}</td>
                          <td className="p-3 text-xs font-semibold">{new Date(obs.fecha_hora_registro).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                          <td className="p-3"><span className="text-[10px] font-black opacity-0">{/* Espacio vacío bajo la etiqueta */}</span></td>
                          <td className="p-3 font-bold opacity-0">{/* Espacio vacío bajo el parámetro */}</td>
                          <td className="p-3 text-right">
                            <span className="inline-block px-3 py-1 rounded-md border font-mono text-base font-bold shadow-sm" style={style.badgeStyle}>
                              {parseFloat(obs.valor_numerico).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-bold">{obs.unidad_medida || '-'}</td>
                          <td className="p-3 text-slate-400 font-mono text-xs">
                            {obs.rango_referencia_min && obs.rango_referencia_max ? `[${obs.rango_referencia_min} - ${obs.rango_referencia_max}]` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
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