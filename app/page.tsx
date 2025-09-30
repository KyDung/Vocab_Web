import { Hero } from "@/components/hero";
import { FeatureCards } from "@/components/feature-cards";
import { AboutSection } from "@/components/about-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Hero />
      <FeatureCards />
      <AboutSection />
    </div>
  );
}
