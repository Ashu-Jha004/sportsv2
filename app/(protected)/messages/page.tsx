"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { InboxList } from "@/components/social/inbox-list";
import { MessageThread } from "@/components/social/message-thread";
import { MessageCircle, ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewMessageDialog } from "./messages/NewMessageDialog";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function MessagesPage() {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded || !userId) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  return <MessagesClient userId={userId} />;
}

function MessagesClient({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ FIX 1: Parse conversation ID from URL params OR path
  const getConversationIdFromUrl = useCallback(() => {
    // Check if we're on /messages/[id] route
    const conversationId = params.conversationId as string;
    if (conversationId) return conversationId;

    // Check query param (fallback)
    return null;
  }, [params.conversationId]);

  // ✅ FIX 2: Sync state with URL
  useEffect(() => {
    const conversationId = getConversationIdFromUrl();
    setActiveConversationId(conversationId);
    if (conversationId) {
      setSidebarOpen(false); // Close sidebar when specific chat
    }
  }, [getConversationIdFromUrl]);

  // ✅ FIX 3: Handle conversation selection
  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      setSidebarOpen(false);

      // Navigate to specific conversation route
      router.push(`/messages/${conversationId}`);
    },
    [router]
  );

  // ✅ FIX 4: Handle back to inbox
  const handleBackToInbox = useCallback(() => {
    setActiveConversationId(null);
    setSidebarOpen(false);
    router.push("/messages");
  }, [router]);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto" />
      </div>
    );
  }

  const conversationId: any = getConversationIdFromUrl();

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-slate-50">
      {/* 📱 InboxList (Mobile: only when NO chat) */}
      <div
        className={`
        ${activeConversationId ? "hidden" : "block"} 
        md:block 
        w-full md:w-80 h-full border-r bg-white
      `}
      >
        <InboxList
          currentUserId={userId}
          activeConversationId={conversationId || undefined}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* 📱 MessageThread (Mobile: only when chat is selected) */}
      <div
        className={`
        flex-1 flex flex-col min-w-0 overflow-hidden 
        ${activeConversationId ? "block" : "hidden"} 
        md:block
      `}
      ></div>

      <NewMessageDialog />
    </div>
  );
}
