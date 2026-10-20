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
  // Illiteracy-first scales: minimum body text 16sp, large metric counters 34sp
  sizes: {
    caption: 13, // label-md
    small: 15, // label-lg
    body: 16, // body-md (baseline floor)
    largeBody: 17, // body-lg
    subheading: 19, // headline-sm
    heading: 22, // headline-md
    display: 26, // headline-lg-mobile
    giantNumber: 34, // metric-display
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
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
  sm: 4,
  small: 6,
  default: 8,
  md: 12,
  medium: 12,
  lg: 16,
  large: 16,
  card: 16, // Stitch standard card radius
  xl: 24,
  full: 9999, // Pill / Circular FAB
} as const;

export const TouchTargets = {
  minimum: 48, // 48dp minimum for all touch targets
  primaryButton: 56, // 56dp for primary action buttons
  voiceButton: 56, // 56dp persistent microphone FAB
  listenPill: 44, // 44dp tactile audio read-aloud button
} as const;

export const Shadows = {
  // Tactile utility elevation for direct sunlight legibility
  card: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingButton: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  tactilePush: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 4,
  },
};

export { Colors };
