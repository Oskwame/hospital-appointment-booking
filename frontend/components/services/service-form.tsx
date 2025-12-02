"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Plus } from "lucide-react"
import {
  FaTooth,
  FaEye,
  FaSearch,
  FaVolumeUp,
  FaHeartbeat,
  FaPills,
  FaHospital,
  FaStethoscope,
  FaBaby,
  FaMicroscope
} from "react-icons/fa"

interface Service {
  id: number
  name: string
  description: string
  icon: string
  availableDates: string[]
  timeSlots: string[]
}

interface ServiceFormProps {
  service?: Service
  onSubmit: (service: Omit<Service, "id">) => Promise<void>
  onCancel: () => void
}

export function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(service?.name || "")
  const [description, setDescription] = useState(service?.description || "")
  const [icon, setIcon] = useState(service?.icon || "")
  const [availableDates, setAvailableDates] = useState<string[]>(service?.availableDates || [])
  const [timeSlots, setTimeSlots] = useState<string[]>(service?.timeSlots || [])
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAddDate = () => {
    if (newDate && !availableDates.includes(newDate)) {
      setAvailableDates([...availableDates, newDate].sort())
      setNewDate("")
    }
  }

  const handleRemoveDate = (date: string) => {
    setAvailableDates(availableDates.filter((d) => d !== date))
  }

  const handleAddTime = () => {
    if (newTime && !timeSlots.includes(newTime)) {
      setTimeSlots([...timeSlots, newTime].sort())
      setNewTime("")
    }
  }

  const handleRemoveTime = (time: string) => {
    setTimeSlots(timeSlots.filter((t) => t !== time))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description || !icon || availableDates.length === 0 || timeSlots.length === 0) {
      alert("Please fill all required fields")
      return
    }

    setLoading(true)
    try {
      await onSubmit({ name, description, icon, availableDates, timeSlots })
    } finally {
      setLoading(false)
    }
  }

  const iconOptions = [
    { key: "Tooth", Icon: FaTooth },
    { key: "Eye", Icon: FaEye },
    { key: "Search", Icon: FaSearch },
    { key: "VolumeUp", Icon: FaVolumeUp },
    { key: "Heartbeat", Icon: FaHeartbeat },
    { key: "Pills", Icon: FaPills },
    { key: "Hospital", Icon: FaHospital },
    { key: "Stethoscope", Icon: FaStethoscope },
    { key: "Baby", Icon: FaBaby },
    { key: "Microscope", Icon: FaMicroscope },
  ]

  return (
    <Card className="p-8 border border-blue-100 rounded-2xl shadow-sm bg-white/95">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Service Details</h3>
            <p className="text-sm text-slate-500 mt-1">Provide structured and accurate service information for scheduling.</p>
          </div>
        </div>

        {/* Service Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Service Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Dental Consultation"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Service name"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Short, clear description of the medical service"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Service description"
          />
        </div>

        {/* Icon Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Select Icon</label>
          <div className="flex flex-wrap gap-3">
            {iconOptions.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                aria-pressed={icon === key}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-shadow duration-150 ${icon === key
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                title={key}
              >
                <Icon className="text-blue-600 text-lg" />
              </button>
            ))}
            <div className="flex items-center ml-1 text-sm text-slate-500">Selected: <span className="ml-2 font-medium text-slate-700">{icon || "—"}</span></div>
          </div>

          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="Type icon name or paste emoji"
            className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Icon text input"
          />
        </div>

        {/* Available Dates */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h4 className="text-lg font-semibold text-slate-800">Available Dates</h4>

          <div className="flex gap-3">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add date"
            />
            <Button
              type="button"
              onClick={handleAddDate}
              variant="outline"
              className="rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50 px-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          {availableDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableDates.map((date) => (
                <div
                  key={date}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-sm shadow-sm"
                >
                  <span>{new Date(date).toLocaleDateString()}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDate(date)}
                    className="hover:bg-blue-100 p-1 rounded"
                    aria-label={`Remove date ${date}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Time Slots */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <h4 className="text-lg font-semibold text-slate-800">Available Time Slots</h4>

          <div className="flex gap-3">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Add time slot"
            />
            <Button
              type="button"
              onClick={handleAddTime}
              variant="outline"
              className="rounded-xl border-blue-300 text-blue-600 hover:bg-blue-50 px-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>

          {timeSlots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-800 rounded-full text-sm shadow-sm"
                >
                  <span>{time}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTime(time)}
                    className="hover:bg-blue-100 p-1 rounded"
                    aria-label={`Remove time ${time}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-5 py-2">
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Saving..." : "Save Service"}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ServiceForm
