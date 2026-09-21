import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', type = 'text', ...props }) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-400">
          {icon}
        </div>
      )}
      <input 
        type={type}
        // MAGIA CSS: Estilizamos el ícono del calendario nativo para que se vea elegante y moderno
        className={`w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#87C7FF]/40 focus:border-[#87C7FF] transition-all 
          ${icon ? 'pl-9' : 'pl-4'} pr-4 py-2 
          bg-white dark:bg-[#15232F] 
          border-slate-200 dark:border-[#334759] 
          text-[#1E3040] dark:text-slate-100 
          placeholder-slate-400 dark:placeholder-slate-500
          [&::-webkit-calendar-picker-indicator]:cursor-pointer 
          [&::-webkit-calendar-picker-indicator]:opacity-50 
          hover:[&::-webkit-calendar-picker-indicator]:opacity-100 
          ${className}`}
        {...props}
      />
    </div>
  );
};