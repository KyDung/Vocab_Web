import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    // Try to use RPC function first
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "get_random_oxford_words",
      { limit_param: n }
    );

    if (!rpcError && rpcData) {
      console.log(
        `✅ Game API: Successfully fetched ${rpcData.length} random words via RPC`
      );
      return NextResponse.json(rpcData);
    }

    // Fallback: fetch all words and shuffle in JavaScript
    console.log(
      "🔄 Game API: RPC failed, using fallback method:",
      rpcError?.message
    );

    // Get total count first
    const { count } = await supabase
      .from("oxford_words")
      .select("*", { count: "exact", head: true });

    if (!count || count === 0) {
      return NextResponse.json(
        { error: "No words found in database" },
        { status: 404 }
      );
    }

    // Generate random offset
    const randomOffset = Math.floor(Math.random() * Math.max(0, count - n));

    const { data: fallbackData, error: fallbackError } = await supabase
      .from("oxford_words")
      .select("term, meaning, ipa, pos, example")
      .range(randomOffset, randomOffset + n - 1);

    if (fallbackError) {
      console.error("❌ Game fallback error:", fallbackError);
      return NextResponse.json(
        { error: "Failed to fetch random words" },
        { status: 500 }
      );
    }

    // Shuffle the results for better randomness
    const shuffledData = (fallbackData || []).sort(() => Math.random() - 0.5);

    console.log(
      `✅ Game API: Successfully fetched ${shuffledData.length} words via fallback`
    );
    return NextResponse.json(shuffledData);
  } catch (error) {
    console.error("❌ Game random API unexpected error:", error);
    return NextResponse.json(
      { error: "Failed to fetch random words" },
      { status: 500 }
    );
  }
}
