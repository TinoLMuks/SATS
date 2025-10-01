import { Pool } from "pg"

// Create a singleton pool instance
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const pool = getPool()
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log("[v0] Executed query", { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

// Helper function to close the pool (useful for testing)
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
