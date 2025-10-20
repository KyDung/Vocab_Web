// Test trực tiếp Unsplash API để kiểm tra key và quota
const fs = require("fs");

async function testUnsplashAPI() {
  // Đọc API key từ .env.local
  let apiKey = null;
  try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const match = envContent.match(/UNSPLASH_ACCESS_KEY=(.+)/);
    apiKey = match ? match[1].trim() : null;
  } catch (error) {
    console.error("❌ Cannot read .env.local file");
    return;
  }

  console.log("🔑 Testing Unsplash API...");
  console.log(
    "📋 API Key:",
    apiKey
      ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`
      : "NOT FOUND"
  );

  if (!apiKey) {
    console.error("❌ UNSPLASH_ACCESS_KEY not found in .env.local");
    return;
  }

  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", "test");
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "squarish");

    console.log("🌐 Request URL:", url.toString());
    console.log(
      "🔐 Authorization header:",
      `Client-ID ${apiKey.substring(0, 10)}...`
    );

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${apiKey}`,
        "Accept-Version": "v1",
      },
    });

    console.log("\n📊 Response Details:");
    console.log("Status:", response.status, response.statusText);
    console.log("Headers:");

    // Log important headers
    const headers = {
      "X-Ratelimit-Limit": response.headers.get("X-Ratelimit-Limit"),
      "X-Ratelimit-Remaining": response.headers.get("X-Ratelimit-Remaining"),
      "X-Ratelimit-Reset": response.headers.get("X-Ratelimit-Reset"),
      "Content-Type": response.headers.get("Content-Type"),
    };

    Object.entries(headers).forEach(([key, value]) => {
      if (value) console.log(`  ${key}: ${value}`);
    });

    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ Success!");
      console.log("Total results:", data.total);
      console.log("Results count:", data.results?.length || 0);

      if (data.results && data.results.length > 0) {
        console.log("First image URL:", data.results[0].urls.small);
      }
    } else {
      console.log("\n❌ Error Response:");
      const errorText = await response.text();
      console.log("Error body:", errorText);

      if (response.status === 403) {
        console.log("\n🚫 HTTP 403 Forbidden - Possible causes:");
        console.log("1. Invalid API key");
        console.log("2. API key not activated");
        console.log("3. Rate limit exceeded");
        console.log("4. Application needs approval for production");
        console.log("5. Wrong key type (need Access Key, not Secret Key)");
      }
    }
  } catch (error) {
    console.error("\n💥 Network/Fetch Error:", error.message);
  }
}

// Chạy test
testUnsplashAPI();
