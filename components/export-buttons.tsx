"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { generateStudentsPDF, generateAttendancePDF } from "@/lib/pdf-generator"

interface ExportButtonsProps {
  students: any[]
  attendance: any[]
}

export function ExportButtons({ students, attendance }: ExportButtonsProps) {
  const [loading, setLoading] = useState(false)

  const handleCSVExport = async (type: "students" | "attendance") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/supervisor/export/csv?type=${type}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Student Ambassador-${type}-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("CSV export failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePDFExport = (type: "students" | "attendance") => {
    setLoading(true)
    try {
      const doc = type === "students" ? generateStudentsPDF(students) : generateAttendancePDF(attendance)
      doc.save(`Student Ambassador-${type}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleCSVExport("students")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Students CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePDFExport("students")}>
          <FileText className="mr-2 h-4 w-4" />
          Students PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCSVExport("attendance")}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Attendance CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePDFExport("attendance")}>
          <FileText className="mr-2 h-4 w-4" />
          Attendance PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
