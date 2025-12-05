"use client"

import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"

export function SettingsTab() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">System Settings</h3>
                </div>
                <p className="text-muted-foreground">
                    System configuration options will include:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Hospital information and branding</li>
                    <li>Email service configuration</li>
                    <li>System preferences</li>
                    <li>User role permissions</li>
                    <li>Notification settings</li>
                </ul>
            </Card>
        </div>
    )
}
