"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/api-config"

interface BlogFormProps {
  initialData?: {
    id?: number
    title: string
    author: string
    content: string
    excerpt: string
    date: string
    category: string
    status: string
    image: string
  }
  onSave: (data: any) => void
}

export function BlogForm({ initialData, onSave }: BlogFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      author: "",
      content: "",
      excerpt: "",
      date: new Date().toISOString().split("T")[0],
      category: "Health Tips",
      status: "draft",
      image: "/hospital-blog.jpg",
    },
  )

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image || "/hospital-blog.jpg")
  const [uploading, setUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) throw new Error('Failed to upload image')

    const data = await res.json()
    return data.imageUrl // Expecting backend to return relative path like /uploads/blog-images/filename.jpg
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setUploading(true)
      let finalImageUrl = formData.image

      if (imageFile) {
        // Upload new image if selected
        // But for now assuming we store the path and the frontend knows how to display it (as it does closely with existing implementation)
        const uploadedPath = await uploadImage(imageFile)

        // Check if the returned path is already an absolute URL (like from Cloudinary)
        if (uploadedPath.startsWith('http')) {
          finalImageUrl = uploadedPath
        } else {
          // It's a relative path (fallback for local storage or old implementation)
          const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '')
          finalImageUrl = `${baseUrl}${uploadedPath}`
        }
      }

      onSave({ ...formData, image: finalImageUrl })
    } catch (error) {
      console.error("Error submitting form:", error)
      // Ideally show toast error here, but component doesn't have toast hook yet.
      // Failing silently or relying on parent to handle error (but parent won't know about upload error details easily)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Blog post title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Author name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Health Tips">Health Tips</SelectItem>
              <SelectItem value="Vaccination">Latest News</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Input
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Brief summary of the post"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Blog Image</Label>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-md overflow-hidden">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={() => {
                  setPreviewUrl("")
                  setImageFile(null)
                  setFormData({ ...formData, image: "" })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center p-6">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          )}

          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden" // We'll trigger this with a label or custom button if not using the Input directly style
            onChange={handleImageChange}
            // If we want the input to cover the area we can position, but simple button is easier
            ref={(input) => {
              // Optional: trigger click programmatically if we want a custom button
            }}
          />
          <Label
            htmlFor="image-upload"
            className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 rounded-md inline-flex items-center text-sm font-medium transition-colors"
          >
            Select Image
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Full blog post content"
          rows={6}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Publish Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Save Post"}
        </Button>
      </div>
    </form>
  )
}
