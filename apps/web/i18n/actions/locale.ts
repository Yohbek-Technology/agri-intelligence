'use server'

import { cookies } from 'next/headers'

const SUPPORTED = ['en', 'am', 'om']

export async function setLocaleAction(locale: string) {
  if (!SUPPORTED.includes(locale)) return
  const store = await cookies()
  store.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  })
}
