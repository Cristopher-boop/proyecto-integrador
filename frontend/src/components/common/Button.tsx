import React, { ReactNode } from 'react';
import { INAAQC_THEME } from '../../config/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-sm hover:opacity-90 disabled:opacity-50";
    
    let variantStyle = "";
    if (variant === 'primary') {
    variantStyle = "text-white";
    } else if (variant === 'secondary') {
        variantStyle = "bg-white border";
    }

  // Usamos el tema dinámicamente
  const customStyles = 
    variant === 'primary' ? { backgroundColor: INAAQC_THEME.palette.base } :
    variant === 'secondary' ? { borderColor: '#e2e8f0', color: INAAQC_THEME.palette.darkTint } : {};

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} style={customStyles} {...props}>
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};