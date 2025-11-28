"use client"

import { Clock, CheckCircle, AlertCircle, Calendar, User } from "lucide-react"

export function TodayAppointments() {
  const appointments = [
    {
      id: 1,
      patient: "John Smith",
      reason: "Regular Checkup",
      time: "10:00 AM",
      status: "Pending",
      statusIcon: AlertCircle,
      statusColor: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
      id: 2,
      patient: "Emma Wilson",
      reason: "Follow-up",
      time: "11:30 AM",
      status: "In Progress",
      statusIcon: Clock,
      statusColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: 3,
      patient: "David Lee",
      reason: "Consultation",
      time: "1:00 PM",
      status: "Completed",
      statusIcon: CheckCircle,
      statusColor: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: 4,
      patient: "Lisa Anderson",
      reason: "Lab Results Review",
      time: "3:00 PM",
      status: "Pending",
      statusIcon: AlertCircle,
      statusColor: "bg-amber-100 text-amber-700 border-amber-200",
    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Today's Appointments</h3>
        </div>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
          {appointments.length} Total
        </span>
      </div>

      <div className="space-y-3">
        {appointments.map((apt) => {
          const StatusIcon = apt.statusIcon
          return (
            <div
              key={apt.id}
              className="group p-4 rounded-xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-slate-50/50 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-base">{apt.patient}</p>
                    <p className="text-sm text-slate-600">{apt.reason}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-500 font-medium">{apt.time}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${apt.statusColor}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {apt.status}
                  </span>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:shadow-lg hover:scale-105 transition-all duration-200">
                    View
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
