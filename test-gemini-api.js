// Load environment variables
require("dotenv").config({ path: ".env.local" });

// Test Gemini API để kiểm tra quota và functionality
const testGeminiAPI = async () => {
  console.log("🤖 Testing Gemini API...");

  // Đọc API key từ environment variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY environment variable is not set!");
    console.log("Please add GEMINI_API_KEY to your .env.local file");
    return;
  }

  try {
    console.log(
      "📋 API Key:",
      `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 5)}`
    );

    const testPayload = {
      contents: [
        {
          parts: [
            {
              text: "Test message: Please respond with 'Hello from Gemini API' to confirm you're working.",
            },
          ],
        },
      ],
    };

    console.log("🌐 Sending test request to Gemini API...");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify(testPayload),
      }
    );

    console.log("\n📊 Response Details:");
    console.log("Status:", response.status, response.statusText);

    // Log response headers để xem quota
    const headers = {
      "X-Goog-Quota-User": response.headers.get("X-Goog-Quota-User"),
      "X-Goog-Quota-Project": response.headers.get("X-Goog-Quota-Project"),
      "Content-Type": response.headers.get("Content-Type"),
      Date: response.headers.get("Date"),
    };

    console.log("Headers:");
    Object.entries(headers).forEach(([key, value]) => {
      if (value) console.log(`  ${key}: ${value}`);
    });

    if (response.ok) {
      const data = await response.json();
      console.log("\n✅ Success!");
      console.log("Response structure:", Object.keys(data));

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        console.log(
          "Generated text:",
          data.candidates[0].content.parts[0].text
        );
      } else {
        console.log(
          "❌ Unexpected response format:",
          JSON.stringify(data, null, 2)
        );
      }
    } else {
      console.log("\n❌ Error Response:");
      const errorText = await response.text();
      console.log("Error body:", errorText);

      if (response.status === 400) {
        console.log("\n🚫 HTTP 400 Bad Request - Possible causes:");
        console.log("1. Invalid request format");
        console.log("2. Missing required fields");
        console.log("3. Invalid model name");
      } else if (response.status === 403) {
        console.log("\n🚫 HTTP 403 Forbidden - Possible causes:");
        console.log("1. Invalid API key");
        console.log("2. API not enabled");
        console.log("3. Billing not set up");
        console.log("4. IP restrictions");
      } else if (response.status === 429) {
        console.log("\n🚫 HTTP 429 Too Many Requests - Quota exceeded");
        console.log("1. Rate limit exceeded");
        console.log("2. Daily quota exceeded");
        console.log("3. Need to upgrade plan");
      }
    }
  } catch (error) {
    console.error("\n💥 Network/Fetch Error:", error.message);
  }
};

// Test với vocabulary evaluation
const testVocabEvaluation = async () => {
  console.log("\n📚 Testing vocabulary evaluation endpoint...");

  try {
    const response = await fetch(
      "http://localhost:3002/api/ai-evaluate-simple",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: "apple",
          meaning: "quả táo",
          userInput: "I eat an apple every day",
          source: "oxford",
        }),
      }
    );

    console.log("Evaluation API Status:", response.status);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Evaluation Success:", result);
    } else {
      const errorText = await response.text();
      console.log("❌ Evaluation Error:", errorText);
    }
  } catch (error) {
    console.log("💥 Evaluation Test Error:", error.message);
  }
};

// Chạy tests
console.log("=".repeat(50));
testGeminiAPI().then(() => {
  console.log("\n" + "=".repeat(50));
  return testVocabEvaluation();
});
