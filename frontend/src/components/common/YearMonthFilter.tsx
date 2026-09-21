import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { SearchableSelect, type SearchableOption } from './SearchableSelect';

export interface YearMonthFilterProps {
  selectedYear: number | 'ALL';
  selectedMonth: number | 'ALL';
  availableYears?: number[];
  onYearChange?: (year: number | 'ALL') => void;
  onMonthChange?: (month: number | 'ALL') => void;
  onChangeYear?: (year: number | 'ALL') => void;
  onChangeMonth?: (month: number | 'ALL') => void;
  className?: string;
  compact?: boolean;
}

export const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const YearMonthFilter: React.FC<YearMonthFilterProps> = ({
  selectedYear,
  selectedMonth,
  availableYears = [2024, 2025, 2026],
  onYearChange,
  onMonthChange,
  onChangeYear,
  onChangeMonth,
  className = '',
  compact = false,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Set([...availableYears, currentYear])).sort((a, b) => b - a);

  const handleYear = (val: number | 'ALL') => {
    onYearChange?.(val);
    onChangeYear?.(val);
  };

  const handleMonth = (val: number | 'ALL') => {
    onMonthChange?.(val);
    onChangeMonth?.(val);
  };

  const yearOptions: SearchableOption[] = useMemo(() => [
    { value: 'ALL', label: 'Todos los años' },
    ...years.map((y) => ({
      value: String(y),
      label: String(y),
    })),
  ], [years]);

  const monthOptions: SearchableOption[] = useMemo(() => [
    { value: 'ALL', label: 'Todos los meses' },
    ...MONTH_NAMES.map((name, index) => {
      const monthNum = index + 1;
      return {
        value: String(monthNum),
        label: name,
      };
    }),
  ], []);

  return (
    <div className={`flex items-center gap-1.5 bg-slate-50/90 dark:bg-[#15232F] border border-slate-200/90 dark:border-[#334759] rounded-xl p-1 shadow-xs text-xs transition-colors duration-200 ${className}`}>
      <div className="flex items-center gap-1 pl-1.5 pr-0.5 text-slate-500 dark:text-slate-400 shrink-0">
        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-[#87C7FF]" />
        {!compact && (
          <span className="font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline text-[11px] uppercase tracking-wider">
            Periodo:
          </span>
        )}
      </div>

      {/* Selector de Año con el componente SearchableSelect */}
      <div className="w-28 sm:w-32 shrink-0">
        <SearchableSelect
          options={yearOptions}
          value={String(selectedYear)}
          onChange={(val) => handleYear(val === 'ALL' ? 'ALL' : Number(val))}
          placeholder="Año"
          searchable={false}
          showClear={false}
          size="sm"
          dropdownWidth="w-36"
        />
      </div>

      {/* Selector de Mes con el componente SearchableSelect */}
      <div className="w-32 sm:w-36 shrink-0">
        <SearchableSelect
          options={monthOptions}
          value={String(selectedMonth)}
          onChange={(val) => handleMonth(val === 'ALL' ? 'ALL' : Number(val))}
          placeholder="Mes"
          searchable={false}
          showClear={false}
          size="sm"
          dropdownWidth="w-40"
        />
      </div>
    </div>
  );
};
