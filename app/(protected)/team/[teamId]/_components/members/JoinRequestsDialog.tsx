"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useJoinRequests } from "../../../hooks/useJoinRequests";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleTeamJoinRequest } from "../../../lib/actions/team/handleJoinRequest";
import { toast } from "sonner";
import { useState } from "react";

interface JoinRequestsDialogProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinRequestsDialog({
  teamId,
  isOpen,
  onClose,
}: JoinRequestsDialogProps) {
  const queryClient = useQueryClient();
  const { data: requests = [], isLoading, refetch } = useJoinRequests(teamId);

  const mutation = useMutation({
    mutationFn: handleTeamJoinRequest,
    onSuccess: () => {
      toast.success("Request processed successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to process request");
    },
  });

  const handleDecision = (requestId: string, decision: "ACCEPT" | "REJECT") => {
    mutation.mutate({ requestId, decision });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Join Requests ({requests.length})
          </DialogTitle>
          <DialogDescription>
            Review and manage new athletes requesting to join your team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin mx-auto mb-4" />
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No pending requests
                </h3>
                <p className="text-sm text-slate-600">
                  Great team! No new requests at the moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {requests.map((request: any) => (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Athlete Avatar */}
                      <div className="shrink-0">
                        <Image
                          src={
                            request.athlete.profileImage ||
                            `https://api.dicebear.com/7.x/avataaars-neutral/svg?seed=${request.athlete.id}`
                          }
                          alt={`${request.athlete.firstName} ${request.athlete.lastName}`}
                          width={48}
                          height={48}
                          className="rounded-full border-2 border-slate-200"
                          unoptimized
                        />
                      </div>

                      {/* Athlete Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {request.athlete.firstName}{" "}
                            {request.athlete.lastName}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {request.athlete.rank} {request.athlete.class}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          @{request.athlete.username || "no-username"}
                        </p>
                        <p className="text-sm text-slate-500 mb-2">
                          {request.athlete.primarySport}
                        </p>
                        {request.message && (
                          <p className="text-sm text-slate-700 italic bg-slate-50 p-2 rounded-md">
                            "{request.message}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleDecision(request.id, "ACCEPT")}
                          disabled={mutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDecision(request.id, "REJECT")}
                          disabled={mutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
