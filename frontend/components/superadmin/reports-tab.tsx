"use client"

import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export function ReportsTab() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Reports & Insights</h3>
                </div>
                <p className="text-muted-foreground">
                    Comprehensive reporting features will include:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>Generate custom reports by date range</li>
                    <li>Export data to CSV/PDF</li>
                    <li>Advanced filtering options</li>
                    <li>Print-friendly report views</li>
                    <li>Scheduled report generation</li>
                </ul>
            </Card>
        </div>
    )
}
