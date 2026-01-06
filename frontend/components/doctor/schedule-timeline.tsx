"use client"

import { CalendarClock, Loader2 } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

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

interface TimeSlot {
  time: string
  status: "Available" | "Booked" | "Pending Action" | "Break" | "Past"
  color: string
  appointments?: Appointment[]
}

export function ScheduleTimeline() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  const fetchAppointments = useCallback(async () => {
    try {
      const base = API_BASE_URL
      const res = await fetch(`${base}/api/appointments/me`, {
        headers: getAuthHeaders(),
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
  }, [])

  useEffect(() => {
    fetchAppointments()
    // Refresh every minute to keep data updated
    const interval = setInterval(() => {
      fetchAppointments()
    }, 60000)
    return () => clearInterval(interval)
  }, [fetchAppointments])

  useEffect(() => {
    generateTimeSlots()
  }, [appointments])

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []

    // Define sessions with their time ranges
    const sessions = [
      {
        name: "Morning",
        label: "7:00 AM - 11:00 AM",
        startHour: 7,
        endHour: 11
      },
      {
        name: "Afternoon",
        label: "11:00 AM - 3:00 PM",
        startHour: 11,
        endHour: 15
      },
      {
        name: "Evening",
        label: "3:00 PM - 7:00 PM",
        startHour: 15,
        endHour: 19
      },
    ]

    sessions.forEach(session => {
      // Find appointments in this session's time range
      const sessionAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date)
        const hour = aptDate.getHours()
        return hour >= session.startHour && hour < session.endHour
      })

      if (sessionAppointments.length > 0) {
        const hasPending = sessionAppointments.some(a => a.status === 'pending')
        slots.push({
          time: `${session.name}`,
          status: hasPending ? "Pending Action" : "Booked",
          color: hasPending
            ? "bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300 text-orange-700"
            : "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-700",
          appointments: sessionAppointments // Store all appointments for this session
        })
      } else {
        slots.push({
          time: `${session.name}`,
          status: "Available",
          color: "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 text-green-700"
        })
      }
    })

    setTimeSlots(slots)
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <CalendarClock className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Day Schedule</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeSlots.map((slot, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-xl text-center border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${slot.color} relative group`}
          >
            <p className="font-bold text-lg">{slot.time}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-sm font-semibold opacity-80">{slot.status}</p>
              {slot.appointments && slot.appointments.length > 0 && (
                <span className="bg-white/80 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {slot.appointments.length}
                </span>
              )}
            </div>
            {slot.appointments && slot.appointments.length > 0 && (
              <div className="absolute inset-0 bg-black/95 rounded-xl flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-4 overflow-auto">
                <p className="text-white text-xs font-semibold mb-3 text-center border-b border-white/20 pb-2">
                  {slot.appointments.length} {slot.appointments.length === 1 ? 'Appointment' : 'Appointments'}
                </p>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {slot.appointments.map((apt, aptIdx) => {
                    const time = new Date(apt.appointment_date).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })
                    return (
                      <div key={aptIdx} className="bg-white/10 rounded-lg p-2 hover:bg-white/20 transition-colors">
                        <p className="text-white text-sm font-semibold">
                          {apt.name}
                        </p>
                        <p className="text-white/70 text-xs mt-0.5">
                          {time}
                        </p>
                        {apt.description && (
                          <p className="text-white/60 text-xs mt-1 line-clamp-2">
                            {apt.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"></div>
          <span className="text-xs font-medium text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div>
          <span className="text-xs font-medium text-slate-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-500"></div>
          <span className="text-xs font-medium text-slate-600">Pending Action</span>
        </div>
      </div>
    </div>
  )
}
