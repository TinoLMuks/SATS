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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get recent attendance logs with student info
    const result = await query(
      `SELECT 
        a.id,
        a.clock_in,
        a.clock_out,
        a.total_hours,
        a.status,
        s.student_id,
        s.first_name,
        s.last_name,
        s.email
      FROM attendance_logs a
      JOIN students s ON a.student_id = s.id
      ORDER BY a.clock_in DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    )

    // Get total count
    const countResult = await query("SELECT COUNT(*) as count FROM attendance_logs")

    return NextResponse.json({
      attendance: result.rows,
      total: Number.parseInt(countResult.rows[0].count),
      limit,
      offset,
    })
  } catch (error) {
    console.error("[v0] Attendance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
