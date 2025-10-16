import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, name } = body

    if (!studentId || !name) {
      return NextResponse.json({ error: "Both Student ID and Name are required" }, { status: 400 })
    }

    const trimmedName = name.trim().toLowerCase()

    // Find student matching both ID and name
    const studentResult = await query(
      `SELECT id, first_name, last_name 
       FROM students 
       WHERE student_id = $1`,
      [studentId]
    )

    if (studentResult.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = studentResult.rows[0]
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase().trim()

    if (trimmedName !== fullName) {
      return NextResponse.json({ error: "Name and Student ID do not match" }, { status: 400 })
    }

    // Find active clock-in session
    const sessionResult = await query(
      `SELECT id, clock_in FROM attendance_logs 
       WHERE student_id = $1 AND status = 'clocked_in'
       ORDER BY clock_in DESC LIMIT 1`,
      [student.id]
    )

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: "No active clock-in session found" }, { status: 400 })
    }

    const session = sessionResult.rows[0]

    // Calculate hours worked
    const updateResult = await query(
      `UPDATE attendance_logs
       SET clock_out = CURRENT_TIMESTAMP,
           status = 'clocked_out',
           total_hours = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - clock_in)) / 3600
       WHERE id = $1
       RETURNING id, clock_in, clock_out, total_hours, status`,
      [session.id]
    )

    return NextResponse.json({
      message: "Clocked out successfully",
      attendance: updateResult.rows[0],
      student: {
        name: `${student.first_name} ${student.last_name}`,
      },
    })
  } catch (error) {
    console.error("Clock-out error:", error)
    return NextResponse.json({ error: "Failed to clock out" }, { status: 500 })
  }
}
