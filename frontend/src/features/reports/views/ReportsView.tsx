import React, { useState, useEffect } from 'react';
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

export const ReportsView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('ALL');
  
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: adobe.highlight }} />
        <p className="font-bold text-sm" style={{ color: adobe.darkTint }}>Generando reportes biomédicos reales...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl border flex items-center gap-2" style={{ backgroundColor: statusColors.warning.bg, borderColor: statusColors.warning.border, color: statusColors.warning.text }}>
        <AlertTriangle size={20} />
        <span className="text-sm font-bold">{error || 'No se pudieron cargar los datos.'}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up font-sans">
      {/* HEADER DE REPORTES */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: adobe.base }}>
            <TrendingUp style={{ color: adobe.highlight }} className="w-8 h-8" /> 
            Analítica y Reportes (BI)
          </h2>
          <p className="mt-1 font-medium text-sm" style={{ color: adobe.darkTint }}>
            Inteligencia de negocios aplicada a los datos extraídos de pacientes.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto relative">
          {/* Selector de Rango */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
            {['1M', '6M', 'ALL'].map(range => (
              <button 
                key={range} onClick={() => setTimeRange(range)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === range ? 'shadow-sm bg-white' : 'text-slate-500 hover:text-slate-800'}`}
                style={{ color: timeRange === range ? adobe.base : '' }}
              >
                {range}
              </button>
            ))}
          </div>
          
          {/* BOTÓN DESPLEGABLE DE EXPORTACIÓN */}
          <div className="relative z-50">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition-colors hover:brightness-110 shadow-sm disabled:opacity-50" 
              style={{ backgroundColor: adobe.base }}
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? 'Generando...' : 'Exportar Reportes'}
              <ChevronDown size={14} className={`ml-1 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentos Excel (.xlsx)</p>
                </div>
                <button onClick={() => handleExportReport('pacientes', false)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Users size={16} style={{ color: adobe.darkTint }} /> 
                  Pacientes y Admisiones
                </button>
                <button onClick={() => handleExportReport('gravedad', false)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <Activity size={16} style={{ color: adobe.highlight }} /> 
                  Métricas de Severidad (SOFA)
                </button>
                <button onClick={() => handleExportReport('extracciones', false)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <FileSpreadsheet size={16} style={{ color: '#217346' }} /> 
                  Sábana de Datos (Labs/Vit)
                </button>

                <div className="p-2 border-y border-slate-100 bg-slate-50 mt-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentos PDF (.pdf)</p>
                </div>
                <button onClick={() => handleExportReport('auditoria_pdf', true)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <ShieldAlert size={16} style={{ color: '#E11D48' }} /> 
                  Auditoría Analítica (OCR/IA)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPIS */}
      <ReportKpis
        precisionIa={data.kpis.precision_ia}
        mortalidadPromedio={data.kpis.mortalidad_promedio}
        sofaPromedio={data.kpis.sofa_promedio}
      />

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MortalityTrendChart data={data.mortalityData} />
        <SofaRadar data={data.sofaRadarData} />
      </div>

      <ComorbiditiesChart data={data.comorbiditiesData} />
    </div>
  );
};

export default ReportsView;
