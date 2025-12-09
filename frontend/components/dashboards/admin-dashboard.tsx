"use client"
import { TopBar } from "@/components/layout/topbar"
import { Sidebar } from "@/components/layout/sidebar"
import { useState } from "react"
import { AdminDashboardOverview } from "@/components/admin/admin-dashboard-overview"

export function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Modern Page Header with Gradient */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>
              <p className="text-emerald-100 mt-2">
                Welcome back! Here&apos;s your hospital overview at a glance.
              </p>
            </div>

            {/* Dashboard Content */}
            <AdminDashboardOverview />
          </div>
        </main>
      </div>
    </div>
  )
}

