"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Edit, ExternalLink } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"
import { BlogForm } from "@/components/add-blog/blog-forms"
import { useToast } from "@/lib/hooks/use-toast"

interface Blog {
    id: number
    title: string
    content: string
    category: string
    author: string
    status: string
    createdAt: string
    imageUrl?: string
    excerpt?: string
}

export function BlogManager() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
    const [previewBlog, setPreviewBlog] = useState<Blog | null>(null)
    const { toast } = useToast()

    const fetchBlogs = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE_URL}/api/posts`, { headers: getAuthHeaders() })
            if (!res.ok) throw new Error("Failed to fetch blogs")
            const data = await res.json()
            setBlogs(data)
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to load blogs", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBlogs()
    }, [])

    const handleCreate = async (data: any) => {
        try {
            // Map form 'image' field to backend 'image_url' expectation
            const payload = {
                ...data,
                image_url: data.image
            }

            const res = await fetch(`${API_BASE_URL}/api/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("Failed to create blog")

            toast({ title: "Success", description: "Blog post created successfully" })
            setShowForm(false)
            fetchBlogs()
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to create blog post", variant: "destructive" })
        }
    }

    const handleUpdate = async (data: any) => {
        if (!editingBlog) return
        try {
            // Map form 'image' field to backend 'image_url' expectation
            const payload = {
                ...data,
                image_url: data.image
            }

            const res = await fetch(`${API_BASE_URL}/api/posts/${editingBlog.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("Failed to update blog")

            toast({ title: "Success", description: "Blog post updated successfully" })
            setEditingBlog(null)
            fetchBlogs()
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to update blog post", variant: "destructive" })
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return
        try {
            const res = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            })
            if (!res.ok) throw new Error("Failed to delete blog")

            toast({ title: "Success", description: "Blog post deleted successfully" })
            setBlogs(blogs.filter(b => b.id !== id))
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-foreground">All Blog Posts</h3>
                <Button onClick={() => setShowForm(true)} className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 text-blue-700 hover:bg-blue-200">
                    <Plus className="h-5 w-5" />
                    Add Post
                </Button>
            </div>

            {loading ? (
                <Card className="p-12 text-center border-dashed">
                    <p className="text-muted-foreground">Loading blog posts...</p>
                </Card>
            ) : blogs.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                    <p className="text-muted-foreground">No blog posts found.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Card
                            key={blog.id}
                            className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            onClick={() => setPreviewBlog(blog)}
                        >
                            {blog.imageUrl && (
                                <div className="h-48 w-full bg-gray-200 overflow-hidden">
                                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">{blog.category}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {blog.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg mb-2 line-clamp-2">{blog.title}</h4>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{blog.excerpt || blog.content.substring(0, 100)}...</p>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                    <span className="text-xs text-gray-400">By {blog.author}</span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingBlog(blog)
                                        }}>
                                            <Edit className="h-4 w-4 text-gray-600" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(blog.id)
                                        }}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
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
                        <DialogTitle className="!text-xl !font-semibold !text-slate-800 !tracking-tight">Create New Blog Post</DialogTitle>
                    </DialogHeader>
                    <BlogForm onSave={handleCreate} />
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog open={!!editingBlog} onOpenChange={(open) => !open && setEditingBlog(null)}>
                <DialogContent className="!max-w-3xl !max-h-[90vh] !overflow-y-auto !bg-white !border-blue-200 !border-2 !rounded-2xl !shadow-lg !p-8">
                    <DialogHeader className="!mb-4">
                        <DialogTitle className="!text-xl !font-semibold !text-slate-800 !tracking-tight">Edit Blog Post</DialogTitle>
                    </DialogHeader>
                    {editingBlog && (
                        <BlogForm
                            initialData={{
                                ...editingBlog,
                                date: new Date().toISOString().split('T')[0], // Default to today logic or format createdAt
                                excerpt: editingBlog.excerpt || "",
                                image: editingBlog.imageUrl || ""
                            }}
                            onSave={handleUpdate}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* PREVIEW DIALOG */}
            <Dialog open={!!previewBlog} onOpenChange={(open) => !open && setPreviewBlog(null)}>
                <DialogContent className="!max-w-4xl !max-h-[90vh] !overflow-y-auto !bg-white !border-blue-200 !border-2 !rounded-2xl !shadow-lg !p-0">
                    {previewBlog && (
                        <div className="flex flex-col">
                            {previewBlog.imageUrl && (
                                <div className="w-full h-64 md:h-80 bg-gray-100">
                                    <img
                                        src={previewBlog.imageUrl}
                                        alt={previewBlog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {previewBlog.category}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(previewBlog.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                        {previewBlog.title}
                                    </h1>
                                    <div className="flex items-center gap-2 pb-6 border-b border-gray-100">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                            {previewBlog.author.charAt(0)}
                                        </div>
                                        <div className="text-sm">
                                            <p className="font-semibold text-gray-900">{previewBlog.author}</p>
                                            <p className="text-gray-500">Author</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                                    {previewBlog.content.split('\n').map((paragraph, idx) => (
                                        paragraph.trim() && <p key={idx} className="mb-4">{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
