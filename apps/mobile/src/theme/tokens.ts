/**
 * AgrIntel Design System Tokens
 * Optimized for low-literacy Ethiopian smallholder farmers and outdoor field usability.
 */

export const tokens = {
  // NFR-ACC-001: Minimum touch target size 56dp for field fingers and outdoor accessibility
  touchTarget: {
    min: 56,
    iconButton: 56,
    inputHeight: 56,
    buttonHeight: 56,
  },

  colors: {
    // Primary Crop Greens
    primary: '#16A34A',
    primaryDark: '#15803D',
    primaryLight: '#DCFCE7',
    primarySurface: '#F0FDF4',

    // Soil & Advisory Accents
    accentAmber: '#C78326',
    accentAmberLight: '#FEF3C7',
    soilBrown: '#78350F',
    soilKoticha: '#27272A', // Vertisol black cracking clay
    soilBeda: '#9A3412',    // Nitisol red-brown volcanic soil

    // High Contrast Text for Sunlight Readability
    textPrimary: '#151A14',
    textSecondary: '#4B5563',
    textMuted: '#6B7280',
    textInverse: '#FFFFFF',

    // Surfaces & Backgrounds
    background: '#FAF8F4',
    surface: '#FFFFFF',
    surfaceSubtle: '#F4EFE6',
    border: '#DFD9CB',
    borderFocus: '#16A34A',

    // Status Badges
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#2563EB',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
};

