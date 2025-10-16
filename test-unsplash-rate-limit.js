// Test script to check Unsplash rate limits
const testUnsplashRateLimit = async () => {
  try {
    console.log("🧪 Testing Unsplash rate limit...");

    const response = await fetch("http://localhost:3000/api/oxford/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term: "test" }),
    });

    console.log("📊 Response status:", response.status);
    console.log(
      "📊 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log("📦 Response data:", data);
  } catch (error) {
    console.error("❌ Test error:", error);
  }
};

// Run the test
testUnsplashRateLimit();
