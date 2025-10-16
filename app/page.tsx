import { Hero } from "@/components/hero";
import { FeatureCards } from "@/components/feature-cards";
import { StatsSection } from "@/components/stats-section";
import { AboutSection } from "@/components/about-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Hero />
      <FeatureCards />
      <StatsSection />
      <AboutSection />
    </div>
  );
}
