import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { format } from "date-fns"

export function generateStudentsPDF(students: any[]) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text("Volunteer Students Report", 14, 20)

  // Add date
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, 14, 28)

  // Add summary
  const totalHours = students.reduce((sum, s) => sum + Number.parseFloat(s.total_hours), 0)
  doc.text(`Total Students: ${students.length}`, 14, 36)
  doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 14, 42)

  // Create table
  autoTable(doc, {
    startY: 50,
    head: [["Student ID", "Name", "Email", "Grade", "Total Hours", "Sessions"]],
    body: students.map((s) => [
      s.student_id,
      `${s.first_name} ${s.last_name}`,
      s.email,
      s.grade_level || "-",
      Number.parseFloat(s.total_hours).toFixed(2),
      s.total_sessions,
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })

  return doc
}

export function generateAttendancePDF(attendance: any[]) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(20)
  doc.text("Volunteer Attendance Report", 14, 20)

  // Add date
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, 14, 28)

  // Add summary
  const totalHours = attendance
    .filter((a) => a.total_hours)
    .reduce((sum, a) => sum + Number.parseFloat(a.total_hours), 0)
  doc.text(`Total Records: ${attendance.length}`, 14, 36)
  doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 14, 42)

  // Create table
  autoTable(doc, {
    startY: 50,
    head: [["Student", "Clock In", "Clock Out", "Hours", "Status"]],
    body: attendance.map((a) => [
      `${a.first_name} ${a.last_name}`,
      format(new Date(a.clock_in), "MMM d, h:mm a"),
      a.clock_out ? format(new Date(a.clock_out), "MMM d, h:mm a") : "-",
      a.total_hours ? Number.parseFloat(a.total_hours).toFixed(2) : "-",
      a.status === "clocked_in" ? "Active" : "Completed",
    ]),
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246] },
  })

  return doc
}
