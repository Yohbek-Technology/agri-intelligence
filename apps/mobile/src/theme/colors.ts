/**
 * Agricultural Intelligence Design Tokens — Color Palette
 * Reconciled with Stitch UI MVP Design System & Ethiopian Agronomic Themes
 */

export const Colors = {
  light: {
    // Primary Brand (Ethiopian Greenery / Deep Forest Green)
    primary: '#1B5E20',
    primaryHover: '#15803D',
    primarySubtle: '#E8F5E9',
    primaryContainer: '#2E7D32',
    primaryText: '#FFFFFF',

    // Secondary (Fresh Sprout Green / Optimal Health / Sync Active)
    secondary: '#4CAF50',
    secondarySubtle: '#F1F8E9',
    secondaryText: '#FFFFFF',

    // Tertiary / Action Accent (Fertile Terracotta Amber / "Listen" Audio Trigger)
    accent: '#E65100',
    accentLight: '#FFF3E0',
    accentBorder: '#FFB74D',

    // Soil & Grain Accents (Beda Red Nitisol / Koticha Black Vertisol / Teff Gold)
    soilKoticha: '#27272A', // Black Vertisol
    soilBeda: '#991B1B', // Red Nitisol
    teffGold: '#C78326', // Ripe Teff

    // Neutral Surfaces & Card Backgrounds (Biophilic Warm Off-White)
    background: '#F8FAF6', // Surface Canvas
    backgroundElement: '#F1F5E9', // Surface Container
    backgroundSelected: '#E2E8D8',
    card: '#FFFFFF', // Card Level 1
    border: '#D7E1D1', // Crisp Structural Low-Contrast Border
    borderSubtle: '#E2E8F0',

    // Text & Typography (Rich Dark Slate for direct sunlight visibility)
    text: '#1E293B',
    textSecondary: '#475569',
    textMuted: '#64748B',

    // Status & Severity Indicators (Outdoor High Contrast)
    success: '#2E7D32',
    successLight: '#E8F5E9',
    warning: '#FBC02D',
    warningLight: '#FFF8E1',
    warningBorder: '#F57F17',
    danger: '#C62828',
    dangerLight: '#FFEBEE',
    info: '#0284C7',
    infoLight: '#E0F2FE',

    tint: '#1B5E20',
  },
  dark: {
    primary: '#4ADE80',
    primaryHover: '#22C55E',
    primarySubtle: '#14532D',
    primaryContainer: '#166534',
    primaryText: '#052E16',

    secondary: '#81C784',
    secondarySubtle: '#1B5E20',
    secondaryText: '#052E16',

    accent: '#FFB74D',
    accentLight: '#4A2600',
    accentBorder: '#E65100',

    soilKoticha: '#18181B',
    soilBeda: '#7F1D1D',
    teffGold: '#F59E0B',

    background: '#121412',
    backgroundElement: '#1F241F',
    backgroundSelected: '#2A332B',
    card: '#181C18',
    border: '#272F26',
    borderSubtle: '#334155',

    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',

    success: '#4ADE80',
    successLight: '#052E16',
    warning: '#FBBF24',
    warningLight: '#451A03',
    warningBorder: '#F57F17',
    danger: '#F87171',
    dangerLight: '#450A0A',
    info: '#38BDF8',
    infoLight: '#082F49',

    tint: '#4ADE80',
  },
} as const;

export type ThemeMode = 'light' | 'dark';
export type ColorPalette = typeof Colors.light;
