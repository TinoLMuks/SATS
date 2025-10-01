"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, TrendingUp, Calendar } from "lucide-react"
import { ExportButtons } from "@/components/export-buttons"
import type { DashboardStats } from "@/lib/types"
import { format } from "date-fns"

export function SupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes, attendanceRes] = await Promise.all([
        fetch("/api/supervisor/stats"),
        fetch("/api/supervisor/students"),
        fetch("/api/supervisor/attendance?limit=100"),
      ])

      const statsData = await statsRes.json()
      const studentsData = await studentsRes.json()
      const attendanceData = await attendanceRes.json()

      setStats(statsData.stats)
      setStudents(studentsData.students)
      setAttendance(attendanceData.attendance)
    } catch (error) {
      console.error("[v0] Failed to fetch dashboard data:", error)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Supervisor Dashboard</h1>
            <p className="text-muted-foreground">Monitor ambassador hours and activity</p>
          </div>
          <ExportButtons students={students} attendance={attendance} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_students || 0}</div>
              <p className="text-xs text-muted-foreground">Registered ambassadors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.currently_clocked_in || 0}</div>
              <p className="text-xs text-muted-foreground">Clocked in now</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_hours_today.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Total hours logged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_hours_week.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Week to date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_hours_month.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">Month to date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_hours_all_time.toFixed(1) || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>View all registered ambassadors and their hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Student ID</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Grade</th>
                        <th className="text-right p-2">Total Hours</th>
                        <th className="text-right p-2">Sessions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-mono text-sm">{student.student_id}</td>
                          <td className="p-2">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">{student.email}</td>
                          <td className="p-2">{student.grade_level || "-"}</td>
                          <td className="p-2 text-right font-semibold">
                            {Number.parseFloat(student.total_hours).toFixed(2)}
                          </td>
                          <td className="p-2 text-right">{student.total_sessions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest clock in/out records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Student</th>
                        <th className="text-left p-2">Clock In</th>
                        <th className="text-left p-2">Clock Out</th>
                        <th className="text-right p-2">Hours</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            {record.first_name} {record.last_name}
                            <span className="text-xs text-muted-foreground ml-2">({record.student_id})</span>
                          </td>
                          <td className="p-2 text-sm">{format(new Date(record.clock_in), "MMM d, h:mm a")}</td>
                          <td className="p-2 text-sm">
                            {record.clock_out ? format(new Date(record.clock_out), "MMM d, h:mm a") : "-"}
                          </td>
                          <td className="p-2 text-right font-semibold">
                            {record.total_hours ? Number.parseFloat(record.total_hours).toFixed(2) : "-"}
                          </td>
                          <td className="p-2 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === "clocked_in"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {record.status === "clocked_in" ? "Active" : "Completed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
