// components/StatsFallback.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useGuideFinderStore } from "@/stores/guide/Finder/guideFinder.store";

export function StatsFallback({ isSelf }: { isSelf: boolean }) {
  const openDialog = useGuideFinderStore((s) => s.openDialog);

  return (
    <section className="max-w-3xl mx-auto space-y-4 border rounded-xl p-6 bg-muted/40">
      <h2 className="text-lg font-semibold">No stats available yet</h2>
      <p className="text-sm text-muted-foreground">
        This athlete has not completed a physical evaluation. Once a guide
        evaluates them, their performance stats will appear here.
      </p>

      <Button
        variant="default"
        className="mt-2"
        onClick={() => openDialog({ sportFilter: "primary" })}
      >
        Find Nearest Guide..
      </Button>
    </section>
  );
}
