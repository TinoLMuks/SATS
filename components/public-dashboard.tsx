"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, TrendingUp, Calendar, Award } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

interface PublicStats {
  total_students: number
  currently_clocked_in: number
  total_hours_today: number
  total_hours_week: number
  total_hours_month: number
  total_hours_all_time: number
  top_volunteers: Array<{ first_name: string; last_name: string; total_hours: number }>
  daily_hours: Array<{ date: string; hours: number }>
}

export function PublicDashboard() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    fetchStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/public/stats")
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error("[v0] Failed to fetch public stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Format chart data
  const chartData =
    stats?.daily_hours.map((day) => ({
      date: format(new Date(day.date), "MMM d"),
      hours: Number.parseFloat(day.hours.toString()),
    })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Student Ambassador Dashboard</h1>
          <p className="text-xl text-muted-foreground">Tracking our ambassadors contributions</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Ambassadors</CardTitle>
              <Users className="h-5 w-5 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.total_students || 0}</div>
              <p className="text-xs text-blue-100 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Currently Active</CardTitle>
              <Clock className="h-5 w-5 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.currently_clocked_in || 0}</div>
              <p className="text-xs text-green-100 mt-1">Ambassadors working now</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Impact</CardTitle>
              <TrendingUp className="h-5 w-5 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats?.total_hours_all_time.toFixed(0) || 0}</div>
              <p className="text-xs text-purple-100 mt-1">Hours contributed all-time</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_hours_today.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Hours logged today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_hours_week.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Hours this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_hours_month.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Hours this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Ambassador hours over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Ambassador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Ambassador This Month
              </CardTitle>
              <CardDescription>Leading contributors for {format(new Date(), "MMMM yyyy")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.top_volunteers.slice(0, 10).map((volunteer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                              ? "bg-gray-400 text-white"
                              : index === 2
                                ? "bg-amber-600 text-white"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="font-medium">
                        {volunteer.first_name} {volunteer.last_name}
                      </span>
                    </div>
                    <span className="font-bold text-primary">
                      {Number.parseFloat(volunteer.total_hours.toString()).toFixed(1)} hrs
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>Dashboard updates automatically every 30 seconds</p>
        </div>
      </div>
    </div>
  )
}
