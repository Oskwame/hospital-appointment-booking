"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { API_BASE_URL } from "./api-config"

type Role = "admin" | "superadmin" | "doctor"

interface AuthState {
  user: any | null
  role: Role | null
  loading: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
  login: () => { },
  logout: () => { },
})

const REFRESH_INTERVAL = 150 * 60 * 1000 // 2.5 hours

const API_AUTH_BASE = `${API_BASE_URL}/api/auth`

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<AuthState, "login" | "logout">>({
    user: null,
    role: null,
    loading: true,
  })

  const fetchMe = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setState({ user: null, role: null, loading: false })
        return false
      }

      const res = await fetch(`${API_AUTH_BASE}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        setState({ user: null, role: null, loading: false })
        return false
      }

      const data = await res.json()
      const r = String(data.role || "admin").toLowerCase()
      const role: Role =
        r === "doctor" ? "doctor" : r === "superadmin" ? "superadmin" : "admin"

      setState({ user: data, role, loading: false })
      return true
    } catch {
      setState({ user: null, role: null, loading: false })
      return false
    }
  }, [])

  const login = useCallback(
    async (token: string) => {
      localStorage.setItem("token", token)
      await fetchMe()
    },
    [fetchMe]
  )

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setState({ user: null, role: null, loading: false })
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return false

      const res = await fetch(`${API_AUTH_BASE}/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return false

      const data = await res.json()
      if (data.token) {
        localStorage.setItem("token", data.token)
      }

      return true
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!state.user) return

    const id = setInterval(async () => {
      const ok = await refreshToken()
      if (!ok) await fetchMe()
    }, REFRESH_INTERVAL)

    return () => clearInterval(id)
  }, [state.user, refreshToken, fetchMe])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}



