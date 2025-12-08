"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Calendar, CheckCircle, Users, BarChart3, Clock, UserPlus, TrendingDown } from 'lucide-react'

interface OverviewMetrics {
  totalAppointments: number
  completedAppointments: number
  uniquePatients: number
}

interface AppointmentByService {
  serviceName: string
  count: number
}

interface DoctorWorkload {
  doctorName: string
  appointmentCount: number
  specialization: string
}

interface CancellationData {
  total: number
  cancelled: number
  completed: number
  cancellationRate: number
}

interface PeakHour {
  hour: number
  hourLabel: string
  count: number
}

interface NewPatient {
  month: string
  newPatients: number
}

export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const [overview, setOverview] = useState<OverviewMetrics>({
    totalAppointments: 0,
    completedAppointments: 0,
    uniquePatients: 0
  })

  const [appointmentsByService, setAppointmentsByService] = useState<AppointmentByService[]>([])
  const [doctorWorkload, setDoctorWorkload] = useState<DoctorWorkload[]>([])
  const [cancellations, setCancellations] = useState<CancellationData>({
    total: 0,
    cancelled: 0,
    completed: 0,
    cancellationRate: 0
  })
  const [peakHours, setPeakHours] = useState<PeakHour[]>([])
  const [newPatients, setNewPatients] = useState<NewPatient[]>([])
  const [loading, setLoading] = useState(true)

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"

  useEffect(() => {
    fetchAllData()
  }, [dateRange])

  const fetchAllData = async () => {
    setLoading(true)
    const params = new URLSearchParams(dateRange)

    try {
      const [overviewRes, servicesRes, workloadRes, cancellationsRes, peakRes, patientsRes] = await Promise.all([
        fetch(`${base}/reports/overview?${params}`, { credentials: "include" }),
        fetch(`${base}/reports/appointments-by-service?${params}`, { credentials: "include" }),
        fetch(`${base}/reports/doctor-workload?${params}`, { credentials: "include" }),
        fetch(`${base}/reports/cancellations?${params}`, { credentials: "include" }),
        fetch(`${base}/reports/peak-hours?${params}`, { credentials: "include" }),
        fetch(`${base}/reports/new-patients`, { credentials: "include" })
      ])

      if (overviewRes.ok) setOverview(await overviewRes.json())
      if (servicesRes.ok) setAppointmentsByService(await servicesRes.json())
      if (workloadRes.ok) setDoctorWorkload(await workloadRes.json())
      if (cancellationsRes.ok) setCancellations(await cancellationsRes.json())
      if (peakRes.ok) setPeakHours(await peakRes.json())
      if (patientsRes.ok) setNewPatients(await patientsRes.json())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <Card className="p-4">
        <div className=" grid md:flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">From:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <label className="text-sm font-medium text-gray-700">To:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {overview.totalAppointments.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Appointments</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                {overview.completedAppointments.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Patients</p>
              <p className="text-3xl font-bold text-purple-700 mt-2">
                {overview.uniquePatients.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Service */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Appointments by Service</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsByService}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="serviceName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Doctor Workload */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Doctor Workload</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doctorWorkload.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointmentCount" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Peak Hours */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Peak Booking Hours</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hourLabel" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* New Patients */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">New Patients per Month</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={newPatients.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="newPatients" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Cancellations Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-semibold">Cancellation Overview</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{cancellations.total}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{cancellations.completed}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{cancellations.cancelled}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Cancellation Rate</p>
            <p className="text-2xl font-bold text-orange-700 mt-1">{cancellations.cancellationRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
