import React, { useState } from 'react';
import { TestTube, AlertCircle, CheckCircle2, AlertTriangle, Search, Filter } from 'lucide-react';

// Datos extraídos del PDF real de HILDE JOSEPHINE VELLEMANS (con ligeras alteraciones para probar el mapa de calor)
const labResults = [
  { id: 1, date: '21/01/2026 08:51', param: 'Bilirubine totale', value: 0.6, min: 0.0, max: 1.2, unit: 'mg/dL' },
  { id: 2, date: '21/01/2026 08:51', param: 'Calcium', value: 2.23, min: 2.20, max: 2.55, unit: 'mmol/L' },
  { id: 3, date: '21/01/2026 08:51', param: 'Créatinine', value: 0.63, min: 0.50, max: 0.90, unit: 'mg/dL' },
  { id: 4, date: '21/01/2026 08:51', param: 'Globules blancs', value: 5.3, min: 3.5, max: 11.0, unit: 'x10^3/µL' },
  { id: 5, date: '21/01/2026 08:51', param: 'Potassium', value: 4.4, min: 3.4, max: 4.4, unit: 'mmol/L' },
  
  // Datos del día 20/01
  { id: 6, date: '20/01/2026 09:00', param: 'Hématocrite', value: 38.2, min: 35.0, max: 47.0, unit: '%' },
  { id: 7, date: '20/01/2026 09:00', param: 'INR', value: 1.03, min: 0.95, max: 1.31, unit: '' },
  { id: 8, date: '20/01/2026 09:00', param: 'Plaquettes', value: 244, min: 150, max: 440, unit: 'x10^3/µL' },
  { id: 9, date: '20/01/2026 09:00', param: 'Sodium', value: 139, min: 136, max: 145, unit: 'mmol/L' },
  
  // Datos del día 19/01 (ALTERADOS PARA DEMOSTRAR EL MAPA DE CALOR ROJO/AMARILLO)
  { id: 10, date: '19/01/2026 10:48', param: 'Globules blancs', value: 14.2, min: 3.5, max: 11.0, unit: 'x10^3/µL' }, // Leucocitosis (ROJO)
  { id: 11, date: '19/01/2026 10:48', param: 'Potassium', value: 4.5, min: 3.4, max: 4.4, unit: 'mmol/L' }, // Ligeramente alto (AMARILLO)
  { id: 12, date: '19/01/2026 10:48', param: 'Créatinine', value: 1.10, min: 0.50, max: 0.90, unit: 'mg/dL' }, // Falla renal leve (ROJO)
  { id: 13, date: '19/01/2026 10:48', param: 'Urée', value: 52.0, min: 17.0, max: 48.0, unit: 'mg/dL' }, // Elevado (ROJO)
];

const Labs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // --- LÓGICA CORE: MAPA DE CALOR BIOMÉDICO ---
  const getHeatmapStyle = (value: number, min: number, max: number) => {
    // Si está perfectamente dentro del rango
    if (value >= min && value <= max) {
      return { 
        rowClass: 'bg-white hover:bg-slate-50', 
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      };
    }
    
    // Calculamos qué tan lejos está del rango (Desviación)
    const deviation = value < min ? (min - value) / min : (value - max) / max;
    
    // Si la desviación es pequeña (< 10%), es una Alerta Amarilla (Límite)
    if (deviation <= 0.1) {
      return { 
        rowClass: 'bg-yellow-50/50 hover:bg-yellow-50', 
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 font-bold',
        icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />
      };
    }
    
    // Si la desviación es grande (> 10%), es una Anomalía Crítica (Rojo)
    return { 
      rowClass: 'bg-red-50 hover:bg-red-100/80 transition-colors', 
      badgeClass: 'bg-red-200 text-red-900 border-red-400 font-extrabold animate-pulse',
      icon: <AlertCircle className="w-4 h-4 text-red-700" />
    };
  };

  // Filtrador de búsqueda
  const filteredLabs = labResults.filter(lab => 
    lab.param.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Cabecera */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <TestTube className="text-blue-600 w-7 h-7" />
            Análisis de Laboratorio (Mapa de Calor)
          </h2>
          <p className="text-slate-500 mt-1">
            Detección visual automática de parámetros fuera de rango para el episodio EP-001.
          </p>
        </div>
        
        {/* Buscador */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar parámetro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabla con Mapa de Calor */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold">Fecha y Hora</th>
                <th className="px-6 py-4 font-semibold">Parámetro</th>
                <th className="px-6 py-4 font-semibold text-right">Valor Detectado</th>
                <th className="px-6 py-4 font-semibold text-center">Rango Normal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLabs.map((lab) => {
                const style = getHeatmapStyle(lab.value, lab.min, lab.max);
                
                return (
                  <tr key={lab.id} className={`${style.rowClass}`}>
                    <td className="px-6 py-4">
                      {style.icon}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {lab.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {lab.param}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Badge con el color del mapa de calor */}
                      <span className={`inline-block px-3 py-1 rounded-md border ${style.badgeClass}`}>
                        {lab.value} {lab.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-400 font-medium">
                      {lab.min} - {lab.max} {lab.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredLabs.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No se encontraron resultados para "{searchTerm}".
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Labs;