// Test with easier words that should have images
const { createClient } = require("@supabase/supabase-js");
const fetch = require("node-fetch");
require("dotenv").config({ path: ".env.local" });

// Make sure fetch is available globally
global.fetch = fetch;

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
  console.log(`📸 Found ${data.results.length} results`);

  const hit = data?.results?.[0];
  const imageUrl = hit?.urls?.small || hit?.urls?.regular || null;

  if (imageUrl) {
    console.log(`✅ Image URL: ${imageUrl}`);
    console.log(`📝 Alt: ${hit?.alt_description || "No description"}`);
  }

  return {
    imageUrl,
    altDescription: hit?.alt_description || null,
    rateLimit: { remaining: parseInt(remaining), limit: parseInt(limit) },
  };
}

async function testSpecificWords() {
  try {
    // Test with common words that should have images
    const testWords = ["apple", "car", "house", "cat", "dog"];

    console.log("🧪 Testing Unsplash with common words first...\n");

    for (const word of testWords) {
      console.log(`\n--- Testing "${word}" ---`);

      try {
        const { imageUrl, altDescription, rateLimit } =
          await fetchUnsplashImage(word);

        if (imageUrl) {
          console.log(`✅ SUCCESS: Found image for "${word}"`);
        } else {
          console.log(`❌ FAIL: No image for "${word}"`);
        }

        // Check rate limit
        if (rateLimit.remaining <= 5) {
          console.log(`⚠️ Rate limit low, stopping test`);
          break;
        }

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error testing "${word}":`, error.message);
      }
    }

    // Now test finding a word in database with easier terms
    console.log("\n\n🔍 Looking for database words with common terms...");

    const commonTerms = [
      "able",
      "about",
      "after",
      "again",
      "all",
      "also",
      "and",
      "any",
      "are",
      "as",
      "at",
      "back",
      "be",
      "because",
      "but",
      "by",
      "call",
      "can",
      "come",
      "could",
      "day",
      "do",
      "each",
      "first",
      "for",
      "from",
      "get",
      "give",
      "go",
      "good",
      "great",
      "group",
      "hand",
      "have",
      "he",
      "help",
      "her",
      "here",
      "him",
      "his",
      "how",
      "I",
      "if",
      "in",
      "into",
      "is",
      "it",
      "its",
      "just",
      "know",
      "large",
      "last",
      "leave",
      "life",
      "like",
      "line",
      "little",
      "long",
      "look",
      "make",
      "man",
      "may",
      "me",
      "more",
      "most",
      "move",
      "much",
      "my",
      "need",
      "new",
      "no",
      "not",
      "now",
      "number",
      "of",
      "off",
      "old",
      "on",
      "one",
      "only",
      "or",
      "other",
      "our",
      "out",
      "over",
      "own",
      "part",
      "people",
      "place",
      "point",
      "put",
      "right",
      "same",
      "say",
      "see",
      "seem",
      "she",
      "should",
      "show",
      "small",
      "so",
      "some",
      "sound",
      "still",
      "such",
      "system",
      "take",
      "than",
      "that",
      "the",
      "them",
      "there",
      "these",
      "they",
      "think",
      "this",
      "those",
      "through",
      "time",
      "to",
      "too",
      "try",
      "turn",
      "two",
      "up",
      "us",
      "use",
      "very",
      "want",
      "water",
      "way",
      "we",
      "well",
      "were",
      "what",
      "when",
      "where",
      "which",
      "while",
      "who",
      "will",
      "with",
      "work",
      "world",
      "would",
      "write",
      "year",
      "you",
      "your",
    ];

    // Find database words that match common terms
    const { data: matchingWords, error } = await supabase
      .from("oxford_words")
      .select("id, term")
      .is("image_url", null)
      .in("term", commonTerms.slice(0, 20)) // Test first 20 common terms
      .limit(3);

    if (error) {
      console.error("Database error:", error);
      return;
    }

    if (matchingWords && matchingWords.length > 0) {
      console.log(
        `\n✅ Found ${matchingWords.length} database words with common terms:`
      );

      for (const word of matchingWords) {
        console.log(
          `\n--- Processing DB word "${word.term}" (ID: ${word.id}) ---`
        );

        try {
          const { imageUrl, altDescription, rateLimit } =
            await fetchUnsplashImage(word.term);

          if (imageUrl) {
            console.log(`✅ Found image for "${word.term}"`);

            // Update database
            const { error: updateError } = await supabase
              .from("oxford_words")
              .update({ image_url: imageUrl })
              .eq("id", word.id);

            if (updateError) {
              console.error(`❌ Failed to update database:`, updateError);
            } else {
              console.log(`✅ Database updated successfully!`);
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

          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Error processing "${word.term}":`, error.message);
        }
      }
    } else {
      console.log("❌ No matching words found in database");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testSpecificWords();
