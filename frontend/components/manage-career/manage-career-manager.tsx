"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit, Briefcase, MapPin, Clock, DollarSign, Users, Link2 } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"
import { useToast } from "@/lib/hooks/use-toast"

interface Career {
    id: number
    title: string
    department: string
    location: string
    type: string
    description: string
    requirements: string
    salary?: string
    status: string
    createdAt: string
}

export function ManageCareerManager() {
    const [careers, setCareers] = useState<Career[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCareer, setEditingCareer] = useState<Career | null>(null)
    const [previewCareer, setPreviewCareer] = useState<Career | null>(null)
    const { toast } = useToast()

    const emptyForm = {
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: "",
        salary: "",
        status: "active",
    }

    const [form, setForm] = useState(emptyForm)

    const fetchCareers = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE_URL}/api/careers`, { headers: getAuthHeaders() })
            if (!res.ok) throw new Error("Failed to fetch careers")
            const data = await res.json()
            setCareers(data)
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to load career listings", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCareers()
    }, [])

    const resetForm = () => {
        setForm(emptyForm)
        setShowForm(false)
        setEditingCareer(null)
    }

    const openCreate = () => {
        setForm(emptyForm)
        setEditingCareer(null)
        setShowForm(true)
    }

    const openEdit = (career: Career) => {
        setForm({
            title: career.title,
            department: career.department,
            location: career.location,
            type: career.type,
            description: career.description,
            requirements: career.requirements,
            salary: career.salary || "",
            status: career.status,
        })
        setEditingCareer(career)
        setShowForm(true)
    }

    const handleSave = async () => {
        try {
            const method = editingCareer ? "PUT" : "POST"
            const url = editingCareer
                ? `${API_BASE_URL}/api/careers/${editingCareer.id}`
                : `${API_BASE_URL}/api/careers`

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error("Failed to save career")

            toast({
                title: "Success",
                description: editingCareer ? "Career listing updated" : "Career listing created",
            })
            resetForm()
            fetchCareers()
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to save career listing", variant: "destructive" })
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this career listing?")) return
        try {
            const res = await fetch(`${API_BASE_URL}/api/careers/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            })
            if (!res.ok) throw new Error("Failed to delete career")

            toast({ title: "Success", description: "Career listing deleted" })
            setCareers(careers.filter((c) => c.id !== id))
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to delete career listing", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-foreground">All Career Listings</h3>
                <Button onClick={openCreate} className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 text-blue-700 hover:bg-blue-200">
                    <Plus className="h-5 w-5" />
                    Add Career
                </Button>
            </div>

            {loading ? (
                <Card className="p-12 text-center border-dashed">
                    <p className="text-muted-foreground">Loading career listings...</p>
                </Card>
            ) : careers.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <p className="text-muted-foreground">No career listings found.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {careers.map((career) => (
                        <Card
                            key={career.id}
                            className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            onClick={() => setPreviewCareer(career)}
                        >
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-blue-100 text-blue-700">
                                        {career.department}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${career.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {career.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg mb-3 line-clamp-2">{career.title}</h4>
                                <div className="space-y-1.5 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>{career.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{career.type}</span>
                                    </div>
                                    {career.salary && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            <span>{career.salary}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{career.description}</p>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                window.location.href = `/admin/manage-career/${career.id}`
                                            }}
                                        >
                                            <Users className="h-3.5 w-3.5" />
                                            View Applications
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 text-gray-600 border-gray-200 hover:bg-gray-50"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                const url = `${window.location.origin}/careers/apply/${career.id}`
                                                navigator.clipboard.writeText(url)
                                                toast({ title: "Copied!", description: "Application link copied to clipboard" })
                                            }}
                                        >
                                            <Link2 className="h-3.5 w-3.5" />
                                            Copy Link
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                openEdit(career)
                                            }}
                                        >
                                            <Edit className="h-4 w-4 text-gray-600" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(career.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* CREATE/EDIT DIALOG */}
            <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent className="!max-w-2xl !max-h-[90vh] !overflow-y-auto !bg-white !border-blue-200 !border-2 !rounded-2xl !shadow-lg !p-8">
                    <DialogHeader className="!mb-4">
                        <DialogTitle className="!text-xl !font-semibold !text-slate-800 !tracking-tight">
                            {editingCareer ? "Edit Career Listing" : "Create New Career Listing"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Job Title</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Registered Nurse"
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Department</Label>
                                <Input
                                    value={form.department}
                                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                                    placeholder="e.g. Emergency"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Location</Label>
                                <Input
                                    value={form.location}
                                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                                    placeholder="e.g. Accra, Ghana"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Job Type</Label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option>Full-time</option>
                                    <option>Part-time</option>
                                    <option>Contract</option>
                                    <option>Internship</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Salary (optional)</Label>
                                <Input
                                    value={form.salary}
                                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                                    placeholder="e.g. $50,000 - $70,000"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Describe the role and responsibilities..."
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Requirements</Label>
                            <Textarea
                                value={form.requirements}
                                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                                placeholder="List the qualifications and requirements..."
                                rows={4}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Status</Label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter className="!mt-6">
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                            {editingCareer ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PREVIEW DIALOG */}
            <Dialog open={!!previewCareer} onOpenChange={(open) => !open && setPreviewCareer(null)}>
                <DialogContent className="!max-w-2xl !max-h-[90vh] !overflow-y-auto !bg-white !border-blue-200 !border-2 !rounded-2xl !shadow-lg !p-8">
                    {previewCareer && (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {previewCareer.department}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${previewCareer.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                        {previewCareer.status}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{previewCareer.title}</h2>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{previewCareer.location}</div>
                                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{previewCareer.type}</div>
                                {previewCareer.salary && <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />{previewCareer.salary}</div>}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{previewCareer.description}</p>
                            </div>
                            {previewCareer.requirements && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{previewCareer.requirements}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
