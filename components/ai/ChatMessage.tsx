"use client";

import * as React from "react";
import type { ChatMessage as ChatMessageType } from "@/types/ai.types";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  // Don't render system messages
  if (isSystem) return null;

  // Ensure content is a string
  const content =
    typeof message.content === "string"
      ? message.content
      : String(message.content || "");

  if (!content) return null;

  const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`
        flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300
        ${isUser ? "flex-row-reverse" : "flex-row"}
      `}
    >
      {/* Avatar */}
      <div
        className={`
          shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${
            isUser
              ? "bg-blue-500 text-white"
              : "bg-linear-to-br from-purple-500 to-blue-500 text-white"
          }
        `}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message Bubble */}
      <div className={`flex-1 max-w-[85%] md:max-w-[75%]`}>
        <div
          className={`
            rounded-2xl px-4 py-3 shadow-sm
            ${
              isUser
                ? "bg-blue-500 text-white rounded-tr-sm"
                : "bg-gray-100 text-gray-900 rounded-tl-sm"
            }
          `}
        >
          {/* Message Content */}
          {isUser ? (
            // User messages: simple text
            <div className="whitespace-pre-wrap break-words text-sm">
              {content}
            </div>
          ) : (
            // AI messages: render markdown
            <div
              className={`
                prose prose-sm max-w-none
                prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4
                prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                prose-p:mb-2 prose-p:leading-relaxed
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5
                prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5
                prose-li:mb-1
                prose-strong:font-semibold prose-strong:text-gray-900
                prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-gray-800 prose-pre:text-white prose-pre:p-3 prose-pre:rounded-lg
                prose-table:border-collapse prose-table:w-full
                prose-th:border prose-th:border-gray-300 prose-th:bg-gray-100 prose-th:p-2 prose-th:font-semibold
                prose-td:border prose-td:border-gray-300 prose-td:p-2
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
              `}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}

          {/* Token count (for AI messages) */}
          {!isUser && message.tokenCount && (
            <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200 flex items-center gap-1">
              <span>~{message.tokenCount} tokens</span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`
            text-xs text-gray-500 mt-1 px-2
            ${isUser ? "text-right" : "text-left"}
          `}
        >
          {timestamp}
        </div>
      </div>
    </div>
  );
}

// Loading indicator for AI response
export function ChatMessageLoading() {
  return (
    <div className="flex gap-3 mb-4">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center">
        <Bot className="h-5 w-5" />
      </div>

      {/* Loading Bubble */}
      <div className="flex-1 max-w-[75%]">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Error message display
export function ChatMessageError({ error }: { error: string }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
        ⚠️
      </div>
      <div className="flex-1 max-w-[75%]">
        <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
}
