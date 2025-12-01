"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { TodayAppointments } from "@/components/doctor/today-appointment"
import { ScheduleTimeline } from "@/components/doctor/schedule-timeline"

export function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [doctorName, setDoctorName] = useState("Doctor")

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/doctors/me`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setDoctorName(data.name)
        }
      } catch (e) {
        console.error("Failed to fetch doctor", e)
      }
    }
    fetchDoctor()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} role="doctor" onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Page Title */}
            <div className=" rounded-2xl p-6  shadow-lg">
              <h2 className="text-3xl font-bold">Welcome Back, {doctorName}! </h2>
              <p className="mt-2 text-gray-500">Here&apos;s your schedule and patient information for today.</p>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <TodayAppointments />
              <ScheduleTimeline />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
