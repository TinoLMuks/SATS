"use client"

import { useState, useEffect } from "react"
import { SupervisorLogin } from "@/components/supervisor-login"
import { SupervisorDashboard } from "@/components/supervisor-dashboard"

export default function SupervisorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/supervisor/stats")
      if (response.ok) {
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SupervisorLogin onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  return <SupervisorDashboard />
}
