"use client"

import { X, Mail, Shield, Calendar, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface User {
    id: number
    email: string
    role: string
    createdAt: string
}

interface ViewUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: User | null
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
    if (!open || !user) return null

    const getUserName = (email: string) => {
        return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-blue-300 to-blue-100 p-6 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{getUserName(user.email)}</h2>
                            <p className="text-blue-100 mt-1">User Details</p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <Badge className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                            Active
                        </Badge>
                    </div>

                    {/* User Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm font-medium">Email Address</span>
                            </div>
                            <p className="text-slate-800 font-medium pl-6">{user.email}</p>
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Shield className="h-4 w-4" />
                                <span className="text-sm font-medium">Role</span>
                            </div>
                            <div className="pl-6">
                                <Badge className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 capitalize">
                                    {user.role.toLowerCase()}
                                </Badge>
                            </div>
                        </div>

                        {/* Created At */}
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium">Account Created</span>
                            </div>
                            <p className="text-slate-800 font-medium pl-6">{formatDate(user.createdAt)}</p>
                        </div>

                        {/* User ID */}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 bg-blue-400 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </Card>
        </div>
    )
}
