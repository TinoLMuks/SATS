import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("supervisor_session")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total students
    const totalStudents = await query("SELECT COUNT(*) as count FROM students")

    // Get currently clocked in
    const currentlyClockedIn = await query("SELECT COUNT(*) as count FROM attendance_logs WHERE status = 'clocked_in'")

    // Get total hours today
    const hoursToday = await query(`
      SELECT COALESCE(SUM(total_hours), 0) as total
      FROM attendance_logs
      WHERE DATE(clock_in) = CURRENT_DATE AND status = 'clocked_out'
    `)

    // Get total hours this week
    const hoursWeek = await query(`
      SELECT COALESCE(SUM(total_hours), 0) as total
      FROM attendance_logs
      WHERE clock_in >= DATE_TRUNC('week', CURRENT_DATE) AND status = 'clocked_out'
    `)

    // Get total hours this month
    const hoursMonth = await query(`
      SELECT COALESCE(SUM(total_hours), 0) as total
      FROM attendance_logs
      WHERE clock_in >= DATE_TRUNC('month', CURRENT_DATE) AND status = 'clocked_out'
    `)

    // Get total hours all time
    const hoursAllTime = await query(`
      SELECT COALESCE(SUM(total_hours), 0) as total
      FROM attendance_logs
      WHERE status = 'clocked_out'
    `)

    const stats = {
      total_students: Number.parseInt(totalStudents.rows[0].count),
      currently_clocked_in: Number.parseInt(currentlyClockedIn.rows[0].count),
      total_hours_today: Number.parseFloat(hoursToday.rows[0].total),
      total_hours_week: Number.parseFloat(hoursWeek.rows[0].total),
      total_hours_month: Number.parseFloat(hoursMonth.rows[0].total),
      total_hours_all_time: Number.parseFloat(hoursAllTime.rows[0].total),
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
