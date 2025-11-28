"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Calendar, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { FaTooth, FaEye, FaSearch, FaVolumeUp, FaHeartbeat, FaPills, FaHospital, FaStethoscope } from "react-icons/fa"
import { ServiceForm } from "./service-form"

interface Service {
  id: number
  name: string
  description: string
  icon: string
  availableDates: string[]
  timeSlots: string[]
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/services`, { credentials: "include" })
      const data = await res.json()
      setServices(
        (data as any[]).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? "",
          icon: s.icon || "",
          availableDates: Array.isArray(s.availableDates) ? s.availableDates : [],
          timeSlots: Array.isArray(s.timeSlots) ? s.timeSlots : [],
        }))
      )
    } catch (error) {
      console.error("[v0] Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async (serviceData: Omit<Service, "id">) => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: serviceData.name,
          description: serviceData.description,
          icon: serviceData.icon,
          availableDates: serviceData.availableDates,
          timeSlots: serviceData.timeSlots,
        }),
      })
      const newService = await res.json()
      setServices([
        ...services,
        {
          id: newService.id,
          name: newService.name,
          description: newService.description ?? "",
          icon: newService.icon || "",
          availableDates: Array.isArray(newService.availableDates) ? newService.availableDates : [],
          timeSlots: Array.isArray(newService.timeSlots) ? newService.timeSlots : [],
        },
      ])
      setShowForm(false)
    } catch (error) {
      console.error("[v0] Failed to add service:", error)
    }
  }

  const handleEditService = async (serviceData: Omit<Service, "id">) => {
    if (editingId === null) return
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: serviceData.name,
          description: serviceData.description,
          icon: serviceData.icon,
          availableDates: serviceData.availableDates,
          timeSlots: serviceData.timeSlots,
        }),
      })
      const updated = await res.json()
      setServices(
        services.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: updated.name,
                description: updated.description ?? "",
                icon: updated.icon || "",
                availableDates: Array.isArray(updated.availableDates) ? updated.availableDates : [],
                timeSlots: Array.isArray(updated.timeSlots) ? updated.timeSlots : [],
              }
            : s
        )
      )
      setEditingId(null)
    } catch (error) {
      console.error("[v0] Failed to update service:", error)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      await fetch(`${base}/services/${id}`, { method: "DELETE", credentials: "include" })
      setServices(services.filter((s) => s.id !== id))
    } catch (error) {
      console.error("[v0] Failed to delete service:", error)
    }
  }

  // Keep UI visible during loading; show message in list area instead

  const editingService = services.find((s) => s.id === editingId)

  const ICONS: Record<string, any> = {
    Tooth: FaTooth,
    Eye: FaEye,
    Search: FaSearch,
    VolumeUp: FaVolumeUp,
    Heartbeat: FaHeartbeat,
    Pills: FaPills,
    Hospital: FaHospital,
    Stethoscope: FaStethoscope,
  }

 return (
  <div className="space-y-6">

    {(showForm || editingId) && (
      <ServiceForm
        service={editingService}
        onSubmit={editingId ? handleEditService : handleAddService}
        onCancel={() => {
          setShowForm(false)
          setEditingId(null)
        }}
      />
    )}

    {/* Header */}
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
        Hospital Services
      </h3>

      {!showForm && !editingId && (
        <Button
          onClick={() => setShowForm(true)}
          className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 rounded-xl"
        >
          <Plus className="rounded-xl h-5 bg-blue-500 text-white" />
          Add Service
        </Button>
      )}
    </div>

    {/* Loading / Empty State */}
    {loading ? (
      <Card className="p-12 text-center border border-blue-100 bg-blue-50/30 rounded-2xl">
        <p className="text-slate-500">Loading services...</p>
      </Card>
    ) : services.length === 0 ? (
      <Card className="p-12 text-center border border-blue-100 bg-blue-50/30 rounded-2xl">
        <p className="text-slate-500">No services added yet.</p>
      </Card>
    ) : (
      <div className="space-y-3">

        {services.map((service) => {
          const IconComp = ICONS[service.icon]

          return (
            <Card
              key={service.id}
              className={`
                overflow-hidden rounded-2xl border border-blue-100
                transition-shadow bg-white
                hover:shadow-md
                relative
              `}
            >
              {/* Left Accent Bar */}
              <div
                className={`
                  absolute left-0 top-0 h-full w-1.5 rounded-r-md 
                  transition-all 
                  ${expandedId === service.id ? "bg-blue-600" : "bg-blue-400/50"}
                `}
              />

              {/* Collapsed Header */}
              <div
                className="p-4 cursor-pointer flex items-center justify-between hover:bg-slate-50"
                onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  {IconComp ? (
                    <IconComp className="h-8 w-8 text-blue-600" />
                  ) : (
                    <span className="text-3xl">{service.icon}</span>
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-base">
                      {service.name}
                    </h4>
                    <p className="text-sm text-slate-500">
                      {service.description}
                    </p>
                  </div>
                </div>

                {expandedId === service.id ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </div>

              {/* Expanded */}
              {expandedId === service.id && (
                <div className="bg-slate-50 border-t border-blue-100 p-5 space-y-5">

                  {/* Dates */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">
                        Available Dates ({service.availableDates.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {service.availableDates.length ? (
                        service.availableDates.map((date) => (
                          <span
                            key={date}
                            className="text-xs bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm"
                          >
                            {new Date(date).toLocaleDateString()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No dates configured</span>
                      )}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-slate-800">
                        Time Slots ({service.timeSlots.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {service.timeSlots.length ? (
                        service.timeSlots.map((time) => (
                          <span
                            key={time}
                            className="text-xs bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm"
                          >
                            {time}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No time slots configured</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl"
                      onClick={() => setEditingId(service.id)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}

      </div>
    )}
  </div>
)
}
