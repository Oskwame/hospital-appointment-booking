"use client"

import { X, User, Mail, Phone, Calendar, Clock, FileText, CheckCircle, PlayCircle } from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
    session?: string
    time_slot?: string
    created_at: string
}

interface AppointmentDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    appointment: Appointment | null
    onStatusUpdated?: () => void
}

export function AppointmentDetailDialog({
    open,
    onOpenChange,
    appointment,
    onStatusUpdated,
}: AppointmentDetailDialogProps) {
    const [updating, setUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!open || !appointment) return null

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }

    const updateStatus = async (newStatus: string) => {
        setError(null)
        setUpdating(true)
        try {
            const base = API_BASE_URL
            const res = await fetch(`${base}/appointments/${appointment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!res.ok) {
                const msg = await res.json().catch(() => ({}))
                throw new Error(msg?.message || "Failed to update appointment")
            }

            onStatusUpdated?.()
            onOpenChange(false)
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
            default:
                return "bg-amber-100 text-amber-700 border-amber-300"
        }
    }

    const canConfirm = ['pending', 'booked'].includes(appointment.status.trim().toLowerCase())
    const canComplete = ['confirmed', 'in progress'].includes(appointment.status.trim().toLowerCase())

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
            <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 md:p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold">Appointment Details</h2>
                            <p className="text-blue-100 mt-1 text-sm md:text-base">Review and manage appointment</p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
                    {/* Status Badge */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <span
                            className={`inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold border-2 ${getStatusColor(appointment.status)}`}
                        >
                            {appointment.status === 'completed' && <CheckCircle className="h-3 md:h-4 w-3 md:w-4" />}
                            {appointment.status.toLowerCase() === 'in progress' && <Clock className="h-3 md:h-4 w-3 md:w-4" />}
                            {appointment.status}
                        </span>
                        <p className="text-xs text-slate-500">ID: #{appointment.id}</p>
                    </div>

                    {/* Patient Information */}
                    <div className="space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-slate-800 border-b pb-2">Patient Information</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                            {/* Name */}
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <User className="h-3 md:h-4 w-3 md:w-4" />
                                    <span className="text-xs md:text-sm font-medium">Patient Name</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-800 font-semibold pl-5 md:pl-6">{appointment.name}</p>
                            </div>

                            {/* Email */}
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Mail className="h-3 md:h-4 w-3 md:w-4" />
                                    <span className="text-xs md:text-sm font-medium">Email</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-800 font-medium pl-5 md:pl-6 break-all">{appointment.email}</p>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Phone className="h-3 md:h-4 w-3 md:w-4" />
                                    <span className="text-xs md:text-sm font-medium">Phone Number</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-800 font-medium pl-5 md:pl-6">{appointment.phone}</p>
                            </div>

                            {/* Date */}
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Calendar className="h-3 md:h-4 w-3 md:w-4" />
                                    <span className="text-xs md:text-sm font-medium">Appointment Date</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-800 font-medium pl-5 md:pl-6">{formatDate(appointment.appointment_date)}</p>
                            </div>

                            {/* Session */}
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock className="h-3 md:h-4 w-3 md:w-4" />
                                    <span className="text-xs md:text-sm font-medium">Session</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-800 font-medium pl-5 md:pl-6">
                                    {appointment.session || (() => {
                                        const hour = new Date(appointment.appointment_date).getHours()
                                        if (hour >= 7 && hour < 10) return 'Morning'
                                        if (hour >= 11 && hour < 15) return 'Afternoon'
                                        if (hour >= 15 && hour < 18) return 'Evening'
                                        return 'N/A'
                                    })()}
                                </p>
                            </div>

                            {/* Time */}
                            <div className="space-y-1 md:space-y-2">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clock className="h-3 md:h-4 w-3 md:w-4" />
                                    <span className="text-xs md:text-sm font-medium">Appointment Time</span>
                                </div>
                                <p className="text-sm md:text-base text-slate-800 font-medium pl-5 md:pl-6">
                                    {appointment.time_slot || formatTime(appointment.appointment_date)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1 md:space-y-2">
                        <div className="flex items-center gap-2 text-slate-500">
                            <FileText className="h-3 md:h-4 w-3 md:w-4" />
                            <span className="text-xs md:text-sm font-medium">Description</span>
                        </div>
                        <div className="pl-5 md:pl-6 p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-xs md:text-sm text-slate-700">{appointment.description || 'No description provided'}</p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs md:text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row gap-2 md:gap-3 border-t border-slate-200">
                    <Button
                        onClick={() => onOpenChange(false)}
                        variant="outline"
                        disabled={updating}
                        className="w-full sm:flex-1 rounded-xl h-10 md:h-11 border-slate-300 hover:bg-slate-100 transition-colors text-sm"
                    >
                        Close
                    </Button>

                    {canConfirm && (
                        <Button
                            onClick={() => updateStatus('confirmed')}
                            disabled={updating}
                            className="w-full sm:flex-1 rounded-xl h-10 md:h-11 bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            <PlayCircle className="h-4 w-4" />
                            {updating ? "Updating..." : "Confirm Appointment"}
                        </Button>
                    )}

                    {canComplete && (
                        <Button
                            onClick={() => updateStatus('completed')}
                            disabled={updating}
                            className="w-full sm:flex-1 rounded-xl h-10 md:h-11 bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            <CheckCircle className="h-4 w-4" />
                            {updating ? "Updating..." : "Mark Complete"}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
