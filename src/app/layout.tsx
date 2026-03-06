import './globals.css'
import QueryProvider from '@/lib/providers/query-provider'

export const metadata = {
  title: 'Sistema de Tienda',
  description: 'Sistema interno de gestión para tienda de tecnología',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}