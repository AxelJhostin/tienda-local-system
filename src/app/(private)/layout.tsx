import { requireServerSession } from '@/lib/auth/server'
import { PrivateShell } from '@/components/shared/private-shell'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireServerSession()

  return <PrivateShell session={session}>{children}</PrivateShell>
}

