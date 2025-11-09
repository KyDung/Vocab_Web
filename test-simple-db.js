// Simple test for database connection using the same setup as the app
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing database connection...");
console.log("URL:", supabaseUrl ? "Present" : "Missing");
console.log("Key:", supabaseKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDB() {
  try {
    // Test 1: Count total words
    console.log("\n1. Testing word count...");
    const { count, error: countError } = await supabase
      .from("oxford_words")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Count error:", countError);
      return;
    }
    console.log(`✅ Total words in database: ${count}`);

    // Test 2: Count words without images
    console.log("\n2. Testing words without images...");
    const { count: noImageCount, error: noImageError } = await supabase
      .from("oxford_words")
      .select("*", { count: "exact", head: true })
      .is("image_url", null);

    if (noImageError) {
      console.error("No image count error:", noImageError);
      return;
    }
    console.log(`📸 Words without images: ${noImageCount}`);

    // Test 3: Get a few words without images
    console.log("\n3. Sample words without images...");
    const { data: samples, error: sampleError } = await supabase
      .from("oxford_words")
      .select("id, term, image_url")
      .is("image_url", null)
      .limit(3);

    if (sampleError) {
      console.error("Sample error:", sampleError);
      return;
    }

    console.log("Sample words needing images:");
    samples?.forEach((word) => {
      console.log(
        `  - ID: ${word.id}, Term: "${word.term}", Image: ${
          word.image_url || "null"
        }`
      );
    });

    // Test 4: Try updating one word (if exists)
    if (samples && samples.length > 0) {
      const testWord = samples[0];
      console.log(`\n4. Testing update for word "${testWord.term}"...`);

      const testImageUrl = "https://example.com/test-image.jpg";
      const { error: updateError } = await supabase
        .from("oxford_words")
        .update({ image_url: testImageUrl })
        .eq("id", testWord.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return;
      }

      console.log("✅ Test update successful");

      // Revert the test update
      const { error: revertError } = await supabase
        .from("oxford_words")
        .update({ image_url: null })
        .eq("id", testWord.id);

      if (revertError) {
        console.error("Revert error:", revertError);
      } else {
        console.log("✅ Test update reverted");
      }
    }

    console.log("\n🎉 Database connection test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testDB();
