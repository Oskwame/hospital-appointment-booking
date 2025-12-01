"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddUserForm } from "@/components/superadmin/adduser-form"

interface ManagedUser {
  id: number
  name: string
  email: string
  role: "admin" | "doctor" | "superadmin"
  status: "Active" | "Inactive"
}

export function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah@kasa.com", role: "doctor", status: "Active" },
    { id: 2, name: "Admin John Doe", email: "admin@kasa.com", role: "admin", status: "Active" },
  ])
  const [open, setOpen] = useState(false)


  useEffect(() => {
    const run = async () => {
      try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
        const res = await fetch(`${base}/auth/users`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          setUsers(
            (data as any[]).map((u) => ({
              id: u.id,
              name: String(u.email).split("@")[0],
              email: u.email,
              role: String(u.role || "admin").toLowerCase() as any,
              status: "Active",
            }))
          )
        }
      } catch (e) { }
    }
    run()
  }, [])



  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">User Management</h3>
        <button
          className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                {user.role}
              </Badge>
              <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {user.status}
              </Badge>
              <button className="p-1.5 hover:bg-border rounded transition-colors">
                <Edit2 className="h-3 w-3 text-muted-foreground" />
              </button>
              <button className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddUserForm
        open={open}
        onOpenChange={setOpen}
        onCreated={(created) => {
          const name = String(created.email).split("@")[0]
          setUsers([
            { id: created.id, name, email: created.email, role: String(created.role).toLowerCase() as any, status: "Active" },
            ...users,
          ])
        }}
      />
    </div>
  )
}
