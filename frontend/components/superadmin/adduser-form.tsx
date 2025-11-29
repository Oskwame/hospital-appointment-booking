"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

type RoleOpt = "admin" | "doctor"

interface AddUserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (created: any) => void
}

export function AddUserForm({ open, onOpenChange, onCreated }: AddUserFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<RoleOpt>("admin")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("")

  const canSave = Boolean(email && password && role && otp && otp.length === 6)

  const requestOtp = async () => {
    if (!email) {
      setError("Enter an email to send OTP")
      return
    }
    setError(null)
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/auth/users/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        setError(String(msg?.message || "Failed to send OTP"))
        return
      }
      setOtpSent(true)
    } catch (e) {
      setError("Network error")
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave || saving) return
    setError(null)
    setSaving(true)
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/auth/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role: role.toUpperCase(), otp }),
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        setError(String(msg?.message || "Failed to create user"))
        return
      }
      const created = await res.json()
      onCreated?.(created)
      onOpenChange(false)
      setEmail("")
      setPassword("")
      setRole("admin")
      setOtp("")
      setOtpSent(false)
    } catch (e) {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <Card className="p-6 bg-white shadow-md rounded-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Add New User</h3>
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 hover:bg-gray-200 rounded-full transition"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Email / Password / Role */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            />
            <div className="mt-2 flex gap-2">
              <Button type="button" onClick={requestOtp} variant="outline" className="h-9">
                {otpSent ? "Resend OTP" : "Send OTP"}
              </Button>
              {otpSent && (
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="w-40"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 focus:outline-none rounded"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as RoleOpt)}>
              <SelectTrigger className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 justify-end mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
            className="flex-1 rounded-xl h-11 border-gray-300 hover:bg-gray-100 transition"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSave || saving}
            className="flex-1 rounded-xl h-11 bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {saving ? "Adding..." : "Add User"}
          </Button>
        </div>
      </form>
    </Card>
  )
}
export default AddUserForm
