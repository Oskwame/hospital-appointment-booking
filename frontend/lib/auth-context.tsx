"use client"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { API_BASE_URL } from "./api-config"

type Role = "admin" | "superadmin" | "doctor"

interface AuthState {
  user: any | null
  role: Role | null
  loading: boolean
}

const AuthContext = createContext<AuthState>({ user: null, role: null, loading: true })

// Token refresh interval (20 hours - before 24h expiration)
const REFRESH_INTERVAL = 20 * 60 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true })

  const refreshToken = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        console.log("[AUTH] Token refreshed successfully")
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const fetchMe = useCallback(async () => {
    try {
      const base = API_BASE_URL
      const res = await fetch(`${base}/auth/me`, { credentials: "include" })
      if (res.ok) {
        const data = await res.json()
        const r = String(data.role || "ADMIN").toLowerCase()
        const role: Role = r === "doctor" ? "doctor" : r === "superadmin" ? "superadmin" : "admin"
        setState({ user: data, role, loading: false })
        return true
      } else {
        setState({ user: null, role: null, loading: false })
        return false
      }
    } catch {
      setState({ user: null, role: null, loading: false })
      return false
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMe()
  }, [fetchMe])

  // Set up automatic token refresh
  useEffect(() => {
    if (!state.user) return

    // Refresh token periodically (every 20 hours)
    const intervalId = setInterval(async () => {
      const success = await refreshToken()
      if (!success) {
        // If refresh fails, try to fetch user (might redirect to login)
        await fetchMe()
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(intervalId)
  }, [state.user, refreshToken, fetchMe])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}


