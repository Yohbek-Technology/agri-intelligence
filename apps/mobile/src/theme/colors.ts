/**
 * Agricultural Intelligence Design Tokens — Color Palette
 * Tailored HSL color scales for Ethiopian highland & lowland farming themes
 */

export const Colors = {
  light: {
    // Primary Brand (Ethiopian Greenery / Teff & Crop foliage)
    primary: '#16A34A',
    primaryHover: '#15803D',
    primarySubtle: '#DCFCE7',
    primaryText: '#FFFFFF',

    // Soil & Grain Accents (Beda Red Nitisol / Ripe Teff Gold)
    accent: '#C78326',
    accentLight: '#FEF3C7',
    soilKoticha: '#27272A', // Black Vertisol
    soilBeda: '#991B1B', // Red Nitisol

    // Neutral Surfaces & Card Backgrounds
    background: '#FAF8F4',
    backgroundElement: '#F0ECE1',
    backgroundSelected: '#E2DBD0',
    card: '#FFFFFF',
    border: '#DFD9CB',

    // Text & Typography
    text: '#151A14',
    textSecondary: '#566153',
    textMuted: '#8C9789',

    // Status & Severity Indicators
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    info: '#0284C7',
    infoLight: '#E0F2FE',

    tint: '#16A34A',
  },
  dark: {
    primary: '#4ADE80',
    primaryHover: '#22C55E',
    primarySubtle: '#14532D',
    primaryText: '#052E16',

    accent: '#F59E0B',
    accentLight: '#78350F',
    soilKoticha: '#18181B',
    soilBeda: '#7F1D1D',

    background: '#121412',
    backgroundElement: '#1F241F',
    backgroundSelected: '#2A332B',
    card: '#181C18',
    border: '#272F26',

    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    success: '#4ADE80',
    successLight: '#052E16',
    warning: '#FBBF24',
    warningLight: '#451A03',
    danger: '#F87171',
    dangerLight: '#450A0A',
    info: '#38BDF8',
    infoLight: '#082F49',

    tint: '#4ADE80',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ColorPalette = typeof Colors.light;
