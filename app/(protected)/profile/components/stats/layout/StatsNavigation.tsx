// components/stats/layout/StatsNavigation.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Clock, Zap, Activity, Heart, User } from "lucide-react";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { getTestCountByCategory } from "../../../lib/utils/statsDataProcessor";

type ViewType =
  | "overview"
  | "timeline"
  | "strength"
  | "speed"
  | "stamina"
  | "anthropometric";

interface StatsNavigationProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  stats: CleanedAthleteStats;
}

export function StatsNavigation({
  activeView,
  onViewChange,
  stats,
}: StatsNavigationProps) {
  const testCounts = getTestCountByCategory(stats);

  const tabs = [
    {
      id: "overview" as ViewType,
      label: "Overview",
      icon: LayoutGrid,
      color: "text-gray-600",
      activeColor: "text-blue-600",
      activeBg: "bg-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "timeline" as ViewType,
      label: "Timeline",
      icon: Clock,
      color: "text-gray-600",
      activeColor: "text-purple-600",
      activeBg: "bg-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: "anthropometric" as ViewType,
      label: "Body Composition",
      icon: User,
      color: "text-gray-600",
      activeColor: "text-orange-600",
      activeBg: "bg-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      id: "strength" as ViewType,
      label: "Strength",
      icon: Zap,
      count: testCounts.strength,
      color: "text-gray-600",
      activeColor: "text-blue-600",
      activeBg: "bg-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "speed" as ViewType,
      label: "Speed",
      icon: Activity,
      count: testCounts.speed,
      color: "text-gray-600",
      activeColor: "text-green-600",
      activeBg: "bg-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "stamina" as ViewType,
      label: "Stamina",
      icon: Heart,
      count: testCounts.stamina,
      color: "text-gray-600",
      activeColor: "text-purple-600",
      activeBg: "bg-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={cn(
                "flex-1 px-4 py-4 flex items-center justify-center gap-2 transition-all relative",
                "hover:bg-gray-50",
                isActive && tab.bgColor
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? tab.activeColor : tab.color
                )}
              />
              <span
                className={cn(
                  "font-semibold text-sm transition-colors",
                  isActive ? tab.activeColor : tab.color
                )}
              >
                {tab.label}
              </span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-xs font-bold",
                    isActive
                      ? `${tab.activeColor} ${tab.bgColor}`
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-1 rounded-t",
                    tab.activeBg
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Navigation - Horizontal Scroll */}
      <div className="md:hidden overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={cn(
                  "px-4 py-3 flex flex-col items-center gap-1 transition-all min-w-[100px] relative",
                  "hover:bg-gray-50",
                  isActive && tab.bgColor
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? tab.activeColor : tab.color
                  )}
                />
                <span
                  className={cn(
                    "font-semibold text-xs transition-colors",
                    isActive ? tab.activeColor : tab.color
                  )}
                >
                  {tab.label}
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs font-bold",
                      isActive
                        ? `${tab.activeColor} ${tab.bgColor}`
                        : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <div
                    className={cn(
                      "absolute bottom-0 left-0 right-0 h-1 rounded-t",
                      tab.activeBg
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
