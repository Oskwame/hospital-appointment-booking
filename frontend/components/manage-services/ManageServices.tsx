"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
}

export function ServicesManager() {
  const [services, setServices] = useState<Service[]>([])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Hospital Services</h3>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">No services added yet. Services will be added here soon.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="p-6 border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-foreground">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
