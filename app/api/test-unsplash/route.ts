import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    console.log("🧪 Starting manual auto-load test...");

    // Get one word without image
    const { data: words, error } = await supabase
      .from("oxford_words")
      .select("id, term, image_url")
      .is("image_url", null)
      .limit(1);

    if (error) {
      throw error;
    }

    if (!words || words.length === 0) {
      return NextResponse.json({
        message: "All words have images",
        status: "completed",
      });
    }

    const word = words[0];
    console.log(`🎯 Testing with word: "${word.term}" (ID: ${word.id})`);

    // Test Unsplash API
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", word.term);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "squarish");

    console.log(`🔍 Fetching from Unsplash...`);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY!}`,
        "Accept-Version": "v1",
      },
    });

    const remaining = res.headers.get("X-Ratelimit-Remaining");
    const limit = res.headers.get("X-Ratelimit-Limit");
    console.log(`📊 Rate limit: ${remaining}/${limit}`);

    if (!res.ok) {
      throw new Error(`Unsplash ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const hit = data?.results?.[0];
    const imageUrl = hit?.urls?.small || hit?.urls?.regular || null;

    console.log(`📸 Found ${data.results.length} results`);

    if (imageUrl) {
      console.log(`✅ Image URL: ${imageUrl}`);

      // Try to update database
      console.log("💾 Updating database...");

      const { error: updateError } = await supabase
        .from("oxford_words")
        .update({ image_url: imageUrl })
        .eq("id", word.id);

      if (updateError) {
        console.error("❌ Database update failed:", updateError);
        return NextResponse.json({
          status: "db_error",
          error: updateError.message,
          word: word.term,
          imageUrl,
        });
      }

      console.log("✅ Database updated successfully!");

      // Verify update
      const { data: updated, error: verifyError } = await supabase
        .from("oxford_words")
        .select("image_url")
        .eq("id", word.id)
        .single();

      if (verifyError) {
        console.error("❌ Verification failed:", verifyError);
      } else {
        console.log(
          `🔍 Verified: ${updated.image_url ? "Image saved" : "No image in DB"}`
        );
      }

      return NextResponse.json({
        status: "success",
        word: word.term,
        wordId: word.id,
        imageUrl,
        verified: updated?.image_url || null,
        rateLimit: {
          remaining: parseInt(remaining || "0"),
          limit: parseInt(limit || "50"),
        },
      });
    } else {
      console.log(`❌ No image found for "${word.term}"`);
      return NextResponse.json({
        status: "no_image",
        word: word.term,
        wordId: word.id,
        rateLimit: {
          remaining: parseInt(remaining || "0"),
          limit: parseInt(limit || "50"),
        },
      });
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
