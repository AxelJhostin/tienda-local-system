import './globals.css'
import QueryProvider from '@/lib/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'

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
      <body>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}

