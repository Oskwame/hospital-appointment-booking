"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Mail, CheckCircle, PlayCircle, Clock, XCircle } from "lucide-react"
import { useState } from "react"

type Role = "admin" | "superadmin" | "doctor" | null

interface AppointmentDetailProps {
  appointment: {
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
  onClose: () => void
  role?: Role
  onStatusUpdated?: () => void
}

export function AppointmentDetail({ appointment, onClose, role, onStatusUpdated }: AppointmentDetailProps) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateStatus = async (newStatus: string) => {
    setError(null)
    setUpdating(true)
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.message || "Failed to update appointment")
      }

      onStatusUpdated?.()
      onClose()
    } catch (e: any) {
      setError(e.message || "Failed to update appointment")
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-700 border-green-300"
      case 'confirmed':
      case 'in progress':
        return "bg-blue-100 text-blue-700 border-blue-300"
      case 'cancelled':
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-amber-100 text-amber-700 border-amber-300"
    }
  }

  const isDoctor = role === "doctor"
  const canConfirm = isDoctor && ['pending', 'booked'].includes(appointment.status.trim().toLowerCase())
  const canStart = isDoctor && ['confirmed'].includes(appointment.status.trim().toLowerCase())
  const canComplete = isDoctor && ['confirmed', 'in progress'].includes(appointment.status.trim().toLowerCase())
  const canCancel = isDoctor && !['cancelled', 'completed'].includes(appointment.status.trim().toLowerCase())

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card
        className="
        max-w-md w-full 
        bg-white/95 backdrop-blur-xl 
        border border-slate-300 
        shadow-2xl rounded-2xl 
        p-6 animate-in fade-in zoom-in duration-200
      "
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-800">
            Appointment Details
          </h3>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="space-y-5">
          {/* Status Badge */}
          <div>
            <p className="text-xs text-slate-500 mb-1">Status</p>
            <Badge
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border-2 ${getStatusColor(appointment.status)}`}
            >
              {appointment.status === 'completed' && <CheckCircle className="h-3 w-3" />}
              {appointment.status.toLowerCase() === 'in progress' && <Clock className="h-3 w-3" />}
              {appointment.status}
            </Badge>
          </div>

          <div>
            <p className="text-xs text-slate-500">Patient</p>
            <p className="text-slate-800 font-semibold text-sm">{appointment.name}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Email</p>
            <p className="text-slate-800 font-medium text-sm">{appointment.email}</p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Service</p>
            <p className="text-slate-800 font-medium text-sm">
              {appointment.serviceName}
            </p>
          </div>

          {appointment.doctorName && (
            <div>
              <p className="text-xs text-slate-500">Assigned Doctor</p>
              <p className="text-slate-800 font-medium text-sm">
                {appointment.doctorName}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-slate-800 font-medium text-sm">
                {appointment.date}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-slate-800 font-medium text-sm">
                {appointment.time}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500">Description</p>
            <p className="text-slate-700 text-sm leading-relaxed">
              {appointment.description || 'No description provided'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-slate-200">
          {isDoctor ? (
            <>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={updating}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </Button>

                {canCancel && (
                  <Button
                    onClick={() => updateStatus('cancelled')}
                    disabled={updating}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {updating ? "Updating..." : "Cancel Appt"}
                  </Button>
                )}
              </div>

              {canConfirm && (
                <Button
                  onClick={() => updateStatus('confirmed')}
                  disabled={updating}
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-xl"
                >
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {updating ? "Updating..." : "Confirm Appointment"}
                </Button>
              )}

              {canStart && (
                <Button
                  onClick={() => updateStatus('in progress')}
                  disabled={updating}
                  className="w-full bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {updating ? "Updating..." : "Start Appointment"}
                </Button>
              )}

              {canComplete && (
                <Button
                  onClick={() => updateStatus('completed')}
                  disabled={updating}
                  className="w-full bg-green-500 text-white hover:bg-green-600 rounded-xl"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updating ? "Updating..." : "Mark Complete"}
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Close
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
