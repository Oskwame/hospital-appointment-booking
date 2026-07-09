"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { ImageUploadsManager } from "@/components/image-uploads/image-uploads-manager"
import { RequireAuth } from "@/components/require-auth"

export default function ImageUploadsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <RequireAuth allowedRoles={["superadmin"]}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 overflow-auto">
                        <div className="p-6 max-w-7xl mx-auto space-y-6">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground">Image Uploads</h2>
                                <p className="text-muted-foreground mt-1">Manage homepage header images and other website media.</p>
                            </div>
                            <ImageUploadsManager />
                        </div>
                    </main>
                </div>
            </div>
        </RequireAuth>
    )
}
