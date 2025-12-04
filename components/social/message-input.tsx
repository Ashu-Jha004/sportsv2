"use client";

/**
 * =============================================================================
 * MESSAGE INPUT COMPONENT
 * =============================================================================
 * Input box for composing and sending messages with optional media upload
 */

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon } from "lucide-react";
import { Send } from "lucide-react";
import { toast } from "sonner";
interface MessageInputProps {
  onSend: (content: string, imageUrl?: string) => Promise<void>;
  disabled?: boolean;
}

// Placeholder for media upload - TODO: Integrate Cloudinary or similar
// Real Cloudinary upload
async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/message/upload-media", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Upload failed");
  }

  return result.url;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Send message handler
  const handleSend = useCallback(async () => {
    if (!message.trim() && !imageFile) {
      return;
    }

    let imageUrl: string | undefined;

    try {
      setSending(true);

      if (imageFile) {
        toast.loading("Uploading image...", { id: "upload" });
        imageUrl = await uploadMedia(imageFile);
        toast.success("Image uploaded!", { id: "upload" });
      }

      await onSend(message.trim(), imageUrl);
      setMessage("");
      setImageFile(null);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      toast.error("Failed to send message", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  }, [message, imageFile, onSend]);

  // Handle enter key (send message)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-t border-slate-200 bg-white">
      <label
        htmlFor="file-upload"
        className="cursor-pointer p-2 rounded-md hover:bg-slate-100 text-slate-600"
        title="Upload Image"
        aria-label="Upload Image"
      >
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
          disabled={disabled || sending}
        />
        <ImageIcon size={20} />
      </label>

      <Textarea
        ref={inputRef}
        rows={1}
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        className="resize-none overflow-hidden"
      />

      <Button
        onClick={handleSend}
        disabled={disabled || sending || (!message.trim() && !imageFile)}
        size="sm"
        variant="default"
      >
        <Send className="rotate-45" size={18} />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
