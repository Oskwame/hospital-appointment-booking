"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api-config";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";

import { useAuth } from "@/lib/auth-context";

export const dynamic = "force-dynamic";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Use useAuth hook

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "Login failed");
        setLoading(false);
        return;
      }

      // Use context login which updates state and localStorage
      await login(data.token);

      router.push("/"); // redirect after successful login
    } catch (err) {
      console.error(err);
      setMessage("Network error. Server may be down.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="card p-8 w-full max-w-md">
        <div className="flex flex-col items-center">
          <Image src="/kasahospital-logo.png" alt="Logo" width={70} height={70} />
          <h2 className="text-lg font-semibold text-slate-800">Admin Login</h2>
        </div>

        <form className="flex flex-col gap-y-6 mt-6" onSubmit={handleLogin}>
          <div className="flex items-center gap-2 mb-4">
            <FaUser className="text-slate-600" />
            <input
              type="text"
              name="email"
              value={formData.email}
              placeholder="Email"
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="flex items-center gap-2 mb-5">
            <FaLock className="text-slate-600" />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                placeholder="Password"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full px-3 rounded-md shadow-md"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-red-500">{message}</p>}

        <p className="text-center mt-4 text-slate-500 text-xs">
          © {new Date().getFullYear()} Kasa Hospital
        </p>
      </div>
    </div>
  );
}
