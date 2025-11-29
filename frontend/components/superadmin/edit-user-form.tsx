"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

type RoleOpt = "admin" | "doctor"

interface User {
    id: number
    email: string
    role: string
    createdAt: string
}

interface EditUserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
    onUpdated?: (updated: any) => void
}

export function EditUserForm({ open, onOpenChange, user, onUpdated }: EditUserFormProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword]= useState(false);
    const [role, setRole] = useState<RoleOpt>("admin")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Populate form when user changes
    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setRole(user.role.toLowerCase() as RoleOpt)
        }
    }, [user])

    const canSave = Boolean(email && role)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!canSave || saving || !user) return
        setError(null)
        setSaving(true)
        try {
            const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
            const res = await fetch(`${base}/auth/users/${user.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, role: role.toUpperCase() }),
            })
            if (!res.ok) {
                const msg = await res.json().catch(() => ({}))
                setError(String(msg?.message || "Failed to update user"))
                return
            }
            const updated = await res.json()
            onUpdated?.(updated)
            onOpenChange(false)
        } catch (e) {
            setError("Network error")
        } finally {
            setSaving(false)
        }
    }

    if (!open || !user) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
                    <div>
                        <h3 className="text-2xl font-semibold text-slate-800">Edit User</h3>
                        <p className="text-sm text-slate-600 mt-1">Update user information</p>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="p-2 hover:bg-white/50 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-6">
                    {/* User ID (Read-only) */}


                    {/* Email / Role Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full rounded-lg border border-slate-300 focus:border-blue-300 focus:ring focus:ring-amber-200 transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Role</label>
                            <Select value={role} onValueChange={(v) => setRole(v as RoleOpt)}>
                                <SelectTrigger className="w-full rounded-lg border border-slate-300 focus:border-blue-300 focus:ring focus:ring-amber-200 transition">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

            <div>
                 <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-800 focus:outline-none rounded" >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            type="button"
                            className="flex-1 rounded-xl h-11 border-slate-300 hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSave || saving}
                            className="flex-1 rounded-xl h-11 bg-blue-400 text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Updating..." : "Update User"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
