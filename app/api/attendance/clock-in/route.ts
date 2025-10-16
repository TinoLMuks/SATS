import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, name } = body

    if (!studentId || !name) {
      return NextResponse.json({ error: "Both Student ID and Name are required" }, { status: 400 })
    }

    // Normalize name input (trim + case-insensitive)
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

    // Check if already clocked in
    const existingSession = await query(
      `SELECT id FROM attendance_logs 
       WHERE student_id = $1 AND status = 'clocked_in'
       ORDER BY clock_in DESC LIMIT 1`,
      [student.id]
    )

    if (existingSession.rows.length > 0) {
      return NextResponse.json({ error: "Already clocked in" }, { status: 400 })
    }

    // Create new clock-in record
    const result = await query(
      `INSERT INTO attendance_logs (student_id, clock_in, status)
       VALUES ($1, CURRENT_TIMESTAMP, 'clocked_in')
       RETURNING id, student_id, clock_in, status`,
      [student.id]
    )

    return NextResponse.json({
      message: "Clocked in successfully",
      attendance: result.rows[0],
      student: {
        name: `${student.first_name} ${student.last_name}`,
      },
    })
  } catch (error) {
    console.error("Clock-in error:", error)
    return NextResponse.json({ error: "Failed to clock in" }, { status: 500 })
  }
}
