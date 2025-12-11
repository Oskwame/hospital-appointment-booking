"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"

interface SidebarProps {
  open: boolean
  role?: "admin" | "superadmin" | "doctor"
  onToggle?: () => void
}

export function Sidebar({ open: defaultOpen, role: roleProp }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  // Get role from auth context, fallback to prop or "admin"
  const { role: authRole } = useAuth()
  const role = authRole || roleProp || "admin"

  const baseItems = [{ icon: LayoutDashboard, label: "Dashboard", href: "/" }]
  const adminItems = [
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: Users, label: "Doctors", href: "/doctors" },
    { icon: Stethoscope, label: "Services", href: "/services" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ]
  const doctorItems = [{ icon: Calendar, label: "Appointments", href: "/appointments" }]
  const superAdminItems = [{ icon: Users, label: "User Management", href: "/users" }]

  const r = String(role || "admin").toLowerCase()
  let items = baseItems
  if (r === "doctor") items = [...baseItems, ...doctorItems]
  else if (r === "admin") items = [...baseItems, ...adminItems]
  else if (r === "superadmin") items = [...baseItems, ...adminItems, ...superAdminItems]

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-5 left-[0.8rem] z-50 p-2 rounded-2xl bg-white shadow-md hover:bg-blue-50 transition"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-6 w-6 text-blue-600" /> : <ChevronRight className="h-5 w-5 text-blue-600" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r shadow-sm transition-all duration-300 flex-shrink-0 flex flex-col",
          "fixed md:relative top-0 left-0 h-full z-40",
          mobileOpen ? "w-64" : "w-0 md:w-auto",
          desktopCollapsed ? "md:w-20" : "md:w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Top Section: Collapse button + Logo */}
        <div className="p-2 border-b flex items-center justify-between bg-gradient-to-r from-blue-20 to-blue-100">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl flex items-center justify-center">
              <Image src="/kasahospital-logo.png" alt="Logo" width={120} height={120} />
            </div>
            {(!desktopCollapsed || mobileOpen) && (
              <span className="font-bold text-gray-700 text-sm tracking-wide">Kasa Family Hospital</span>
            )}
          </div>

          {/* Desktop collapse button */}
          <div className="hidden md:flex">
            <button
              onClick={() => setDesktopCollapsed(!desktopCollapsed)}
              className="p-1 rounded-2xl bg-blue-50 text-blue-600 shadow- hover:bg-blue-100 transition"
              title={desktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {desktopCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all text-gray-700",
                "hover:bg-blue-100 hover:text-blue-700 active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm hover:shadow-md"
              )}
              title={desktopCollapsed && !mobileOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
              {(!desktopCollapsed || mobileOpen) && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
