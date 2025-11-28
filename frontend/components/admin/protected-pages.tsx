"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent } from "@/components/ui/card"

interface ProtectedPageProps {
  children: ReactNode
  allowedRoles: ("admin" | "superadmin" | "doctor")[]
  pageTitle: string
}

export function ProtectedPage({ children, allowedRoles, pageTitle }: ProtectedPageProps) {
  const { role } = useAuth()

  const r = String(role || '').toLowerCase() as 'admin' | 'superadmin' | 'doctor'
  if (!r || !allowedRoles.includes(r)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">You&apos;re not permitted to access the {pageTitle} page.</p>
            <p className="text-sm text-muted-foreground">
              Current role: <span className="font-semibold capitalize">{r || 'unknown'}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
