"use client"

import { X, AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ConfirmationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    variant?: "danger" | "warning" | "info"
    loading?: boolean
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    variant = "danger",
    loading = false,
}: ConfirmationDialogProps) {
    if (!open) return null

    const variantStyles = {
        danger: {
            icon: "text-red-500",
            iconBg: "bg-red-100",
            button: "bg-red-600 hover:bg-red-700 text-white",
        },
        warning: {
            icon: "text-amber-500",
            iconBg: "bg-amber-100",
            button: "bg-amber-600 hover:bg-amber-700 text-white",
        },
        info: {
            icon: "text-blue-500",
            iconBg: "bg-blue-100",
            button: "bg-blue-600 hover:bg-blue-700 text-white",
        },
    }

    const styles = variantStyles[variant]

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${styles.iconBg}`}>
                            <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                            <p className="text-sm text-slate-500 mt-1">{message}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="p-1 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 bg-slate-50">
                    <Button
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        variant="outline"
                        className="flex-1 rounded-xl h-11 border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm()
                            onOpenChange(false)
                        }}
                        disabled={loading}
                        className={`flex-1 rounded-xl h-11 transition-colors ${styles.button}`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
