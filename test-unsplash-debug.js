// Test Unsplash API trực tiếp
// Using built-in fetch (Node.js 18+)

async function testUnsplash() {
  const UNSPLASH_ACCESS_KEY = "jZ8FIuZJz4F1cm7pdqAnCuMwPe_nk2z34CzBeOCy4M8";
  const term = "apple";

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", term);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", "squarish");

  console.log(`Testing Unsplash API for: "${term}"`);
  console.log(`URL: ${url.toString()}`);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    });

    console.log(`Status: ${res.status} ${res.statusText}`);

    // Log rate limit info
    const remaining = res.headers.get("X-Ratelimit-Remaining");
    const limit = res.headers.get("X-Ratelimit-Limit");
    console.log(`Rate limit: ${remaining}/${limit} remaining`);

    if (!res.ok) {
      console.error(`Error: ${res.status} - ${res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log(`Results found: ${data.results?.length || 0}`);

    if (data.results?.length > 0) {
      const hit = data.results[0];
      console.log(`Image URL: ${hit.urls?.small || "N/A"}`);
      console.log(`Alt description: ${hit.alt_description || "N/A"}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testUnsplash();
