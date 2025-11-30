"use client";

import * as React from "react";
import { useAIChatStore } from "@/stores/ai/aiChat.store";
import { AI_ROLES, type AIRole } from "@/types/ai.types";
import type { CleanedAthleteStats } from "../../app/(protected)/profile/lib/utils/statsDataProcessor";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AIHeaderMenuProps {
  stats: CleanedAthleteStats | null;
  className?: string;
}

export function AIHeaderMenu({ stats, className = "" }: AIHeaderMenuProps) {
  const { openDialog } = useAIChatStore();

  // Convert stats to snapshot format
  const createStatsSnapshot = React.useCallback(() => {
    if (!stats) return null;

    try {
      return {
        athleteId: stats.profile?.athleteId || "unknown",
        // athleteName:
        //   stats.profile?.firstName && stats.profile?.lastName
        //     ? `${stats.profile.firstName} ${stats.profile.lastName}`
        //     : "Athlete",
        recordedAt: stats.recordedAt || new Date().toISOString(),
        overallScore: null, // Your data doesn't have overall score
        categories: {
          // Use the actual aggregate scores with proper structure
          strength: stats.aggregateScores?.strength || null,
          speed: stats.aggregateScores?.speed || null,
          stamina: stats.aggregateScores?.stamina || null,
          anthropometric: stats.anthropometrics?.basic || null,
        },
        // Pass complete data for AI analysis
        rawData: {
          anthropometrics: stats.anthropometrics,
          aggregateScores: stats.aggregateScores,
          tests: stats.tests,
          timeline: stats.timeline,
          injuries: stats.injuries,
        },
      };
    } catch (error) {
      console.error("❌ Error creating stats snapshot:", error);
      return null;
    }
  }, [stats]);

  console.log("AIHeaderMenu stats:", stats);

  const handleOpenAI = React.useCallback(
    (role: AIRole) => {
      const snapshot: any = createStatsSnapshot();

      if (!snapshot) {
        console.error("❌ No stats available for AI context");
        // Could show a toast notification here
        return;
      }

      //   console.log(`🤖 Opening AI ${role} with stats:`, snapshot.athleteName);
      openDialog(role, snapshot);
    },
    [createStatsSnapshot, openDialog]
  );

  // Don't render if no stats available
  if (!stats) {
    return null;
  }

  const roleColors: Record<AIRole, string> = {
    coach: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500",
    comparison: "bg-purple-500 hover:bg-purple-600 focus:ring-purple-500",
    nutritionist: "bg-green-500 hover:bg-green-600 focus:ring-green-500",
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}
      role="toolbar"
      aria-label="AI Assistant Tools"
    >
      {/* AI Header Label (optional, can remove for cleaner look) */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 mr-1">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <span>AI Tools</span>
      </div>

      {/* AI Role Buttons */}
      {(Object.keys(AI_ROLES) as AIRole[]).map((roleKey) => {
        const role = AI_ROLES[roleKey];
        return (
          <Button
            key={role.id}
            onClick={() => handleOpenAI(role.id)}
            className={`
              ${roleColors[role.id]}
              text-white font-medium
              shadow-md hover:shadow-lg
              transition-all duration-200
              focus:ring-2 focus:ring-offset-2
              text-sm sm:text-base
              px-3 py-2 sm:px-4 sm:py-2
            `}
            variant="default"
            size="sm"
            aria-label={role.description}
          >
            <span className="mr-1.5 text-base sm:text-lg">{role.icon}</span>
            <span className="hidden xs:inline">{role.label}</span>
            <span className="xs:hidden">{role.label.replace("AI ", "")}</span>
          </Button>
        );
      })}
    </div>
  );
}

// Compact version for mobile nav
export function AIHeaderMenuCompact({
  stats,
  className = "",
}: AIHeaderMenuProps) {
  const { openDialog } = useAIChatStore();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const createStatsSnapshot = React.useCallback(() => {
    if (!stats) return null;

    return {
      athleteId: stats.profile.athleteId,
      //   athleteName: `${stats.profile.firstName} ${stats.profile.lastName}`,
      recordedAt: stats.recordedAt,
      overallScore: stats.aggregateScores.strength,
      speedScore: stats.aggregateScores.speed,
      staminaScore: stats.aggregateScores.stamina,
      cleanedAthleteStats: stats,
      rawData: stats,
    };
  }, [stats]);

  const handleOpenAI = (role: AIRole) => {
    const snapshot: any = createStatsSnapshot();
    if (!snapshot) return;
    openDialog(role, snapshot);
    setIsExpanded(false);
  };

  if (!stats) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
        size="sm"
      >
        <Sparkles className="h-4 w-4 mr-1.5" />
        AI Tools
      </Button>

      {/* Dropdown Menu */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {(Object.keys(AI_ROLES) as AIRole[]).map((roleKey) => {
              const role = AI_ROLES[roleKey];
              return (
                <button
                  key={role.id}
                  onClick={() => handleOpenAI(role.id)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <span className="text-2xl shrink-0">{role.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">
                      {role.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {role.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
