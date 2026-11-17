import React, { useState } from 'react';
import { Palette, Table as TableIcon, FileText, Activity, Search, Filter, MoreVertical, Plus, UploadCloud, LineChart as ChartIcon } from 'lucide-react';
import { INAAQC_THEME } from '../config/theme';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Dropzone } from '../components/common/Dropzone';
import { ChartCard } from '../components/common/ChartCard';
import { Pagination } from '../components/common/Pagination'; // <--- IMPORTAMOS EL LADRILLO

// --- DATOS MOCK PARA LA GRÁFICA VISUAL ---
const mockSodioData = [
  { time: '08:00', valor: 135 }, { time: '10:00', valor: 142 }, { time: '12:00', valor: 138 },
  { time: '14:00', valor: 145 }, { time: '16:00', valor: 140 },
];
const mockGlucosaData = [
  { time: '08:00', valor: 90 }, { time: '10:00', valor: 110 }, { time: '12:00', valor: 105 },
];

const UISandbox: React.FC = () => {
  const adobe = INAAQC_THEME.palette;
  
  // ESTADO PARA LA PAGINACIÓN DEL SANDBOX
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in-up font-sans">
      
      {/* HEADER DEL SANDBOX */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight" style={{ color: adobe.base }}>
          <Palette className="w-10 h-10" style={{ color: adobe.highlight }} />
          Sistema de Diseño INAAQC (Component-Based)
        </h1>
        <p className="font-medium mt-2 text-lg" style={{ color: adobe.darkTint }}>
          Estructura 100% modular con Paginación Integrada.
        </p>
      </div>

      <div className="space-y-10">
        
        {/* ========================================================= */}
        {/* MÓDULO 1: TABLA CLÍNICA                                   */}
        {/* ========================================================= */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-xl font-bold border-b pb-4 flex items-center gap-2" style={{ color: adobe.base, borderColor: '#e2e8f0' }}>
            <TableIcon className="w-6 h-6" /> Vista de Gestión (Pacientes)
          </h2>

          <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ borderColor: '#e2e8f0' }}>
            <div className="p-4 flex justify-between items-center border-b bg-slate-50 border-slate-200">
              <div className="w-72">
                <Input icon={<Search className="w-4 h-4" />} placeholder="Buscar paciente..." />
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>Filtros</Button>
                <Button variant="primary" icon={<Plus className="w-4 h-4" />}>Nuevo Registro</Button>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest bg-slate-100" style={{ color: adobe.darkTint }}>Paciente</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest bg-slate-100" style={{ color: adobe.darkTint }}>Estado Clínico</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest bg-slate-100" style={{ color: adobe.darkTint }}>Último Estudio</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center bg-slate-100" style={{ color: adobe.darkTint }}>Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b transition-colors bg-white hover:bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
                  <td className="px-6 py-4"><div className="font-bold" style={{ color: adobe.base }}>Walravens, Gilbert</div><div className="text-xs font-medium" style={{ color: adobe.midTint }}>EP-460612MW04</div></td>
                  <td className="px-6 py-4"><Badge status="alert">Acción Requerida</Badge></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2" style={{ color: adobe.darkTint }}><FileText className="w-4 h-4" /> LAB (Hematología)</div></td>
                  <td className="px-6 py-4 text-center"><button className="p-1.5 rounded" style={{ color: adobe.midTint }}><MoreVertical className="w-5 h-5" /></button></td>
                </tr>
                <tr className="border-b transition-colors bg-white hover:bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
                  <td className="px-6 py-4"><div className="font-bold" style={{ color: adobe.base }}>Mendoza, Ana</div><div className="text-xs font-medium" style={{ color: adobe.midTint }}>EP-109823AM11</div></td>
                  <td className="px-6 py-4"><Badge status="warning">En Observación</Badge></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2" style={{ color: adobe.darkTint }}><Activity className="w-4 h-4" /> VIT (Signos)</div></td>
                  <td className="px-6 py-4 text-center"><button className="p-1.5 rounded" style={{ color: adobe.midTint }}><MoreVertical className="w-5 h-5" /></button></td>
                </tr>
              </tbody>
            </table>

            {/* --- AQUÍ ESTÁ EL NUEVO LADRILLO DE PAGINACIÓN --- */}
            <Pagination 
              currentPage={currentPage} 
              totalPages={5} 
              totalItems={45} 
              itemsPerPage={10} 
              onPageChange={setCurrentPage} 
            />

          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-xl font-bold border-b pb-4 flex items-center gap-2" style={{ color: adobe.base, borderColor: '#e2e8f0' }}>
              <UploadCloud className="w-6 h-6" /> Vista de Ingesta Inteligente
            </h2>
            <div className="space-y-4">
              <Dropzone title="Arrastra el PDF aquí" subtitle="Formatos soportados: PDF, JPG, PNG (Max 5MB)" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-xl font-bold border-b pb-4 flex items-center gap-2" style={{ color: adobe.base, borderColor: '#e2e8f0' }}>
              <ChartIcon className="w-6 h-6" /> Vista Estudio (Recharts Reutilizable)
            </h2>
            <div className="space-y-4">
              <ChartCard title="Sodio (Na)" unit="mmol/L" data={mockSodioData} dataKey="valor" xAxisKey="time" statusText="Simulación finalizada." />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UISandbox;