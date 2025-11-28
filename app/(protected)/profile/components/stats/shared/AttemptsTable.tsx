// components/stats/shared/AttemptsTable.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Attempt {
  attemptNumber: number;
  [key: string]: any;
}

interface AttemptsTableProps<T extends Attempt> {
  attempts: T[];
  columns: {
    key: keyof T;
    label: string;
    format?: (value: any, attempt: T) => string | React.ReactNode;
    align?: "left" | "center" | "right";
  }[];
  bestAttemptIndex?: number;
  className?: string;
}

export function AttemptsTable<T extends Attempt>({
  attempts,
  columns,
  bestAttemptIndex,
  className,
}: AttemptsTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "py-2 px-3 font-semibold text-gray-700",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.align === "left" && "text-left"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt, index) => {
            const isBest = bestAttemptIndex !== undefined && index === bestAttemptIndex;
            return (
              <tr
                key={attempt.attemptNumber}
                className={cn(
                  "border-b border-gray-100",
                  isBest && "bg-yellow-50"
                )}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      "py-2 px-3",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.align === "left" && "text-left"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {col.key === "attemptNumber" && isBest && (
                        <Trophy className="h-4 w-4 text-yellow-600" />
                      )}
                      {col.format
                        ? col.format(attempt[col.key], attempt)
                        : String(attempt[col.key])}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
