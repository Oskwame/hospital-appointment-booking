"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { ManageCareerManager } from "@/components/manage-career/manage-career-manager"
import { RequireAuth } from "@/components/require-auth"

export default function ManageCareerPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 overflow-auto">
                        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Career</h2>
                                <p className="text-muted-foreground mt-1 text-sm sm:text-base">Create and manage job openings and career opportunities at the hospital.</p>
                            </div>
                            <ManageCareerManager />
                        </div>
                    </main>
                </div>
            </div>
        </RequireAuth>
    )
}
