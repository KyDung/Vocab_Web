// Test database connection và kiểm tra từ không có ảnh
import { supabase } from "./lib/supabase.js";

async function testDatabase() {
  console.log("Testing Supabase connection...");

  try {
    // Test connection
    const { data, error } = await supabase
      .from("oxford_words")
      .select("id, term, image_url")
      .limit(5);

    if (error) {
      console.error("Database error:", error);
      return;
    }

    console.log(`✅ Database connected successfully`);
    console.log(`Sample records: ${data?.length || 0}`);

    // Check words without images
    const { data: wordsWithoutImages, error: noImageError } = await supabase
      .from("oxford_words")
      .select("id, term")
      .is("image_url", null)
      .limit(10);

    if (noImageError) {
      console.error("Error fetching words without images:", noImageError);
      return;
    }

    console.log(`\nWords without images: ${wordsWithoutImages?.length || 0}`);
    if (wordsWithoutImages?.length > 0) {
      console.log("Sample words needing images:");
      wordsWithoutImages.forEach((word, i) => {
        console.log(`${i + 1}. ${word.term} (ID: ${word.id})`);
      });
    }

    // Check total words with images
    const { count: totalWithImages } = await supabase
      .from("oxford_words")
      .select("*", { count: "exact", head: true })
      .not("image_url", "is", null);

    console.log(`\nTotal words WITH images: ${totalWithImages || 0}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

testDatabase();
