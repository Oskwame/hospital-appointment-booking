"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

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

  // OTP State
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otp, setOtp] = useState("")
  const [sendingOtp, setSendingOtp] = useState(false)

  const [showPassword, setShowPassword] = useState(false);

  // Basic validation for the initial form
  const canProceed = Boolean(email && password && role && password.length >= 8)

  const requestOtp = async () => {
    if (!email) {
      setError("Enter an email to send OTP")
      return
    }
    setError(null)
    setSendingOtp(true)
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
      // OTP sent successfully, open the dialog
      setShowOtpDialog(true)
    } catch (e) {
      setError("Network error")
    } finally {
      setSendingOtp(false)
    }
  }

  const submit = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }
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

      // Reset and close everything
      onOpenChange(false)
      setShowOtpDialog(false)
      setEmail("")
      setPassword("")
      setRole("admin")
      setOtp("")
    } catch (e) {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
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

        <div className="space-y-6">
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
          {error && !showOtpDialog && (
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
              type="button"
              onClick={requestOtp}
              disabled={!canProceed || sendingOtp}
              className="flex-1 rounded-xl h-11 bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              {sendingOtp ? "Sending OTP..." : "Add User"}
            </Button>
          </div>
        </div>
      </Card>

      {/* OTP Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-0 p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white mb-2">Verify Identity</DialogTitle>
              <DialogDescription className="text-blue-100 text-base">
                We&apos;ve sent a 6-digit code to <br />
                <span className="font-semibold text-white">{email}</span>
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <label className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Enter Verification Code
              </label>
              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="
                    text-center text-3xl tracking-[0.5em] font-bold 
                    w-64 h-16 
                    border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                    rounded-xl text-slate-800 placeholder:text-slate-300
                    transition-all duration-200
                  "
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center border border-red-100">
                {error}
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowOtpDialog(false)}
                className="w-full sm:w-auto text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submit}
                disabled={otp.length !== 6 || saving}
                className="
                  w-full sm:w-auto 
                  bg-blue-400 hover:bg-blue-500
                  text-white font-medium shadow-lg shadow-blue-500/25
                  border-0 rounded-[8px] h-11
                "
              >
                {saving ? "Verifying..." : "Verify & Create User"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
export default AddUserForm
