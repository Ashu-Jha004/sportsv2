// src/features/notifications/components/SeedNotificationButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SeedNotificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const res = await fetch("/api/dev/notifications/seed", {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          body?.message ?? `Request failed with status ${res.status}`;
        setLastResult(`Error: ${message}`);
        console.error("[SeedNotificationButton] Failed", {
          status: res.status,
          body,
        });
        return;
      }

      const data = await res.json();
      setLastResult(`Created notification: ${data.id}`);
      console.log("[SeedNotificationButton] Success", data);
    } catch (error) {
      console.error("[SeedNotificationButton] Network error", {
        error,
      });
      setLastResult(
        process.env.NODE_ENV === "development"
          ? `Network error: ${(error as Error).message}`
          : "Network error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? "Seeding notification..." : "Create test notification"}
      </Button>

      {lastResult && <p className="text-xs text-slate-500">{lastResult}</p>}
    </div>
  );
}
