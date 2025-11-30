"use client"

import { Menu, Search, Bell } from "lucide-react"
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
            <Menu className="h-5 w-5 text-slate-600" />
          </button>

          {/* SEARCH FIELD */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="
                absolute left-3 top-1/2 -translate-y-1/2 
                h-4 w-4 text-slate-400
              " />

              <input
                type="text"
                placeholder="Search patients, appointments..."
                className="
                  w-full pl-10 pr-4 py-2.5
                  bg-slate-100/60
                  rounded-xl
                  border border-slate-200
                  text-slate-700
                  placeholder-slate-400
                  focus:outline-none 
                  focus:ring-2 focus:ring-blue-400/50
                  focus:bg-white
                  transition
                "
              />
            </div>
          </div>
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