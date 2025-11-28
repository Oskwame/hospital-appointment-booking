"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { ProtectedPage } from "@/components/admin/protected-pages"
import { useAuth } from "@/lib/auth-context"
import { ReportsAnalytics } from "@/components/reports/reports-analytics"

export default function ReportsPage() {
  const { role } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ProtectedPage allowedRoles={["admin", "superadmin"]} pageTitle="Reports">
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar open={sidebarOpen} role={role ?? "admin"} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto">
            <div className="p-6 max-w-7xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Reports & Analytics</h2>
                <p className="text-muted-foreground mt-1">Hospital performance metrics and detailed analytics.</p>
              </div>
              <ReportsAnalytics />
            </div>
          </main>
        </div>
      </div>
    </ProtectedPage>
  )
}
