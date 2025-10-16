//this is the orgonal

import { type NextRequest, NextResponse } from "next/server"
import { authenticateSupervisor } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const supervisor = await authenticateSupervisor(username, password)

    if (!supervisor) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set("supervisor_session", JSON.stringify({ id: supervisor.id, username: supervisor.username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return NextResponse.json({ supervisor })
  } catch (error) {
    console.error("Supervisor login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
