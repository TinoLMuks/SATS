export interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  grade_level?: string
  created_at: Date
  updated_at: Date
}

export interface Supervisor {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  created_at: Date
}

export interface AttendanceLog {
  id: number
  student_id: number
  clock_in: Date
  clock_out?: Date
  total_hours?: number
  status: "clocked_in" | "clocked_out"
  notes?: string
  created_at: Date
  updated_at: Date
}

export interface AttendanceWithStudent extends AttendanceLog {
  student_first_name: string
  student_last_name: string
  student_student_id: string
}

export interface DashboardStats {
  total_students: number
  currently_clocked_in: number
  total_hours_today: number
  total_hours_week: number
  total_hours_month: number
  total_hours_all_time: number
}
