"use client"

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useState, useMemo, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

// Helper functions for date calculations
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  return day === 0 ? 6 : day - 1
}

const getMonthName = (month: number) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  return months[month]
}

const getDayName = (dayIndex: number) => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return days[dayIndex]
}

interface WeekData {
  dates: { day: string; date: number; month: number; year: number }[]
  startDate: number
  endDate: number
}

interface Appointment {
  id: number
  appointment_date: string
  status: string
}

export function AppointmentsCalendar() {
  // Stabilize 'today' so it doesn't trigger re-renders or invalid useMemo deps
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/appointments`, { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // Count appointments for a specific date
  const getAppointmentCount = useCallback((date: number, month: number, year: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date)
      return aptDate.getDate() === date &&
        aptDate.getMonth() === month &&
        aptDate.getFullYear() === year
    }).length
  }, [appointments])

  // Generate weeks for the current month
  const weeks = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth)

    const weeksArray: WeekData[] = []
    let currentDate = 1

    // First week (may start mid-week)
    const firstWeek: WeekData = { dates: [], startDate: 1, endDate: 1 }
    for (let i = 0; i < 7; i++) {
      if (i >= firstDayOfMonth && currentDate <= daysInMonth) {
        firstWeek.dates.push({
          day: getDayName(i),
          date: currentDate,
          month: currentMonth,
          year: currentYear
        })
        firstWeek.endDate = currentDate
        currentDate++
      }
    }
    if (firstWeek.dates.length > 0) {
      weeksArray.push(firstWeek)
    }

    // Remaining full weeks
    while (currentDate <= daysInMonth) {
      const week: WeekData = { dates: [], startDate: currentDate, endDate: currentDate }
      for (let i = 0; i < 7 && currentDate <= daysInMonth; i++) {
        week.dates.push({
          day: getDayName(i),
          date: currentDate,
          month: currentMonth,
          year: currentYear
        })
        week.endDate = currentDate
        currentDate++
      }
      weeksArray.push(week)
    }

    return weeksArray
  }, [currentMonth, currentYear])

  // Find which week contains today (for "Today" button)
  const todayWeekIndex = useMemo(() => {
    if (today.getMonth() !== currentMonth || today.getFullYear() !== currentYear) {
      return 0
    }
    return weeks.findIndex(week =>
      week.dates.some(d => d.date === today.getDate())
    )
  }, [weeks, currentMonth, currentYear, today])

  // Set initial week to current week on mount
  useMemo(() => {
    if (today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
      const weekIdx = weeks.findIndex(week =>
        week.dates.some(d => d.date === today.getDate())
      )
      if (weekIdx >= 0 && currentWeekIndex === 0) {
        setCurrentWeekIndex(weekIdx)
      }
    }
  }, [])

  const currentWeekData = weeks[currentWeekIndex] || weeks[0]

  const isToday = (date: number, month: number, year: number) => {
    return date === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
  }

  const getCountBadgeStyle = (count: number) => {
    if (count === 0) return "bg-gray-100 text-gray-500 border-gray-200"
    if (count >= 10) return "bg-red-100 text-red-700 border-red-200"
    if (count >= 6) return "bg-orange-100 text-orange-700 border-orange-200"
    return "bg-green-100 text-green-700 border-green-200"
  }

  const getWeekLabel = () => {
    if (!currentWeekData) return ""
    return `${getMonthName(currentMonth)} ${currentWeekData.startDate} - ${currentWeekData.endDate}, ${currentYear}`
  }

  const canGoPrev = currentWeekIndex > 0
  const canGoNext = currentWeekIndex < weeks.length - 1

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
    setCurrentWeekIndex(0)
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
    setCurrentWeekIndex(0)
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    // Will be set correctly after re-render
    setTimeout(() => {
      const weekIdx = weeks.findIndex(week =>
        week.dates.some(d => d.date === today.getDate() && d.month === today.getMonth() && d.year === today.getFullYear())
      )
      if (weekIdx >= 0) {
        setCurrentWeekIndex(weekIdx)
      }
    }, 0)
  }

  const goToPrevWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(prev => prev - 1)
    } else {
      // Go to previous month's last week
      goToPrevMonth()
      setTimeout(() => setCurrentWeekIndex(weeks.length - 1), 0)
    }
  }

  const goToNextWeek = () => {
    if (currentWeekIndex < weeks.length - 1) {
      setCurrentWeekIndex(prev => prev + 1)
    } else {
      // Go to next month's first week
      goToNextMonth()
    }
  }

  return (
    <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r  to-indigo-500 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg ">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-700">Weekly Calendar</h3>
              <p className="text-blue-500 text-sm">{getWeekLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevWeek}
              className="p-2 sm:p-2.5 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 sm:p-2.5 bg-blue-50/20  rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 sm:p-4 md:p-6 bg-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
          {currentWeekData?.dates.map((item, idx) => {
            const isTodayDate = isToday(item.date, item.month, item.year)
            const appointmentCount = getAppointmentCount(item.date, item.month, item.year)

            return (
              <div
                key={idx}
                className={`
                  group relative p-3 sm:p-4 rounded-xl border-2 
                  transition-all duration-300 cursor-pointer
                  hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1
                  ${isTodayDate
                    ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-200"
                    : "border-gray-100 hover:border-blue-300 bg-gray-50/50 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50"
                  }
                `}
              >
                {/* Today indicator */}
                {isTodayDate && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full ring-2 ring-white animate-pulse" />
                )}

                <p className={`text-xs font-semibold mb-2 uppercase tracking-wide ${isTodayDate ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                  } transition-colors`}>
                  {item.day}
                </p>

                <p className={`text-2xl sm:text-3xl font-bold mb-2 ${isTodayDate ? "text-blue-700" : "text-gray-800 group-hover:text-blue-700"
                  } transition-colors`}>
                  {item.date}
                </p>

                <div className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border
                  ${getCountBadgeStyle(appointmentCount)}
                  transition-all duration-200 group-hover:scale-105
                `}>
                  <span>{appointmentCount}</span>
                  <span className="hidden sm:inline">appts</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              <span className="text-gray-600">None (0)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
              <span className="text-gray-600">Low (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400"></span>
              <span className="text-gray-600">Medium (6-9)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="text-gray-600">High (10+)</span>
            </div>
            {loading && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-gray-600">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
