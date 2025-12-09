"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { AcceptCounterDialog } from "./accept-counter-dialog";
import { CounterAgainDialog } from "./counter-again-dialog";
import { CancelChallengeDialog } from "./cancel-challenge-dialog";
import { ViewDetailsDialog } from "./view-details-dialog";

const DIALOG_TITLES = {
  ACCEPT_COUNTER: "Accept Counter-Proposal",
  COUNTER_AGAIN: "Propose Different Details",
  CANCEL: "Cancel Challenge",
  VIEW_DETAILS: "Challenge Details",
};

export function SentChallengeActionDialog() {
  const { isActionDialogOpen, selectedAction, closeActionDialog } =
    useSentChallengeStore();

  if (!selectedAction) return null;

  return (
    <Dialog open={isActionDialogOpen} onOpenChange={closeActionDialog}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {DIALOG_TITLES[selectedAction]}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {selectedAction === "ACCEPT_COUNTER" && <AcceptCounterDialog />}
          {selectedAction === "COUNTER_AGAIN" && <CounterAgainDialog />}
          {selectedAction === "CANCEL" && <CancelChallengeDialog />}
          {selectedAction === "VIEW_DETAILS" && <ViewDetailsDialog />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
