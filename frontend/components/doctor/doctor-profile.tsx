"use client"

import { Stethoscope, Clock, Users, Award, Mail, Phone } from "lucide-react"

export function DoctorProfile() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
      {/* Profile Section */}
      <div className="p-6 text-center border-b border-slate-100">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white ring-4 ring-blue-100">
              <Stethoscope className="h-12 w-12 text-white" />
            </div>
            <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800">Dr. Sarah Davis</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">Cardiology Specialist</p>

        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg">
            <Mail className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">s.davis@hospital.com</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
            <Phone className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-medium text-green-700">+1 234-567-890</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-xl bg-blue-50 border border-blue-100">
            <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-800">8h</p>
            <p className="text-xs text-slate-600">Shift</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-green-50 border border-green-100">
            <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-800">8</p>
            <p className="text-xs text-slate-600">Patients</p>
          </div>

          <div className="text-center p-3 rounded-xl bg-purple-50 border border-purple-100">
            <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-slate-800">12y</p>
            <p className="text-xs text-slate-600">Experience</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Today's Shift</span>
            <span className="text-sm font-semibold text-slate-800">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm text-slate-600">Department</span>
            <span className="text-sm font-semibold text-slate-800">Cardiology</span>
          </div>
        </div>

        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
          <Stethoscope className="h-4 w-4" />
          Edit Profile
        </button>
      </div>
    </div>
  )
}
