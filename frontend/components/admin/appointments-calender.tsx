"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function AppointmentsCalendar() {
  const [currentWeek, setCurrentWeek] = useState(0)

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const dates = Array.from({ length: 7 }, (_, i) => ({
    day: days[i],
    date: 15 + i,
    count: ((i * 3) % 12) + 3,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Calendar</h3>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/5 transition-colors cursor-pointer text-center"
          >
            <p className="text-xs font-medium text-muted-foreground mb-2">{item.day}</p>
            <p className="text-xl font-bold text-foreground mb-2">{item.date}</p>
            <p className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded font-medium">
              {item.count} appointments
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
