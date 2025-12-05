"use client"

import { Card } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"

export function AnalyticsTab() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Analytics Dashboard</h3>
                </div>
                <p className="text-muted-foreground">
                    Advanced analytics with charts will be implemented here. This will include:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Appointment trends over time</li>
                    <li>Doctor performance metrics</li>
                    <li>Service utilization statistics</li>
                    <li>Peak booking hours analysis</li>
                </ul>
            </Card>
        </div>
    )
}
