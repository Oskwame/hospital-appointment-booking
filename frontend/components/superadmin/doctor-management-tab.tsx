"use client"

import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

export function DoctorManagementTab() {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">Doctor Management</h3>
                </div>
                <p className="text-muted-foreground">
                    Complete doctor management interface will include:
                </p>
                <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                    <li>View all doctors in grid/list view</li>
                    <li>Add new doctors</li>
                    <li>Edit doctor information</li>
                    <li>Manage availability schedules</li>
                    <li>Assign services to doctors</li>
                </ul>
            </Card>
        </div>
    )
}
