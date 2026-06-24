import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileSpreadsheet, ChevronDown, TrendingUp, Activity, BrainCircuit, ShieldAlert, Loader2, AlertTriangle, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell
} from 'recharts';
import { INAAQC_THEME } from '../config/theme';

interface ReportData {
  kpis: { mortalidad_promedio: number; sofa_promedio: number; precision_ia: number };
  comorbiditiesData: { nombre: string; pacientes: number }[];
  sofaRadarData: { organo: string; valorPromedio: number; fullMark: number }[];
  mortalityData: { mes: string; prediccionSAPS: number; promedioSOFA: number }[];
}

const ReportsView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('ALL');
  
  // Estado para el Menú Desplegable de Excel
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://127.0.0.1:8000/api/v1/clinical/reports/data/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        console.error("Error al cargar reportes:", err);
        setError("Error al extraer los datos analíticos del servidor.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // --- FUNCIÓN SEGURA PARA EXPORTAR EXCEL ---
  const handleExportReport = async (reportType: string, isPdf: boolean = false) => {
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://127.0.0.1:8000/api/v1/clinical/reports/export/?type=${reportType}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // FIX: Asignar la extensión correcta
      const ext = isPdf ? 'pdf' : 'xlsx';
      link.setAttribute('download', `Reporte_INAAQC_${reportType.toUpperCase()}.${ext}`);
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        if(link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (err) {
      console.error("Error al exportar el reporte", err);
      alert("Hubo un problema al generar el reporte en el servidor.");
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
        <span className="text-sm font-bold">{error || "No se pudieron cargar los datos."}</span>
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
          
          {/* Selector de Rango de tiempo */}
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
          
          {/* BOTÓN DESPLEGABLE DE REPORTES */}
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

            {/* Menú de Opciones Extendidas */}
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2">
                
                {/* GRUPO EXCEL */}
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
                {/* NUEVO REPORTE DE EXTRACCIÓN MASIVA */}
                <button onClick={() => handleExportReport('extracciones', false)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <FileSpreadsheet size={16} style={{ color: '#217346' }} /> 
                  Sábana de Datos (Labs/Vit)
                </button>

                {/* GRUPO PDF */}
                <div className="p-2 border-y border-slate-100 bg-slate-50 mt-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Documentos PDF (.pdf)</p>
                </div>
                {/* NUEVO REPORTE EN PDF DE AUDITORÍA */}
                <button onClick={() => handleExportReport('auditoria_pdf', true)} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <ShieldAlert size={16} style={{ color: '#E11D48' }} /> 
                  Auditoría Analítica (OCR/IA)
                </button>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* TARJETAS DE RESUMEN EJECUTIVO REALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg" style={{ backgroundColor: adobe.lightTint + '30' }}>
            <BrainCircuit className="w-6 h-6" style={{ color: adobe.base }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>Precisión Algorítmica (IA)</p>
            <p className="text-2xl font-black" style={{ color: adobe.base }}>{data.kpis.precision_ia}%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg" style={{ backgroundColor: statusColors.alert.bg }}>
            <ShieldAlert className="w-6 h-6" style={{ color: statusColors.alert.text }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>Mortalidad Est. Promedio</p>
            <p className="text-2xl font-black" style={{ color: adobe.base }}>{data.kpis.mortalidad_promedio}%</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-lg" style={{ backgroundColor: statusColors.success.bg }}>
            <Activity className="w-6 h-6" style={{ color: statusColors.success.text }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>SOFA Promedio Global</p>
            <p className="text-2xl font-black" style={{ color: adobe.base }}>{data.kpis.sofa_promedio} pts</p>
          </div>
        </div>
      </div>

      {/* ÁREA DE GRÁFICOS COMPLEJOS REALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: TENDENCIA MORTALIDAD (SAPS 3) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: adobe.darkTint }}>
              Evolución de Gravedad Estimada (SAPS 3 / SOFA)
            </h3>
          </div>
          <div className="flex-1 min-h-[350px]">
            {data.mortalityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">No hay historial de puntajes calculados.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.mortalityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
                  
                  {/* Barras = Mortalidad (Eje Izquierdo) */}
                  <Bar yAxisId="left" dataKey="prediccionSAPS" name="Riesgo Mortalidad (%)" barSize={30} fill={adobe.base} radius={[4, 4, 0, 0]} />
                  {/* Línea = SOFA Promedio (Eje Derecho) */}
                  <Line yAxisId="right" type="monotone" dataKey="promedioSOFA" name="SOFA Promedio" stroke={statusColors.warning.text} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: MAPA DE FALLO ORGÁNICO (RADAR) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: adobe.darkTint }}>
              Mapa Global de Disfunción (Promedios SOFA)
            </h3>
          </div>
          <div className="flex-1 w-full min-h-[350px]">
            {data.sofaRadarData.every(d => d.valorPromedio === 0) ? (
              <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">No hay suficientes puntajes SOFA guardados.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.sofaRadarData}>
                  <PolarGrid stroke={adobe.lightTint} />
                  <PolarAngleAxis dataKey="organo" tick={{ fill: adobe.base, fontSize: 12, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 4]} tick={false} axisLine={false} />
                  <Radar name="Puntaje Medio (0-4)" dataKey="valorPromedio" stroke={adobe.highlight} fill={adobe.highlight} fillOpacity={0.5} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 3: TOP COMORBILIDADES (BARRA HORIZONTAL) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: adobe.darkTint }}>
            Top 5 Prevalencia de Comorbilidades Severas (Extraídas por el Motor NLP)
          </h3>
          <div className="flex-1 min-h-[250px]">
            {data.comorbiditiesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">Sube Notas de Admisión para poblar este gráfico.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.comorbiditiesData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
                  <YAxis dataKey="nombre" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.base, fontWeight: 600 }} width={180} />
                  <Tooltip cursor={{ fill: adobe.lightTint + '20' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="pacientes" name="Nº Pacientes" fill={adobe.base} radius={[0, 4, 4, 0]} barSize={30}>
                    {data.comorbiditiesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? statusColors.alert.text : adobe.base} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReportsView;