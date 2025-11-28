"use client"
import { TopBar } from "@/components/layout/topbar"
import { Sidebar } from "@/components/layout/sidebar"
import { useState } from "react"
import { MetricsCards } from "@/components/admin/metrics-card"
import { AppointmentsTable } from "../admin/appointment-table"
import {AppointmentsCalendar} from "@/components/admin/appointments-calender"  

export function AdminDashboard () {
    const [sidebarOpen, setSidebarOpen] = useState(true)

     return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <div>
              <h2 className="text-3xl font-bold text-foreground">Admin Dashboard</h2>
              <p className="text-muted-foreground mt-1">Welcome back! Here&#39;s your hospital overview.</p>
            </div>

            {/* Metrics */}
            <MetricsCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar and Table */}
              <div className="lg:col-span-2 space-y-6">
                <AppointmentsCalendar />
                <AppointmentsTable />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
