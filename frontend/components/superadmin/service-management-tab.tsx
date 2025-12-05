"use client"

import { Card } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

export function ServiceManagementTab() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Service Management</h3>
                </div>
                <p className="text-muted-foreground">
                    Service management features will include:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Create and edit services</li>
                    <li>Manage service availability dates</li>
                    <li>Set blackout dates and holidays</li>
                    <li>Configure session times</li>
                    <li>Assign icons and descriptions</li>
                </ul>
            </Card>
        </div>
    )
}
