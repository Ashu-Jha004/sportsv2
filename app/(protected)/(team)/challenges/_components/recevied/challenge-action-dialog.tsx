"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReceivedChallengeStore } from "@/stores/challenges/recevied/received-challenge-store";
import { AcceptChallengeDialog } from "./accept-challenge-dialog";
import { RejectChallengeDialog } from "./reject-challenge-dialog";
import { CounterProposeDialog } from "./counter-propose-dialog";
import { DeleteChallengeDialog } from "./delete-challenge-dialog";

const DIALOG_TITLES = {
  ACCEPT: "Accept Challenge",
  REJECT: "Reject Challenge",
  COUNTER: "Counter-Propose Match Details",
  DELETE: "Delete Challenge",
};

export function ChallengeActionDialog() {
  const { isActionDialogOpen, selectedAction, closeActionDialog } =
    useReceivedChallengeStore();

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
          {selectedAction === "ACCEPT" && <AcceptChallengeDialog />}
          {selectedAction === "REJECT" && <RejectChallengeDialog />}
          {selectedAction === "COUNTER" && <CounterProposeDialog />}
          {selectedAction === "DELETE" && <DeleteChallengeDialog />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
