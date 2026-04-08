import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

// Definimos las propiedades obligatorias que debe tener nuestro Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  Icon: LucideIcon; // Obligamos a pasar un icono de Lucide
}

const Input: React.FC<InputProps> = ({ label, Icon, className = '', ...props }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {/* El Icono */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        {/* El Input Real con estilos base */}
        <input
          {...props} // Pasamos type, placeholder, value, onChange, etc.
          className={`block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition-colors bg-slate-50 outline-none ${className}`}
        />
      </div>
    </div>
  );
};

export default Input;