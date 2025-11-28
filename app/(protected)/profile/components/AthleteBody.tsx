"use client";

import React, { useState, useCallback } from "react";
import AboutTab from "./AboutTab";
import MediaTab from "./MediaTab";
import MatchTab from "./MatchTab";
import StatsTab from "./StatTab";
import { Info, Camera, ListChecks, BarChart2 } from "lucide-react";
import { useAthleteStats } from "../hooks/profile/useAthleteStats";
export default function AthleteBody({
  athlete,
  media,
  matches,
  isOwnProfile,
}: any) {
  const [activeSection, setActiveSection] = useState("about");

  const handleNavigation = useCallback((section: string) => {
    setActiveSection(section);
  }, []);
  const { data, isLoading, error } = useAthleteStats(athlete.clerkUserId);
  return (
    <section className="max-w-6xl mx-auto mt-10 bg-white rounded-xl shadow-md p-6">
      {/* Responsive Navigation Menu */}
      <nav className="flex flex-col sm:flex-row sm:justify-center mb-4 space-y-2 sm:space-y-0 sm:space-x-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeSection === "about" ? "bg-gray-300" : "hover:bg-gray-100"
          }`}
          onClick={() => handleNavigation("about")}
        >
          <Info size={18} /> About
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeSection === "media" ? "bg-gray-300" : "hover:bg-gray-100"
          }`}
          onClick={() => handleNavigation("media")}
        >
          <Camera size={18} /> Media
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeSection === "match" ? "bg-gray-300" : "hover:bg-gray-100"
          }`}
          onClick={() => handleNavigation("match")}
        >
          <ListChecks size={18} /> Match
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded ${
            activeSection === "stats" ? "bg-gray-300" : "hover:bg-gray-100"
          }`}
          onClick={() => handleNavigation("stats")}
        >
          <BarChart2 size={18} /> Stats
        </button>
      </nav>

      {/* Show selected section */}
      {activeSection === "about" && <AboutTab athlete={athlete} />}
      {activeSection === "media" && (
        <MediaTab media={media} isOwnProfile={isOwnProfile} />
      )}
      {activeSection === "match" && (
        <MatchTab matches={matches} isOwnProfile={isOwnProfile} />
      )}
      {activeSection === "stats" && (
        <StatsTab
          stats={data}
          isOwnProfile={isOwnProfile}
          username={athlete.username}
        />
      )}
    </section>
  );
}
