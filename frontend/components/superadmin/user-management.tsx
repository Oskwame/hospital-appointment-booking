"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Trash2, Edit2, RotateCcw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AddUserForm } from "@/components/superadmin/adduser-form"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

interface ManagedUser {
  id: number
  name: string
  email: string
  role: "admin" | "doctor" | "superadmin"
  status: "Active" | "Deactivated"
}

export function UserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [open, setOpen] = useState(false)
  const [showDeactivated, setShowDeactivated] = useState(false)

  const reload = useCallback(async () => {
    try {
      const base = API_BASE_URL
      const endpoint = showDeactivated ? `${base}/auth/users/deactivated` : `${base}/auth/users`
      const res = await fetch(endpoint, { headers: getAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setUsers(
          (data as any[]).map((u) => ({
            id: u.id,
            name: String(u.email).split("@")[0],
            email: u.email,
            role: String(u.role || "admin").toLowerCase() as any,
            status: u.deletedAt ? "Deactivated" : "Active",
          }))
        )
      }
    } catch (e) { }
  }, [showDeactivated])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
  }, [reload])

  const handleDeactivateUser = async (userId: number) => {
    if (!confirm("Are you sure you want to deactivate this user? They will no longer be able to log in.")) return

    try {
      const base = API_BASE_URL
      const res = await fetch(`${base}/auth/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        reload()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to deactivate user")
      }
    } catch (err) {
      alert("Failed to deactivate user")
    }
  }

  const handleActivateUser = async (userId: number) => {
    try {
      const base = API_BASE_URL
      const res = await fetch(`${base}/auth/users/${userId}/restore`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      })

      if (res.ok) {
        reload()
      } else {
        const data = await res.json()
        alert(data.message || "Failed to activate user")
      }
    } catch (err) {
      alert("Failed to activate user")
    }
  }

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
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {showDeactivated ? "No deactivated users" : "No active users"}
          </p>
        ) : (
          users.map((user) => (
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
                <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
                  }`}>
                  {user.status}
                </Badge>
                <button className="p-1.5 hover:bg-border rounded transition-colors">
                  <Edit2 className="h-3 w-3 text-muted-foreground" />
                </button>
                {user.status === "Active" ? (
                  <button
                    onClick={() => handleDeactivateUser(user.id)}
                    className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                    title="Deactivate user"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateUser(user.id)}
                    className="p-1.5 hover:bg-green-100 hover:text-green-700 rounded transition-colors"
                    title="Reactivate user"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Toggle button positioned at bottom right */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => setShowDeactivated(!showDeactivated)}
          className={`px-4 py-2 text-sm rounded-md transition-colors shadow-sm ${showDeactivated
            ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          {showDeactivated ? "Show Active Users" : "Show Deactivated Users"}
        </button>
      </div>

      <AddUserForm
        open={open}
        onOpenChange={setOpen}
        onCreated={(created) => {
          reload()
        }}
      />
    </div>
  )
}
