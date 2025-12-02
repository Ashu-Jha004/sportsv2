"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import AthleteSearch from "./AthleteSearch";
import PendingInvites from "./PendingInvites";

interface InviteDialogProps {
  teamId: string;
  teamName: string;
  canInvite: boolean;
}

export default function InviteDialog({
  teamId,
  teamName,
  canInvite,
}: InviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"nearby" | "search" | "pending">(
    "nearby"
  );

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveTab("nearby");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" disabled={!canInvite}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Player
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 border-b bg-slate-50">
            <DialogTitle className="text-2xl">
              Invite Players to {teamName}
            </DialogTitle>
            <p className="text-sm text-slate-600 mt-2">
              Find nearby athletes or search by name
            </p>
          </DialogHeader>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Search Bar + Tabs */}
            <div className="p-4 border-b space-y-4 bg-white sticky top-0 z-10">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search athletes by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs List */}
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="nearby" className="text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Nearby</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="text-sm">
                  <Search className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Search</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Pending</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="nearby" className="mt-0">
                <AthleteSearch
                  teamId={teamId}
                  searchQuery={searchQuery}
                  tab="nearby"
                />
              </TabsContent>

              <TabsContent value="search" className="mt-0">
                <AthleteSearch
                  teamId={teamId}
                  searchQuery={searchQuery}
                  tab="search"
                />
              </TabsContent>

              <TabsContent value="pending" className="mt-0">
                <PendingInvites teamId={teamId} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
