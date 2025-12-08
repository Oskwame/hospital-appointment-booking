"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { API_BASE_URL } from "./api-config"

type Role = "admin" | "superadmin" | "doctor"

interface AuthState {
  user: any | null
  role: Role | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true })

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const base = API_BASE_URL
        const res = await fetch(`${base}/auth/me`, { credentials: "include" })
        if (res.ok) {
          const data = await res.json()
          const r = String(data.role || "ADMIN").toLowerCase()
          const role: Role = r === "doctor" ? "doctor" : r === "superadmin" ? "superadmin" : "admin"
          setState({ user: data, role, loading: false })
        } else {
          setState({ user: null, role: null, loading: false })
        }
      } catch {
        setState({ user: null, role: null, loading: false })
      }
    }
    fetchMe()
  }, [])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

