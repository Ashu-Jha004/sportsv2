// components/stats/sections/AnthropometricSection.tsx
"use client";

import React from "react";
import { SectionHeader } from "../shared/SectionHeader";
import { StatCard } from "../shared/StatCard";
import { MetricDisplay } from "../shared/MetricDisplay";
import { MetricGrid } from "../shared/MetricGrid";
import { ProgressRing } from "../shared/ProgressRing";
import { InsightCard } from "../shared/InsightCard";
import type { CleanedAthleteStats } from "../../../lib/utils/statsDataProcessor";
import { User, Ruler, Weight, Activity } from "lucide-react";
import {
  formatHeight,
  formatWeight,
  formatNumber,
} from "../../../lib/utils/formatting";
import {
  getBMICategory,
  calculateLeanBodyMass,
} from "../../../lib/utils/performanceCalculations";

interface AnthropometricSectionProps {
  stats: CleanedAthleteStats;
  expanded?: boolean;
}

export function AnthropometricSection({
  stats,
  expanded = false,
}: AnthropometricSectionProps) {
  const { anthropometrics } = stats;
  const { basic, circumferences, dimensions } = anthropometrics;

  const bmiCategory = getBMICategory(basic.bmi);
  const leanBodyMass = calculateLeanBodyMass(basic.weight, basic.bodyFat);

  // Calculate body composition percentages
  const fatMassKg = (basic.weight * basic.bodyFat) / 100;
  const muscleMassPercentage = (leanBodyMass / basic.weight) * 100;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Body Composition & Measurements"
        subtitle="Physical attributes and body metrics"
        icon={User}
        iconColor="text-orange-600"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Height */}
        <StatCard
          title="Height"
          icon={Ruler}
          iconColor="text-blue-600"
          className="border-2 border-blue-100"
        >
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {basic.height}
              <span className="text-lg text-gray-500 ml-1">cm</span>
            </div>
            <p className="text-sm text-gray-500">
              {formatHeight(basic.height)}"ft"
            </p>
          </div>
        </StatCard>

        {/* Weight */}
        <StatCard
          title="Weight"
          icon={Weight}
          iconColor="text-green-600"
          className="border-2 border-green-100"
        >
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {basic.weight}
              <span className="text-lg text-gray-500 ml-1">kg</span>
            </div>
            <p className="text-sm text-gray-500">
              {formatWeight(basic.weight)} "lbs"
            </p>
          </div>
        </StatCard>

        {/* BMI */}
        <StatCard
          title="Body Mass Index"
          icon={Activity}
          iconColor="text-purple-600"
          badge={{
            label: bmiCategory.category,
            variant:
              bmiCategory.category === "Normal" ? "default" : "secondary",
            color: bmiCategory.color,
          }}
          className="border-2 border-purple-100"
        >
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {formatNumber(basic.bmi, 1)}
            </div>
            <p className="text-sm text-gray-500">{bmiCategory.description}</p>
          </div>
        </StatCard>

        {/* Age */}
        <StatCard
          title="Age"
          icon={User}
          iconColor="text-orange-600"
          className="border-2 border-orange-100"
        >
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {basic.age}
              <span className="text-lg text-gray-500 ml-1">years</span>
            </div>
            <p className="text-sm text-gray-500">Current age</p>
          </div>
        </StatCard>
      </div>

      {/* Body Composition Details */}
      <StatCard
        title="Body Composition Analysis"
        icon={Activity}
        iconColor="text-blue-600"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Visual Composition */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <ProgressRing
              percentage={basic.bodyFat}
              size="lg"
              color="#ef4444"
              label="Body Fat"
            />
            <ProgressRing
              percentage={muscleMassPercentage}
              size="lg"
              color="#3b82f6"
              label="Lean Mass"
            />
          </div>

          {/* Metrics Grid */}
          <div className="md:col-span-2">
            <MetricGrid columns={2} gap="md">
              <MetricDisplay
                label="Body Fat Percentage"
                value={formatNumber(basic.bodyFat, 1)}
                unit="%"
                icon="📊"
                color="text-red-600"
                tooltip="Percentage of total body weight that is fat mass"
              />
              <MetricDisplay
                label="Fat Mass"
                value={formatNumber(fatMassKg, 1)}
                unit="kg"
                icon="⚖️"
                color="text-red-600"
                tooltip="Total weight of body fat"
              />
              <MetricDisplay
                label="Lean Body Mass"
                value={formatNumber(leanBodyMass, 1)}
                unit="kg"
                icon="💪"
                color="text-blue-600"
                tooltip="Weight excluding body fat (muscle, bone, organs, water)"
              />
              <MetricDisplay
                label="Lean Mass %"
                value={formatNumber(muscleMassPercentage, 1)}
                unit="%"
                icon="📈"
                color="text-blue-600"
                tooltip="Percentage of total body weight that is lean mass"
              />
            </MetricGrid>

            {/* Body Composition Insights */}
            <div className="mt-6">
              {basic.bodyFat < 10 && (
                <InsightCard
                  insight={{
                    title: "Very Low Body Fat",
                    message:
                      "Your body fat percentage is very low. This is excellent for athletic performance but ensure adequate nutrition.",
                    type: "info",
                    icon: "💡",
                    actionable: true,
                    recommendation:
                      "Maintain proper nutrition and monitor energy levels. Consider consulting with a sports nutritionist.",
                  }}
                />
              )}
              {basic.bodyFat >= 10 && basic.bodyFat <= 20 && (
                <InsightCard
                  insight={{
                    title: "Optimal Body Composition",
                    message:
                      "Your body fat percentage is in the optimal range for athletic performance and health.",
                    type: "success",
                    icon: "✅",
                    actionable: false,
                  }}
                />
              )}
              {basic.bodyFat > 20 && basic.bodyFat <= 25 && (
                <InsightCard
                  insight={{
                    title: "Moderate Body Fat",
                    message:
                      "Your body fat is slightly elevated. Reducing it could improve power-to-weight ratio and performance.",
                    type: "warning",
                    icon: "⚠️",
                    actionable: true,
                    recommendation:
                      "Focus on nutrition optimization and consider adding metabolic conditioning to your training.",
                  }}
                />
              )}
              {basic.bodyFat > 25 && (
                <InsightCard
                  insight={{
                    title: "High Body Fat Percentage",
                    message:
                      "Elevated body fat may impact athletic performance. Consider working with professionals to optimize body composition.",
                    type: "error",
                    icon: "🎯",
                    actionable: true,
                    recommendation:
                      "Consult with a certified nutritionist and strength coach to develop a sustainable fat loss plan.",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </StatCard>

      {/* Circumference Measurements */}
      {expanded && (
        <StatCard
          title="Circumference Measurements"
          icon={Ruler}
          iconColor="text-purple-600"
        >
          <MetricGrid columns={3} gap="md">
            <MetricDisplay
              label="Waist"
              value={circumferences.waist}
              unit="cm"
              icon="⭕"
              color="text-purple-600"
              tooltip="Waist circumference at narrowest point"
            />
            <MetricDisplay
              label="Neck"
              value={circumferences.neck}
              unit="cm"
              icon="👔"
              color="text-blue-600"
              tooltip="Neck circumference measurement"
            />
            <MetricDisplay
              label="Biceps"
              value={circumferences.biceps}
              unit="cm"
              icon="💪"
              color="text-orange-600"
              tooltip="Bicep circumference at largest point"
            />
            <MetricDisplay
              label="Thigh"
              value={circumferences.thigh}
              unit="cm"
              icon="🦵"
              color="text-green-600"
              tooltip="Thigh circumference at largest point"
            />
            <MetricDisplay
              label="Calf"
              value={circumferences.calf}
              unit="cm"
              icon="🦿"
              color="text-blue-600"
              tooltip="Calf circumference at largest point"
            />
          </MetricGrid>

          {/* Circumference Visualization */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Relative Proportions
            </h4>
            <div className="space-y-2">
              {[
                {
                  label: "Waist",
                  value: circumferences.waist,
                  color: "bg-purple-500",
                },
                {
                  label: "Thigh",
                  value: circumferences.thigh,
                  color: "bg-green-500",
                },
                {
                  label: "Neck",
                  value: circumferences.neck,
                  color: "bg-blue-500",
                },
                {
                  label: "Calf",
                  value: circumferences.calf,
                  color: "bg-cyan-500",
                },
                {
                  label: "Biceps",
                  value: circumferences.biceps,
                  color: "bg-orange-500",
                },
              ].map((item) => {
                const maxCircumference = Math.max(
                  ...Object.values(circumferences)
                );
                const percentage = (item.value / maxCircumference) * 100;

                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold text-gray-900">
                        {item.value} cm
                      </span>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </StatCard>
      )}

      {/* Body Dimensions */}
      {expanded && (
        <StatCard
          title="Body Dimensions"
          icon={Ruler}
          iconColor="text-blue-600"
        >
          <MetricGrid columns={2} gap="md">
            <MetricDisplay
              label="Arm Span"
              value={dimensions.armSpan}
              unit="cm"
              icon="🤸"
              color="text-blue-600"
              tooltip="Fingertip to fingertip with arms outstretched"
            />
            <MetricDisplay
              label="Leg Length"
              value={dimensions.legLength}
              unit="cm"
              icon="📏"
              color="text-green-600"
              tooltip="Hip to ankle measurement"
            />
          </MetricGrid>

          {/* Proportion Analysis */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>📐</span>
              Proportion Analysis
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-medium mb-1">
                  Arm Span / Height Ratio
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(dimensions.armSpan / basic.height, 2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {dimensions.armSpan / basic.height > 1.02 &&
                    "Above average reach"}
                  {dimensions.armSpan / basic.height >= 0.98 &&
                    dimensions.armSpan / basic.height <= 1.02 &&
                    "Average proportions"}
                  {dimensions.armSpan / basic.height < 0.98 &&
                    "Below average reach"}
                </p>
              </div>
              <div>
                <p className="text-blue-700 font-medium mb-1">
                  Leg / Height Ratio
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatNumber(dimensions.legLength / basic.height, 2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Relative leg length proportion
                </p>
              </div>
            </div>
          </div>
        </StatCard>
      )}

      {/* Summary Insight */}
      {!expanded && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Click on any measurement for detailed analysis
          </p>
        </div>
      )}
    </div>
  );
}
