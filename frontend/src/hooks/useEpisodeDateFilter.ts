import { useState, useMemo } from 'react';

export function formatDateBadge(dateStr?: string | null): string | undefined {
  if (!dateStr) return undefined;
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return undefined;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function useEpisodeDateFilter<T extends Record<string, any>>(
  episodes: T[],
  _selectedValue?: string,
  _getId?: (item: T) => string,
  defaultYear: number = 2026,
  defaultMonth: number | 'ALL' = 'ALL',
) {
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>(defaultMonth);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(defaultYear);
    (episodes || []).forEach((ep) => {
      const dateStr = ep?.fecha_ingreso;
      if (dateStr) {
        const match = String(dateStr).match(/^(\d{4})/);
        if (match) {
          yearsSet.add(Number(match[1]));
        } else {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            yearsSet.add(d.getFullYear());
          }
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [episodes, defaultYear]);

  const filteredEpisodes = useMemo(() => {
    return (episodes || []).filter((ep) => {
      const dateStr = ep?.fecha_ingreso;
      if (!dateStr) return true;
      let year: number;
      let month: number;
      const match = String(dateStr).match(/^(\d{4})-(\d{2})/);
      if (match) {
        year = Number(match[1]);
        month = Number(match[2]);
      } else {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return true;
        year = d.getFullYear();
        month = d.getMonth() + 1;
      }

      if (selectedYear !== 'ALL' && year !== selectedYear) return false;
      if (selectedMonth !== 'ALL' && month !== selectedMonth) return false;
      return true;
    });
  }, [episodes, selectedYear, selectedMonth]);

  return {
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    availableYears,
    filteredEpisodes,
    formatDateBadge,
  };
}