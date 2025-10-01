import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, firstName, lastName, email, phone, gradeLevel } = body

    // Validate required fields
    if (!studentId || !firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if student ID or email already exists
    const existingStudent = await query("SELECT id FROM students WHERE student_id = $1 OR email = $2", [
      studentId,
      email,
    ])

    if (existingStudent.rows.length > 0) {
      return NextResponse.json({ error: "Student ID or email already exists" }, { status: 409 })
    }

    // Insert new student
    const result = await query(
      `INSERT INTO students (student_id, first_name, last_name, email, phone, grade_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, student_id, first_name, last_name, email, phone, grade_level, created_at`,
      [studentId, firstName, lastName, email, phone || null, gradeLevel || null],
    )

    return NextResponse.json({ student: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Failed to register student" }, { status: 500 })
  }
}
