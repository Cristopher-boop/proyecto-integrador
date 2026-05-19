import React, { InputHTMLAttributes } from 'react';
import { INAAQC_THEME } from '../../config/theme';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ icon, className = '', ...props }) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-2.5 flex items-center pointer-events-none" style={{ color: INAAQC_THEME.palette.midTint }}>
          {icon}
        </div>
      )}
      <input 
        className={`w-full rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${icon ? 'pl-9' : 'pl-4'} pr-4 py-2 ${className}`}
        style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: INAAQC_THEME.palette.base, outlineColor: INAAQC_THEME.palette.lightTint }}
        {...props}
      />
    </div>
  );
};