"use client"

import { useEffect, useState } from "react"
import { Stethoscope, Clock, Users, Award, Mail, Phone } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

interface DoctorData {
  id: number
  name: string
  specialization: string
  email: string
  phone: string
  service: string
  status: string
}

export function DoctorProfile() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const base = API_BASE_URL
        const res = await fetch(`${base}/api/doctors/me`, {
          headers: getAuthHeaders(),
        })
        if (res.ok) {
          const data = await res.json()
          setDoctor(data)
        }
      } catch (e) {
        console.error("Failed to fetch doctor profile", e)
      } finally {
        setLoading(false)
      }
    }
    fetchDoctor()
  }, [])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
        <p className="text-center text-slate-500">Loading profile...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
        <p className="text-center text-slate-500">Profile not found</p>
      </div>
    )
  }

  const initials = doctor.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
      {/* Profile Section */}
      <div className="p-6 text-center border-b border-slate-100">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white ring-4 ring-blue-100">
              <span className="text-3xl font-bold text-white">{initials}</span>
            </div>
            <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white ${doctor.status === 'available' ? 'bg-green-500' : doctor.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800">{doctor.name}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">{doctor.specialization}</p>

        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
            <Mail className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">{doctor.email}</span>
          </div>
          {doctor.phone && doctor.phone !== 'Pending Phone' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
              <Phone className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-700">{doctor.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Service</span>
            <span className="text-sm font-semibold text-slate-800">{doctor.service}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Status</span>
            <span className={`text-sm font-semibold px-2 py-1 rounded ${doctor.status === 'available' ? 'bg-green-100 text-green-700' :
              doctor.status === 'busy' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
              {doctor.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
