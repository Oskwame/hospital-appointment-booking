"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, Mail, Phone, Award } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"
import { TeamMemberForm } from "@/components/team-members/team-member-form"
import { useToast } from "@/lib/hooks/use-toast"

interface TeamMember {
  id: number
  name: string
  title: string
  imageSrc: string
  specialty?: string
  email?: string
  phone?: string
  category: string
  order: number
  createdAt: string
}

export function TeamMembersManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const { toast } = useToast()

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/team-members`)
      if (!res.ok) throw new Error("Failed to fetch team members")
      const data = await res.json()
      setTeamMembers(data)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to load team members", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const handleCreate = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/team-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create team member")

      toast({ title: "Success", description: "Team member created successfully" })
      setShowForm(false)
      fetchTeamMembers()
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to create team member", variant: "destructive" })
    }
  }

  const handleUpdate = async (data: any) => {
    if (!editingMember) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/team-members/${editingMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update team member")

      toast({ title: "Success", description: "Team member updated successfully" })
      setEditingMember(null)
      fetchTeamMembers()
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to update team member", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/team-members/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!res.ok) throw new Error("Failed to delete team member")

      toast({ title: "Success", description: "Team member deleted successfully" })
      setTeamMembers(teamMembers.filter((m) => m.id !== id))
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to delete team member", variant: "destructive" })
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category.toLowerCase()) {
      case "leadership":
        return "Leadership & Management"
      case "doctors":
        return "Doctors"
      case "staff":
        return "Support Staff"
      default:
        return category
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground">Manage Team Members</h3>
        <Button onClick={() => setShowForm(true)} className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 text-blue-700 hover:bg-blue-200">
          <Plus className="h-5 w-5" />
          Add Team Member
        </Button>
      </div>

      {loading ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">Loading team members...</p>
        </Card>
      ) : teamMembers.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">No team members found. Add your first one!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="h-48 w-full bg-gray-200 overflow-hidden">
                <img src={member.imageSrc} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    {getCategoryLabel(member.category)}
                  </span>
                  <span className="text-xs text-gray-400">Order: {member.order}</span>
                </div>
                <h4 className="font-bold text-lg mb-1">{member.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{member.title}</p>

                {member.specialty && (
                  <div className="flex items-start gap-2 mb-3">
                    <Award className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">{member.specialty}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-blue-600" />
                      <p className="text-xs text-gray-600">{member.email}</p>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-blue-600" />
                      <p className="text-xs text-gray-600">{member.phone}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                  <Button size="sm" variant="ghost" onClick={() => setEditingMember(member)}>
                    <Edit className="h-4 w-4 text-gray-600 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(member.id)}>
                    <Trash2 className="h-4 w-4 text-red-500 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="!max-w-3xl !max-h-[90vh] !overflow-y-auto !bg-white !border-blue-200 !border-2 !rounded-2xl !shadow-lg !p-8">
          <DialogHeader className="!mb-4">
            <DialogTitle className="!text-xl !font-semibold !text-slate-800 !tracking-tight">Add New Team Member</DialogTitle>
          </DialogHeader>
          <TeamMemberForm onSave={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="!max-w-3xl !max-h-[90vh] !overflow-y-auto !bg-white !border-blue-200 !border-2 !rounded-2xl !shadow-lg !p-8">
          <DialogHeader className="!mb-4">
            <DialogTitle className="!text-xl !font-semibold !text-slate-800 !tracking-tight">Edit Team Member</DialogTitle>
          </DialogHeader>
          {editingMember && <TeamMemberForm initialData={editingMember} onSave={handleUpdate} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
