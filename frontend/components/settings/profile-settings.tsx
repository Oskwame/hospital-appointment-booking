"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

export function ProfileSettings() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "Dr. Sarah Johnson",
    email: user?.email || "",
    phone: "+1 234-567-8900",
    specialization: "Cardiology",
    department: "Cardiology",
  })
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
  <div className="space-y-6 max-w-2xl mx-auto">
    {/* Personal Info */}
    <Card className="p-6 bg-white shadow-md rounded-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Specialization</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 shadow-md transition"
        >
          Save Changes
        </Button>

        {saved && <p className="text-sm text-green-600 mt-2">Profile updated successfully!</p>}
      </form>
    </Card>

    {/* Change Password */}
    <Card className="p-6 bg-white shadow-md rounded-xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h3>
      <form className="space-y-5">
        {["Current Password", "New Password", "Confirm Password"].map((label) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            />
          </div>
        ))}

        <Button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 shadow-md transition"
        >
          Update Password
        </Button>
      </form>
    </Card>
  </div>
)
} 