import React, { ReactNode } from 'react';
import { INAAQC_THEME } from '../../config/theme';

interface BadgeProps {
  children: ReactNode;
  status: 'alert' | 'warning' | 'success' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, status }) => {
  // Le decimos a TypeScript que esto es un objeto de estilos CSS válido
  let styles: React.CSSProperties = {};
  
  if (status === 'info') {
    styles = { 
      backgroundColor: INAAQC_THEME.palette.lightTint, 
      color: INAAQC_THEME.palette.base, 
      borderColor: INAAQC_THEME.palette.midTint 
    };
  } else if (status === 'neutral') {
    styles = { 
      backgroundColor: 'transparent', 
      color: INAAQC_THEME.palette.darkTint, 
      borderColor: INAAQC_THEME.palette.midTint 
    };
  } else {
    // --- CORRECCIÓN AQUÍ ---
    // Extraemos la tríada matemática y la traducimos al idioma que React entiende
    const themeStatus = INAAQC_THEME.status[status];
    styles = {
      backgroundColor: themeStatus.bg,
      color: themeStatus.text,
      borderColor: themeStatus.border
    };
  }

  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold border" style={styles}>
      {children}
    </span>
  );
};