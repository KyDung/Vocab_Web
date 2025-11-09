// Test auto-load functionality manually
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Use global fetch (Node.js 18+)
if (typeof fetch === "undefined") {
  global.fetch = require("node-fetch");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchUnsplashImage(term) {
  console.log(`🔍 Fetching image for: "${term}"`);

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", term);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "squarish");

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${unsplashKey}`,
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

  return {
    imageUrl,
    altDescription: hit?.alt_description || null,
    rateLimit: { remaining: parseInt(remaining), limit: parseInt(limit) },
  };
}

async function testAutoLoad() {
  try {
    console.log("🚀 Starting auto-load test...\n");

    // Get first 3 words without images
    const { data: words, error } = await supabase
      .from("oxford_words")
      .select("id, term")
      .is("image_url", null)
      .limit(3);

    if (error) {
      console.error("Database error:", error);
      return;
    }

    console.log(`Found ${words.length} words to process:\n`);

    for (const word of words) {
      try {
        console.log(`\n--- Processing "${word.term}" (ID: ${word.id}) ---`);

        // Fetch image
        const { imageUrl, altDescription, rateLimit } =
          await fetchUnsplashImage(word.term);

        if (imageUrl) {
          console.log(`✅ Found image: ${imageUrl}`);
          console.log(`📝 Alt: ${altDescription}`);

          // Update database
          const { error: updateError } = await supabase
            .from("oxford_words")
            .update({ image_url: imageUrl })
            .eq("id", word.id);

          if (updateError) {
            console.error(`❌ Failed to update database:`, updateError);
          } else {
            console.log(`✅ Database updated successfully!`);

            // Verify update
            const { data: updated, error: verifyError } = await supabase
              .from("oxford_words")
              .select("image_url")
              .eq("id", word.id)
              .single();

            if (verifyError) {
              console.error(`❌ Failed to verify update:`, verifyError);
            } else {
              console.log(
                `🔍 Verified: ${
                  updated.image_url ? "Image URL saved" : "No image URL found"
                }`
              );
            }
          }
        } else {
          console.log(`❌ No image found for "${word.term}"`);
        }

        // Check rate limit
        if (rateLimit.remaining <= 5) {
          console.log(
            `⚠️ Rate limit low (${rateLimit.remaining}), stopping here`
          );
          break;
        }

        // Small delay between requests
        console.log("⏳ Waiting 2 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error processing "${word.term}":`, error.message);
      }
    }

    // Final count check
    const { count: finalCount } = await supabase
      .from("oxford_words")
      .select("*", { count: "exact", head: true })
      .is("image_url", null);

    console.log(`\n🎯 Final result: ${finalCount} words still need images`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAutoLoad();
