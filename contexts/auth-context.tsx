"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  username: string
  email: string
  role: 'manager' | 'operator' | 'inventory' | 'admin'
  avatarUrl?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data on mount
    const checkStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem("prodease_token")

        if (storedToken) {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              setUser(data.data)
            } else {
              // Clear invalid token
              localStorage.removeItem("prodease_token")
              localStorage.removeItem("prodease_user")
            }
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("prodease_token")
            localStorage.removeItem("prodease_user")
          }
        }
      } catch (error) {
        console.error("Error checking stored auth:", error)
        // Clear potentially corrupted data
        localStorage.removeItem("prodease_user")
        localStorage.removeItem("prodease_token")
      } finally {
        setIsLoading(false)
      }
    }

    checkStoredAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        localStorage.setItem("prodease_user", JSON.stringify(data.user))
        localStorage.setItem("prodease_token", data.token)
        return true
      } else {
        console.error("Login failed:", data.message)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem("prodease_token")
      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      localStorage.removeItem("prodease_user")
      localStorage.removeItem("prodease_token")
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
