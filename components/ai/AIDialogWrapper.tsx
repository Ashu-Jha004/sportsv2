"use client";

import * as React from "react";
import { useAIChatStore } from "@/stores/ai/aiChat.store";
import { AI_ROLES, formatTokenUsage } from "@/types/ai.types";
import { X, ChevronLeft, Maximize2, Minimize2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIDialogWrapperProps {
  children: React.ReactNode;
}

export function AIDialogWrapper({ children }: AIDialogWrapperProps) {
  const {
    isOpen,
    currentRole,
    closeDialog,
    resetSession,
    toggleSidebar,
    sidebarOpen,
    tokenUsage,
  } = useAIChatStore();

  const [isFullscreen, setIsFullscreen] = React.useState(true);

  // Prevent body scroll when dialog open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // ESC key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    if (confirm("Close AI chat? Your conversation will be lost.")) {
      closeDialog();
      setTimeout(() => resetSession(), 300); // Reset after animation
    }
  };

  if (!isOpen || !currentRole) return null;

  const roleData = AI_ROLES[currentRole];
  const tokenInfo = formatTokenUsage(tokenUsage);

  const roleColors = {
    coach: "from-blue-500 to-blue-600",
    comparison: "from-purple-500 to-purple-600",
    nutritionist: "from-green-500 to-green-600",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog Container */}
      <div
        className={`
          fixed z-50 bg-white shadow-2xl
          animate-in slide-in-from-bottom duration-300
          ${isFullscreen ? "inset-0" : "inset-4 md:inset-8 rounded-2xl"}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-dialog-title"
      >
        {/* Header */}
        <header
          className={`
            bg-linear-to-r ${roleColors[currentRole]}
            text-white px-4 py-3 md:px-6 md:py-4
            flex items-center justify-between
            shadow-lg
          `}
        >
          {/* Left: Role Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-2xl shrink-0">{roleData.icon}</span>
              <div className="min-w-0">
                <h1
                  id="ai-dialog-title"
                  className="font-bold text-lg md:text-xl truncate"
                >
                  {roleData.label}
                </h1>
                <p className="text-xs md:text-sm text-white/80 truncate">
                  {roleData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 ml-4">
            {/* Token Counter */}
            <div
              className="hidden md:flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5"
              title={`${tokenInfo.session.toLocaleString()} tokens used this session`}
            >
              <Info className="h-4 w-4" />
              <span className="text-xs font-medium">
                {tokenInfo.session > 1000
                  ? `${(tokenInfo.session / 1000).toFixed(1)}k`
                  : tokenInfo.session}{" "}
                tokens
              </span>
            </div>

            {/* Sidebar Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-white hover:bg-white/20 hidden lg:flex"
              aria-label={sidebarOpen ? "Hide stats" : "Show stats"}
            >
              {sidebarOpen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>

            {/* Fullscreen Toggle (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white/20 hidden md:flex"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </Button>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="h-[calc(100%-64px)] md:h-[calc(100%-72px)] overflow-hidden">
          {children}
        </div>

        {/* Mobile Token Counter (Bottom) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-4 py-2 flex items-center justify-between text-xs">
          <span className="text-gray-600">Tokens used:</span>
          <span className="font-semibold text-gray-900">
            {tokenInfo.session.toLocaleString()} / 1.5M daily
          </span>
          <span
            className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${
                tokenInfo.percentage < 50
                  ? "bg-green-100 text-green-700"
                  : tokenInfo.percentage < 80
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }
            `}
          >
            {tokenInfo.percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </>
  );
}
