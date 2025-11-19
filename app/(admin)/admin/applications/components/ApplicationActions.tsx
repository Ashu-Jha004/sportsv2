"use client";

import { useState, useTransition } from "react";
import {
  approveApplication,
  rejectApplication,
  claimApplication,
} from "../../../actions/admin-actions";
import { useRouter } from "next/navigation";

export function ApplicationActions({
  applicationId,
}: {
  applicationId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [cooldownDays, setCooldownDays] = useState(30);

  const handleClaim = () => {
    startTransition(async () => {
      try {
        await claimApplication(applicationId);
        router.refresh();
      } catch (error) {
        alert("Failed to claim application");
      }
    });
  };

  const handleApprove = () => {
    startTransition(async () => {
      try {
        await approveApplication(applicationId, reviewNotes || undefined);
        setShowApproveModal(false);
        router.push("/admin/applications");
        router.refresh();
      } catch (error) {
        alert("Failed to approve application");
      }
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    startTransition(async () => {
      try {
        await rejectApplication(applicationId, rejectionReason, cooldownDays);
        setShowRejectModal(false);
        router.push("/admin/applications");
        router.refresh();
      } catch (error) {
        alert("Failed to reject application");
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
      <div className="space-y-3">
        <button
          onClick={handleClaim}
          disabled={isPending}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
        >
          {isPending ? "Processing..." : "Claim for Review"}
        </button>

        <button
          onClick={() => setShowApproveModal(true)}
          disabled={isPending}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
        >
          ✓ Approve Application
        </button>

        <button
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
        >
          ✕ Reject Application
        </button>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Approve Application
          </h3>
          <p className="text-gray-600 mb-4">
            This will grant the athlete associate privileges and create their
            profile.
          </p>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add review notes (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {isPending ? "Approving..." : "Confirm Approval"}
            </button>
            <button
              onClick={() => setShowApproveModal(false)}
              disabled={isPending}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Reject Application
          </h3>
          <p className="text-gray-600 mb-4">
            Please provide a reason for rejection.
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason (required)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            rows={4}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooldown Period (days)
            </label>
            <input
              title="number"
              type="number"
              value={cooldownDays}
              onChange={(e) => setCooldownDays(parseInt(e.target.value))}
              min={0}
              max={365}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Athlete can reapply after this period
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={isPending || !rejectionReason.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
            >
              {isPending ? "Rejecting..." : "Confirm Rejection"}
            </button>
            <button
              onClick={() => setShowRejectModal(false)}
              disabled={isPending}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">{children}</div>
    </div>
  );
}
