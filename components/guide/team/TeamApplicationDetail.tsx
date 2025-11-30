// components/team/TeamApplicationDetail.tsx
"use client";

import React, { useState } from "react";
import { GuideTeamApplication } from "@/app/(business)/business/features/guide/hooks/useGuideTeamApplications";
import AthleteApplicationCard from "./AthleteApplicationCard";
import ApproveRejectButtons from "./ApproveRejectButtons";
import { useUpdateTeamApplication } from "@/app/(business)/business/features/guide/hooks/useGuideTeamApplications";
import { toast } from "sonner";

interface Props {
  application: GuideTeamApplication;
  onClose: () => void;
}

export default function TeamApplicationDetail({ application, onClose }: Props) {
  const [reviewNote, setReviewNote] = useState("");
  const mutation = useUpdateTeamApplication();

  async function handleApprove() {
    try {
      await mutation.mutateAsync({
        applicationId: application.id,
        status: "APPROVED",
        reviewNote,
      });
      toast.success("You have approved a team's application.");
      onClose();
    } catch (error) {
      // Handled by mutation onError
    }
  }

  async function handleReject() {
    try {
      await mutation.mutateAsync({
        applicationId: application.id,
        status: "REJECTED",
        reviewNote,
      });
      toast.success("You have rejected a team's application.");
      onClose();
    } catch (error) {
      // Handled by mutation onError
    }
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div>
        <h3 className="text-lg font-semibold">
          Team Application: {application.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Submitted on {new Date(application.createdAt).toLocaleDateString()}
        </p>
      </div>
      <AthleteApplicationCard athlete={application.applicant} />
      <div>
        <label
          htmlFor="reviewNote"
          className="block text-sm font-medium text-gray-700"
        >
          Review Note (optional)
        </label>
        <textarea
          id="reviewNote"
          rows={3}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          placeholder="Add any notes for the athlete"
        />
      </div>
      <ApproveRejectButtons onApprove={handleApprove} onReject={handleReject} />
      <button
        type="button"
        className="mt-4 text-sm text-gray-500 hover:underline"
        onClick={onClose}
      >
        Back to list
      </button>
    </div>
  );
}
