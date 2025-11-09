// Auto Image Loading Service
// Automatically loads missing images in background

class AutoImageLoader {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  private readonly INTERVAL_MS = 10000; // 10 seconds
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;

  constructor() {
    console.log("🖼️ Auto Image Loader initialized");
  }

  // Start automatic loading
  start() {
    if (this.isActive) {
      console.log("⚠️ Auto loader already active");
      return;
    }

    console.log("🚀 Starting auto image loading...");
    this.isActive = true;
    this.retryCount = 0;

    // Immediate first call
    this.loadBatch();

    // Set interval for continuous loading
    this.intervalId = setInterval(() => {
      this.loadBatch();
    }, this.INTERVAL_MS);
  }

  // Stop automatic loading
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log("⏹️ Auto image loading stopped");
  }

  // Load a batch of images
  private async loadBatch() {
    try {
      console.log("📦 Loading image batch...");

      const response = await fetch("/api/oxford/auto-load-images", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "completed") {
        console.log("🎉 All images loaded! Stopping auto loader.");
        this.stop();
        return;
      }

      if (data.status === "success") {
        console.log(
          `✅ Loaded ${data.processed} images. Remaining: ${data.remainingWords}`
        );
        this.retryCount = 0; // Reset retry count on success

        // Dispatch event for UI updates
        window.dispatchEvent(
          new CustomEvent("imagesLoaded", {
            detail: {
              processed: data.processed,
              remaining: data.remainingWords,
              results: data.results,
            },
          })
        );
      } else if (data.status === "rate_limited") {
        console.log(`⏳ Rate limited. Waiting ${data.waitTime}ms...`);
      } else if (data.status === "busy") {
        console.log("⏸️ Server busy loading images...");
      } else {
        console.warn("⚠️ Unexpected response:", data);
      }
    } catch (error) {
      console.error("❌ Auto load error:", error);
      this.retryCount++;

      if (this.retryCount >= this.MAX_RETRIES) {
        console.error(
          `💥 Max retries (${this.MAX_RETRIES}) reached. Stopping auto loader.`
        );
        this.stop();
      }
    }
  }

  // Get current status
  async getStatus() {
    try {
      const response = await fetch("/api/oxford/auto-load-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "status" }),
      });

      return await response.json();
    } catch (error) {
      console.error("Failed to get status:", error);
      return null;
    }
  }

  // Check if loader is active
  isRunning() {
    return this.isActive;
  }
}

// Create singleton instance
const autoImageLoader = new AutoImageLoader();

export default autoImageLoader;
