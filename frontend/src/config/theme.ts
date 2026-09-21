export interface ThemeScale {
  readonly 900: string;
  readonly 800: string;
  readonly 700: string;
  readonly 600: string;
  readonly 500: string;
  readonly 400: string;
  readonly 300: string;
  readonly 200: string;
  readonly 100: string;
  readonly 50: string;
}

export interface ThemePalette {
  readonly base: string;
  readonly darkTint: string;
  readonly midTint: string;
  readonly lightTint: string;
  readonly highlight: string;
}

export interface ThemeStatusItem {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
}

export interface ThemeStatus {
  readonly alert: ThemeStatusItem;
  readonly success: ThemeStatusItem;
  readonly warning: ThemeStatusItem;
}

export interface InaaqcTheme {
  readonly scale: ThemeScale;
  readonly palette: ThemePalette;
  readonly status: ThemeStatus;
}

export const INAAQC_THEME: InaaqcTheme = {
  // Escala monocromática oficial de 10 tonos (de la paleta institucional INAAQC)
  scale: {
    900: '#1E3040', // Primario ancla (base)
    800: '#334759', // Hover oscuro / fondo secundario
    700: '#4D6173', // Secundario / darkTint
    600: '#6C7D8C', // Terciario / metadatos
    500: '#909CA6', // Neutro / bordes / midTint
    400: '#9FB0BF', // Bordes suaves / hover sutil
    300: '#9EBDD9', // Superficies suaves / chips / lightTint
    200: '#99C8F2', // Enfoque / focus ring
    100: '#87C7FF', // Acento luminoso / spinners / highlight
    50:  '#6EBBFF', // Acento eléctrico / micro-interacción
  },
  // Alias de compatibilidad existentes (HSL estándar)
  palette: {
    base: 'hsl(208, 36%, 18%)',      // #1E3040 (Primario)
    darkTint: 'hsl(208, 20%, 38%)',  // #4D6173 (Secundario)
    midTint: 'hsl(208, 11%, 61%)',   // #909CA6 (Neutro)
    lightTint: 'hsl(208, 42%, 73%)', // #9EBDD9 (Fondos)
    highlight: 'hsl(208, 100%, 76%)' // #87C7FF (Acentos)
  },
  // Tríada funcional para alertas clínicas (descartando verde lima por armonía azul-petróleo)
  status: {
    alert: { bg: 'hsl(28, 80%, 90%)', text: 'hsl(28, 80%, 35%)', border: 'hsl(28, 80%, 80%)' },    
    success: { bg: 'hsl(208, 42%, 93%)', text: 'hsl(208, 36%, 22%)', border: 'hsl(208, 42%, 75%)' },   
    warning: { bg: 'hsl(328, 70%, 94%)', text: 'hsl(328, 70%, 35%)', border: 'hsl(328, 70%, 85%)' }
  }
} as const;

export default INAAQC_THEME;