"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { MoreVertical, Calendar } from "lucide-react"

import { API_BASE_URL } from "@/lib/api-config"

interface Appointment {
    id: number
    patientName: string
    patientEmail: string
    doctorName?: string
    date: string
    time: string
    status: string
    service?: string
}

export function SuperAdminAppointmentsTable() {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            const base = API_BASE_URL
            const res = await fetch(`${base}/appointments`, { credentials: "include" })

            if (!res.ok) {
                throw new Error("Failed to fetch appointments")
            }

            const data = await res.json()

            // Sort by appointment_date (descending) and get 10 most recent appointments
            const sorted = data
                .sort((a: any, b: any) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                .slice(0, 10) // Show only 10 most recent

            const mappedAppointments = sorted.map((apt: any) => {
                const appointmentDate = new Date(apt.appointment_date)
                return {
                    id: apt.id,
                    patientName: apt.name || "N/A",
                    patientEmail: apt.email || "",
                    doctorName: apt.doctor_name || "Unassigned",
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
                    service: apt.service_name || "General",
                }
            })

            setAppointments(mappedAppointments)
        } catch (err) {
            console.error("Error fetching appointments:", err)
            setError("Failed to load appointments")
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "bg-green-100 text-green-700"
            case "pending":
                return "bg-yellow-100 text-yellow-700"
            case "cancelled":
                return "bg-red-100 text-red-700"
            case "completed":
                return "bg-blue-100 text-blue-700"
            default:
                return "bg-gray-100 text-gray-700"
        }
    }

    if (loading) {
        return (
            <Card className="p-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded" />
                    ))}
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-2 text-red-600 mb-4">
                    <Calendar className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Recent Appointments</h3>
                </div>
                <p className="text-muted-foreground">{error}</p>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden shadow-sm rounded-xl">
            <div className="p-6 border-b border-slate-300 bg-gradient-to-r from-blue-50 to-indigo-50 ">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-800" />
                    <h3 className="text-lg font-semibold text-foreground">Recent Appointments</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Showing {appointments.length} most recent appointments
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50  border-b border-slate-400">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Patient</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Doctor</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Service</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date & Time</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                    No appointments found
                                </td>
                            </tr>
                        ) : (
                            appointments.map((apt) => (
                                <tr key={apt.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-foreground">{apt.patientName}</div>
                                        <div className="text-xs text-muted-foreground">{apt.patientEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{apt.doctorName}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{apt.service}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {apt.date} at {apt.time}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                apt.status
                                            )}`}
                                        >
                                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-border rounded transition-colors">
                                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
