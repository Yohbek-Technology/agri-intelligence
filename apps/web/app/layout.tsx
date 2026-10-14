import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { AppProviders } from '../providers/appProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgriIntel | Autonomous Agricultural Extension Operating System',
  description:
    'Autonomous Agricultural Intelligence and Extension Operating System for Highland Vertisol Agronomy, Adama Woreda Municipal Extension Branch.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="scroll-smooth">
      <body className="bg-background text-text-primary min-h-screen antialiased flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
