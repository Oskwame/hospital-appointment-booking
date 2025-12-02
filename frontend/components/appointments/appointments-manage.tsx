"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import { AppointmentForm } from "./appointment-form"
import { AppointmentDetail } from "@/components/appointments/appointment-details"
import { useAuth } from "@/lib/auth-context"

interface AppointmentRow {
  id: number
  name: string
  email: string
  serviceName: string
  date: string
  time: string
  status: string
  description: string
  doctorName?: string
}

export function AppointmentsManager() {
  const { role } = useAuth()
  const [appointments, setAppointments] = useState<AppointmentRow[]>([])
  const [servicesMap, setServicesMap] = useState<Record<number, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRow | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)

  const base = useMemo(() => (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api", [])

  const reload = useCallback(async () => {
    try {
      const r = String(role || '').toLowerCase()
      // Use /me endpoint for doctors to get only their appointments
      const appointmentsEndpoint = r === 'doctor' ? `${base}/appointments/me` : `${base}/appointments`

      const [servicesRes, apptRes] = await Promise.all([
        fetch(`${base}/services`, { credentials: "include" }),
        fetch(appointmentsEndpoint, { credentials: "include" }),
      ])
      const servicesData = await servicesRes.json()
      const apptsData = await apptRes.json()
      const map: Record<number, string> = {}
        ; (servicesData as any[]).forEach((s) => (map[s.id] = s.name))
      setServicesMap(map)
      setAppointments(
        (apptsData as any[]).map((a) => {
          const iso = String(a.appointment_date || "")
          const d = iso.slice(0, 10)
          const t = iso.slice(11, 16)
          return {
            id: a.id,
            name: a.name,
            email: a.email,
            serviceName: map[a.service_id] || String(a.service_id),
            date: d,
            time: t,
            status: a.status || "booked",
            description: a.description || "",
            doctorName: a.doctor?.name || (a.doctor_name) || undefined,
          } as AppointmentRow
        })
      )
    } catch (e) { }
  }, [base, role])

  // Helper function to get session from time
  const getSessionFromTime = (time: string): string => {
    const hour = parseInt(time.split(':')[0])
    if (hour >= 7 && hour < 10) return 'Morning'
    if (hour >= 11 && hour < 15) return 'Afternoon'
    if (hour >= 15 && hour < 18) return 'Evening'
    return time
  }

  useEffect(() => {
    Promise.resolve().then(reload)
  }, [reload])

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  }

  const handleDelete = (id: string) => {
    if (role === "doctor") {
      alert("Doctors cannot delete appointments")
      return
    }
    const ok = typeof window !== "undefined" ? window.confirm("Delete this appointment? This action cannot be undone.") : true
    if (!ok) return
    setAppointments(appointments.filter((a) => String(a.id) !== id))
  }

  const canCreateAppointment = role !== "doctor"
  const canEdit = role !== "doctor"
  const canDelete = role !== "doctor"

  return (
    <div className="overflow-x-auto gap-2 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">
          {role === "doctor" ? "My Appointments" : "All Appointments"}
        </h3>

        {canCreateAppointment && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 rounded-xl"
          >
            <Plus className="rounded-xl h-5 bg-blue-500 text-white" />
            New Appointment
          </Button>
        )}
      </div>

      {/* Form */}
      {canCreateAppointment && showForm && (
        <AppointmentForm
          appointment={
            editingId ? appointments.find((a) => a.id === editingId) : undefined
          }
          onClose={() => {
            setShowForm(false)
            setEditingId(null)
          }}
          onCreated={() => reload()}
        />
      )}

      {/* Detail */}
      {selectedAppointment && (
        <AppointmentDetail
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          role={role}
          onStatusUpdated={reload}
        />
      )}

      {/* Desktop Table */}
      <div className="overflow-x-auto">
        <Card className="p-6 bg-white rounded-xl shadow-md border border-slate-200 max-w-7xl mx-auto ">

          <table className="w-full max-w-7xl border-collapse text-sm sm:table hidden">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Patient</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Email</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Service</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Date & Time</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Description</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4 text-slate-700">{appointment.name}</td>
                  <td className="py-4 px-4 text-slate-700">{appointment.email}</td>
                  <td className="py-4 px-4 text-slate-700">{appointment.serviceName}</td>
                  <td className="py-4 px-4 text-slate-700">
                    {appointment.date} - {getSessionFromTime(appointment.time)}
                  </td>
                  <td className="py-4 px-4 text-slate-700 max-w-xs truncate">
                    {appointment.description}
                  </td>

                  <td className="py-4 px-4">
                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status as keyof typeof statusColors] ||
                        "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {appointment.status}
                    </Badge>
                  </td>

                  <td className="py-4 px-2 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => {
                          setEditingId(appointment.id)
                          setShowForm(true)
                        }}
                        className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(String(appointment.id))}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between mb-3">
                  <h4 className="font-semibold text-slate-700">{appointment.name}</h4>
                  <Badge
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status as keyof typeof statusColors] ||
                      "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {appointment.status}
                  </Badge>
                </div>

                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-600">Service:</span>{" "}
                  {appointment.serviceName}
                </p>

                <p className="text-sm text-slate-500">
                  <span className="font-medium text-slate-600">Date:</span>{" "}
                  {appointment.date} - {getSessionFromTime(appointment.time)}
                </p>

                {appointment.description && (
                  <p className="text-sm text-slate-500 mt-1">
                    <span className="font-medium text-slate-600">Notes:</span>{" "}
                    {appointment.description}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setSelectedAppointment(appointment)}
                    className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => {
                        setEditingId(appointment.id)
                        setShowForm(true)
                      }}
                      className="p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(String(appointment.id))}
                      className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </Card>
      </div>
    </div>
  )
}
