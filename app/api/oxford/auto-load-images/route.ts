import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
export const runtime = "nodejs";

// Rate limiting state (in memory - for production use Redis)
let lastLoadTime = 0;
let currentlyLoading = false;
const MIN_INTERVAL = 3000; // 3 seconds between requests
const MAX_BATCH_SIZE = 10; // Max images to load per call

async function fetchUnsplash(term: string) {
  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", term);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "squarish");

  console.log(`🔍 Auto-loading image for: "${term}"`);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}`,
      "Accept-Version": "v1",
    },
    next: { revalidate: 60 * 60 }, // cache 1h
  });

  // Log rate limit info
  const remaining = res.headers.get("X-Ratelimit-Remaining");
  const limit = res.headers.get("X-Ratelimit-Limit");
  console.log(`📊 Unsplash rate limit: ${remaining}/${limit} remaining`);

  if (!res.ok) {
    if (res.status === 403) {
      console.error(`❌ Unsplash 403 - Rate limit or API key issue`);
    }
    throw new Error(`Unsplash ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const hit = data?.results?.[0];
  const imageUrl = hit?.urls?.small || hit?.urls?.regular || null;

  return {
    imageUrl,
    rateLimit: {
      remaining: parseInt(remaining || "0"),
      limit: parseInt(limit || "50"),
    },
  };
}

export async function GET(req: NextRequest) {
  try {
    // Prevent concurrent loading
    if (currentlyLoading) {
      return NextResponse.json({
        message: "Already loading images",
        status: "busy",
      });
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastLoadTime < MIN_INTERVAL) {
      return NextResponse.json({
        message: "Rate limited",
        waitTime: MIN_INTERVAL - (now - lastLoadTime),
        status: "rate_limited",
      });
    }

    currentlyLoading = true;
    lastLoadTime = now;

    // Get words without images (excluding those marked as unavailable)
    const { data: wordsWithoutImages, error } = await supabase
      .from("oxford_words")
      .select("id, term")
      .is("image_url", null)
      .limit(MAX_BATCH_SIZE);

    if (error) {
      throw error;
    }

    if (!wordsWithoutImages || wordsWithoutImages.length === 0) {
      currentlyLoading = false;
      return NextResponse.json({
        message: "All words have images",
        status: "completed",
        remainingWords: 0,
      });
    }

    console.log(`🚀 Auto-loading ${wordsWithoutImages.length} images...`);

    const results = [];
    let rateLimitInfo = null;

    for (const word of wordsWithoutImages) {
      try {
        const { imageUrl, rateLimit } = await fetchUnsplash(word.term);
        rateLimitInfo = rateLimit;

        if (imageUrl) {
          // Update database
          const { error: updateError } = await supabase
            .from("oxford_words")
            .update({ image_url: imageUrl })
            .eq("id", word.id);

          if (updateError) {
            console.error(`Failed to update ${word.term}:`, updateError);
            results.push({
              term: word.term,
              status: "db_error",
              error: updateError.message,
            });
          } else {
            console.log(`✅ Updated ${word.term}: ${imageUrl}`);
            results.push({ term: word.term, status: "success", imageUrl });
          }
        } else {
          // Mark as "no image available" to avoid retrying
          console.log(
            `❌ No image found for "${word.term}", marking as unavailable`
          );
          const { error: markError } = await supabase
            .from("oxford_words")
            .update({ image_url: "no_image_available" })
            .eq("id", word.id);

          if (markError) {
            console.error(
              `Failed to mark ${word.term} as no-image:`,
              markError
            );
            results.push({
              term: word.term,
              status: "mark_error",
              error: markError.message,
            });
          } else {
            console.log(`🚫 Marked ${word.term} as no-image-available`);
            results.push({ term: word.term, status: "no_image_marked" });
          }
        }

        // Check rate limit - if low, stop early
        if (rateLimit.remaining <= 5) {
          console.log(
            `⚠️ Rate limit low (${rateLimit.remaining}), stopping early`
          );
          break;
        }

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to load image for ${word.term}:`, error);
        results.push({
          term: word.term,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // If it's a rate limit error, stop processing
        if (error instanceof Error && error.message.includes("403")) {
          break;
        }
      }
    }

    // Get remaining count
    const { count: remainingCount } = await supabase
      .from("oxford_words")
      .select("*", { count: "exact", head: true })
      .is("image_url", null);

    currentlyLoading = false;

    return NextResponse.json({
      status: "success",
      processed: results.length,
      results,
      remainingWords: remainingCount || 0,
      rateLimit: rateLimitInfo,
      nextCallSuggested: MIN_INTERVAL,
    });
  } catch (error) {
    currentlyLoading = false;
    console.error("Auto-load error:", error);
    return NextResponse.json(
      {
        error: "Failed to auto-load images",
        details: error instanceof Error ? error.message : "Unknown error",
        status: "error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "start") {
      // Trigger immediate loading
      return GET(req);
    } else if (action === "status") {
      // Get current status
      const { count: remainingCount } = await supabase
        .from("oxford_words")
        .select("*", { count: "exact", head: true })
        .is("image_url", null);

      return NextResponse.json({
        remainingWords: remainingCount || 0,
        currentlyLoading,
        lastLoadTime: new Date(lastLoadTime).toISOString(),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
