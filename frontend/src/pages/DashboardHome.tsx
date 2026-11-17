import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, FileText, Users, BrainCircuit, HeartPulse, Loader2, AlertTriangle } from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { INAAQC_THEME } from '../config/theme';

interface DashboardStats {
  kpis: {
    pacientes: number;
    episodios: number;
    archivos: number;
    inferencias: number;
  };
  docTypesData: { name: string; value: number }[];
  severityData: { name: string; Pacientes: number }[];
}

const DashboardHome: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // COLORES PARA EL GRÁFICO DE DONA
  const PIE_COLORS = [adobe.base, adobe.darkTint, adobe.midTint, adobe.highlight];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://127.0.0.1:8000/api/v1/clinical/dashboard/stats/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error("Error al cargar estadísticas globales:", err);
        setError("No se pudieron cargar las estadísticas del sistema.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin mb-4" size={40} style={{ color: adobe.highlight }} />
        <p className="font-bold text-sm" style={{ color: adobe.darkTint }}>Compilando estadísticas globales...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 rounded-xl border flex items-center gap-2 mt-4" style={{ backgroundColor: statusColors.warning.bg, borderColor: statusColors.warning.border, color: statusColors.warning.text }}>
        <AlertTriangle size={20} />
        <span className="font-bold text-sm">{error || "Error desconocido"}</span>
      </div>
    );
  }

  // PREPARAR LAS TARJETAS CON LA DATA REAL
  const statsCards = [
    { title: 'Pacientes Activos', value: stats.kpis.pacientes, icon: Users, color: adobe.base, bg: adobe.lightTint + '30' },
    { title: 'Episodios UCI', value: stats.kpis.episodios, icon: HeartPulse, color: statusColors.alert.text, bg: statusColors.alert.bg },
    { title: 'Archivos Procesados', value: stats.kpis.archivos, icon: FileText, color: adobe.darkTint, bg: adobe.lightTint + '50' },
    { title: 'Inferencias IA', value: stats.kpis.inferencias, icon: BrainCircuit, color: adobe.highlight, bg: adobe.base },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      
      {/* CABECERA */}
      <div>
        <h2 className="text-2xl font-black" style={{ color: adobe.base }}>Visión General del Sistema</h2>
        <p className="text-sm font-medium mt-1" style={{ color: adobe.darkTint }}>
          Métricas globales del Instituto Académico-Científico Quispe-Cornejo (INAAQC)
        </p>
      </div>

      {/* 1. TARJETAS DE MÉTRICAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
            <div className="p-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.bg }}>
              <stat.icon className="w-6 h-6" style={{ color: stat.color === adobe.highlight ? '#fff' : stat.color }} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: adobe.midTint }}>{stat.title}</p>
              <p className="text-2xl font-black" style={{ color: adobe.base }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. ÁREA DE GRÁFICOS RECARGADA CON DATA REAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: Tipos de Documentos (Pie Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: adobe.darkTint }}>
            Distribución de Ingesta Documental
          </h3>
          <div className="flex-1 min-h-[300px]">
            {stats.docTypesData.reduce((acc, curr) => acc + curr.value, 0) === 0 ? (
              <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">No hay documentos procesados aún.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.docTypesData}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={100}
                    paddingAngle={5} dataKey="value" stroke="none"
                  >
                    {stats.docTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: Estratificación de Gravedad (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6" style={{ color: adobe.darkTint }}>
            Estratificación de Gravedad (SOFA Global)
          </h3>
          <div className="flex-1 min-h-[300px]">
             {stats.severityData.reduce((acc, curr) => acc + curr.Pacientes, 0) === 0 ? (
               <div className="h-full flex items-center justify-center text-sm font-bold text-slate-400 italic">No hay pacientes con SOFA calculado aún.</div>
             ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: adobe.midTint, fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: adobe.lightTint + '20' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="Pacientes" radius={[4, 4, 0, 0]}>
                    {stats.severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? statusColors.warning.text : index === 1 ? adobe.highlight : adobe.base} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
             )}
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: ESTADO DEL MOTOR */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 rounded-full animate-pulse" style={{ backgroundColor: statusColors.success.bg }}>
              <Activity className="w-6 h-6" style={{ color: statusColors.success.text }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Servicios de Backend Operativos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Conexión estable con PostgreSQL y Motores OCR/NLP Locales.</p>
            </div>
         </div>
         <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold font-mono">
           v2.1.0-stable
         </span>
      </div>

    </div>
  );
};

export default DashboardHome;