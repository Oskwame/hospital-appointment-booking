"use client"

import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Stethoscope,
  X,
  ChevronRight,
  PenSquare,
  Globe,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

  const manageWebsiteItems = [
    { icon: PenSquare, label: "Blog", href: "/admin/blog" },
    { icon: Users, label: "Team Members", href: "/admin/team-members" },
  ]

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

          {/* Manage Website Dropdown */}
          {/* Manage Website Dropdown (Admin & Superadmin) */}
          {(r === 'admin' || r === 'superadmin') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all text-gray-700",
                    "hover:bg-blue-100 hover:text-blue-700 active:scale-[0.98]",
                    "focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm hover:shadow-md"
                  )}
                  title={desktopCollapsed && !mobileOpen ? "Manage Website" : undefined}
                >
                  <Globe className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  {(!desktopCollapsed || mobileOpen) && (
                    <span className="text-sm font-medium">Manage Website</span>
                  )}
                  {(!desktopCollapsed || mobileOpen) && (
                    <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="right" 
                align="start"
                className="w-48"
              >
                {manageWebsiteItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a
                      href={item.href}
                      className="flex items-center gap-2 w-full cursor-pointer"
                    >
                      <item.icon className="h-4 w-4 text-blue-600" />
                      <span>{item.label}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
                {r === 'superadmin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href="/admin/image-uploads"
                        className="flex items-center gap-2 w-full cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>Image Uploads</span>
                      </a>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
