import { Platform } from 'react-native';
import { Colors } from './colors';

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Typography = {
  // Illiteracy-first scales: minimum body text 16sp, large mode up to 24sp
  sizes: {
    caption: 13,
    small: 14,
    body: 16,
    largeBody: 18,
    subheading: 20,
    heading: 24,
    display: 30,
    giantNumber: 36,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  } as const,
  fonts: Platform.select({
    android: {
      sans: 'Roboto',
      geez: 'NotoSansEthiopic',
      mono: 'monospace',
    },
    default: {
      sans: 'System',
      geez: 'System',
      mono: 'monospace',
    },
  }),
};

export const Radii = {
  small: 6,
  medium: 12,
  large: 16,
  card: 20,
  full: 9999,
} as const;

export const TouchTargets = {
  minimum: 48, // 48dp minimum
  primaryButton: 56, // 56dp for primary actions
  voiceButton: 56, // 56dp persistent mic button
} as const;

export const Shadows = {
  card: {
    shadowColor: '#151A14',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  floatingButton: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

export { Colors };
