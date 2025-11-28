"use client"

import { Clock, UserCheck, Baby } from "lucide-react"

export function MetricsCards() {
  const metrics = [
    {
      label: "Total Appointments",
      value: "1,234",
      icon: Calendar,
      color: "bg-blue-50 text-primary",
    },
    {
      label: "Pending Approvals",
      value: "23",
      icon: Clock,
      color: "bg-yellow-50 text-accent",
    },
    {
      label: "Doctors On Duty",
      value: "18",
      icon: UserCheck,
      color: "bg-green-50 text-secondary",
    },
    {
      label: "New Patients",
      value: "42",
      icon: Baby,
      color: "bg-purple-50 text-primary",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{metric.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${metric.color}`}>
              <metric.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

import { Calendar } from "lucide-react"
