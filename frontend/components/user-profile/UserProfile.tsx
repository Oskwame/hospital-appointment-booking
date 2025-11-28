"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Settings } from "lucide-react";

interface UserProfileProps {
  user: {
    username?: string;
    email?: string;
  } | null;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL + "/api"
      await fetch(`${base}/auth/logout`, {
        method: "POST",
        credentials: "include", // in case you're using cookies
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="relative">
      {/* Profile Icon */}
      <button
        type="button"
        aria-label="Open profile menu"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
      >
        <UserIcon className="text-gray-600" size={18} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="p-3 text-gray-800 text-sm">
            <p className="font-semibold">
              {user?.username || user?.email || "Unknown User"}
            </p>
          </div>

          <hr className="border-gray-200" />

          <ul className="text-gray-800 text-sm">
            <li>
              <a
                href="../settings"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <Settings size={16} /> Settings
              </a>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
              >
                <LogOut size={16} /> Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
