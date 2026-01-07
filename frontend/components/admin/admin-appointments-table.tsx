"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, MoreVertical } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

interface Appointment {
    id: number
    patient: string
    doctor: string
    service: string
    date: string
    time: string
    status: string
}

export function AdminAppointmentsTable() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments`, { headers: getAuthHeaders() })
            if (!res.ok) throw new Error("Failed to fetch")

            const data = await res.json()

            // Get upcoming appointments (today and future), sorted by date
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const upcomingAppointments = data
                .filter((apt: any) => new Date(apt.appointment_date) >= today)
                .sort((a: any, b: any) =>
                    new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
                )
                .slice(0, 8) // Show only 8 upcoming
                .map((apt: any) => {
                    const appointmentDate = new Date(apt.appointment_date)
                    return {
                        id: apt.id,
                        patient: apt.name || "Unknown",
                        doctor: apt.doctor?.name || apt.doctor_name || "Unassigned",
                        service: apt.service_name || "General",
                        date: appointmentDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }),
                        time: appointmentDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                        }),
                        status: apt.status || "pending",
                    }
                })

            setAppointments(upcomingAppointments)
        } catch (error) {
            console.error("Failed to fetch appointments:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-green-100 text-green-700 border-green-200"
            case "pending":
                return "bg-yellow-100 text-yellow-700 border-yellow-200"
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200"
            case "completed":
                return "bg-blue-100 text-blue-700 border-blue-200"
            default:
                return "bg-gray-100 text-gray-700 border-gray-200"
        }
    }

    if (loading) {
        return (
            <Card className="p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded" />
                    ))}
                </div>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
                    <a
                        href="/appointments"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                    >
                        View All →
                    </a>
                </div>
            </div>

            {appointments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                    <p className="font-medium">No upcoming appointments</p>
                    <p className="text-sm">New appointments will appear here</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">{apt.patient}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{apt.doctor}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{apt.service}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm text-gray-900">{apt.date}</p>
                                        <p className="text-xs text-gray-500">{apt.time}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(apt.status)}`}>
                                            {apt.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    )
}
