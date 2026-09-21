import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import { INAAQC_THEME } from '../../../config/theme';
import { dashboardApi } from '../api/dashboardApi';
import type { DashboardStats } from '../types/dashboard.types';
import { DashboardKpis } from '../components/DashboardKpis';
import { DocTypesDonut } from '../components/DocTypesDonut';
import { SeverityBars } from '../components/SeverityBars';

export const DashboardHomeView: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  const statusColors = INAAQC_THEME.status;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error al cargar estadísticas globales:', err);
        if (isMounted) {
          setError('No se pudieron recuperar las estadísticas globales del servidor.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="animate-spin mb-4" size={40} style={{ color: adobe.highlight }} />
        <p className="font-bold text-sm" style={{ color: adobe.darkTint }}>
          Compilando indicadores hospitalarios...
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        className="p-5 rounded-2xl border flex items-center gap-3 my-4 shadow-sm"
        style={{
          backgroundColor: statusColors.warning.bg,
          borderColor: statusColors.warning.border,
          color: statusColors.warning.text,
        }}
      >
        <AlertTriangle size={22} className="shrink-0" />
        <span className="font-bold text-sm">{error || 'Error desconocido al cargar métricas'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      {/* Cabecera de Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-[#334759]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1E3040] dark:text-[#F1F5F9]">
            Visión General del Sistema
          </h2>
          <p className="text-xs sm:text-sm font-medium mt-1 text-slate-500 dark:text-slate-400">
            Métricas operativas del Instituto Académico-Científico Quispe-Cornejo (INAAQC) • Hospital Erasme
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9EBDD9]/30 dark:bg-[#15232F] border border-[#9FB0BF] dark:border-[#334759] text-[#1E3040] dark:text-[#87C7FF] text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3040] dark:text-[#87C7FF]" />
          <span>Servidores Activos</span>
        </div>
      </div>

      {/* 1. KPIs Globales */}
      <DashboardKpis kpis={stats.kpis} />

      {/* 2. Gráficos de Distribución Documental y Severidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DocTypesDonut data={stats.docTypesData} />
        <SeverityBars data={stats.severityData} />
      </div>

      {/* 3. Barra de Estado de la Infraestructura */}
      <div className="bg-white dark:bg-[#1E3040] p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-[#334759] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center gap-3.5">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ backgroundColor: statusColors.success.bg }}
          >
            <Activity className="w-5 h-5" style={{ color: statusColors.success.text }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-[#F1F5F9]">
              Pipeline Clínico y Algoritmos Deterministas Operativos
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Conexión activa con PostgreSQL, Motores OCR Tesseract y Reglas de Inferencia KDIGO/SAPS3.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#15232F] text-slate-600 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-[#334759] shrink-0">
          v2.2.0-clean
        </span>
      </div>
    </div>
  );
};

export default DashboardHomeView;
