import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        s.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as name,
        a.clock_in as clock_in_time
      FROM attendance_logs a
      JOIN students s ON a.student_id = s.id
      WHERE a.clock_out IS NULL
      ORDER BY a.clock_in DESC`,
      [],
    )

    console.log("[v0] Active students fetched:", result.rows.length)
    return NextResponse.json({ activeStudents: result.rows })
  } catch (error: any) {
    console.error("[v0] Error fetching active students:", error)
    return NextResponse.json({ error: "Failed to fetch active students" }, { status: 500 })
  }
}
