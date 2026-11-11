import { Platform } from 'react-native';

/**
 * Ethiopic-capable font stack.
 * Ensures proper rendering of Fidel script glyphs (Amharic and Tigrinya)
 * alongside Latin characters (Afaan Oromoo and English).
 */
export const typography = {
  fontFamily: Platform.select({
    ios: 'NotoSansEthiopic, -apple-system, system-ui',
    android: 'NotoSansEthiopic, sans-serif',
    default: 'NotoSansEthiopic, system-ui, sans-serif',
  }),

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  sizes: {
    caption: 12,
    bodySm: 14,
    body: 16,
    subtitle: 18,
    title: 20,
    headline: 24,
    display: 32,
  },

  lineHeights: {
    caption: 16,
    bodySm: 20,
    body: 24,
    subtitle: 26,
    title: 28,
    headline: 32,
    display: 40,
  },
};

