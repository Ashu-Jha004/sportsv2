"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExistingConversation } from "@/hooks/social/use-conversations";
import { createConversation } from "@/actions/social/conversation.actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function NewMessageDialog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [targetUsername, setTargetUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const targetUsernames = targetUsername ? [targetUsername] : [];
  const { data: existingConversationId } = useExistingConversation(
    targetUsernames,
    !!targetUsername
  );

  useEffect(() => {
    const user = searchParams.get("user");
    if (user && !targetUsername) {
      setTargetUsername(user);
      setIsOpen(true);
    }
  }, [searchParams.get("user")]);

  const handleCreateConversation = async () => {
    if (!targetUsername || loading) return;

    try {
      setLoading(true);

      if (existingConversationId) {
        toast.success("Opening existing conversation");
        router.push(`/messages/${existingConversationId}`);
        setIsOpen(false);
        return;
      }

      const result = await createConversation([targetUsername]);

      if (result.success && result.data?.conversation) {
        toast.success("Conversation started!");
        router.push(`/messages/${result.data.conversation.id}`);
        setIsOpen(false);
      } else {
        toast.error(result.message || "Failed to start conversation");
      }
    } catch (error) {
      toast.error("Failed to start conversation");
      console.error("NewMessageDialog error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTargetUsername("");
  };

  if (!targetUsername) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Message @{targetUsername}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {existingConversationId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                You already have a conversation with @{targetUsername}
              </p>
            </div>
          )}

          <p className="text-sm text-slate-600">
            Start a new conversation with @{targetUsername}
          </p>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCreateConversation}
              className="flex-1"
              disabled={loading || !!existingConversationId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : existingConversationId ? (
                "Open Chat"
              ) : (
                "Start Chat"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
