"use client";

import { redirect, useParams, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

import { MessageThread } from "@/components/social/message-thread";

import { ChevronLeft, MessageSquare, Menu } from "lucide-react";

export default function MessagesChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const conversationId = params.conversationId as string | undefined;

  useEffect(() => {
    if (params.conversationId) {
      setSidebarOpen(false);
    }
  }, [params.conversationId]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-center text-red-600 font-semibold">
          Please sign in to view messages
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex bg-slate-50">
      {/* Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {conversationId ? (
          <MessageThread
            conversationId={conversationId}
            currentUserId={user.id}
          />
        ) : (
          <NoConversationSelected />
        )}
      </main>
    </div>
  );
}

function NoConversationSelected() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center p-6 text-center select-none bg-white">
      <MessageSquare className="w-20 h-20 text-slate-300 mb-6" />
      <h2 className="text-3xl font-semibold text-slate-900 mb-2">
        Select a conversation
      </h2>
      <p className="text-lg text-slate-600 max-w-md">
        Choose a conversation from the sidebar to start chatting.
      </p>
    </div>
  );
}
