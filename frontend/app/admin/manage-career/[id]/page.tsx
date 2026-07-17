"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/topbar"
import { RequireAuth } from "@/components/require-auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"
import { useToast } from "@/lib/hooks/use-toast"
import {
    ArrowLeft,
    MapPin,
    Clock,
    DollarSign,
    Mail,
    Phone,
    FileText,
    Download,
    GraduationCap,
    Briefcase,
    Award,
    User,
} from "lucide-react"

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

interface Application {
    id: number
    careerId: number
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    education?: string
    experience?: string
    licenses?: string
    cvFileName?: string
    coverLetterFileName?: string
    certificatesFileName?: string
    status: string
    createdAt: string
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    reviewed: "bg-blue-100 text-blue-700",
    shortlisted: "bg-purple-100 text-purple-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
}

const statusOptions = ["pending", "reviewed", "shortlisted", "accepted", "rejected"]

export default function CareerApplicationsPage() {
    const params = useParams()
    const router = useRouter()
    const careerId = params.id

    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [career, setCareer] = useState<Career | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<number | null>(null)
    const { toast } = useToast()

    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE_URL}/api/careers/${careerId}/applications`, {
                headers: getAuthHeaders(),
            })
            if (!res.ok) throw new Error("Failed to fetch")
            const data = await res.json()
            setCareer(data.career)
            setApplications(data.applications)
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to load applications", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (careerId) fetchData()
    }, [careerId])

    const handleStatusChange = async (applicationId: number, newStatus: string) => {
        try {
            setUpdatingId(applicationId)
            const res = await fetch(`${API_BASE_URL}/api/careers/applications/${applicationId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify({ status: newStatus }),
            })
            if (!res.ok) throw new Error("Failed to update")

            setApplications((prev) =>
                prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
            )
            toast({ title: "Success", description: `Application ${newStatus}` })
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        } finally {
            setUpdatingId(null)
        }
    }

    const isCloudinaryUrl = (url: string) => {
        return url.startsWith("http://") || url.startsWith("https://")
    }

    const getDocumentUrl = (fileName: string) => {
        if (!fileName) return null
        if (fileName.startsWith("http")) return fileName
        return null
    }

    return (
        <RequireAuth allowedRoles={["admin", "superadmin"]}>
            <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
                    <main className="flex-1 overflow-auto">
                        <div className="p-6 max-w-7xl mx-auto space-y-6">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push("/admin/manage-career")}
                                    className="gap-1.5"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                            </div>

                            {loading ? (
                                <Card className="p-12 text-center border-dashed">
                                    <p className="text-muted-foreground">Loading applications...</p>
                                </Card>
                            ) : !career ? (
                                <Card className="p-12 text-center border-dashed">
                                    <p className="text-muted-foreground">Career listing not found.</p>
                                </Card>
                            ) : (
                                <>
                                    {/* Career Summary */}
                                    <Card className="p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                        {career.department}
                                                    </span>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full ${career.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                        {career.status}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {applications.length} application{applications.length !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl font-bold text-gray-900">{career.title}</h2>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{career.location}</div>
                                                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{career.type}</div>
                                                {career.salary && <div className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" />{career.salary}</div>}
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Applications List */}
                                    {applications.length === 0 ? (
                                        <Card className="p-12 text-center border-dashed">
                                            <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-muted-foreground">No applications received yet.</p>
                                        </Card>
                                    ) : (
                                        <div className="space-y-4">
                                            {applications.map((app) => (
                                                <Card key={app.id} className="p-6 hover:shadow-md transition-shadow">
                                                    {/* Applicant Header */}
                                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                                {app.firstName.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-lg text-gray-900">
                                                                    {app.firstName} {app.lastName}
                                                                </h3>
                                                                <p className="text-sm text-gray-500">
                                                                    Applied {new Date(app.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[app.status] || "bg-gray-100 text-gray-600"}`}>
                                                                {app.status}
                                                            </span>
                                                            <select
                                                                value={app.status}
                                                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                                disabled={updatingId === app.id}
                                                                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                                                            >
                                                                {statusOptions.map((s) => (
                                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Contact Info */}
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                                        <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{app.email}</div>
                                                        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{app.phone}</div>
                                                        {app.address && <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{app.address}</div>}
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        {app.education && (
                                                            <div className="bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                                                                    <GraduationCap className="h-3.5 w-3.5" />
                                                                    Education
                                                                </div>
                                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.education}</p>
                                                            </div>
                                                        )}
                                                        {app.experience && (
                                                            <div className="bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                                                                    <Briefcase className="h-3.5 w-3.5" />
                                                                    Experience
                                                                </div>
                                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.experience}</p>
                                                            </div>
                                                        )}
                                                        {app.licenses && (
                                                            <div className="bg-gray-50 rounded-lg p-3">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1">
                                                                    <Award className="h-3.5 w-3.5" />
                                                                    Licenses
                                                                </div>
                                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.licenses}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Uploaded Documents */}
                                                    <div className="border-t pt-4">
                                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Uploaded Documents</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {app.cvFileName && (
                                                                isCloudinaryUrl(app.cvFileName) ? (
                                                                    <a
                                                                        href={app.cvFileName}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                                                    >
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                        CV / Resume
                                                                        <Download className="h-3 w-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-500 rounded-lg" title="File uploaded before Cloudinary migration">
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                        CV / Resume ({app.cvFileName})
                                                                    </span>
                                                                )
                                                            )}
                                                            {app.coverLetterFileName && (
                                                                isCloudinaryUrl(app.coverLetterFileName) ? (
                                                                    <a
                                                                        href={app.coverLetterFileName}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                                                    >
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                        Cover Letter
                                                                        <Download className="h-3 w-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-500 rounded-lg" title="File uploaded before Cloudinary migration">
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                        Cover Letter ({app.coverLetterFileName})
                                                                    </span>
                                                                )
                                                            )}
                                                            {app.certificatesFileName && (
                                                                isCloudinaryUrl(app.certificatesFileName) ? (
                                                                    <a
                                                                        href={app.certificatesFileName}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                                                                    >
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                        Certificates
                                                                        <Download className="h-3 w-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 text-gray-500 rounded-lg" title="File uploaded before Cloudinary migration">
                                                                        <FileText className="h-3.5 w-3.5" />
                                                                        Certificates ({app.certificatesFileName})
                                                                    </span>
                                                                )
                                                            )}
                                                            {!app.cvFileName && !app.coverLetterFileName && !app.certificatesFileName && (
                                                                <p className="text-sm text-gray-400">No documents uploaded</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </RequireAuth>
    )
}
