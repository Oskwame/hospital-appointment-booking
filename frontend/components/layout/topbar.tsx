"use client"

import { Search, Bell } from "lucide-react"
import UserProfile from "@/components/user-profile/UserProfile";

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header
      className="
        bg-white/90 backdrop-blur-md
        border-b border-slate-200
        shadow-sm
      "
    >
      <div className="px-6 py-4 flex items-center justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="
              p-2 rounded-lg lg:hidden
              hover:bg-slate-100 transition
            "
            aria-label="Toggle sidebar"
          >
          </button>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">

          {/* NOTIFICATIONS */}
          <button
            className="
              p-2 rounded-lg
              hover:bg-slate-100 transition
              relative
            "
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-slate-600" />

            <span
              className="
                absolute top-1 right-1
                h-2.5 w-2.5
                bg-red-500
                rounded-full
                ring-2 ring-white
              "
            />
          </button>

          {/* PROFILE */}
          <div className="relative">
            <UserProfile user={null} />
          </div>
        </div>
      </div>
    </header>
  );
}