import bcrypt from "bcryptjs"
import { query } from "./db"
import type { Supervisor } from "./types"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function authenticateSupervisor(username: string, password: string): Promise<Supervisor | null> {
  try {
    const result = await query(
      "SELECT id, username, password_hash, full_name, email, role, created_at FROM supervisors WHERE username = $1",
      [username],
    )

    if (result.rows.length === 0) {
      return null
    }

    const supervisor = result.rows[0]
    const isValid = await verifyPassword(password, supervisor.password_hash)

    if (!isValid) {
      return null
    }

    // Return supervisor without password hash
    const { password_hash, ...supervisorData } = supervisor
    return supervisorData
  } catch (error) {
    console.error("[v0] Authentication error:", error)
    return null
  }
}

export async function createSupervisor(
  username: string,
  password: string,
  fullName: string,
  email: string,
  role = "supervisor",
): Promise<Supervisor> {
  const passwordHash = await hashPassword(password)

  const result = await query(
    `INSERT INTO supervisors (username, password_hash, full_name, email, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, full_name, email, role, created_at`,
    [username, passwordHash, fullName, email, role],
  )

  return result.rows[0]
}
