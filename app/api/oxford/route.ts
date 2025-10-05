import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Function to get all words by batching requests to bypass Supabase 1000-row limit
async function getAllWords(search: string = "", topic: string = "") {
  try {
    let allWords: any[] = [];
    let offset = 0;
    const batchSize = 1000; // Supabase limit
    let hasMore = true;

    console.log(`[oxford] Starting to load all words with batching...`);

    while (hasMore) {
      // Build query for this batch
      let query = supabase
        .from("oxford_words")
        .select("id, term, meaning, pos, example, image_url, ipa, topic");

      // Add search filter
      if (search) {
        query = query.or(`term.ilike.%${search}%,meaning.ilike.%${search}%`);
      }

      // Add topic filter
      if (topic) {
        query = query.eq("topic", topic);
      }

      // Add pagination for this batch
      query = query
        .order("term", { ascending: true })
        .range(offset, offset + batchSize - 1);

      const { data: words, error } = await query;

      if (error) {
        console.error(`[oxford] Batch ${offset} failed:`, error);
        throw error;
      }

      if (words && words.length > 0) {
        allWords = allWords.concat(words);
        console.log(
          `[oxford] Loaded batch: ${words.length} words (total: ${allWords.length})`
        );
        offset += batchSize;

        // If we got less than batchSize, we're done
        if (words.length < batchSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }

      // Safety break to prevent infinite loops
      if (offset > 10000) {
        console.warn("[oxford] Safety break at 10000 words");
        break;
      }
    }

    console.log(
      `[oxford] ✅ Successfully loaded ${allWords.length} words in total`
    );

    return NextResponse.json({
      words: allWords,
      total: allWords.length,
      page: 1,
      limit: allWords.length,
      totalPages: 1,
    });
  } catch (error) {
    console.error("[oxford] getAllWords failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch all words" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const topic = searchParams.get("topic") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limitParam = searchParams.get("limit");

    // Special handling for loading all words
    if (limitParam === "all") {
      return await getAllWords(search, topic);
    }

    const limit = Math.min(
      Math.max(Number.parseInt(limitParam || "50"), 1),
      1000 // Use Supabase limit of 1000 for regular pagination
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
