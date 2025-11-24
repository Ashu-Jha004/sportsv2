"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Calendar,
  Clock,
  Activity,
  Info,
} from "lucide-react";
import { InjuryForm } from "./InjuryForm";
import { useStatsWizardStore } from "@/stores/statsWizard/statsWizardStore";
import type { InjuryRecord } from "@/types/stats/athlete-stats.types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type InjuryManagementProps = {
  onComplete: () => void;
};

export function InjuryManagement({ onComplete }: InjuryManagementProps) {
  const injuries = useStatsWizardStore((s) => s.injuries);
  const addInjury = useStatsWizardStore((s) => s.addInjury);
  const updateInjury = useStatsWizardStore((s) => s.updateInjury);
  const removeInjury = useStatsWizardStore((s) => s.removeInjury);
  const markStepComplete = useStatsWizardStore((s) => s.markStepComplete);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInjury, setEditingInjury] = useState<InjuryRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [injuryToDelete, setInjuryToDelete] = useState<string | null>(null);

  // Handle save (add or update)
  const handleSave = (
    data: Omit<InjuryRecord, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingInjury) {
        // Update existing
        updateInjury(editingInjury.id, {
          ...data,
          updatedAt: new Date().toISOString(),
        });

        if (process.env.NODE_ENV === "development") {
          console.debug("[InjuryManagement] Updated injury", editingInjury.id);
        }
      } else {
        // Add new
        const newInjury: InjuryRecord = {
          id: `injury_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addInjury(newInjury);

        if (process.env.NODE_ENV === "development") {
          console.debug("[InjuryManagement] Added injury", newInjury.id);
        }
      }

      // Close form
      setIsFormOpen(false);
      setEditingInjury(null);
    } catch (error) {
      console.error("[InjuryManagement] Error saving injury:", error);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (injuryToDelete) {
      removeInjury(injuryToDelete);

      if (process.env.NODE_ENV === "development") {
        console.debug("[InjuryManagement] Deleted injury", injuryToDelete);
      }

      setDeleteDialogOpen(false);
      setInjuryToDelete(null);
    }
  };

  // Handle edit
  const handleEdit = (injury: InjuryRecord) => {
    setEditingInjury(injury);
    setIsFormOpen(true);
  };

  // Handle complete
  const handleComplete = () => {
    markStepComplete(9);
    onComplete();
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    const colors = {
      minor: "bg-green-500/10 text-green-700 border-green-500/20",
      moderate: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      severe: "bg-orange-500/10 text-orange-700 border-orange-500/20",
      critical: "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return colors[severity as keyof typeof colors] || colors.minor;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-red-500/10 text-red-700 border-red-500/20",
      recovering: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      recovered: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Injury Records</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track current and past injuries, treatment plans, and recovery
            progress.
          </p>
        </div>
        {!isFormOpen && (
          <Button
            onClick={() => {
              setEditingInjury(null);
              setIsFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Injury
          </Button>
        )}
      </div>

      {/* Info Alert */}
      {!isFormOpen && injuries.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            No injuries recorded yet. If the athlete has no current or past
            injuries, you can skip this step and proceed to the next section.
          </AlertDescription>
        </Alert>
      )}

      {/* Injury Form */}
      {isFormOpen && (
        <Card>
          <CardContent className="p-6">
            <InjuryForm
              initialData={editingInjury || undefined}
              onSave={handleSave}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingInjury(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Injury List */}
      {!isFormOpen && injuries.length > 0 && (
        <div className="space-y-3">
          {injuries.map((injury: any) => (
            <Card key={injury.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left Section - Injury Details */}
                  <div className="flex-1 space-y-3">
                    {/* Title and Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {injury.type}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold",
                          getSeverityColor(injury.severity)
                        )}
                      >
                        {injury.severity}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-semibold",
                          getStatusColor(injury.currentStatus)
                        )}
                      >
                        {injury.currentStatus}
                      </Badge>
                    </div>

                    {/* Body Part */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Activity className="h-4 w-4" />
                      <span>{injury.bodyPart}</span>
                    </div>

                    {/* Date Info */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Occurred:{" "}
                          {format(new Date(injury.occurredAt), "MMM dd, yyyy")}
                        </span>
                      </div>

                      {injury.currentStatus === "active" &&
                        injury.expectedRecoveryDate && (
                          <div className="flex items-center gap-1.5 text-amber-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              Expected:{" "}
                              {format(
                                new Date(injury.expectedRecoveryDate),
                                "MMM dd, yyyy"
                              )}
                            </span>
                          </div>
                        )}

                      {injury.currentStatus === "recovered" &&
                        injury.recoveredAt && (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Recovered:{" "}
                              {format(
                                new Date(injury.recoveredAt),
                                "MMM dd, yyyy"
                              )}
                            </span>
                            {injury.recoveryTime && (
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-emerald-500/10 text-emerald-700"
                              >
                                {injury.recoveryTime} days
                              </Badge>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Treatment Plan */}
                    {injury.treatmentPlan && (
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold text-foreground">
                          Treatment Plan:
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {injury.treatmentPlan}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {injury.notes && (
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold text-foreground">
                          Notes:
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {injury.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex gap-2 sm:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(injury)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInjuryToDelete(injury.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Alert */}
      {!isFormOpen && injuries.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>{injuries.length}</strong> injury record(s) added.{" "}
            {injuries.filter((i: any) => i.currentStatus === "active").length >
              0 && (
              <>
                <strong>
                  {
                    injuries.filter((i: any) => i.currentStatus === "active")
                      .length
                  }
                </strong>{" "}
                currently active.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Complete Button */}
      {!isFormOpen && (
        <div className="flex justify-end">
          <Button onClick={handleComplete} size="lg">
            {injuries.length > 0 ? "Save & Continue" : "Skip & Continue"}
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Injury Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              injury record from this evaluation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
