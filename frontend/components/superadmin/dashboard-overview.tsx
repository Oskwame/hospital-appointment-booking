"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users, Calendar, Stethoscope, Activity,
    TrendingUp, TrendingDown, UserPlus, CalendarPlus,
    FileText, Settings
} from "lucide-react"
import { SuperAdminAppointmentsTable } from "@/components/superadmin/superadmin-appointments-table"

import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"
import { AppointmentsCalendar } from "../admin/appointments-calender"

interface Metrics {
    totalAppointments: number
    pendingAppointments: number
    totalDoctors: number
    totalServices: number
    appointmentsTrend: number
    doctorsTrend: number
}

export function DashboardOverview() {
    const [metrics, setMetrics] = useState<Metrics>({
        totalAppointments: 0,
        pendingAppointments: 0,
        totalDoctors: 0,
        totalServices: 0,
        appointmentsTrend: 0,
        doctorsTrend: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchMetrics()
    }, [])

    const fetchMetrics = async () => {
        try {
            const base = API_BASE_URL

            // Fetch appointments
            // Fetch appointments
            const appointmentsRes = await fetch(`${base}/appointments`, { headers: getAuthHeaders() })
            const appointments = await appointmentsRes.json()

            // Fetch doctors
            // Fetch doctors
            const doctorsRes = await fetch(`${base}/doctors`, { headers: getAuthHeaders() })
            const doctors = await doctorsRes.json()

            // Fetch services
            // Fetch services
            const servicesRes = await fetch(`${base}/services`, { headers: getAuthHeaders() })
            const services = await servicesRes.json()

            const pending = appointments.filter((a: any) => a.status === 'pending').length

            setMetrics({
                totalAppointments: appointments.length,
                pendingAppointments: pending,
                totalDoctors: doctors.length,
                totalServices: services.length,
                appointmentsTrend: 12.5, // Mock trend data
                doctorsTrend: 5.2,
            })
        } catch (error) {
            console.error("Failed to fetch metrics:", error)
        } finally {
            setLoading(false)
        }
    }

    const metricCards = [
        {
            title: "Total Appointments",
            value: metrics.totalAppointments,
            icon: Calendar,
            trend: metrics.appointmentsTrend,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Pending Appointments",
            value: metrics.pendingAppointments,
            icon: Activity,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        },
        {
            title: "Active Doctors",
            value: metrics.totalDoctors,
            icon: Stethoscope,
            trend: metrics.doctorsTrend,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Available Services",
            value: metrics.totalServices,
            icon: Users,
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
    ]

    const quickActions = [
        { label: "Add User", icon: UserPlus, href: "/users" },
        { label: "Manage Doctor", icon: Users, href: "/doctors" },
        { label: "Manage Service", icon: CalendarPlus, href: "/services" },
        { label: "View Reports", icon: FileText, href: "/reports" },
        { label: "Settings", icon: Settings, href: "/settings" },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
                {metricCards.map((card, index) => (
                    <Card key={index} className="p-6 hover:shadow-lg transition-shadow rounded-xl">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                                <h3 className="text-3xl font-bold mt-2">{card.value}</h3>
                                {card.trend !== undefined && (
                                    <div className="flex items-center mt-2 text-sm ">
                                        {card.trend > 0 ? (
                                            <>
                                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                                <span className="text-green-600">+{card.trend}%</span>
                                            </>
                                        ) : (
                                            <>
                                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                                                <span className="text-red-600">{card.trend}%</span>
                                            </>
                                        )}
                                        <span className="text-muted-foreground ml-1">vs last month</span>
                                    </div>
                                )}
                            </div>
                            <div className={`${card.bgColor} p-3 rounded-lg`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <AppointmentsCalendar />

            {/* Appointments Table and Quick Actions Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl">
                    <SuperAdminAppointmentsTable />
                </div>

                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
                        <div className="space-y-3">
                            {quickActions.map((action, index) => (
                                <a
                                    key={index}
                                    href={action.href}
                                    className="flex items-center gap-3 p-3 bg-white border-2 border-purple-100 rounded-lg hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <action.icon className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                </a>
                            ))}
                        </div>
                    </Card>

                    {/* System Health */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">System Health</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Backend Status</span>
                                <span className="text-sm font-medium text-green-600">● Online</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Database</span>
                                <span className="text-sm font-medium text-green-600">● Connected</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Email Service</span>
                                <span className="text-sm font-medium text-green-600">● Active</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
