import React, { type ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { YearMonthFilter } from './YearMonthFilter';
import { SearchableSelect, type SearchableOption } from './SearchableSelect';

export interface ClinicalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;

  // Filtro por Año y Mes
  selectedYear: number | 'ALL';
  selectedMonth: number | 'ALL';
  onChangeYear: (year: number | 'ALL') => void;
  onChangeMonth: (month: number | 'ALL') => void;
  availableYears?: number[];

  // Selector de Episodio Clínico
  episodes: SearchableOption[];
  selectedEpisode: string;
  onEpisodeChange: (episodeId: string) => void;
  episodePlaceholder?: string;
  episodeSearchPlaceholder?: string;
  episodeIcon?: ReactNode;
  episodeSelectorWidth?: string;

  // Acciones o herramientas adicionales
  children?: ReactNode;
  className?: string;
}

export const ClinicalHeader: React.FC<ClinicalHeaderProps> = ({
  title,
  subtitle,
  icon,
  selectedYear,
  selectedMonth,
  onChangeYear,
  onChangeMonth,
  availableYears,
  episodes,
  selectedEpisode,
  onEpisodeChange,
  episodePlaceholder = '-- Seleccionar episodio clínico --',
  episodeSearchPlaceholder = 'Buscar por episodio o paciente...',
  episodeIcon,
  episodeSelectorWidth = 'w-full sm:w-72',
  children,
  className = '',
}) => {
  return (
    <PageHeader title={title} subtitle={subtitle} icon={icon} className={className}>
      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
        <YearMonthFilter
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onChangeYear={onChangeYear}
          onChangeMonth={onChangeMonth}
          availableYears={availableYears}
        />
        <div className={episodeSelectorWidth}>
          <SearchableSelect
            options={episodes}
            value={selectedEpisode}
            onChange={onEpisodeChange}
            placeholder={episodePlaceholder}
            searchPlaceholder={episodeSearchPlaceholder}
            icon={episodeIcon || icon}
          />
        </div>
        {children}
      </div>
    </PageHeader>
  );
};
