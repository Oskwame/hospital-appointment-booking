"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import {
    Calendar, Clock, Stethoscope, Users,
    TrendingUp, TrendingDown, CalendarPlus,
    FileText, ClipboardList, UserCheck
} from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"
import { AppointmentsCalendar } from "./appointments-calender"
import { AdminAppointmentsTable } from "./admin-appointments-table"

interface Metrics {
    totalAppointments: number
    pendingAppointments: number
    confirmedAppointments: number
    totalDoctors: number
    todayAppointments: number
    appointmentsTrend: number
}

export function AdminDashboardOverview() {
    const [metrics, setMetrics] = useState<Metrics>({
        totalAppointments: 0,
        pendingAppointments: 0,
        confirmedAppointments: 0,
        totalDoctors: 0,
        todayAppointments: 0,
        appointmentsTrend: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMetrics()
    }, [])

    const fetchMetrics = async () => {
        try {
            const base = API_BASE_URL

            // Fetch appointments
            const appointmentsRes = await fetch(`${base}/api/appointments`, { headers: getAuthHeaders() })
            const appointments = await appointmentsRes.json()

            // Fetch doctors
            const doctorsRes = await fetch(`${base}/api/doctors`, { headers: getAuthHeaders() })
            const doctors = await doctorsRes.json()

            // Calculate metrics
            const pending = appointments.filter((a: any) => a.status === 'pending').length
            const confirmed = appointments.filter((a: any) => a.status === 'confirmed').length

            // Today's appointments
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const todayAppts = appointments.filter((a: any) => {
                const aptDate = new Date(a.appointment_date)
                return aptDate >= today && aptDate < tomorrow
            }).length

            setMetrics({
                totalAppointments: appointments.length,
                pendingAppointments: pending,
                confirmedAppointments: confirmed,
                totalDoctors: doctors.length,
                todayAppointments: todayAppts,
                appointmentsTrend: 8.5, // Mock trend data
            })
        } catch (error) {
            console.error("Failed to fetch metrics:", error)
        } finally {
            setLoading(false)
        }
    }

    const metricCards = [
        {
            title: "Today's Appointments",
            value: metrics.todayAppointments,
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
        },
        {
            title: "Pending Approvals",
            value: metrics.pendingAppointments,
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
        },
        {
            title: "Confirmed",
            value: metrics.confirmedAppointments,
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
        },
        {
            title: "Active Doctors",
            value: metrics.totalDoctors,
            icon: Stethoscope,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
        },
    ]

    const quickActions = [
        { label: "New Appointment", icon: CalendarPlus, href: "/appointments" },
        { label: "Manage Services", icon: ClipboardList, href: "/services" },
        { label: "View Reports", icon: FileText, href: "/reports" },
        { label: "Manage Doctors", icon: Users, href: "/doctors" },
    ]

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-24 bg-gray-200 rounded-lg" />
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {metricCards.map((card, index) => (
                    <Card
                        key={index}
                        className={`p-6 hover:shadow-lg transition-all duration-300 rounded-xl border-2 ${card.borderColor} hover:scale-[1.02]`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                                {index === 0 && metrics.appointmentsTrend !== undefined && (
                                    <div className="flex items-center mt-2 text-sm">
                                        {metrics.appointmentsTrend > 0 ? (
                                            <>
                                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-green-600">+{metrics.appointmentsTrend}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                                <span className="text-red-600">{metrics.appointmentsTrend}%</span>
                                            </>
                                        )}
                                        <span className="text-muted-foreground ml-1">vs last week</span>
                                    </div>
                                )}
                            </div>
                            <div className={`${card.bgColor} p-3 rounded-xl`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Calendar */}
            <AppointmentsCalendar />

            {/* Appointments Table and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <AdminAppointmentsTable />
                </div>

                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map((action, index) => (
                                <a
                                    key={index}
                                    href={action.href}
                                    className="flex items-center gap-3 p-3 bg-white border-2 border-emerald-100 rounded-lg hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <action.icon className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                </a>
                            ))}
                        </div>
                    </Card>

                    {/* Stats Summary */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Appointments Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Appointments</span>
                                <span className="text-sm font-bold text-gray-800">{metrics.totalAppointments}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min((metrics.confirmedAppointments / Math.max(metrics.totalAppointments, 1)) * 100, 100)}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Confirmed: {metrics.confirmedAppointments}</span>
                                <span>Pending: {metrics.pendingAppointments}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
