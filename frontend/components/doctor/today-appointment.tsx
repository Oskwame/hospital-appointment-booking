"use client"

import { useEffect, useState } from "react"
import { Clock, CheckCircle, AlertCircle, Calendar, User } from "lucide-react"

interface Appointment {
  id: number
  name: string
  email: string
  phone: string
  description: string
  appointment_date: string
  status: string
  service_id: number
  doctor_id: number | null
  created_at: string
}

export function TodayAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/appointments/me`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          // Filter for today's appointments
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const todayAppts = data.filter((apt: Appointment) => {
            const aptDate = new Date(apt.appointment_date)
            return aptDate >= today && aptDate < tomorrow
          })
          setAppointments(todayAppts)
        }
      } catch (e) {
        console.error("Failed to fetch appointments", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return CheckCircle
      case 'in progress':
        return Clock
      default:
        return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-700 border-green-200"
      case 'in progress':
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-amber-100 text-amber-700 border-amber-200"
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
        <p className="text-center text-slate-500">Loading appointments...</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Today's Appointments</h3>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
          {appointments.length} Total
        </span>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No appointments for today</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const StatusIcon = getStatusIcon(apt.status)
            return (
              <div
                key={apt.id}
                className="group p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/50 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-base">{apt.name}</p>
                      <p className="text-sm text-slate-600">{apt.description || 'No description'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <p className="text-xs text-slate-500 font-medium">{formatTime(apt.appointment_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(apt.status)}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {apt.status}
                    </span>
                    <button className="px-4 py-2 rounded-[8px] bg-blue-500 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                      View
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
