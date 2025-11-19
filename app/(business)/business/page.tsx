import type { Metadata } from "next";
import HeroSection from "./components/HeroSection";
import FeaturesGrid from "./components/FeaturesGrid";

export const metadata: Metadata = {
  title: "Sparta Business - Empower Your Athletic Journey",
  description:
    "Discover Sparta's comprehensive platform for athletes, facilities, and sports professionals. Rent facilities, become a guide, and access premium equipment.",
};

export default function BusinessPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Grid */}
      <FeaturesGrid />

      {/* Optional: Stats Section */}
      <section className="py-16 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                1000+
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Active Athletes
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                20+
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Partner Institutions
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                500+
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Listed Facilities
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
