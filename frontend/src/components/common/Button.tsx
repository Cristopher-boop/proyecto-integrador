import React, { type ReactNode } from 'react';
import { INAAQC_THEME } from '../../config/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer";
    
    let variantStyle = "";
    if (variant === 'primary') {
      variantStyle = "text-white";
    } else if (variant === 'secondary') {
      variantStyle = "bg-white border";
    } else if (variant === 'outline') {
      variantStyle = "bg-white border hover:bg-slate-50";
    } else if (variant === 'ghost') {
      variantStyle = "bg-transparent hover:bg-slate-100/60";
    }

  // Usamos el tema dinámicamente con la escala INAAQC
  const customStyles: React.CSSProperties = 
    variant === 'primary' ? { backgroundColor: INAAQC_THEME.scale[900] } :
    variant === 'secondary' || variant === 'outline' ? { borderColor: INAAQC_THEME.scale[400], color: INAAQC_THEME.scale[700] } :
    variant === 'ghost' ? { color: INAAQC_THEME.scale[700] } : {};

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} style={customStyles} {...props}>
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};