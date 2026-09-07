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
  readonly palette: ThemePalette;
  readonly status: ThemeStatus;
}

export const INAAQC_THEME: InaaqcTheme = {
  palette: {
    base: 'hsl(208, 36%, 18%)',      // #1E3040 (Primario)
    darkTint: 'hsl(208, 20%, 38%)',  // #4D6173 (Secundario)
    midTint: 'hsl(208, 11%, 61%)',   // #909CA6 (Neutro)
    lightTint: 'hsl(208, 42%, 73%)', // #9EBDD9 (Fondos)
    highlight: 'hsl(208, 100%, 76%)' // #87C7FF (Acentos)
  },
  status: {
    alert: { bg: 'hsl(28, 80%, 90%)', text: 'hsl(28, 80%, 35%)', border: 'hsl(28, 80%, 80%)' },    
    success: { bg: 'hsl(88, 60%, 90%)', text: 'hsl(88, 60%, 30%)', border: 'hsl(88, 60%, 80%)' },   
    warning: { bg: 'hsl(328, 70%, 94%)', text: 'hsl(328, 70%, 35%)', border: 'hsl(328, 70%, 85%)' }
  }
} as const;

export default INAAQC_THEME;