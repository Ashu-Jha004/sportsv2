// components/stats/shared/TestConditions.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Cloud, Thermometer, Wind, MapPin, Calendar } from "lucide-react";

interface TestCondition {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}

interface TestConditionsProps {
  conditions: {
    temperature?: number;
    humidity?: number;
    altitude?: number;
    surface?: string;
    weather?: string;
    location?: string;
    equipment?: string;
    timeOfDay?: string;
    [key: string]: any;
  };
  className?: string;
}

export function TestConditions({ conditions, className }: TestConditionsProps) {
  const conditionItems: TestCondition[] = [];

  if (conditions.temperature !== undefined) {
    conditionItems.push({
      icon: <Thermometer className="h-4 w-4" />,
      label: "Temperature",
      value: `${conditions.temperature}°C`,
    });
  }

  if (conditions.humidity !== undefined) {
    conditionItems.push({
      icon: <Wind className="h-4 w-4" />,
      label: "Humidity",
      value: `${conditions.humidity}%`,
    });
  }

  if (conditions.altitude !== undefined) {
    conditionItems.push({
      icon: <MapPin className="h-4 w-4" />,
      label: "Altitude",
      value: `${conditions.altitude}m`,
    });
  }

  if (conditions.surface) {
    conditionItems.push({
      icon: <span>🏟️</span>,
      label: "Surface",
      value: conditions.surface,
    });
  }

  if (conditions.weather) {
    conditionItems.push({
      icon: <Cloud className="h-4 w-4" />,
      label: "Weather",
      value: conditions.weather,
    });
  }

  if (conditions.timeOfDay) {
    conditionItems.push({
      icon: <Calendar className="h-4 w-4" />,
      label: "Time of Day",
      value: conditions.timeOfDay,
    });
  }

  if (conditions.equipment) {
    conditionItems.push({
      icon: <span>⚙️</span>,
      label: "Equipment",
      value: conditions.equipment,
    });
  }

  // Add any other custom conditions
  Object.entries(conditions).forEach(([key, value]) => {
    if (
      value &&
      ![
        "temperature",
        "humidity",
        "altitude",
        "surface",
        "weather",
        "timeOfDay",
        "equipment",
        "location",
      ].includes(key)
    ) {
      conditionItems.push({
        label: key.replace(/([A-Z])/g, " $1").trim(),
        value: String(value),
      });
    }
  });

  if (conditionItems.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-blue-50 border border-blue-100 p-4",
        className
      )}
    >
      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <span>🔬</span>
        Test Conditions
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {conditionItems.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {item.icon && (
              <div className="text-blue-600 mt-0.5">{item.icon}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-700 font-medium">{item.label}</p>
              <p className="text-sm text-blue-900 font-semibold truncate">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
