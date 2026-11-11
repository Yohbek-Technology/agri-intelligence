import React from 'react';
import { I18nProvider as BaseI18nProvider, useTranslation } from '@/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <BaseI18nProvider>{children}</BaseI18nProvider>;
}

export { useTranslation };

