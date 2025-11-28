"use client"

import { Card } from "@/components/ui/card"
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
} from "recharts"

const appointmentData = [
  { month: "Jan", appointments: 120, completed: 100, cancelled: 20 },
  { month: "Feb", appointments: 150, completed: 130, cancelled: 20 },
  { month: "Mar", appointments: 180, completed: 160, cancelled: 20 },
  { month: "Apr", appointments: 140, completed: 110, cancelled: 30 },
  { month: "May", appointments: 200, completed: 180, cancelled: 20 },
  { month: "Jun", appointments: 220, completed: 200, cancelled: 20 },
]

const departmentData = [
  { name: "Cardiology", patients: 250 },
  { name: "Neurology", patients: 180 },
  { name: "Orthopedics", patients: 220 },
  { name: "Pediatrics", patients: 290 },
  { name: "Dermatology", patients: 150 },
]

export function ReportsAnalytics() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Appointments", value: "1,210", change: "+12%" },
          { label: "Completed", value: "1,080", change: "+8%" },
          { label: "Patient Satisfaction", value: "94%", change: "+2%" },
          { label: "Doctor Utilization", value: "87%", change: "+5%" },
        ].map((metric, i) => (
          <Card key={i} className="p-4">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-bold text-foreground mt-2">{metric.value}</p>
            <p className="text-xs text-green-600 mt-1">{metric.change} from last month</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Appointment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="#3b82f6" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">Patients by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Export */}
      <Card className="p-6 bg-accent/30">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-foreground">Export Reports</h3>
            <p className="text-sm text-muted-foreground mt-1">Download detailed reports in PDF or CSV format</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition">
              PDF
            </button>
            <button className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition">
              CSV
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
