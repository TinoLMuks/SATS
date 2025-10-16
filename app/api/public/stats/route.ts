import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
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

    // Get top volunteers this month
    const topVolunteers = await query(`
      SELECT 
        s.first_name,
        s.last_name,
        COALESCE(SUM(a.total_hours), 0) as total_hours
      FROM students s
      LEFT JOIN attendance_logs a ON s.id = a.student_id 
        AND a.status = 'clocked_out'
        AND a.clock_in >= DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY s.id, s.first_name, s.last_name
      HAVING COALESCE(SUM(a.total_hours), 0) > 0
      ORDER BY total_hours DESC
      LIMIT 10
    `)

    // Get daily hours for the past 7 days
    const dailyHours = await query(`
      SELECT 
        DATE(clock_in) as date,
        COALESCE(SUM(total_hours), 0) as hours
      FROM attendance_logs
      WHERE clock_in >= CURRENT_DATE - INTERVAL '7 days'
        AND status = 'clocked_out'
      GROUP BY DATE(clock_in)
      ORDER BY date DESC
    `)

    const stats = {
      total_students: Number.parseInt(totalStudents.rows[0].count),
      currently_clocked_in: Number.parseInt(currentlyClockedIn.rows[0].count),
      total_hours_today: Number.parseFloat(hoursToday.rows[0].total),
      total_hours_week: Number.parseFloat(hoursWeek.rows[0].total),
      total_hours_month: Number.parseFloat(hoursMonth.rows[0].total),
      total_hours_all_time: Number.parseFloat(hoursAllTime.rows[0].total),
      top_volunteers: topVolunteers.rows,
      daily_hours: dailyHours.rows,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Public stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
