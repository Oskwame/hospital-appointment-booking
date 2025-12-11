"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Plus, Phone, Mail } from "lucide-react"
import { API_BASE_URL, getAuthHeaders } from "@/lib/api-config"

interface Doctor {
  id: number
  name: string
  specialization: string
  email: string
  phone: string
  service: string
  status: "available" | "busy" | "offline"
}

interface Service {
  id: number
  name: string
  description: string
}

export function DoctorsManager() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selected, setSelected] = useState<Doctor | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [edit, setEdit] = useState<Omit<Doctor, "id"> | null>(null)
  const [form, setForm] = useState<Omit<Doctor, "id">>({
    name: "",
    specialization: "",
    email: "",
    phone: "",
    service: "",
    status: "available",
  })

  useEffect(() => {
    const run = async () => {
      try {
        const base = API_BASE_URL
        const [doctorsRes, servicesRes] = await Promise.all([
          fetch(`${base}/doctors`, { headers: getAuthHeaders() }),
          fetch(`${base}/services`, { headers: getAuthHeaders() })
        ])
        const doctorsData = await doctorsRes.json()
        const servicesData = await servicesRes.json()

        setDoctors(
          (doctorsData as any[]).map((d) => ({
            id: d.id,
            name: d.name,
            specialization: d.specialization,
            email: d.email,
            phone: d.phone,
            service: d.service,
            status: (d.status || "available") as Doctor["status"],
          }))
        )
        setServices(
          (servicesData as any[]).map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
          }))
        )
      } catch (e) {
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const statusColors = {
    available: "bg-green-100 text-green-700 border border-green-200",
    busy: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    offline: "bg-gray-100 text-gray-700 border border-gray-200",
  }

  const initials = (n: string) =>
    n
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("")

  const submit = async () => {
    if (!form.name || !form.specialization || !form.email || !form.phone || !form.service) return
    try {
      const base = API_BASE_URL
      const res = await fetch(`${base}/doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(form),
      })
      const created = await res.json()
      setDoctors([
        ...doctors,
        {
          id: created.id,
          name: created.name,
          specialization: created.specialization,
          email: created.email,
          phone: created.phone,
          service: created.service,
          status: (created.status || "available") as Doctor["status"],
        },
      ])
      setShowForm(false)
      setForm({ name: "", specialization: "", email: "", phone: "", service: "", status: "available" })
    } catch (e) { }
  }

  return (
    <div className="space-y-7">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-foreground ">Doctors Directory</h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 shadow-md bg-blue-100 h-11 border-gray-400 rounded-xl">
            <Plus className="rounded-xl h-5 bg-blue-500 text-white" />
            Add Doctor
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6 space-y-6 shadow-sm border border-blue-100 bg-white/95 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-[7px] shadow-sm resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <Input
              placeholder="Specialization"
              value={form.specialization}
              onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              className="w-full px-4 py-4 border border-gray-300 rounded-[7px] shadow-sm resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-4 border border-gray-300 rounded-[7px] shadow-sm resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-4 border border-gray-300 rounded-[7px] shadow-sm resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-[7px] shadow-sm text-foreground transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Service</option>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </select>

            <select
              className="
      h-11 rounded-xl border-muted  shadow-sm px-3 
      text-foreground transition focus:ring-2 focus:ring-primary/40 focus:outline-none
    "
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Doctor['status'] })}
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="flex gap-5 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1 rounded-xl h-11 border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-sm transition-all duration-200"
            >
              Cancel
            </Button>

            <Button
              onClick={submit}
              className="flex-1 rounded-xl h-11 bg-blue-500 text-white hover:bg-blue-600 shadow-sm transition-all duration-200"
            >
              Save Doctor
            </Button>
          </div>


        </Card>
      )}

      {loading ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">Loading doctors…</p>
        </Card>
      ) : doctors.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-muted-foreground">No doctors added yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6 rounded-2xl shadow-sm hover:shadow-md transition bg-white border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{doctor.name}</h4>
                  <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[doctor.status]}`}>
                  {doctor.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {doctor.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {doctor.phone}
                </div>
                <p className="text-muted-foreground">Service: {doctor.service}</p>
              </div>

              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 bg-blue-500 text-white hover:bg-blue-500 hover:text-white  shadow-sm transition-all duration-200"
                onClick={() => {
                  setSelected(doctor)
                  setEdit({
                    name: doctor.name,
                    specialization: doctor.specialization,
                    email: doctor.email,
                    phone: doctor.phone,
                    service: doctor.service,
                    status: doctor.status,
                  })
                  setEditMode(false)
                  setProfileOpen(true)
                }}
              >
                View Profile
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* PROFILE DIALOG */}
      <Dialog
        open={profileOpen}
        onOpenChange={(open) => {
          setProfileOpen(open)
          if (!open) {
            setSelected(null)
            setEdit(null)
            setEditMode(false)
          }
        }}
      >
        <DialogContent className="rounded-[12px] max-w-md w-full p-6 bg-white shadow-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-gray-800">
                  Doctor Profile
                </DialogTitle>
              </DialogHeader>

              {!editMode ? (
                <div className="space-y-6 pt-2">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                      {initials(selected.name)}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Name", value: selected.name },
                      { label: "Specialization", value: selected.specialization },
                      { label: "Email", value: selected.email },
                      { label: "Phone", value: selected.phone },
                      { label: "Service", value: selected.service },
                      { label: "Status", value: selected.status },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <DialogFooter className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-sm transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      Close
                    </Button>
                    <Button
                      className="rounded-xl h-11 px-6 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-7 pt-2">
                  {edit && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                      <Input
                        placeholder="Full name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                        className=" border-gray-400 rounded-[6px]" />

                      <Input
                        placeholder="Specialization" value={edit.specialization} onChange={(e) => setEdit({ ...edit, specialization: e.target.value })}
                        className=" border-gray-400 rounded-[6px]" />

                      <Input
                        placeholder="Email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })}
                        className=" border-gray-400 rounded-[6px]" />

                      <Input placeholder="Phone" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                        className=" border-gray-400 rounded-[6px]" />

                      <select
                        value={edit.service}
                        onChange={(e) => setEdit({ ...edit, service: e.target.value })}
                        className="border border-gray-400 rounded-[6px] px-3 py-2 bg-white text-gray-700"
                      >
                        <option value="">Select Service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.name}>
                            {service.name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700"
                        value={edit.status}
                        onChange={(e) => setEdit({ ...edit, status: e.target.value as Doctor["status"] })}
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                  )}

                  <DialogFooter className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      className="rounded-xl h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-100 hover:shadow-sm transition"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>

                    <Button
                      disabled={saving}
                      className="rounded-xl h-11 px-6 bg-blue-600 text-white hover:bg-blue-700 shadow-md transition"
                      onClick={async () => {
                        if (!edit || !selected) return
                        try {
                          setSaving(true)
                          const base = API_BASE_URL
                          const res = await fetch(`${base}/doctors/${selected.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                            body: JSON.stringify(edit),
                          })
                          const updated = await res.json()
                          setDoctors(doctors.map((d) => d.id === selected.id ? { id: selected.id, ...edit } : d))
                          setSelected({ id: selected.id, ...edit })
                          setEditMode(false)
                        } finally {
                          setSaving(false)
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  )
}
