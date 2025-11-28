"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Mail } from "lucide-react"

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
  }
  onClose: () => void
}

export function AppointmentDetail({ appointment, onClose }: AppointmentDetailProps) {
  const handleApprove = () => {
    console.log("Appointment approved, email sent to patient")
    onClose()
  }

  return (
  <Card
  className="
    fixed inset-0 m-auto max-w-md w-[90%] h-fit 
    bg-white/80 backdrop-blur-xl 
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
        {appointment.description}
      </p>
    </div>

    <div>
      <p className="text-xs text-slate-500">Status</p>

      <Badge
        className="
          mt-1 px-3 py-1 rounded-full text-xs font-medium 
          bg-blue-100 text-blue-700
        "
      >
        {appointment.status}
      </Badge>
    </div>

    {/* ACTION BUTTONS */}
    {appointment.status === "pending" && (
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          className="
            flex-1 border-slate-300 text-slate-700 
            hover:bg-slate-100 rounded-xl
          "
        >
          Reject
        </Button>

        <Button
          onClick={handleApprove}
          className="
            flex-1 gap-2 rounded-xl 
            bg-blue-600 hover:bg-blue-700 text-white
          "
        >
          <Mail className="h-4 w-4" />
          Approve & Email Patient
        </Button>
      </div>
    )}
  </div>
</Card>

  )
}
