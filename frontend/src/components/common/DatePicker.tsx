import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { INAAQC_THEME } from '../../config/theme';

interface DatePickerProps {
  value: string; 
  onChange: (date: string) => void;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, required = false }) => {
  const adobe = INAAQC_THEME.palette;
  const [isOpen, setIsOpen] = useState(false);
  
  // NUEVO ESTADO: Controla si vemos los días o si vemos la lista de años
  const [viewMode, setViewMode] = useState<'calendar' | 'years'>('calendar');
  
  const containerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const diasSemana = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

  // Generamos una lista de 100 años hacia atrás (Ideal para nacimientos)
  const yearsList = Array.from({ length: 120 }, (_, i) => today.getFullYear() - i);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode('calendar'); // Reseteamos la vista al cerrar
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } 
    else { setCurrentMonth(currentMonth - 1); }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } 
    else { setCurrentMonth(currentMonth + 1); }
  };

  const handlePrevYear = () => setCurrentYear(currentYear - 1);
  const handleNextYear = () => setCurrentYear(currentYear + 1);

  const handleSelectDay = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    onChange(`${currentYear}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  const handleSelectYear = (year: number) => {
    setCurrentYear(year);
    setViewMode('calendar'); // Volvemos a los días después de elegir el año
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="absolute left-3 top-2.5 flex items-center pointer-events-none" style={{ color: adobe.midTint }}>
          <Calendar className="w-4 h-4" />
        </div>
        <input
          type="text"
          readOnly
          required={required}
          value={formatDisplayDate(value)}
          placeholder="Seleccionar fecha (DD/MM/YYYY)..."
          className="w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 pl-9 pr-4 py-2 cursor-pointer transition-all"
          style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: adobe.base, outlineColor: adobe.lightTint }}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Controles del Calendario */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-1">
              <button type="button" onClick={handlePrevYear} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Año anterior">
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={handlePrevMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Mes anterior">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            
            {/* NUEVO: Botón Central Clickeable para cambiar el ViewMode */}
            <button 
              type="button"
              onClick={() => setViewMode(viewMode === 'calendar' ? 'years' : 'calendar')}
              className="text-sm font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              style={{ color: adobe.base }}
            >
              {viewMode === 'calendar' ? `${meses[currentMonth]} ${currentYear}` : 'Volver a Días'}
            </button>
            
            <div className="flex gap-1">
              <button type="button" onClick={handleNextMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Mes siguiente">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleNextYear} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors" title="Año siguiente">
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RENDERIZADO CONDICIONAL: Años vs Días */}
          {viewMode === 'years' ? (
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
              {yearsList.map(year => (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
                  className={`py-2 text-sm font-semibold rounded-lg transition-colors hover:bg-slate-100`}
                  style={year === currentYear ? { backgroundColor: adobe.base, color: '#fff' } : { color: adobe.darkTint }}
                >
                  {year}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {diasSemana.map((d, i) => <div key={i} className="text-xs font-bold text-slate-400 py-1">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-1.5 text-transparent text-xs">.</div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const itemDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = value === itemDateStr;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all hover:bg-slate-100`}
                      style={isSelected ? { backgroundColor: adobe.base, color: '#fff' } : { color: adobe.darkTint }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};