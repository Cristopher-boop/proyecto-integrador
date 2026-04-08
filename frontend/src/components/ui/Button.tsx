import React, { ButtonHTMLAttributes } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';

// Propiedades del botón, incluyendo el icono opcional y estado de carga
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode; // El texto del botón
  Icon?: LucideIcon;         // Un icono opcional al final
  isLoading?: boolean;       // Estado de carga
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  Icon, 
  isLoading = false, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {/* Si está cargando, mostramos un spinner */}
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {children}
          {Icon && <Icon className="w-4 h-4" />} {/* Icono opcional al final */}
        </>
      )}
    </button>
  );
};

export default Button;