import React, { type ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', icon, className = '', ...props }) => {
    const baseStyle = "px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-xs hover:opacity-90 disabled:opacity-50 cursor-pointer";
    
    let variantStyle = "";
    if (variant === 'primary') {
      variantStyle = "text-white bg-[#1E3040] dark:bg-[#87C7FF] dark:text-[#0F1A24]";
    } else if (variant === 'secondary') {
      variantStyle = "bg-white dark:bg-[#1E3040] border border-slate-200 dark:border-[#334759] text-[#1E3040] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#334759]/40";
    } else if (variant === 'outline') {
      variantStyle = "bg-white dark:bg-[#1E3040] border border-slate-200 dark:border-[#334759] text-[#1E3040] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#334759]/40";
    } else if (variant === 'ghost') {
      variantStyle = "bg-transparent hover:bg-slate-100/60 dark:hover:bg-[#334759]/40 text-[#1E3040] dark:text-slate-100";
    }

  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {icon && <span className="w-4 h-4 flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};