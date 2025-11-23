// app/dashboard/evaluations/page.tsx
"use client";

import { useMyEvaluationRequests } from "../hooks/profile/useMyEvaluationRequests";

export default function EvaluationsPage() {
  const { data, isLoading, error } = useMyEvaluationRequests();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading requests...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-500">
        Failed to load evaluation requests.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        You have no physical evaluation requests yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((req) => {
        const guideUser = req.guide.user;
        const guideName =
          guideUser.firstName || guideUser.lastName
            ? `${guideUser.firstName ?? ""} ${guideUser.lastName ?? ""}`.trim()
            : guideUser.username;

        return (
          <div
            key={req.id}
            className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div>
              <p className="font-medium">{guideName}</p>
              <p className="text-xs text-muted-foreground">
                @{guideUser.username}
              </p>
              <p className="text-xs text-muted-foreground">
                Requested on{" "}
                {new Date(req.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              {req.message && (
                <p className="text-xs text-muted-foreground mt-1">
                  Your message: {req.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs rounded-full bg-muted px-2 py-0.5">
                {req.status}
              </span>
              {/* later: add cancel button for PENDING */}
            </div>
          </div>
        );
      })}
    </div>
  );
}
