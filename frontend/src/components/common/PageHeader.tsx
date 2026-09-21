import type { ReactNode } from 'react';
import { INAAQC_THEME } from '../../config/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
}) => {
  const adobe = INAAQC_THEME.palette;

  return (
    <div
      className={`bg-white dark:bg-[#1E3040] px-5 py-3 rounded-2xl shadow-xs border border-slate-100 dark:border-[#334759] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors duration-200 ${className}`}
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2 tracking-tight text-[#1E3040] dark:text-[#F1F5F9]">
          {icon && (
            <span
              style={{ color: adobe.highlight }}
              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0"
            >
              {icon}
            </span>
          )}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="font-medium text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {children && (
        <div className="w-full sm:w-auto shrink-0 flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};
