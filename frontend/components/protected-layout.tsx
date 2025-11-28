
"use client"
import { useEffect, useState } from "react"
import { AdminDashboard } from "./dashboards/admin-dashboard"
import { SuperAdminDashboard } from "./dashboards/super-admin-dashboard"
import { DoctorDashboard } from "@/components/dashboards/doctor-dashboard"

export function ProtectedLayout() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<"admin" | "superadmin" | "doctor" | null>(null)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL + "/api"
        const res = await fetch(`${base}/auth/me`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
          const r = String(data.role || "ADMIN").toLowerCase() as any
          setRole(r === "doctor" ? "doctor" : r === "superadmin" ? "superadmin" : "admin")
        } else {
          setRole("admin")
        }
      } catch {
        setRole("admin")
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

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
    return <AdminDashboard />
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
