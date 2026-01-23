// Tema renkleri ve stilleri

export interface Theme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

// Dark Theme (Varsayılan)
export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#7c4dff',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#e4e4e4',
    border: '#0f3460',
    notification: '#7c4dff',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
};

// Light Theme
export const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#6200ee',
    background: '#f5f5f5',
    card: '#ffffff',
    text: '#212121',
    border: '#e0e0e0',
    notification: '#6200ee',
    error: '#b00020',
    success: '#00c853',
    warning: '#ff6f00',
    info: '#0091ea',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
};

// Tema seçici
export function getTheme(isDark: boolean): Theme {
  return isDark ? darkTheme : lightTheme;
}

// Ortak stil yardımcıları
export const commonStyles = {
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
};

// 🌌 COSMIC PURPLE THEME (Global Shared Theme)
export const COSMIC_THEME = {
  primary: '#9B30FF',
  secondary: '#7B2CBF',
  accent: '#E0AAFF',
  background: ['#050505', '#120E16', '#1A1520'] as const,
  card: 'rgba(30, 20, 50, 0.9)',
  cardBg: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  glass: 'rgba(255, 255, 255, 0.05)',
  border: 'rgba(138, 43, 226, 0.3)',
  glow: 'rgba(155, 48, 255, 0.6)',
  placeholder: 'rgba(255,255,255,0.4)',
  gold: '#F59E0B',
  danger: '#ff5252',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};
