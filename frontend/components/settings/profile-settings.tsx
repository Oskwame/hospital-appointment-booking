"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

export function ProfileSettings() {
  const { user, role } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    phone: "",
    specialization: "",
    department: "",
  })
  const [initialEmail, setInitialEmail] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/doctors/me`, { headers: getAuthHeaders() })
        if (res.ok) {
          const me = await res.json()
          setFormData((d) => ({
            ...d,
            name: String(me.name || d.name || ""),
            phone: String(me.phone || d.phone || ""),
            specialization: String(me.specialization || d.specialization || ""),
            department: String(me.department || d.department || ""),
          }))
        }
        // Set initial email from user context or fetched data if needed, 
        // but user context is reliable for auth email
        setInitialEmail(user?.email || "")
        setFormData(prev => ({ ...prev, email: user?.email || "" }))
      } catch { }
    }
    run()
  }, [user?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if email changed
    if (formData.email !== initialEmail) {
      // Request OTP
      try {
        setOtpLoading(true)
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/auth/request-email-change-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ newEmail: formData.email }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.message || "Failed to send OTP")
        }

        setShowOtpModal(true)
        setOtpLoading(false)
        return // Stop here, wait for OTP
      } catch (err: any) {
        setError(err.message)
        setOtpLoading(false)
        return
      }
    }

    // If email not changed, proceed with normal update
    await saveProfile(null)
  }

  const saveProfile = async (otpCode: string | null) => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"

      // update email (and verify OTP if provided)
      const res = await fetch(`${base}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ email: formData.email, otp: otpCode }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Failed to update profile")
      }

      // doctor profile details
      if (String(role || "").toLowerCase() === "doctor") {
        await fetch(`${base}/doctors/me`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            name: formData.name,
            specialization: formData.specialization,
            phone: formData.phone,
            department: formData.department,
          }),
        })
      }

      setSaved(true)
      setShowOtpModal(false)
      setOtp("")
      setInitialEmail(formData.email) // Update initial email
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message || "Failed to update profile")
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Personal Info */}
      <Card className="p-6 bg-white shadow-md rounded-xl relative">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          {String(role || "").toLowerCase() === "doctor" && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition"
            />
          </div>

          {String(role || "").toLowerCase() === "doctor" && (
            <>
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
            </>
          )}

          <Button
            type="submit"
            disabled={otpLoading}
            className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 shadow-md transition disabled:opacity-50"
          >
            {otpLoading ? "Sending OTP..." : "Save Changes"}
          </Button>

          {saved && <p className="text-sm text-green-600 mt-2">Profile updated successfully!</p>}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>

        {/* OTP Modal Overlay */}
        {showOtpModal && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
            <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4">
              <h4 className="text-lg font-bold text-gray-800 mb-2">Verify Email Change</h4>
              <p className="text-sm text-gray-600 mb-4">
                We sent a 6-digit code to <strong>{formData.email}</strong>. Please enter it below to confirm.
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 outline-none transition mb-4 text-center text-lg tracking-widest"
                maxLength={6}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowOtpModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => saveProfile(otp)}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                  disabled={otp.length < 6}
                >
                  Verify & Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
      <Card className="p-6 bg-white shadow-md rounded-xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h3>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault()
            const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
            const inputs = Array.from((e.currentTarget as HTMLFormElement).querySelectorAll('input[type="password"]')) as HTMLInputElement[]
            const currentPassword = inputs[0]?.value || ""
            const newPassword = inputs[1]?.value || ""
            try {
              await fetch(`${base}/auth/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ currentPassword, newPassword }),
              })
              setSaved(true)
              setTimeout(() => setSaved(false), 2000)
            } catch (e) {
              setError("Failed to update password")
            }
          }}
        >
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
