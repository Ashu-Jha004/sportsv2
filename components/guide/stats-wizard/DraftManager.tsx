"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import { Save, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type DraftManagerProps = {
  className?: string;
};

export function DraftManager({ className }: DraftManagerProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const draftSavedAt = useStatsWizardStore((s) => s.draftSavedAt);
  const saveDraft = useStatsWizardStore((s) => s.saveDraft);
  const getProgressPercentage = useStatsWizardStore(
    (s) => s.getProgressPercentage
  );

  const handleSaveDraft = () => {
    try {
      saveDraft();
      setSaveSuccess(true);

      if (process.env.NODE_ENV === "development") {
        console.info("[DraftManager] Draft saved successfully");
      }

      // Auto-close success message after 2 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setShowSaveDialog(false);
      }, 2000);
    } catch (error) {
      console.error("[DraftManager] Failed to save draft:", error);
      setSaveSuccess(false);
    }
  };

  const progressPercentage = getProgressPercentage();

  return (
    <>
      {/* Save Draft Button */}
      <div className={className}>
        <Button
          variant="outline"
          onClick={() => setShowSaveDialog(true)}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>

        {/* Last Saved Indicator */}
        {draftSavedAt && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Last saved: {format(new Date(draftSavedAt), "MMM dd, hh:mm a")}
            </span>
          </div>
        )}
      </div>

      {/* Save Draft Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              Save Evaluation Draft
            </DialogTitle>
            <DialogDescription>
              Save your current progress to continue this evaluation later. All
              entered data will be preserved in your browser.
            </DialogDescription>
          </DialogHeader>

          {!saveSuccess ? (
            <>
              {/* Progress Info */}
              <div className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Current Progress</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm">Completion:</span>
                      <Badge variant="secondary" className="text-sm">
                        {progressPercentage}%
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <p className="font-semibold text-foreground">
                    What gets saved:
                  </p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>All completed measurements and test results</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Current step and progress tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Injury records and notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Draft timestamp for reference</span>
                    </li>
                  </ul>
                </div>

                <Alert
                  variant="default"
                  className="border-amber-500/20 bg-amber-500/5"
                >
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Drafts
                    are saved locally in your browser. Clear your browser data
                    will remove saved drafts. Submit the evaluation when
                    complete to save permanently.
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveDraft} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    Draft Saved Successfully!
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You can safely close this page and continue later.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
