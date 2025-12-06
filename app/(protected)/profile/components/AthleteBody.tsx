"use client";

import React, { useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Camera,
  ListChecks,
  BarChart2,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import AboutTab from "./AboutTab";
import MediaTab from "./MediaTab";
import MatchTab from "./MatchTab";
import StatsTab from "./StatTab";
import { useAthleteStats } from "../hooks/profile/useAthleteStats";
import TeamTab from "./TeamTab";

const TABS = [
  { id: "about", label: "About", icon: Info },
  { id: "media", label: "Media", icon: Camera },
  { id: "match", label: "Matches", icon: ListChecks },
  { id: "stats", label: "Stats", icon: BarChart2 },
  { id: "Team", label: "Team", icon: Users },
] as const;

export default function AthleteBody({
  athlete,
  media,
  matches,
  isOwnProfile,
}: any) {
  const [activeSection, setActiveSection] = useState<
    "about" | "media" | "match" | "stats" | "Team"
  >("about");
  const [isPending, startTransition] = useTransition();
  const {
    data: stats,
    isLoading: statsLoading,
    error,
  } = useAthleteStats(athlete.clerkUserId);

  const handleNavigation = useCallback(
    (section: (typeof TABS)[number]["id"]) => {
      startTransition(() => {
        setActiveSection(section);
      });
    },
    []
  );

  const activeTab = TABS.find((tab) => tab.id === activeSection)!;

  return (
    <section className="w-full max-w-7xl mx-auto mt-8 lg:mt-12">
      {/* Modern Glassmorphism Tab Navigation */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl shadow-slate-200/50 p-1 sticky top-4 z-20 mx-4 lg:mx-0">
        <nav className="flex flex-col sm:flex-row gap-1 p-1">
          {TABS.map((tab) => {
            const isActive = tab.id === activeSection;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation(tab.id)}
                className={cn(
                  "flex-1 sm:flex-none h-14 px-4 gap-3 font-semibold text-sm tracking-tight transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-linear-to-r from-blue-600 to-emerald-600 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40"
                    : "text-slate-700 hover:text-slate-900 hover:bg-white/80 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5"
                )}
              >
                <tab.icon
                  size={20}
                  className={cn(
                    "shrink-0 transition-transform group-hover:scale-110",
                    isActive && "group-hover:scale-105"
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Active Tab Glow Effect */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bg-linear-to-r from-blue-600/20 to-emerald-600/20 -inset-1 rounded-2xl blur-xl -z-10"
                    transition={{ duration: 0.3 }}
                  />
                )}

                {/* Loading Spinner */}
                {isPending && tab.id === activeSection && (
                  <Loader2 className="w-4 h-4 ml-auto animate-spin shrink-0" />
                )}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Content Area with Smooth Transitions */}
      <div className="relative mt-8 mx-4 lg:mx-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-linear-to-b from-slate-50/80 to-white/70 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl shadow-slate-200/25 p-8 lg:p-12 min-h-[400px]"
          >
            {activeSection === "about" && <AboutTab athlete={athlete} />}
            {activeSection === "media" && (
              <MediaTab media={media} isOwnProfile={isOwnProfile} />
            )}
            {activeSection === "match" && (
              <MatchTab matches={matches} isOwnProfile={isOwnProfile} />
            )}
            {activeSection === "stats" && (
              <StatsTab
                stats={stats}
                isOwnProfile={isOwnProfile}
                username={athlete.username}
                isLoading={statsLoading}
              />
            )}
            {activeSection === "Team" && (
              <TeamTab
                isOwnProfile={isOwnProfile}
                username={athlete.username}
                isLoadings={statsLoading}
                profileData={athlete}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Tab Labels */}
        <div className="lg:hidden flex justify-center mt-4 space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200",
                activeSection === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
