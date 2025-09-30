import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// GET /api/oxford/count?search=...
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Use Supabase select with exact count
    let query = supabase.from("oxford_words").select("id", { count: "exact" });
    if (search) {
      // or() supports multiple ilike conditions
      query = query.or(`term.ilike.%${search}%,meaning.ilike.%${search}%`);
    }

    const { data, count, error } = await query;
    if (error) {
      console.error("COUNT Supabase error:", error);
      return NextResponse.json({ error: "count failed" }, { status: 500 });
    }

    return NextResponse.json({ total: count || 0 });
  } catch (e: any) {
    console.error("COUNT unexpected error:", e);
    return NextResponse.json({ error: "count failed" }, { status: 500 });
  }
}
