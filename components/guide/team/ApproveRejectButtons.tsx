// components/team/ApproveRejectButtons.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  isLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function ApproveRejectButtons({
  isLoading,
  onApprove,
  onReject,
}: any) {
  return (
    <div className="flex gap-4 justify-end mt-6">
      <Button variant="destructive" disabled={isLoading} onClick={onReject}>
        {isLoading ? "Processing..." : "Reject"}
      </Button>
      <Button disabled={isLoading} onClick={onApprove}>
        {isLoading ? "Processing..." : "Approve"}
      </Button>
    </div>
  );
}
