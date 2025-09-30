import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Build Supabase query
    let query = supabase
      .from("oxford_words")
      .select("id, term, meaning, pos, example, image_url, ipa, topic", {
        count: "exact",
      });

    // Add search filter
    if (search) {
      query = query.or(`term.ilike.%${search}%,meaning.ilike.%${search}%`);
    }

    // Add topic filter
    if (topic) {
      query = query.eq("topic", topic);
    }

    // Add pagination
    query = query
      .order("term", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: words, error, count } = await query;

    if (error) {
      console.error("[oxford] Supabase query failed:", error);
      return NextResponse.json(
        {
          error: "Database query error",
          detail: error.message,
          fix: "Check Supabase connection and table existence",
        },
        { status: 500 }
      );
    }

    const total = count || 0;

    return NextResponse.json({
      words: words || [],
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
