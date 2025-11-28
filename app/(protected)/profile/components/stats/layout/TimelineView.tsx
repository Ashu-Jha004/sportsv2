// components/stats/layout/TimelineView.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import {
  formatTestDate,
  formatTestTime,
  snakeToTitle,
} from "../../../lib/utils/formatting";
import { Search, Calendar, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
  stats: CleanedAthleteStats;
}

export function TimelineView({ stats }: TimelineViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<
    "all" | "strength" | "speed" | "stamina"
  >("all");

  const { timeline } = stats;

  // Filter timeline
  const filteredTimeline = timeline.filter((entry) => {
    const matchesSearch = searchQuery
      ? entry.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        snakeToTitle(entry.testName)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory =
      filterCategory === "all" || entry.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Group by date
  const groupedByDate = filteredTimeline.reduce((acc, entry) => {
    const date = entry.date.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof timeline>);

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "strength":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "speed":
        return "bg-green-100 text-green-700 border-green-200";
      case "stamina":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "strength":
        return "💪";
      case "speed":
        return "⚡";
      case "stamina":
        return "❤️";
      default:
        return "📊";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory("all")}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  filterCategory === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterCategory("strength")}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  filterCategory === "strength"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                )}
              >
                Strength
              </button>
              <button
                onClick={() => setFilterCategory("speed")}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  filterCategory === "speed"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                )}
              >
                Speed
              </button>
              <button
                onClick={() => setFilterCategory("stamina")}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  filterCategory === "stamina"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                )}
              >
                Stamina
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredTimeline.length} of {timeline.length} tests
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No tests found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((date, dateIndex) => (
            <div key={date} className="relative">
              {/* Date Header */}
              <div className="sticky top-0 z-10 bg-linear-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 p-4 mb-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">
                    {formatTestDate(date)}
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {groupedByDate[date].length} tests
                  </Badge>
                </div>
              </div>

              {/* Timeline Line */}
              {dateIndex < sortedDates.length - 1 && (
                <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-linear-to-b from-gray-300 to-transparent" />
              )}

              {/* Tests for this date */}
              <div className="space-y-3 ml-16 relative">
                {groupedByDate[date].map((entry, index) => (
                  <div key={`${entry.testName}-${index}`} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-20 top-4 h-4 w-4 rounded-full bg-white border-4 border-blue-600 shadow" />

                    {/* Test Card */}
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {getCategoryIcon(entry.category)}
                              </span>
                              <h4 className="font-semibold text-gray-900">
                                {snakeToTitle(entry.testName)}
                              </h4>
                              <Badge
                                className={cn(
                                  "text-xs border",
                                  getCategoryColor(entry.category)
                                )}
                              >
                                {entry.category}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <span>⏱️</span>
                                {formatTestTime(entry.recordedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <span>📊</span>
                                {entry.keyMetric}
                              </span>
                            </div>
                          </div>

                          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            View Details →
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
