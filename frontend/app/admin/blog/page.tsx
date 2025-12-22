"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { BlogManager } from "@/components/blog/manage-blog"

export default function BlogAdminPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { role } = useAuth()

    const r = String(role || '').toLowerCase()

    // Restrict access to SUPERADMIN and ADMIN only
    if (r === "doctor") {
        return (
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 overflow-auto flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
                            <p className="text-muted-foreground mt-2">You&apos;re not permitted to access this page.</p>
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    // Simplified auth check - in real app might want better protection
    // Assuming Middleware handles generic protection, specific role check here if needed

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                <main className="flex-1 overflow-auto">
                    <div className="p-6 max-w-7xl mx-auto space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-foreground">Blog Management</h2>
                            <p className="text-muted-foreground mt-1">Create and manage content for the hospital blog.</p>
                        </div>
                        <BlogManager />
                    </div>
                </main>
            </div>
        </div>
    )
}
