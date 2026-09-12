import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Microscope,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Brain,
  Droplet,
  Wind,
  Filter,
  Eye,
} from 'lucide-react';
import { useLaboratory } from '../hooks/useLaboratory';
import { INAAQC_THEME } from '../../../config/theme';
import { AuditSplitView } from '../../visualizer/views/AuditSplitView';
import { Pagination } from '../../../components/common/Pagination';
import { ClinicalHeader } from '../../../components/common/ClinicalHeader';
import { useEpisodeDateFilter, formatDateBadge } from '../../../hooks/useEpisodeDateFilter';

const LAB_ORDER = [
  'bilirubina total',
  'calcio',
  'creatinina',
  'globulos blancos',
  'hematocritos',
  'inr',
  'lactate',
  'pco2',
  'ph',
  'plaquetas',
  'po2',
  'potasio',
  'sodio',
  'urea',
];

type FilterType = 'ALL' | 'VIT' | 'GLAS' | 'LAB' | 'PUL';

export const LaboratoryView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const themeStatus = INAAQC_THEME.status;
  const [searchParams] = useSearchParams();
  const episodioUrl = searchParams.get('episodio') || undefined;

  const {
    admisiones,
    selectedAdmision,
    setSelectedAdmision,
    archivos,
    observaciones,
    activeFilter,
    setActiveFilter,
    isLoading,
    error,
  } = useLaboratory(episodioUrl);

  const [archivoAuditoria, setArchivoAuditoria] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
    availableYears,
    filteredEpisodes,
  } = useEpisodeDateFilter(admisiones, selectedAdmision, (a) => a.id_admision);

  const episodeOptions = useMemo(
    () =>
      filteredEpisodes.map((a) => ({
        value: a.id_admision,
        label: a.numero_episodio,
        secondary: a.paciente_nombre,
        badge: formatDateBadge(a.fecha_ingreso),
      })),
    [filteredEpisodes]
  );

  const getTipoCategoria = (parametro: string, tipoDb?: string): FilterType => {
    const p = (parametro || '').toLowerCase();
    if (p.includes('glasgow') || p.includes('coma')) return 'GLAS';
    if (
      p.includes('ph') ||
      p.includes('pco2') ||
      p.includes('po2') ||
      p.includes('lactato') ||
      p.includes('exceso de base') ||
      p.includes('gases')
    )
      return 'PUL';
    if (
      p.includes('frecuencia') ||
      p.includes('temperatura') ||
      p.includes('presión arterial') ||
      p.includes('saturación de oxígeno')
    )
      return 'VIT';
    if (tipoDb === 'SIGNOS_VITALES') return 'VIT';
    if (tipoDb === 'NEUROLOGICO') return 'GLAS';
    return 'LAB';
  };

  const getHeatmapStyle = (
    valorStr: string,
    minStr: string | null,
    maxStr: string | null
  ) => {
    if (!minStr || !maxStr)
      return {
        rowColor: '#ffffff',
        badgeStyle: {
          backgroundColor: '#f1f5f9',
          color: '#334155',
          borderColor: '#e2e8f0',
        },
        iconColor: '#94a3b8',
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    const value = parseFloat(valorStr),
      min = parseFloat(minStr),
      max = parseFloat(maxStr);

    if (value >= min && value <= max)
      return {
        rowColor: '#ffffff',
        badgeStyle: {
          backgroundColor: themeStatus.success.bg,
          color: themeStatus.success.text,
          borderColor: themeStatus.success.border,
        },
        iconColor: themeStatus.success.text,
        icon: <CheckCircle2 className="w-4 h-4" />,
      };

    const deviation = value < min ? (min - value) / min : (value - max) / max;
    if (deviation <= 0.1)
      return {
        rowColor: themeStatus.alert.bg,
        badgeStyle: {
          backgroundColor: themeStatus.alert.bg,
          color: themeStatus.alert.text,
          borderColor: themeStatus.alert.border,
        },
        iconColor: themeStatus.alert.text,
        icon: <AlertTriangle className="w-4 h-4" />,
      };

    return {
      rowColor: themeStatus.warning.bg,
      badgeStyle: {
        backgroundColor: themeStatus.warning.bg,
        color: themeStatus.warning.text,
        borderColor: themeStatus.warning.border,
      },
      iconColor: themeStatus.warning.text,
      icon: <AlertCircle className="w-4 h-4" />,
    };
  };

  const filteredObservaciones = observaciones.filter(
    (obs) =>
      activeFilter === 'ALL' ||
      getTipoCategoria(obs.parametro, obs.tipo_observacion) === activeFilter
  );

  const sortedObservaciones = [...filteredObservaciones].sort((a, b) => {
    const paramA = a.parametro.toLowerCase();
    const paramB = b.parametro.toLowerCase();

    let indexA = LAB_ORDER.findIndex((p) => paramA.includes(p));
    let indexB = LAB_ORDER.findIndex((p) => paramB.includes(p));

    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;

    if (indexA !== indexB) return indexA - indexB;
    if (indexA === 999 && indexB === 999 && paramA !== paramB)
      return paramA.localeCompare(paramB);

    const dateA = new Date(a.fecha_hora_registro).getTime();
    const dateB = new Date(b.fecha_hora_registro).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(sortedObservaciones.length / itemsPerPage);
  const currentObservaciones = sortedObservaciones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (f: FilterType) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handleAdmisionChange = (val: string) => {
    setSelectedAdmision(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <ClinicalHeader
        title="Control de Laboratorio"
        subtitle="Resultados analíticos y parámetros biomédicos extraídos por OCR."
        icon={<Microscope className="w-6 h-6 sm:w-7 sm:h-7" />}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onChangeYear={setSelectedYear}
        onChangeMonth={setSelectedMonth}
        availableYears={availableYears}
        episodes={episodeOptions}
        selectedEpisode={selectedAdmision}
        onEpisodeChange={handleAdmisionChange}
        episodePlaceholder="-- Selecciona un episodio activo --"
        episodeIcon={<Microscope className="w-4 h-4 text-slate-400" />}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-700 text-xs font-bold">
          {error}
        </div>
      )}

      {/* 2. Chips de Documentos Fuente */}
      {selectedAdmision && archivos.length > 0 && (
        <div className="bg-white px-4 py-2 rounded-xl shadow-xs border border-slate-100 flex items-center gap-2.5 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Archivos ({archivos.length}):
          </span>
          <div className="flex items-center gap-2">
            {archivos.map((archivo) => (
              <div
                key={archivo.id_archivo}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-teal-600" />
                <span
                  className="font-bold text-[11px] truncate max-w-[140px]"
                  style={{ color: adobe.base }}
                >
                  {archivo.nombre_archivo}
                </span>
                <span className="text-[9px] font-black px-1 py-0.2 rounded bg-teal-50 text-teal-700">
                  {archivo.tipo_documento.replace('_AUDITADO', '')}
                </span>
                <button
                  onClick={() => setArchivoAuditoria(archivo)}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 transition-colors ml-0.5"
                  title="Auditar documento OCR"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Tarjeta de Tabla sin espacios blancos artificiales */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden flex flex-col">
        {/* Barra de Filtros */}
        {selectedAdmision && !isLoading && observaciones.length > 0 && (
          <div className="px-5 py-2.5 border-b bg-slate-50/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'ALL', label: 'Todos', icon: <Filter size={13} /> },
                { id: 'VIT', label: 'Vitales', icon: <Activity size={13} /> },
                { id: 'GLAS', label: 'Neurológico', icon: <Brain size={13} /> },
                { id: 'PUL', label: 'Gasometría', icon: <Wind size={13} /> },
                { id: 'LAB', label: 'Laboratorio', icon: <Droplet size={13} /> },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFilterChange(f.id as FilterType)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border shrink-0 ${
                    activeFilter === f.id
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Página {currentPage} de {totalPages || 1} ({filteredObservaciones.length} datos)
            </span>
          </div>
        )}

        {/* Cuerpo de la Tabla */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-10 flex justify-center items-center">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: adobe.highlight }}
              />
            </div>
          ) : currentObservaciones.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className="border-b"
                  style={{ backgroundColor: `${adobe.lightTint}15`, borderColor: '#e2e8f0' }}
                >
                  <th className="py-2.5 px-4 text-center w-16 text-xs font-bold uppercase tracking-wider text-slate-600">Estado</th>
                  <th className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Fecha / Hora</th>
                  <th className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Categoría</th>
                  <th className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Parámetro</th>
                  <th className="py-2.5 px-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">Valor Detectado</th>
                  <th className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Unidad</th>
                  <th className="py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600">Rango Ref.</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-700">
                {currentObservaciones.map((obs) => {
                  const style = getHeatmapStyle(
                    obs.valor_numerico,
                    obs.rango_referencia_min,
                    obs.rango_referencia_max
                  );
                  const cat = getTipoCategoria(
                    obs.parametro,
                    obs.tipo_observacion
                  );

                  return (
                    <tr
                      key={obs.id_observacion}
                      className="border-b transition-colors hover:bg-slate-50/80"
                      style={{
                        backgroundColor: style.rowColor,
                        borderColor: '#f1f5f9',
                      }}
                    >
                      <td
                        className="py-2 px-4 text-center"
                        style={{ color: style.iconColor }}
                      >
                        <div className="flex justify-center">{style.icon}</div>
                      </td>
                      <td className="py-2 px-4 text-slate-600 font-semibold">
                        {obs.fecha_hora_registro
                          ? new Date(obs.fecha_hora_registro).toLocaleString(
                              'es-ES',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )
                          : '-'}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className="text-[10px] font-black px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${adobe.lightTint}25`,
                            color: adobe.base,
                            borderColor: `${adobe.lightTint}60`,
                          }}
                        >
                          {cat}
                        </span>
                      </td>
                      <td className="py-2 px-4 font-bold text-slate-800">
                        {obs.parametro}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-md border font-mono text-sm font-bold shadow-xs"
                          style={style.badgeStyle}
                        >
                          {parseFloat(obs.valor_numerico).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-slate-500 font-semibold">
                        {obs.unidad_medida || '-'}
                      </td>
                      <td className="py-2 px-4 text-slate-400 font-mono text-xs">
                        {obs.rango_referencia_min && obs.rango_referencia_max
                          ? `[${obs.rango_referencia_min} - ${obs.rango_referencia_max}]`
                          : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : selectedAdmision ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Filter className="w-10 h-10 mb-2 text-slate-300" />
              <p className="font-bold text-sm text-slate-600">
                No hay observaciones que coincidan con el filtro seleccionado.
              </p>
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Microscope
                className="w-12 h-12 mb-3"
                style={{ color: adobe.highlight }}
              />
              <p className="font-bold text-sm text-slate-700">
                Selecciona un episodio activo arriba para consultar los datos de laboratorio.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Visualizarás el desglose analítico, rangos y documentos asociados sin desplazamientos.
              </p>
            </div>
          )}
        </div>

        {/* Paginación Inferior Fija */}
        {!isLoading && sortedObservaciones.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedObservaciones.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {archivoAuditoria && (
        <AuditSplitView
          idArchivo={archivoAuditoria.id_archivo}
          nombreArchivo={archivoAuditoria.nombre_archivo}
          documentoUrl={archivoAuditoria.archivo_fisico}
          tipo={
            archivoAuditoria.nombre_archivo.toLowerCase().includes('.pdf')
              ? 'PDF'
              : 'IMAGE'
          }
          onClose={() => setArchivoAuditoria(null)}
        />
      )}
    </div>
  );
};

export default LaboratoryView;