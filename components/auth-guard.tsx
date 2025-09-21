"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
  allowedRoles?: string[]
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = "/auth/login",
  allowedRoles = []
}: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth context to finish loading
      if (isLoading) {
        return
      }

      // If authentication is required but user is not logged in
      if (requireAuth && !user) {
        // Store the intended destination
        sessionStorage.setItem('redirectAfterLogin', pathname)
        router.push(redirectTo)
        return
      }

      // If user is logged in but shouldn't be (e.g., on login page)
      if (!requireAuth && user) {
        const intendedPath = sessionStorage.getItem('redirectAfterLogin')
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(intendedPath || "/dashboard")
        return
      }

      // Check role-based access
      if (requireAuth && user && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.push("/unauthorized")
          return
        }
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [user, isLoading, requireAuth, redirectTo, allowedRoles, router, pathname])

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If authentication is required but user is not logged in, don't render children
  if (requireAuth && !user) {
    return null
  }

  // If user is logged in but shouldn't be (e.g., on login page), don't render children
  if (!requireAuth && user) {
    return null
  }

  // If role check fails, don't render children
  if (requireAuth && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for pages that require authentication
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Hook for checking if user has specific permissions
export function usePermissions() {
  const { user } = useAuth()

  const hasRole = (role: string) => {
    return user?.role === role
  }

  const hasAnyRole = (roles: string[]) => {
    return user ? roles.includes(user.role) : false
  }

  const canAccess = (requiredRoles: string[]) => {
    if (requiredRoles.length === 0) return true
    return user ? requiredRoles.includes(user.role) : false
  }

  const isAdmin = () => hasRole('admin')
  const isManager = () => hasRole('manager')
  const isOperator = () => hasRole('operator')
  const isInventory = () => hasRole('inventory')

  return {
    user,
    hasRole,
    hasAnyRole,
    canAccess,
    isAdmin,
    isManager,
    isOperator,
    isInventory,
  }
}
