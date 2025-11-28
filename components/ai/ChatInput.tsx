"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Ask me anything about your performance...",
  maxLength = 4000,
}: ChatInputProps) {
  const [input, setInput] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSend = React.useCallback(() => {
    const trimmed = input.trim();

    // Debug log
    console.log("📝 ChatInput sending:", {
      input,
      trimmed,
      type: typeof trimmed,
      length: trimmed.length,
    });

    if (!trimmed || disabled) {
      console.warn("⚠️ Empty or disabled, not sending");
      return;
    }

    // Call parent with string value
    onSend(trimmed);

    // Clear input
    setInput("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const charCount = input.length;
  const isNearLimit = charCount > maxLength * 0.8;
  const isOverLimit = charCount > maxLength;

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="relative">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="resize-none pr-12 min-h-[60px] max-h-[200px] focus:ring-2 focus:ring-blue-500"
          rows={2}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || !input.trim() || isOverLimit}
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
          type="button"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Character Counter */}
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </span>
        <span
          className={`font-medium ${
            isOverLimit
              ? "text-red-600"
              : isNearLimit
              ? "text-yellow-600"
              : "text-gray-500"
          }`}
        >
          {charCount} / {maxLength}
        </span>
      </div>
    </div>
  );
}
