import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, FileSpreadsheet, ChevronDown, TrendingUp, Activity, 
  ShieldAlert, Loader2, AlertTriangle, Users 
} from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import { reportsApi, type ReportData } from '../api/reportsApi';
import { ReportKpis } from '../components/ReportKpis';
import { MortalityTrendChart } from '../components/MortalityTrendChart';
import { SofaRadar } from '../components/SofaRadar';
import { ComorbiditiesChart } from '../components/ComorbiditiesChart';
import { PageHeader } from '../../../components/common/PageHeader';

export const ReportsView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('ALL');
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportData = await reportsApi.getReportData();
        setData(reportData);
      } catch (err) {
        console.error('Error al cargar reportes:', err);
        setError('Error al extraer los datos analíticos del servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportReport = async (reportType: string, isPdf: boolean = false) => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      await reportsApi.exportReport(reportType, isPdf);
    } catch (err) {
      console.error('Error al exportar el reporte', err);
      alert('Hubo un problema al generar el reporte en el servidor.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#00A896' }} />
        <p className="font-bold tracking-widest uppercase text-xs text-slate-500">
          Generando reportes biomédicos reales...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-3.5 rounded-xl border flex items-center gap-2.5 font-sans" style={{ backgroundColor: statusColors.warning.bg, borderColor: statusColors.warning.border, color: statusColors.warning.text }}>
        <AlertTriangle size={18} />
        <span className="text-xs font-bold">{error || 'No se pudieron cargar los datos.'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans animate-fade-in-up">
      {/* 1. Header Compacto Estandarizado */}
      <PageHeader
        title="Analítica y Reportes (BI)"
        subtitle="Inteligencia de negocios aplicada a los datos extraídos de pacientes."
        icon={<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />}
      >
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Selector de Rango Temporal */}
          <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            {['1M', '6M', 'ALL'].map(range => (
              <button 
                key={range} 
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  timeRange === range 
                    ? 'shadow-xs bg-white text-slate-800' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                style={{ color: timeRange === range ? adobe.base : undefined }}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* Botón Desplegable de Exportación */}
          <div className="relative z-50" ref={exportMenuRef}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white transition-all hover:brightness-110 shadow-xs disabled:opacity-50" 
              style={{ backgroundColor: adobe.base }}
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>{isExporting ? 'Generando...' : 'Exportar Reportes'}</span>
              <ChevronDown size={13} className={`ml-0.5 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50/80">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Documentos Excel (.xlsx)
                  </p>
                </div>
                <button 
                  onClick={() => handleExportReport('pacientes', false)} 
                  className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Users size={15} style={{ color: adobe.darkTint }} /> 
                  Pacientes y Admisiones
                </button>
                <button 
                  onClick={() => handleExportReport('gravedad', false)} 
                  className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <Activity size={15} className="text-teal-600" /> 
                  Métricas de Severidad (SOFA)
                </button>
                <button 
                  onClick={() => handleExportReport('extracciones', false)} 
                  className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet size={15} className="text-emerald-600" /> 
                  Sábana de Datos (Labs/Vit)
                </button>

                <div className="p-2.5 border-y border-slate-100 bg-slate-50/80">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Documentos PDF (.pdf)
                  </p>
                </div>
                <button 
                  onClick={() => handleExportReport('auditoria_pdf', true)} 
                  className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                >
                  <ShieldAlert size={15} className="text-rose-600" /> 
                  Auditoría Analítica (OCR/IA)
                </button>
              </div>
            )}
          </div>
        </div>
      </PageHeader>

      {/* 2. Tarjetas de KPIs */}
      <ReportKpis
        precisionIa={data.kpis.precision_ia}
        mortalidadPromedio={data.kpis.mortalidad_promedio}
        sofaPromedio={data.kpis.sofa_promedio}
      />

      {/* 3. Gráficos de Evolución y Disfunción */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MortalityTrendChart data={data.mortalityData} />
        <SofaRadar data={data.sofaRadarData} />
      </div>

      {/* 4. Distribución de Comorbilidades */}
      <ComorbiditiesChart data={data.comorbiditiesData} />
    </div>
  );
};

export default ReportsView;
