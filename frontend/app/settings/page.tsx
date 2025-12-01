"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { SystemSettings } from "@/components/settings/system-settings"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences" | "hospital">("profile")
  const { role } = useAuth()
  const r = String(role || 'admin').toLowerCase()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Settings</h2>
              <p className="text-muted-foreground mt-1">Manage your account and system preferences.</p>
            </div>

            <div className="flex gap-4 border-b border-border">
              {[
                { key: 'profile', label: 'Profile' },
                { key: 'preferences', label: 'Preferences' },
                ...(r === 'superadmin' ? [{ key: 'hospital', label: 'Hospital' } as const] : []),
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`px-4 py-2 font-medium transition-colors ${activeTab === t.key
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "profile" && <ProfileSettings />}
            {activeTab === "preferences" && <SystemSettings />}
            {activeTab === "hospital" && r === 'superadmin' && <SystemSettings />}
          </div>
        </main>
      </div>
    </div>
  )
}
