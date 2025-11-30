"use client";

import React, { useMemo, useTransition } from "react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Zap,
  BarChart3,
  Crown,
  TrendingUp,
  ArrowUp,
  Sparkles,
  Target,
  Users,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useGuideFinderStore } from "@/stores/guide/Finder/guideFinder.store";
import { useRouter } from "next/navigation";
import { StatsFallback } from "./StatsFallback";

type Attribute =
  | "Strength & Power"
  | "Speed"
  | "Agility"
  | "Recovery"
  | "Flexibility";

interface DataPoint {
  attribute: Attribute;
  athlete: number;
  perfectHuman: number;
}

interface StatsTabProps {
  stats?: any;
  username?: string;
  isOwnProfile?: boolean;
  isLoading?: boolean;
}

const perfectHumanDataPoints: DataPoint[] = [
  { attribute: "Strength & Power", athlete: 0, perfectHuman: 100 },
  { attribute: "Speed", athlete: 0, perfectHuman: 100 },
  { attribute: "Agility", athlete: 0, perfectHuman: 100 },
  { attribute: "Recovery", athlete: 0, perfectHuman: 100 },
  { attribute: "Flexibility", athlete: 0, perfectHuman: 100 },
];

function generateRandomAttributes(): Record<Attribute, number> {
  return {
    "Strength & Power": Math.floor(50 + Math.random() * 45),
    Speed: Math.floor(30 + Math.random() * 35),
    Agility: Math.floor(30 + Math.random() * 35),
    Recovery: Math.floor(30 + Math.random() * 35),
    Flexibility: Math.floor(30 + Math.random() * 35),
  };
}

function getColorClass(value: number): string {
  if (value >= 85) return "bg-emerald-500 text-white shadow-emerald-500/25";
  if (value >= 70) return "bg-lime-500 text-white shadow-lime-500/25";
  if (value >= 55) return "bg-yellow-500 text-white shadow-yellow-500/25";
  if (value >= 40) return "bg-orange-500 text-white shadow-orange-500/25";
  return "bg-rose-500 text-white shadow-rose-500/25";
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const athleteValue = payload[0]?.value ?? 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/98 backdrop-blur-2xl border border-slate-200/60 shadow-2xl rounded-2xl p-4 sm:p-5 min-w-[180px] sm:min-w-[220px] font-inter max-w-[90vw]"
      >
        <h3 className="font-bold text-base sm:text-lg text-slate-900 capitalize mb-3 sm:mb-4 border-b border-slate-200 pb-2">
          {label}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-linear-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg shrink-0" />
              <span className="font-semibold text-slate-700 text-sm sm:text-base truncate">
                Your Score
              </span>
            </div>
            <Badge
              className={cn(
                "px-2 py-1 sm:px-3 sm:py-1 font-bold shadow-md text-sm sm:text-base",
                getColorClass(athleteValue)
              )}
            >
              {athleteValue}%
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-linear-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg shrink-0" />
              <span className="font-semibold text-slate-700 text-sm sm:text-base truncate">
                Perfect Human
              </span>
            </div>
            <Badge className="bg-linear-to-r from-emerald-500 to-teal-600 text-white px-2 py-1 sm:px-3 sm:py-1 font-bold shadow-md text-sm sm:text-base">
              100%
            </Badge>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
}

export default function StatsTab({
  stats,
  username = "",
  isOwnProfile = false,
  isLoading = false,
}: StatsTabProps) {
  const [isPending, startTransition] = useTransition();
  const openDialog = useGuideFinderStore((s) => s.openDialog);
  const router = useRouter();

  const athleteAttributes = useMemo(() => generateRandomAttributes(), []);
  const data: DataPoint[] = perfectHumanDataPoints.map((point) => ({
    ...point,
    athlete: athleteAttributes[point.attribute],
  }));

  const athleteValues = data.map((d) => d.athlete);
  const minScore = Math.min(...athleteValues);
  const maxScore = Math.max(...athleteValues);
  const avgScore = Math.round(
    athleteValues.reduce((a, b) => a + b, 0) / athleteValues.length
  );

  const handleFindGuide = () =>
    startTransition(() => openDialog({ sportFilter: "primary" }));
  const handleDetailedReport = () =>
    startTransition(() => router.push(`/profile/${username}/stats`));

  if (stats?.hasStats === false || isLoading) {
    return <StatsFallback isSelf={isOwnProfile} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-white to-emerald-50/30 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Mobile-First Hero */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 bg-linear-to-r from-slate-900 via-blue-900 to-emerald-900 bg-clip-text text-transparent text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight mb-4 sm:mb-6 px-2">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-lg shrink-0" />
            <span>Performance Radar</span>
            <Crown className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 drop-shadow-lg shrink-0" />
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 font-medium max-w-2xl sm:max-w-3xl mx-auto leading-relaxed px-2">
            Benchmark your athletic abilities against the perfect human athlete
          </p>
        </motion.section>

        {/* Mobile-Optimized Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto w-full"
        >
          {/* Find Guide Card */}
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all duration-400"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent backdrop-blur-sm -z-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3 text-center leading-tight">
                Level Up Now
              </h3>
              <p className="text-emerald-100 text-base sm:text-lg mb-6 text-center font-medium leading-relaxed px-1">
                Connect with certified guides to improve your weakest areas
              </p>
              <Button
                onClick={handleFindGuide}
                disabled={isPending}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold shadow-2xl shadow-white/30 hover:shadow-white/50 hover:scale-[1.01] transition-all duration-300 bg-white text-emerald-700 border-0 rounded-xl"
              >
                {isPending ? (
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Target className="w-5 h-5 mr-2" />
                )}
                Find Guide
              </Button>
            </div>
          </motion.div>

          {/* Detailed Report Card */}
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 transition-all duration-400"
          >
            <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent backdrop-blur-sm -z-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 mx-auto">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-3 text-center leading-tight">
                Deep Analytics
              </h3>
              <p className="text-slate-200 text-base sm:text-lg mb-6 text-center font-medium leading-relaxed px-1">
                Unlock comprehensive performance reports and training insights
              </p>
              <Button
                variant="outline"
                onClick={handleDetailedReport}
                disabled={isPending}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold shadow-2xl shadow-white/30 hover:shadow-white/50 hover:scale-[1.01] transition-all duration-300 bg-white/95 hover:bg-white text-slate-900 backdrop-blur-sm border-white/40 rounded-xl"
              >
                View Analysis →
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Mobile-First Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 max-w-4xl mx-auto w-full"
        >
          {[
            {
              value: avgScore,
              label: "Overall",
              color: "from-emerald-500 to-teal-600",
              icon: Crown,
            },
            {
              value: maxScore,
              label: "Peak",
              color: "from-orange-500 to-red-600",
              icon: TrendingUp,
            },
            {
              value: minScore,
              label: "Weakest",
              color: "from-slate-500 to-slate-700",
              icon: ArrowUp,
            },
          ].map(({ value, label, color, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-linear-to-br from-slate-50/90 via-white/80 backdrop-blur-xl border border-slate-200/50 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-400 overflow-hidden h-full flex flex-col justify-center items-center text-center"
            >
              <div className="absolute inset-0 bg-linear-to-r from-white/30 to-transparent -z-10" />
              <div className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-linear-to-br ${color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shrink-0`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white drop-shadow-md" />
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 mb-1 sm:mb-2 leading-none">
                  {value}%
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider px-1">
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Perfect Mobile Radar */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="relative bg-linear-to-br from-slate-50/70 via-white/90 to-emerald-50/50 backdrop-blur-xl border border-slate-200/40 rounded-3xl sm:rounded-4xl shadow-2xl shadow-slate-200/30 overflow-hidden">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden">
              <div className="px-4 sm:px-8 py-8 sm:py-12 lg:px-12 lg:py-16">
                {/* Mobile-Optimized Badges */}
                <div className="flex flex-col sm:flex-wrap sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center lg:justify-start mb-8 sm:mb-12 max-w-full lg:max-w-4xl mx-auto">
                  {data.map((d, i) => (
                    <motion.div
                      key={d.attribute}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className="w-full sm:w-auto"
                    >
                      <Badge
                        className={cn(
                          "w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 h-auto flex items-center justify-between gap-2 rounded-xl sm:rounded-2xl",
                          getColorClass(d.athlete)
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate text-left">
                            {d.attribute.replace(" & ", "\n")}
                          </span>
                        </div>
                        <span className="font-black text-base sm:text-lg whitespace-nowrap">
                          {d.athlete}%
                        </span>
                      </Badge>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full sm:w-auto"
                  >
                    <Badge className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 h-auto rounded-xl sm:rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Perfect Human
                      </div>
                      <span className="font-black text-base sm:text-lg">
                        100%
                      </span>
                    </Badge>
                  </motion.div>
                </div>

                {/* Perfect Mobile Chart */}
                <div className="h-[400px] sm:h-[450px] lg:h-[550px] xl:h-[600px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data}>
                      <defs>
                        <radialGradient
                          id="athleteFill"
                          cx="50%"
                          cy="50%"
                          r="70%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="60%"
                            stopColor="#3b82f6"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="100%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </radialGradient>
                        <radialGradient
                          id="perfectFill"
                          cx="50%"
                          cy="50%"
                          r="70%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#10b981"
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="70%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                          <stop
                            offset="100%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </radialGradient>
                      </defs>
                      <PolarGrid
                        stroke="#e2e8f0"
                        strokeWidth={1}
                        strokeDasharray="4,4"
                      />
                      <PolarAngleAxis
                        dataKey="attribute"
                        tickLine={false}
                        tick={{
                          fill: "#475569",
                          fontSize: "11px",
                          fontWeight: 700,
                          textAnchor: "middle",
                        }}
                        stroke="transparent"
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tickCount={6}
                        tick={{
                          fill: "#94a3b8",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                        stroke="transparent"
                        tickLine={false}
                        angle={30}
                      />
                      <Radar
                        name="You"
                        dataKey="athlete"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#athleteFill)"
                        dot={{
                          fill: "#3b82f6",
                          stroke: "#1d4ed8",
                          strokeWidth: 2,
                          r: 6,
                        }}
                      />
                      <Radar
                        name="Perfect"
                        dataKey="perfectHuman"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#perfectFill)"
                        dot={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
