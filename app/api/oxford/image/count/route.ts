import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number.parseInt(process.env.PGPORT || "5432"),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

// GET /api/oxford/count?search=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const params: any[] = [];
    let where = "";
    if (search) {
      params.push(`%${search}%`);
      where = "WHERE term ILIKE $1 OR meaning ILIKE $1";
    }
    const sql = `SELECT COUNT(*)::int AS total FROM public.oxford_words ${where}`;
    const { rows } = await pool.query(sql, params);
    return NextResponse.json(rows[0]);
  } catch (e: any) {
    console.error("COUNT error:", e);
    return NextResponse.json({ error: "count failed" }, { status: 500 });
  }
}
