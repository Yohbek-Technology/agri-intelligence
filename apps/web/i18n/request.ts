import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['en', 'am', 'om'] as const
type Locale = (typeof SUPPORTED_LOCALES)[number]

export default getRequestConfig(async () => {
  const store = await cookies()
  const raw = store.get('NEXT_LOCALE')?.value ?? 'en'
  const locale: Locale = (SUPPORTED_LOCALES as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'en'

  const messages = (
    await import(`./messages/${locale}.json`)
  ).default

  return { locale, messages }
})
