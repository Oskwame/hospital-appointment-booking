"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "./dashboards/admin-dashboard"
import { SuperAdminDashboard } from "./dashboards/super-admin-dashboard"
import { DoctorDashboard } from "@/components/dashboards/doctor-dashboard"
import { useAuth } from "@/lib/auth-context"

export function ProtectedLayout() {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-primary/20 mx-auto mb-4 flex items-center justify-center animate-pulse">
            <div className="h-8 w-8 rounded bg-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !role) {
    return null
  }

  // Render appropriate dashboard based on role
  const renderDashboard = () => {
    switch (role) {
      case "admin":
        return <AdminDashboard />
      case "superadmin":
        return <SuperAdminDashboard />
      case "doctor":
        return <DoctorDashboard />
      default:
        return <AdminDashboard />
    }
  }

  return renderDashboard()
}
