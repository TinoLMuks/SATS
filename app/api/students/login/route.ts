import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, name } = body

    if (!studentId || !name) {
      return NextResponse.json({ error: "Student ID and Name are required" }, { status: 400 })
    }

    // Find student by student ID
    const result = await query(
      `SELECT id, student_id, first_name, last_name, email, phone, grade_level, created_at
       FROM students
       WHERE student_id = $1`,
      [studentId],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = result.rows[0]
    const fullName = `${student.first_name} ${student.last_name}`.trim().toLowerCase()
    const enteredName = name.trim().toLowerCase()

    // Make very sure both name and ID match
    if (fullName !== enteredName) {
      return NextResponse.json({ error: "Name and Student ID do not match" }, { status: 400 })
    }

    // Check if student is currently clocked in
    const attendanceCheck = await query(
      `SELECT id, clock_in, status
       FROM attendance_logs
       WHERE student_id = $1 AND status = 'clocked_in'
       ORDER BY clock_in DESC
       LIMIT 1`,
      [student.id],
    )

    const isClockedIn = attendanceCheck.rows.length > 0

    return NextResponse.json({
      student,
      isClockedIn,
      currentSession: isClockedIn ? attendanceCheck.rows[0] : null,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
