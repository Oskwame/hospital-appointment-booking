"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/topbar"
import { Sidebar } from "@/components/layout/sidebar"
import { MetricsCards } from "@/components/admin/metrics-card"
import { AppointmentsTable } from "../admin/appointment-table"
import {AppointmentsCalendar} from "@/components/admin/appointments-calender"
import {UserManagement} from "@/components/superadmin/user-management"



export function SuperAdminDashboard () {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return(
        <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} role="superadmin" onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <div>
              <h2 className="text-3xl font-bold text-foreground">Super Admin Dashboard</h2>
              <p className="text-muted-foreground mt-1">Manage hospital staff and view full analytics.</p>
            </div>

            {/* Metrics */}
            <MetricsCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Admin Features */}
              <div className="lg:col-span-2 space-y-6">
                <AppointmentsCalendar />
                <AppointmentsTable />
              </div>

              {/* User Management */}
              <div className="space-y-6">
                <UserManagement />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    )
}
    
