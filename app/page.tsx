"use client";

import { useEffect } from "react";
import { useWords } from "@/lib/words-context";
import { Hero } from "@/components/hero";
import { FeatureCards } from "@/components/feature-cards";
import { StatsSection } from "@/components/stats-section";
import { AboutSection } from "@/components/about-section";

export default function HomePage() {
  const { loadOxfordWords, loadTopicStats, oxfordLoaded, oxfordLoading } =
    useWords();

  // Preload data immediately when homepage loads
  useEffect(() => {
    console.log("🏠 Homepage mounted - triggering preload...");

    // Start loading Oxford words immediately
    if (!oxfordLoaded && !oxfordLoading) {
      console.log("🚀 Preloading Oxford words from homepage...");
      loadOxfordWords();
    }

    // Also preload topic stats
    loadTopicStats();
  }, [loadOxfordWords, loadTopicStats, oxfordLoaded, oxfordLoading]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Hero />
      <FeatureCards />
      <StatsSection />
      <AboutSection />
    </div>
  );
}
