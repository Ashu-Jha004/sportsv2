"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, Clock, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import AthleteSearch from "./AthleteSearch";
import PendingInvites from "./PendingInvites";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InviteDialogProps {
  teamId: string;
  teamName: string;
  canInvite: boolean;
  disabledReason?: string;
}

type TabValue = "nearby" | "search" | "pending";

export default function InviteDialog({
  teamId,
  teamName,
  canInvite,
  disabledReason = "You don't have permission to invite players",
}: InviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("nearby");

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveTab("nearby");
    }
  }, [isOpen]);

  // Clear search when switching to pending tab
  useEffect(() => {
    if (activeTab === "pending") {
      setSearchQuery("");
    }
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const showSearchBar = activeTab !== "pending";

  const InviteButton = (
    <Button
      size="default"
      disabled={!canInvite}
      className="gap-2"
      aria-label="Invite players to team"
    >
      <UserPlus className="w-4 h-4" />
      <span className="hidden sm:inline">Invite Player</span>
      <span className="sm:hidden">Invite</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              {canInvite ? (
                InviteButton
              ) : (
                <span className="inline-block">{InviteButton}</span>
              )}
            </DialogTrigger>
          </TooltipTrigger>
          {!canInvite && (
            <TooltipContent>
              <p>{disabledReason}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-4xl h-[90vh] sm:h-[85vh] p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b bg-gradient-to-r from-slate-50 to-slate-100 shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
            Invite Players to {teamName}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 mt-1">
            {activeTab === "nearby" && "Find athletes near your location"}
            {activeTab === "search" &&
              "Search for athletes by name or username"}
            {activeTab === "pending" && "Manage your pending invitations"}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Tabs Navigation */}
          <div className="border-b bg-white shrink-0">
            <TabsList className="w-full h-auto bg-transparent border-0 p-0 grid grid-cols-3">
              <TabsTrigger
                value="nearby"
                className="flex items-center justify-center gap-2 px-3 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/30 rounded-none transition-all"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">Nearby</span>
              </TabsTrigger>

              <TabsTrigger
                value="search"
                className="flex items-center justify-center gap-2 px-3 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-purple-50/30 rounded-none transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">Search</span>
              </TabsTrigger>

              <TabsTrigger
                value="pending"
                className="flex items-center justify-center gap-2 px-3 py-3 sm:py-4 border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:text-orange-600 data-[state=active]:bg-orange-50/30 rounded-none transition-all"
              >
                <Clock className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium">Pending</span>
              </TabsTrigger>
            </TabsList>

            {/* Conditional Search Bar */}
            {showSearchBar && (
              <div className="p-4 border-t bg-slate-50">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <Input
                    placeholder={
                      activeTab === "nearby"
                        ? "Filter nearby athletes..."
                        : "Search by name, username, or sport..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                    aria-label="Search athletes"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabs Content - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <TabsContent value="nearby" className="mt-0 p-4 sm:p-6 h-full">
              <AthleteSearch
                teamId={teamId}
                searchQuery={searchQuery}
                tab="nearby"
                onClose={() => setIsOpen(false)}
              />
            </TabsContent>

            <TabsContent value="search" className="mt-0 p-4 sm:p-6">
              <AthleteSearch
                teamId={teamId}
                searchQuery={searchQuery}
                tab="search"
                onClose={() => setIsOpen(false)}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-0 p-4 sm:p-6">
              <PendingInvites teamId={teamId} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
