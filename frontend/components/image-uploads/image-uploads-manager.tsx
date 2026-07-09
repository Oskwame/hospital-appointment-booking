"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

export function ImageUploadsManager() {
  const { role } = useAuth()
  const r = String(role || 'admin').toLowerCase()
  const [headerImages, setHeaderImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const base = API_BASE_URL
    const fetchSettings = async () => {
      if (r !== 'superadmin') return
      try {
        const res = await fetch(`${base}/api/auth/hospital`, { headers: getAuthHeaders() })
        if (res.ok) {
          const hosp = await res.json()
          setHeaderImages(Array.isArray(hosp.headerImages) ? hosp.headerImages : [])
        }
      } catch { }
    }
    fetchSettings()
  }, [r])

  const saveHospital = async () => {
    setError(null)
    try {
      const base = API_BASE_URL
      await fetch(`${base}/api/auth/hospital`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          headerImages,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setError('Failed to save images')
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await res.json()
      if (data.imageUrl) {
        setHeaderImages((prev) => [...prev, data.imageUrl])
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setHeaderImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  if (r !== 'superadmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You do not have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="p-6 bg-white shadow-md rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Homepage Header Images</h3>
            <p className="text-sm text-gray-500 mt-1">Upload and manage header banner images for the website landing page.</p>
          </div>
        </div>

        {/* Upload Button & Area */}
        <div className="mt-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-150">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-gray-600">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP, GIF (MAX. 5MB)</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={uploading} 
              />
            </label>
          </div>
        </div>

        {/* Preview Grid */}
        {headerImages && headerImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {headerImages.map((url, idx) => (
              <div key={url + idx} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 h-28 bg-gray-50">
                <img src={url} alt={`Header ${idx + 1}`} className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition transform hover:scale-110 shadow-md"
                    title="Remove Image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-1 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-medium tracking-wide">
                  Banner {idx + 1}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl mt-6 border border-gray-100">
            No header images uploaded yet.
          </div>
        )}

        {headerImages.length > 0 && (
          <div className="mt-6">
            <Button 
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md transition" 
              onClick={saveHospital} 
              type="button"
            >
              Save Changes
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {saved && <p className="text-sm text-green-600 mt-2">Saved!</p>}
      </Card>
    </div>
  )
}
