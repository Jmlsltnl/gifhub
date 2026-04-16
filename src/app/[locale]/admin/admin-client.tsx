'use client'

import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(
  () => import('./admin-dashboard').then((m) => m.AdminDashboard),
  { ssr: false, loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )}
)

export function AdminClient() {
  return <AdminDashboard />
}
