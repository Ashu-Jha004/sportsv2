// components/stats/shared/RawDataViewer.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "lucide-react";

interface RawDataViewerProps {
  data: any;
  title?: string;
  className?: string;
}

export function RawDataViewer({
  data,
  title = "Raw Test Data",
  className,
}: RawDataViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-lg overflow-hidden",
        className
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Code className="h-4 w-4" />
          <span>{title}</span>
        </div>
        <svg
          className={cn(
            "h-5 w-5 transition-transform text-gray-500",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="h-8 gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <pre className="p-4 bg-gray-900 text-gray-100 text-xs overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
