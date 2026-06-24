import React, { InputHTMLAttributes } from 'react';
import { INAAQC_THEME } from '../../config/theme';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', type = 'text', ...props }) => {
  const adobe = INAAQC_THEME.palette;
  
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-2.5 flex items-center pointer-events-none" style={{ color: adobe.midTint }}>
          {icon}
        </div>
      )}
      <input 
        type={type}
        // MAGIA CSS: Estilizamos el ícono del calendario nativo para que se vea elegante y moderno
        className={`w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 transition-all 
          ${icon ? 'pl-9' : 'pl-4'} pr-4 py-2 
          [&::-webkit-calendar-picker-indicator]:cursor-pointer 
          [&::-webkit-calendar-picker-indicator]:opacity-50 
          hover:[&::-webkit-calendar-picker-indicator]:opacity-100 
          ${className}`}
        style={{ 
          backgroundColor: '#fff', 
          borderColor: '#e2e8f0', 
          color: adobe.base, 
          outlineColor: adobe.lightTint 
        }}
        {...props}
      />
    </div>
  );
};