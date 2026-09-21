import React, { type ReactNode } from 'react';
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
      backgroundColor: `${INAAQC_THEME.scale[300]}40`, 
      color: INAAQC_THEME.scale[900], 
      borderColor: INAAQC_THEME.scale[400] 
    };
  } else if (status === 'neutral') {
    styles = { 
      backgroundColor: 'transparent', 
      color: INAAQC_THEME.scale[700], 
      borderColor: INAAQC_THEME.scale[500] 
    };
  } else {
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