"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, TrendingUp, Calendar } from "lucide-react"
import { ExportButtons } from "@/components/export-buttons"
import type { DashboardStats } from "@/lib/types"
import { format } from "date-fns"

/* ---------- Types ---------- */

interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  email: string
  grade_level?: string
  total_hours: number | string
  total_sessions: number
}

interface AttendanceRecord {
  id: number
  student_id: string
  first_name: string
  last_name: string
  clock_in: string
  clock_out?: string
  total_hours?: number | string
  status: "clocked_in" | "completed"
}

/* ---------- Component ---------- */

export function SupervisorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
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
      setStudents(studentsData.students ?? [])
      setAttendance(attendanceData.attendance ?? [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
            <p className="text-muted-foreground">Monitor ambassador hours and activity</p>
          </div>
          <ExportButtons students={students} attendance={attendance} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="students">
          <TabsList>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Recent Activity</TabsTrigger>
          </TabsList>

          {/* ---------- STUDENTS TAB ---------- */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription>Registered ambassadors</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Student ID</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-right">Hours</th>
                      <th className="p-2 text-right">Sessions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="p-2 font-mono">{student.student_id}</td>
                        <td className="p-2">
                          {student.first_name} {student.last_name}
                        </td>
                        <td className="p-2">{student.email}</td>
                        <td className="p-2">{student.grade_level ?? "-"}</td>
                        <td className="p-2 text-right">
                          {Number(student.total_hours).toFixed(2)}
                        </td>
                        <td className="p-2 text-right">{student.total_sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- ATTENDANCE TAB ---------- */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Student</th>
                      <th className="p-2 text-left">Clock In</th>
                      <th className="p-2 text-left">Clock Out</th>
                      <th className="p-2 text-right">Hours</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="p-2">
                          {record.first_name} {record.last_name}
                        </td>
                        <td className="p-2">
                          {format(new Date(record.clock_in), "MMM d, h:mm a")}
                        </td>
                        <td className="p-2">
                          {record.clock_out
                            ? format(new Date(record.clock_out), "MMM d, h:mm a")
                            : "-"}
                        </td>
                        <td className="p-2 text-right">
                          {record.total_hours
                            ? Number(record.total_hours).toFixed(2)
                            : "-"}
                        </td>
                        <td className="p-2 text-center">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
