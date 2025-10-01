"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogIn, LogOut, Loader2, CheckCircle2, XCircle, Users, Clock } from "lucide-react"

type KioskState = "idle" | "loading" | "success" | "error"

interface ActiveStudent {
  student_id: string
  name: string
  clock_in_time: string
}

export function KioskInterface() {
  const [name, setName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [state, setState] = useState<KioskState>("idle")
  const [message, setMessage] = useState("")
  const [duration, setDuration] = useState<string | null>(null)
  const [activeStudents, setActiveStudents] = useState<ActiveStudent[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const fetchActiveStudents = async () => {
      try {
        const response = await fetch("/api/attendance/active")
        const data = await response.json()
        if (response.ok) {
          setActiveStudents(data.activeStudents)
        }
      } catch (error) {
        console.error("Error fetching active students:", error)
      }
    }

    fetchActiveStudents()
    const interval = setInterval(fetchActiveStudents, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const calculateDuration = (clockInTime: string) => {
    const clockIn = new Date(clockInTime)
    const diff = currentTime.getTime() - clockIn.getTime()
    const totalMinutes = Math.floor(diff / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const resetForm = () => {
    setTimeout(() => {
      setName("")
      setStudentId("")
      setState("idle")
      setMessage("")
      setDuration(null)
    }, 5000)
  }

  const handleClockIn = async () => {
    if (!studentId.trim()) {
      setState("error")
      setMessage("Please enter your Student ID")
      resetForm()
      return
    }

    setState("loading")

    try {
      const response = await fetch("/api/attendance/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to clock in")
      }

      setState("success")
      setMessage(`Welcome, ${data.student.name}! You are now clocked in.`)
      const activeResponse = await fetch("/api/attendance/active")
      const activeData = await activeResponse.json()
      if (activeResponse.ok) {
        setActiveStudents(activeData.activeStudents)
      }
      resetForm()
    } catch (err: any) {
      setState("error")
      setMessage(err.message)
      resetForm()
    }
  }

  const handleClockOut = async () => {
    if (!studentId.trim()) {
      setState("error")
      setMessage("Please enter your Student ID")
      resetForm()
      return
    }

    setState("loading")

    try {
      const response = await fetch("/api/attendance/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to clock out")
      }

      const totalMinutes = Math.round(data.attendance.total_hours * 60)
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const durationText =
        hours > 0
          ? `${hours} hour${hours !== 1 ? "s" : ""} ${minutes} minute${minutes !== 1 ? "s" : ""}`
          : `${minutes} minute${minutes !== 1 ? "s" : ""}`

      setState("success")
      setMessage(`Thank you, ${data.student.name}!`)
      setDuration(durationText)
      const activeResponse = await fetch("/api/attendance/active")
      const activeData = await activeResponse.json()
      if (activeResponse.ok) {
        setActiveStudents(activeData.activeStudents)
      }
      resetForm()
    } catch (err: any) {
      setState("error")
      setMessage(err.message)
      resetForm()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-black to-red-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-2xl border-red-600 border-4">
          <CardContent className="p-6 md:p-10">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="h-12 w-12 text-red-600" />
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-red-600">SATS</h1>
                  <p className="text-base md:text-lg font-semibold text-muted-foreground">
                    Student Ambassador Tracking System
                  </p>
                </div>
              </div>
            </div>

            {state === "success" && (
              <Alert className="mb-6 bg-green-50 border-green-500 border-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-900">
                  <p className="text-xl font-bold mb-1">{message}</p>
                  {duration && (
                    <p className="text-lg font-semibold">
                      Time worked: <span className="text-green-700">{duration}</span>
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {state === "error" && (
              <Alert variant="destructive" className="mb-6 border-2">
                <XCircle className="h-5 w-5" />
                <AlertDescription className="text-lg font-semibold">{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-base font-semibold mb-1.5 text-foreground">
                  Full Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="text-lg md:text-xl h-12 font-medium border-2 focus:border-red-600"
                  disabled={state === "loading"}
                />
              </div>

              <div>
                <label htmlFor="studentId" className="block text-base font-semibold mb-1.5 text-foreground">
                  Student ID
                </label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your Student ID"
                  className="text-lg md:text-xl h-12 font-medium border-2 focus:border-red-600"
                  disabled={state === "loading"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleClockIn()
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Button
                  onClick={handleClockIn}
                  disabled={state === "loading"}
                  size="lg"
                  className="h-20 text-2xl font-black bg-red-600 hover:bg-red-700 text-white shadow-lg"
                >
                  {state === "loading" ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="mr-3 h-8 w-8" />
                      CLOCK IN
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleClockOut}
                  disabled={state === "loading"}
                  size="lg"
                  className="h-20 text-2xl font-black bg-black hover:bg-gray-900 text-white shadow-lg"
                >
                  {state === "loading" ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="mr-3 h-8 w-8" />
                      CLOCK OUT
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>New ambassador? Please Register to Clock in office hours.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xl border-red-600 border-4 max-h-[600px] overflow-hidden flex flex-col">
          <CardContent className="p-6 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-black text-red-600">CLOCKED IN</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {activeStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No ambassadors currently clocked in</p>
                </div>
              ) : (
                activeStudents.map((student) => (
                  <div
                    key={student.student_id}
                    className="bg-red-50 border-2 border-red-200 rounded-lg p-3 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{student.name}</p>
                        
                      
                      </div>
                      <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm font-bold">{calculateDuration(student.clock_in_time)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-center text-sm font-bold text-red-600">
                {activeStudents.length} Ambassador{activeStudents.length !== 1 ? "s" : ""} Active
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
