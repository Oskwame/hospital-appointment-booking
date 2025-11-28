"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
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
        <Button type="submit">Save Post</Button>
      </div>
    </form>
  )
}
