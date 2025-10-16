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

    // Get all students with their total hours
    const result = await query(`
      SELECT 
        s.id,
        s.student_id,
        s.first_name,
        s.last_name,
        s.email,
        s.phone,
        s.grade_level,
        COALESCE(SUM(a.total_hours), 0) as total_hours,
        COUNT(CASE WHEN a.status = 'clocked_out' THEN 1 END) as total_sessions
      FROM students s
      LEFT JOIN attendance_logs a ON s.id = a.student_id AND a.status = 'clocked_out'
      GROUP BY s.id, s.student_id, s.first_name, s.last_name, s.email, s.phone, s.grade_level
      ORDER BY s.last_name, s.first_name
    `)

    return NextResponse.json({ students: result.rows })
  } catch (error) {
    console.error("Students fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}
