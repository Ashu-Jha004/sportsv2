"use client";

import * as React from "react";
import type { StatsSnapshot } from "@/types/ai.types";
import { TrendingUp, Activity, Zap, Heart } from "lucide-react";

interface StatsSidebarProps {
  stats: StatsSnapshot;
}

export function StatsSidebar({ stats }: StatsSidebarProps) {
  // Safely access categories
  const categories = stats?.categories || {};
  const hasCategories = Object.keys(categories).length > 0;

  return (
    <aside className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            Performance Context
          </h3>
          <p className="text-sm text-gray-600">
            Data the AI is using for analysis
          </p>
        </div>

        {/* Athlete Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="text-sm">
            <div className="font-semibold text-gray-900 mb-2">
              {stats?.athleteName || "Unknown Athlete"}
            </div>
            <div className="text-gray-600">
              Last Updated:{" "}
              {stats?.recordedAt
                ? new Date(stats.recordedAt).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        {stats?.overallScore != null && (
          <div className="bg-linear-to-br from-blue-500 to-purple-500 rounded-lg p-4 mb-4 text-white">
            <div className="text-sm opacity-90 mb-1">Overall Score</div>
            <div className="text-3xl font-bold">
              {stats.overallScore}
              <span className="text-lg opacity-75">/100</span>
            </div>
          </div>
        )}

        {/* Category Scores */}
        {hasCategories ? (
          <div className="space-y-3">
            {categories.strength && (
              <CategoryCard
                title="Strength"
                icon={<TrendingUp className="h-4 w-4" />}
                data={categories.strength}
                color="text-blue-600"
              />
            )}

            {categories.speed && (
              <CategoryCard
                title="Speed"
                icon={<Zap className="h-4 w-4" />}
                data={categories.speed}
                color="text-yellow-600"
              />
            )}

            {categories.stamina && (
              <CategoryCard
                title="Stamina"
                icon={<Heart className="h-4 w-4" />}
                data={categories.stamina}
                color="text-red-600"
              />
            )}

            {categories.anthropometric && (
              <CategoryCard
                title="Anthropometric"
                icon={<Activity className="h-4 w-4" />}
                data={categories.anthropometric}
                color="text-green-600"
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className="text-sm text-gray-500">No category data available</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function CategoryCard({
  title,
  icon,
  data,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  data: any;
  color: string;
}) {
  // Extract score safely from various possible structures
  let score = null;
  let subTests: Array<{ name: string; value: number }> = [];

  if (data) {
    // Try to find a score value directly
    score = data?.score ?? data?.averageScore ?? data?.overall;

    // If data is an object with sub-properties (like {muscleMass, enduranceStrength})
    if (typeof data === "object" && score == null) {
      // Extract sub-test values
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          // Nested test with score
          const testScore = (value as any).score ?? (value as any).value;
          if (testScore != null && typeof testScore === "number") {
            subTests.push({
              name: formatTestName(key),
              value: testScore,
            });
          }
        } else if (typeof value === "number") {
          // Direct numeric value
          subTests.push({
            name: formatTestName(key),
            value: value,
          });
        }
      });

      // Calculate average if we have sub-tests
      if (subTests.length > 0) {
        const avg =
          subTests.reduce((sum, test) => sum + test.value, 0) / subTests.length;
        score = Math.round(avg);
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={color}>{icon}</div>
        <div className="font-semibold text-sm text-gray-900">{title}</div>
      </div>

      {score != null ? (
        <>
          <div className="text-2xl font-bold text-gray-900">
            {typeof score === "number" ? score.toFixed(0) : score}
            <span className="text-sm text-gray-500 font-normal">/100</span>
          </div>

          {/* Show sub-tests if available */}
          {subTests.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
              {subTests.slice(0, 3).map((test, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-xs text-gray-600"
                >
                  <span className="truncate mr-2">{test.name}:</span>
                  <span className="font-medium shrink-0">
                    {test.value.toFixed(0)}
                  </span>
                </div>
              ))}
              {subTests.length > 3 && (
                <div className="text-xs text-gray-400 text-center pt-1">
                  +{subTests.length - 3} more
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500">No data</div>
      )}
    </div>
  );
}

// Helper to format test names (camelCase to readable)
function formatTestName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1") // Add space before capitals
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
}
