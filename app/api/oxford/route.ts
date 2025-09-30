import { type NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Validate required envs early (not throwing – just note)
const missingEnv: string[] = [];
for (const key of ["PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD"]) {
  if (!process.env[key]) missingEnv.push(key);
}

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
    const search = searchParams.get("search") || "";
    const topic = searchParams.get("topic") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit =
      searchParams.get("limit") === "all"
        ? 10000 // Load all words
        : Math.min(
            Math.max(Number.parseInt(searchParams.get("limit") || "50"), 1),
            10000
          );
    const offset = (page - 1) * limit;

    const params: any[] = [];
    const whereConditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      whereConditions.push(
        `(term ILIKE $${params.length} OR meaning ILIKE $${params.length})`
      );
    }

    if (topic) {
      params.push(topic);
      whereConditions.push(`topic = $${params.length}`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // First, get total count for pagination info
    const countSql = `
      SELECT COUNT(*) as total
      FROM oxford_words
      ${whereClause}
    `;

    // Then get the actual data
    const sql = `
      SELECT id, term, meaning, pos, example, image_url, ipa, topic
      FROM oxford_words
      ${whereClause}
      ORDER BY term ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    if (missingEnv.length) {
      console.warn("[oxford] Missing DB env vars:", missingEnv.join(", "));
      return NextResponse.json(
        {
          error: "Database env not configured",
          missingEnv,
          hint: "Add PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD to .env.local",
        },
        { status: 500 }
      );
    }

    let rows: any[] = [];
    let total = 0;
    try {
      // Get total count
      const countResult = await getPool().query(countSql, params);
      total = parseInt(countResult.rows[0]?.total || "0");

      // Get data
      const result = await getPool().query(sql, params);
      rows = result.rows;
    } catch (dbErr: any) {
      // Inspect error code for common cases
      const msg = String(dbErr?.message || dbErr);
      console.error("[oxford] DB query failed:", msg);
      if (/relation .* does not exist/i.test(msg)) {
        return NextResponse.json(
          {
            error: "Table oxford_words not found",
            fix: "Run migration or create table (see provided SQL)",
            sql: "CREATE TABLE public.oxford_words (id SERIAL PRIMARY KEY, term TEXT NOT NULL, meaning TEXT NOT NULL, pos TEXT NULL, example TEXT NULL, image_url TEXT NULL, topic TEXT NULL);",
          },
          { status: 500 }
        );
      }
      // Return error for UI to handle gracefully
      return NextResponse.json(
        {
          error: "Database connection error",
          detail: msg,
          fix: "Check database server and credentials",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      words: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[oxford] Unexpected API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    );
  }
}
