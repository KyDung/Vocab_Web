import { type NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Use singleton pattern like Oxford API to prevent connection leaks
let pool: Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      port: Number.parseInt(process.env.PGPORT || "5432"),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 5,
      ssl:
        process.env.PGSSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const n = Math.min(
      Math.max(Number.parseInt(searchParams.get("n") || "10"), 1),
      50
    );

    console.log(
      `🎮 Game API: Fetching ${n} random words from oxford_words table`
    );

    // Get random words from oxford_words table
    const result = await getPool().query(
      `SELECT term, meaning FROM oxford_words ORDER BY RANDOM() LIMIT $1`,
      [n]
    );

    console.log(`✅ Found ${result.rows.length} random words for game`);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("❌ Game random API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random words" },
      { status: 500 }
    );
  }
}
