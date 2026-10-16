/**
 * Agri Intelligence Color Theme & Design Tokens
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#151A14',
    textSecondary: '#566153',
    background: '#FAF8F4',
    backgroundElement: '#F0ECE1',
    backgroundSelected: '#E2DBD0',
    primary: '#16A34A',
    primaryHover: '#15803D',
    primarySubtle: '#DCFCE7',
    primaryText: '#FFFFFF',
    accent: '#C78326',
    border: '#DFD9CB',
    card: '#FFFFFF',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    success: '#16A34A',
    tint: '#16A34A',
  },
  dark: {
    text: '#F4F4F5',
    textSecondary: '#A1A1AA',
    background: '#121412',
    backgroundElement: '#1F241F',
    backgroundSelected: '#2A332B',
    primary: '#4ADE80',
    primaryHover: '#22C55E',
    primarySubtle: '#14532D',
    primaryText: '#052E16',
    accent: '#F59E0B',
    border: '#272F26',
    card: '#181C18',
    danger: '#F87171',
    dangerLight: '#450A0A',
    success: '#4ADE80',
    tint: '#4ADE80',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display, Inter, system-ui, sans-serif)',
    serif: 'var(--font-serif, Georgia, serif)',
    rounded: 'var(--font-rounded, sans-serif)',
    mono: 'var(--font-mono, monospace)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
