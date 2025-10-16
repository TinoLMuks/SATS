import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const session = cookieStore.get("supervisor_session")

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type") || "students"

    let csvContent = ""

    if (reportType === "students") {
      // Export students with their total hours
      const result = await query(`
        SELECT 
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

      // CSV header
      csvContent =
        "Student ID,Student Ambassador Name,Email,Phone,Year of Study,Total Hours,Total Sessions\n"

      // CSV rows
      result.rows.forEach((row) => {
        const fullName = `${row.first_name} ${row.last_name}`
        csvContent += `${row.student_id},"${fullName}",${row.email},${row.phone || ""},${
          row.grade_level || ""
        },${Number.parseFloat(row.total_hours).toFixed(2)},${row.total_sessions}\n`
      })
    } else if (reportType === "attendance") {
      // Export attendance logs
      const result = await query(`
        SELECT 
          a.id,
          s.student_id,
          s.first_name,
          s.last_name,
          a.clock_in,
          a.clock_out,
          a.total_hours,
          a.status
        FROM attendance_logs a
        JOIN students s ON a.student_id = s.id
        ORDER BY a.clock_in DESC
      `)

      // CSV header
      csvContent =
        "Log ID,Student Ambassador Name,Student ID,Clock In,Clock Out,Total Hours,Status\n"

      // CSV rows
      result.rows.forEach((row) => {
        const fullName = `${row.first_name} ${row.last_name}`
        const clockIn = format(new Date(row.clock_in), "yyyy-MM-dd HH:mm:ss")
        const clockOut = row.clock_out ? format(new Date(row.clock_out), "yyyy-MM-dd HH:mm:ss") : ""
        const hours = row.total_hours ? Number.parseFloat(row.total_hours).toFixed(2) : ""

        csvContent += `${row.id},"${fullName}",${row.student_id},${clockIn},${clockOut},${hours},${row.status}\n`
      })
    }

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="Student Ambassador-${reportType}-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.csv"`,
      },
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 })
  }
}
