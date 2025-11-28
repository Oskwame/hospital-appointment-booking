"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Eye } from "lucide-react"
import { AddUserForm } from "@/components/superadmin/adduser-form"

interface User {
  id: number
  email: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/auth/users`, {
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: number, userEmail: string) => {
    if (!confirm(`Delete user ${userEmail}?`)) {
      return
    }

    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/auth/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to delete user')
      }

      // Refresh the list
      fetchUsers()
    } catch (err: any) {
      console.error('Error deleting user:', err)
      alert(err.message || 'Failed to delete user')
    }
  }

  // Extract display name from email
  const getUserName = (email: string) => {
    return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const r = String(user?.role || '').toLowerCase()
  if (r !== "superadmin") {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
              <p className="text-muted-foreground mt-2">Only Super Admins can access user management.</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} role={r as any} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center space-y-2">
              <div>
                <h2 className="text-3xl font-bold text-foreground">User Management</h2>
                <p className="text-muted-foreground mt-1">Manage all hospital staff and system users.</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 rounded-xl px-4 m-3 flex items-center"
              >
                <Plus className="rounded-xl h-5 bg-blue-500 text-white" />
                Add User
              </button>
            </div>

            {/* Add User Form */}
            <AddUserForm
              open={showForm}
              onOpenChange={setShowForm}
              onCreated={() => {
                fetchUsers()
              }}
            />

            {/* Loading State */}
            {loading && (
              <Card className="p-12 bg-white rounded-xl shadow-md border border-slate-200">
                <div className="text-center text-slate-500">Loading users...</div>
              </Card>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="p-12 bg-white rounded-xl shadow-md border border-slate-200">
                <div className="text-center">
                  <p className="text-red-600 mb-2">{error}</p>
                  <button
                    onClick={fetchUsers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </Card>
            )}

            {/* Desktop Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <Card className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 text-left font-semibold text-slate-600">Name</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-600">Email</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-600">Role</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-600">Status</th>
                        <th className="py-3 px-4 text-left font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="hidden sm:table-row-group divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 text-slate-700">{getUserName(u.email)}</td>
                          <td className="py-4 px-4 text-slate-700">{u.email}</td>
                          <td className="py-4 px-4">
                            <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                              {u.role.toLowerCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Active
                            </Badge>
                          </td>
                          <td className="py-4 px-4 flex items-center gap-3">
                            <button className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(u.id, u.email)}
                              className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </div>
            )}

            {/* Mobile Cards */}
            {!loading && !error && (
              <div className="sm:hidden space-y-4 mt-4">
                {users.map((u) => (
                  <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">{getUserName(u.email)}</h4>
                      <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-600">Email:</span> {u.email}
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-600">Role:</span> {u.role.toLowerCase()}
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
