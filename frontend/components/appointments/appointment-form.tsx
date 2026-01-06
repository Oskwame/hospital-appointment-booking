"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { X, AlertCircle } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

interface AppointmentFormProps {
  appointment?: any
  onClose: () => void
  onCreated?: (created: any) => void
}

export function AppointmentForm({ appointment, onClose, onCreated }: AppointmentFormProps) {
  const [services, setServices] = useState<Array<{ id: number; name: string; description: string; availableDates: string[]; timeSlots: string[]; availableSessions?: string[] }>>([])
  const [serviceId, setServiceId] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("male")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [session, setSession] = useState("")
  const [newTime, setNewTime] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const base = API_BASE_URL
        const res = await fetch(`${base}/api/services`, { headers: getAuthHeaders() })
        const data = await res.json()
        setServices(
          (data as any[]).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            availableDates: Array.isArray(s.availableDates) ? s.availableDates : [],
            timeSlots: Array.isArray(s.timeSlots) ? s.timeSlots : [],
          }))
        )
      } catch (e) { }
    }
    run()
  }, [])

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId])

  const canSubmit = Boolean(name && email && serviceId && date && session)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)

    try {
      const base = API_BASE_URL
      const res = await fetch(`${base}/api/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          name,
          email,
          gender,
          description,
          serviceId,
          date,
          session,
          time: newTime !== "none" ? newTime : undefined
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to create appointment")
        return
      }

      onCreated?.(data)
      onClose()
    } catch (e) {
      setError("An unexpected error occurred. Please try again.")
      console.error(e)
    }
  }

  return (
    <Card className="p-6 bg-white shadow-md rounded-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Create New Appointment</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name / Email / Gender */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
            <Select value={gender} onValueChange={(v) => setGender(v)}>
              <SelectTrigger className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Service / Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Service</label>
            <Select value={serviceId ? String(serviceId) : undefined} onValueChange={(v) => setServiceId(Number(v))}>
              <SelectTrigger className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent className=" bg-white">
                {services.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none resize-none h-24 transition"
            />
          </div>
        </div>

        {/* Date / Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Available Date</label>
            <Select value={date || undefined} onValueChange={(v) => setDate(v)}>
              <SelectTrigger className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                <SelectValue placeholder={selectedService ? "Select a date" : "Select a service first"} />
              </SelectTrigger>
              <SelectContent className=" bg-white">
                {(selectedService?.availableDates || []).map((d) => (
                  <SelectItem key={d} value={d.slice(0, 10)}>{d.slice(0, 10)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Session</label>
            <Select value={session || undefined} onValueChange={(v) => {
              setSession(v)
              setNewTime("") // Reset time when session changes
            }}>
              <SelectTrigger className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                <SelectValue placeholder={selectedService ? "Select a session" : "Select a service first"} />
              </SelectTrigger>
              <SelectContent className=" bg-white">
                {selectedService?.availableSessions?.includes('morning') !== false && (
                  <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                )}
                {selectedService?.availableSessions?.includes('afternoon') !== false && (
                  <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                )}
                {selectedService?.availableSessions?.includes('evening') !== false && (
                  <SelectItem value="evening">Evening (5PM - 9PM)</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Time Slot (Optional)</label>
            <Select value={newTime || undefined} onValueChange={(v) => setNewTime(v)} disabled={!session}>
              <SelectTrigger className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition disabled:bg-gray-50">
                <SelectValue placeholder={!session ? "Select session first" : "Select time"} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {selectedService?.timeSlots
                  ?.filter(t => {
                    if (!session) return true
                    const hour = parseInt(t.split(':')[0])
                    if (session === 'morning') return hour >= 6 && hour < 12
                    if (session === 'afternoon') return hour >= 12 && hour < 17
                    if (session === 'evening') return hour >= 17
                    return true
                  })
                  .map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                <SelectItem value="none">No Specific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 justify-end mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            type="button"
            className="flex-1 rounded-xl h-11 border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 rounded-xl h-11 bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Create Appointment
          </Button>
        </div>
      </form>
    </Card >
  )
}