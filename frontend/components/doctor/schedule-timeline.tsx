"use client"

import { CalendarClock } from "lucide-react"

export function ScheduleTimeline() {
  const timeSlots = [
    { time: "9:00 AM", status: "Available", color: "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 text-green-700" },
    { time: "10:00 AM", status: "Booked", color: "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-700" },
    { time: "11:00 AM", status: "Booked", color: "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-700" },
    { time: "12:00 PM", status: "Break", color: "bg-gradient-to-br from-slate-100 to-gray-100 border-slate-300 text-slate-600" },
    { time: "1:00 PM", status: "Booked", color: "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-700" },
    { time: "2:00 PM", status: "Available", color: "bg-gradient-to-br from-green-100 to-emerald-100 border-green-300 text-green-700" },
    { time: "3:00 PM", status: "Booked", color: "bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 text-blue-700" },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <CalendarClock className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Day Schedule</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {timeSlots.map((slot, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl text-center border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${slot.color}`}
          >
            <p className="font-bold text-base">{slot.time}</p>
            <p className="text-xs font-semibold mt-1 opacity-80">{slot.status}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500"></div>
          <span className="text-xs font-medium text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div>
          <span className="text-xs font-medium text-slate-600">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-slate-400 to-gray-500"></div>
          <span className="text-xs font-medium text-slate-600">Break</span>
        </div>
      </div>
    </div>
  )
}
