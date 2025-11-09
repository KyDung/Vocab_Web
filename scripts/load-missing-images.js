// Admin script to load missing images in batches
// Usage:
// 1. Start your Next.js dev server: npm run dev
// 2. Run this script: node scripts/load-missing-images.js

const fetch = require("node-fetch");

const BATCH_SIZE = 40; // Load 40 images per batch (safe for 50/hour limit)
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between requests
const DELAY_BETWEEN_BATCHES = 60000; // 1 minute between batches

async function loadMissingImages() {
  console.log("🚀 Starting missing images loading script...");

  try {
    // Get words without images from your API
    const response = await fetch(
      "http://localhost:3000/api/oxford?limit=10000"
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const words = data.words || [];

    const wordsWithoutImages = words.filter((word) => !word.image_url);
    console.log(`📊 Found ${wordsWithoutImages.length} words without images`);

    if (wordsWithoutImages.length === 0) {
      console.log("✅ All words already have images!");
      return;
    }

    // Process in batches
    const totalBatches = Math.ceil(wordsWithoutImages.length / BATCH_SIZE);
    console.log(
      `📦 Processing ${totalBatches} batches of ${BATCH_SIZE} words each`
    );

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = Math.min(
        startIndex + BATCH_SIZE,
        wordsWithoutImages.length
      );
      const currentBatch = wordsWithoutImages.slice(startIndex, endIndex);

      console.log(
        `\n🔄 Processing batch ${batchIndex + 1}/${totalBatches} (words ${
          startIndex + 1
        }-${endIndex})`
      );

      // Process each word in the batch
      for (let i = 0; i < currentBatch.length; i++) {
        const word = currentBatch[i];
        console.log(
          `  📸 Loading image for "${word.term}" (${i + 1}/${
            currentBatch.length
          })`
        );

        try {
          const imageResponse = await fetch(
            "http://localhost:3000/api/oxford/image",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ term: word.term }),
            }
          );

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            console.log(
              `    ✅ Success: ${imageData.image_url?.substring(0, 50)}...`
            );
          } else {
            const errorData = await imageResponse.json();
            console.log(`    ❌ Failed: ${errorData.error}`);
          }
        } catch (error) {
          console.log(`    ❌ Error: ${error.message}`);
        }

        // Delay between requests
        if (i < currentBatch.length - 1) {
          console.log(`    ⏳ Waiting ${DELAY_BETWEEN_REQUESTS / 1000}s...`);
          await new Promise((resolve) =>
            setTimeout(resolve, DELAY_BETWEEN_REQUESTS)
          );
        }
      }

      // Delay between batches (except for the last batch)
      if (batchIndex < totalBatches - 1) {
        console.log(
          `\n⏸️ Batch complete. Waiting ${
            DELAY_BETWEEN_BATCHES / 1000
          }s before next batch...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    console.log("\n🎉 All batches completed!");
  } catch (error) {
    console.error("❌ Script error:", error);
  }
}

// Run the script
loadMissingImages();
