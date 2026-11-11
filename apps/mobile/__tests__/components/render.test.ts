import { describe, it, expect, vi } from 'vitest';

vi.mock('@/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    currentLanguage: 'en',
    setLanguage: vi.fn(),
  }),
}));

import { VisualCard } from '../../src/components/VisualCard';
import { VoiceBar } from '../../src/components/VoiceBar';
import { FarmOrNotCard } from '../../src/components/FarmOrNotCard';
import { SoilTypeCard } from '../../src/components/SoilTypeCard';

describe('Components Render Contracts', () => {
  it('exports VisualCard functional component', () => {
    expect(typeof VisualCard).toBe('function');
  });

  it('exports VoiceBar functional component', () => {
    expect(typeof VoiceBar).toBe('function');
  });

  it('exports FarmOrNotCard functional component', () => {
    expect(typeof FarmOrNotCard).toBe('function');
  });

  it('exports SoilTypeCard functional component', () => {
    expect(typeof SoilTypeCard).toBe('function');
  });
});
