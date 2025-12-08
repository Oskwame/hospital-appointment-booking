"use client"

import { useState } from "react"
import { TopBar } from "@/components/layout/topbar"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardOverview } from "@/components/superadmin/dashboard-overview"
import { AppointmentsCalendar } from "@/components/admin/appointments-calender"

export function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} role="superadmin" onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Modern Page Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-400 to-indigo-300 rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-100">Super Admin Dashboard</h2>
              <p className="text-gray-50 mt-2">
                Complete system control and analytics at your fingertips
              </p>
            </div>

            {/* Enhanced Tabbed Interface */}
            <div className="space-y-6">
              <DashboardOverview />


            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
