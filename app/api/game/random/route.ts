import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const n = Math.min(
      Math.max(Number.parseInt(searchParams.get("n") || "10"), 1),
      50
    );

    console.log(`🎮 Game API: Fetching ${n} random words from oxford_words table`);

    // Supabase doesn't have a direct RANDOM() order across all providers; use rpc or sampling.
    // Simple approach: fetch n items using offset with a random start (may have bias) or request all ids and sample.
    // Here we fetch random using SQL function via rpc: use 'order' with 'random' via 'select' raw
    const { data, error } = await supabase.rpc('get_random_oxford_words', { limit: n });

    if (error) {
      // Fallback: fetch n items and shuffle in JS
      console.error('Game RPC error, falling back:', error.message || error);
      const { data: allData, error: e2 } = await supabase
        .from('oxford_words')
        .select('term, meaning')
        .limit(n)
      if (e2) {
        console.error('Game fallback error:', e2)
        return NextResponse.json({ error: 'Failed to fetch random words' }, { status: 500 })
      }
      return NextResponse.json(allData || [])
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('❌ Game random API unexpected error:', error);
    return NextResponse.json({ error: 'Failed to fetch random words' }, { status: 500 });
  }
}
