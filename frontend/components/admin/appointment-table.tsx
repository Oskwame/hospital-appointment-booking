"use client"

import { MoreVertical } from "lucide-react"

export function AppointmentsTable() {
  const appointments = [
    {
      id: 1,
      patient: "John Smith",
      doctor: "Dr. Sarah Johnson",
      date: "Nov 25, 2025",
      time: "10:00 AM",
      status: "Confirmed",
      statusColor: "bg-secondary/10 text-secondary",
    },
    {
      id: 2,
      patient: "Emma Wilson",
      doctor: "Dr. Michael Brown",
      date: "Nov 25, 2025",
      time: "11:30 AM",
      status: "Pending",
      statusColor: "bg-accent/10 text-accent",
    },
    {
      id: 3,
      patient: "David Lee",
      doctor: "Dr. Emily Davis",
      date: "Nov 25, 2025",
      time: "2:00 PM",
      status: "Confirmed",
      statusColor: "bg-secondary/10 text-secondary",
    },
    {
      id: 4,
      patient: "Lisa Anderson",
      doctor: "Dr. James Martinez",
      date: "Nov 26, 2025",
      time: "9:00 AM",
      status: "Cancelled",
      statusColor: "bg-destructive/10 text-destructive",
    },
  ]

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Appointments</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Patient</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Doctor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date & Time</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm text-foreground font-medium">{apt.patient}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{apt.doctor}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {apt.date} at {apt.time}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${apt.statusColor}`}
                  >
                    {apt.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-border rounded transition-colors">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
