"use client"

import { useState } from "react"
import { Sidebar } from "../layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { TodayAppointments } from "@/components/doctor/today-appointment"
import { DoctorProfile } from "../doctor/doctor-profile"
import { ScheduleTimeline } from "@/components/doctor/schedule-timeline"

export function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} role="doctor" onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <h2 className="text-3xl font-bold">Welcome Back, Dr. Davis! 👋</h2>
              <p className="mt-2 text-blue-100">Here's your schedule and patient information for today.</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <TodayAppointments />
                <ScheduleTimeline />
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                <DoctorProfile />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
