"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import { API_BASE_URL } from "@/lib/api-config"

interface TeamMemberFormProps {
  initialData?: {
    id?: number
    name: string
    title: string
    imageSrc: string
    specialty?: string
    email?: string
    phone?: string
    category: string
    order?: number
  }
  onSave: (data: any) => void
}

export function TeamMemberForm({ initialData, onSave }: TeamMemberFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      name: "",
      title: "",
      imageSrc: "/staffProfile.jpg",
      specialty: "",
      email: "",
      phone: "",
      category: "leadership",
      order: 0,
    },
  )

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageSrc || "/staffProfile.jpg")
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
    return data.imageUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setUploading(true)
      let finalImageUrl = formData.imageSrc

      if (imageFile) {
        const uploadedPath = await uploadImage(imageFile)

        if (uploadedPath.startsWith('http')) {
          finalImageUrl = uploadedPath
        } else {
          const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '')
          finalImageUrl = `${baseUrl}${uploadedPath}`
        }
      }

      onSave({ ...formData, imageSrc: finalImageUrl })
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Chief Executive Officer"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="specialty">Specialty (Optional)</Label>
        <Input
          id="specialty"
          value={formData.specialty || ""}
          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
          placeholder="e.g. Healthcare Administration"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@hospital.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leadership">Leadership & Management</SelectItem>
              <SelectItem value="doctors">Doctors</SelectItem>
              <SelectItem value="staff">Support Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Profile Photo</Label>
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
                  setFormData({ ...formData, imageSrc: "" })
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
            id="team-member-image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <Label
            htmlFor="team-member-image-upload"
            className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 py-2 rounded-md inline-flex items-center text-sm font-medium transition-colors"
          >
            Select Image
          </Label>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Save Team Member"}
        </Button>
      </div>
    </form>
  )
}
