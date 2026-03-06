import './globals.css'
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import QueryProvider from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Sistema de Tienda',
  description: 'Sistema interno de gestion para tienda de tecnologia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${plusJakarta.variable} ${jetBrainsMono.variable}`}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
