import { type NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number.parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const topicId = params.id
    const result = await pool.query(
      `SELECT id, term, meaning, pos, example, image_url 
       FROM topic_words 
       WHERE topic_id = $1 
       ORDER BY term`,
      [topicId],
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Topic words API error:", error)
    return NextResponse.json({ error: "Failed to fetch topic words" }, { status: 500 })
  }
}
