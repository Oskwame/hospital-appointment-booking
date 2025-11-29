"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Settings, Phone } from "lucide-react";

interface UserProfileProps {
  user: {
    username?: string;
    email?: string;
  } | null;
}

const UserProfile = ({ user: initialUser }: UserProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api";

      // First check role via auth/me if we don't know it
      const authRes = await fetch(`${base}/auth/me`, { credentials: "include" });
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.role === 'DOCTOR') {
          // Fetch doctor details
          const docRes = await fetch(`${base}/doctors/me`, { credentials: "include" });
          if (docRes.ok) {
            const docData = await docRes.json();
            setDoctorData(docData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && !doctorData) {
      fetchDoctorProfile();
    }
  };

  const handleLogout = async () => {
    try {
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000") + "/api"
      await fetch(`${base}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");
  };

  return (
    <div className="relative">
      {/* Profile Icon */}
      <button
        type="button"
        aria-label="Open profile menu"
        onClick={handleToggle}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors overflow-hidden border border-gray-300"
      >
        {doctorData ? (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(doctorData.name)}
          </div>
        ) : (
          <UserIcon className="text-gray-600" size={18} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">

          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading profile...</div>
          ) : doctorData ? (
            <>
              {/* Doctor Header */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                    {getInitials(doctorData.name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{doctorData.name}</p>
                    <p className="text-xs text-blue-600 font-medium">{doctorData.specialization}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${doctorData.status === 'available' ? 'bg-green-100 text-green-700' :
                      doctorData.status === 'busy' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {doctorData.status}
                  </span>
                  <span className="text-xs text-slate-500">• {doctorData.service}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 space-y-3 bg-white">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="p-1.5 bg-slate-100 rounded-md">
                    <UserIcon size={14} />
                  </div>
                  <span className="truncate">{doctorData.email}</span>
                </div>
                {doctorData.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="p-1.5 bg-slate-100 rounded-md">
                      <Phone size={14} />
                    </div>
                    <span>{doctorData.phone}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 text-gray-800 text-sm border-b border-gray-100">
              <p className="font-semibold">
                {initialUser?.username || initialUser?.email || "User"}
              </p>
            </div>
          )}

          <div className="bg-slate-50 p-2 border-t border-slate-100">
            <ul className="space-y-1">
              <li>
                <a
                  href="/settings"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Settings size={16} />
                  <span className="font-medium">Settings</span>
                </a>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
