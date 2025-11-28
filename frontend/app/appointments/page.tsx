"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { AppointmentsManager } from "@/components/appointments/appointments-manage"

export default function AppointmentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Appointments Management</h2>
              <p className="text-muted-foreground mt-1">Create, view, and manage all appointments.</p>
            </div>
            <AppointmentsManager />
          </div>
        </main>
      </div>
    </div>
  )
}
