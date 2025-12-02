"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit, Eye } from "lucide-react"
import { AddUserForm } from "@/components/superadmin/adduser-form"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { ViewUserDialog } from "@/components/superadmin/view-user-dialog"
import { EditUserForm } from "@/components/superadmin/edit-user-form"

interface User {
  id: number
  email: string
  role: string
  createdAt: string
  deletedAt: string | null
}

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeactivated, setShowDeactivated] = useState(false)

  // Modal states
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch users from API
  useEffect(() => {
    fetchUsers()
  }, [showDeactivated])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const endpoint = showDeactivated ? `${base}/auth/users/deactivated` : `${base}/auth/users`
      const res = await fetch(endpoint, {
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

  const handleDelete = async () => {
    if (!deleteUser) return

    try {
      setDeleting(true)
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/auth/users/${deleteUser.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to deactivate user')
      }

      // Refresh the list
      await fetchUsers()
      setDeleteUser(null)
    } catch (err: any) {
      console.error('Error deactivating user:', err)
      setError(err.message || 'Failed to deactivate user')
    } finally {
      setDeleting(false)
    }
  }

  const handleReactivate = async (userId: number) => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      const res = await fetch(`${base}/auth/users/${userId}/restore`, {
        method: "PATCH",
        credentials: "include",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to reactivate user')
      }

      // Refresh the list
      await fetchUsers()
    } catch (err: any) {
      console.error('Error reactivating user:', err)
      setError(err.message || 'Failed to reactivate user')
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
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h2>
                <p className="text-muted-foreground mt-1">Manage all hospital staff and system users.</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 rounded-xl px-4 flex items-center hover:bg-blue-200 transition-colors"
              >
                <Plus className="rounded-xl h-5 bg-blue-500 text-white" />
                <span className="hidden sm:inline">Add User</span>
                <span className="sm:hidden">Add</span>
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
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Card className="p-6 bg-white rounded-xl shadow-md border border-slate-200">
                    <table className="w-full border-collapse text-sm min-w-[800px]">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4 text-left font-semibold text-slate-600 whitespace-nowrap w-[20%]">Full Name</th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-600 whitespace-nowrap w-[25%]">Email</th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-600 whitespace-nowrap w-[15%]">Role</th>
                          <th className="py-3 px-4 text-left font-semibold text-slate-600 whitespace-nowrap w-[15%]">Status</th>
                          <th className="py-3 px-4 text-right font-semibold text-slate-600 whitespace-nowrap w-[25%]">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">{getUserName(u.email)}</td>
                            <td className="py-4 px-4 text-slate-600">{u.email}</td>
                            <td className="py-4 px-4">
                              <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize whitespace-nowrap border-0 shadow-none">
                                {u.role.toLowerCase()}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border-0 shadow-none ${u.deletedAt
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                                }`}>
                                {u.deletedAt ? "Deactivated" : "Active"}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setViewUser(u)}
                                  title="View user details"
                                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {!u.deletedAt ? (
                                  <>
                                    <button
                                      onClick={() => setEditUser(u)}
                                      title="Edit user"
                                      className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => setDeleteUser(u)}
                                      title="Deactivate user"
                                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleReactivate(u.id)}
                                    title="Reactivate user"
                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
              </div>
            )}

            {/* Mobile Cards */}
            {!loading && !error && (
              <div className="md:hidden space-y-4 mt-4">
                {users.map((u) => (
                  <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-700">{getUserName(u.email)}</h4>
                        <p className="text-sm text-slate-500 mt-1">{u.email}</p>
                      </div>
                      <Badge className={`px-3 py-1 rounded-full text-xs font-medium ${u.deletedAt
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                        }`}>
                        {u.deletedAt ? "Deactivated" : "Active"}
                      </Badge>
                    </div>
                    <div className="mb-3">
                      <Badge className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {u.role.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setViewUser(u)}
                        className="flex-1 p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm">View</span>
                      </button>
                      {!u.deletedAt ? (
                        <>
                          <button
                            onClick={() => setEditUser(u)}
                            className="flex-1 p-2 rounded-md bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-sm">Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="flex-1 p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="text-sm">Deactivate</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivate(u.id)}
                          className="flex-1 p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-sm">Reactivate</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Toggle button at bottom right */}
            {!loading && !error && (
              <div className="flex justify-end mt-6">
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
            )}
          </div>

          {/* Modals */}
          <ConfirmationDialog
            open={deleteUser !== null}
            onOpenChange={(open) => !open && setDeleteUser(null)}
            title="Delete User"
            message={`Are you sure you want to delete ${deleteUser?.email}? This action cannot be undone.`}
            confirmText="Delete User"
            cancelText="Cancel"
            onConfirm={handleDelete}
            variant="danger"
            loading={deleting}
          />

          <ViewUserDialog
            open={viewUser !== null}
            onOpenChange={(open) => !open && setViewUser(null)}
            user={viewUser}
          />

          <EditUserForm
            open={editUser !== null}
            onOpenChange={(open) => !open && setEditUser(null)}
            user={editUser}
            onUpdated={() => {
              fetchUsers()
            }}
          />
        </main>
      </div>
    </div>
  )
}
