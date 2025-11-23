// hooks/useGuideEvaluationStatuses.ts
"use client";

import { useEffect, useState } from "react";
import { getEvaluationStatusesForGuides } from "../../actions/getEvaluationStatusesForGuides";
export function useGuideEvaluationStatuses(guideIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guideIds.length === 0) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await getEvaluationStatusesForGuides(guideIds);
        if (!cancelled) setStatuses(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guideIds.join(",")]); // stable dep

  return { statuses, loading };
}
