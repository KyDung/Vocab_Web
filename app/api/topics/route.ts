import { NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number.parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
})

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT t.id, t.name, t.description, COUNT(tw.id) as word_count
      FROM topics t
      LEFT JOIN topic_words tw ON t.id = tw.topic_id
      GROUP BY t.id, t.name, t.description
      ORDER BY t.name
    `)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Topics API error:", error)
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 })
  }
}
