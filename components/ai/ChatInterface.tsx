"use client";

import * as React from "react";
import { useAIChatStore } from "@/stores/ai/aiChat.store";
import { AI_ROLES } from "@/types/ai.types";
import { sendChatMessage } from "../../app/(protected)/actions/ai/geminiChat"; // ✅ Only import server action
import { sanitizeUserInput } from "@/lib/ai/chatUtils"; // ✅ Import utility from lib
import {
  ChatMessage,
  ChatMessageLoading,
  ChatMessageError,
} from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { StatsSidebar } from "./StatsSidebar";
import { Sparkles, AlertCircle } from "lucide-react";

export function ChatInterface() {
  const {
    currentRole,
    messages,
    statsSnapshot,
    isLoading,
    error,
    sidebarOpen,
    addMessage,
    setLoading,
    setError,
    getConversationHistory,
    updateTokenUsage,
  } = useAIChatStore();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle sending message
  const handleSend = React.useCallback(
    async (userMessage: string) => {
      console.log("🎯 ChatInterface received message:", {
        userMessage,
        type: typeof userMessage,
        length: userMessage?.length,
      });

      // Type guard and validation
      if (typeof userMessage !== "string") {
        console.error(
          "❌ Invalid message type:",
          typeof userMessage,
          userMessage
        );
        setError("Invalid message format");
        return;
      }

      if (!currentRole || !statsSnapshot) {
        setError("Session not initialized properly");
        return;
      }

      // Sanitize and validate
      const sanitized = sanitizeUserInput(userMessage); // ✅ Now returns string synchronously

      console.log("✨ Sanitized message:", {
        type: typeof sanitized,
        sanitized,
        length: sanitized.length,
      });

      if (!sanitized || sanitized.length === 0) {
        setError("Message cannot be empty");
        return;
      }

      // Add user message to UI
      addMessage({
        role: "user",
        content: sanitized,
      });

      // Clear previous errors
      if (error) {
        setError(null); // ✅ Only clear if there's an existing error
      }
      setLoading(true);

      try {
        // Get conversation history for context
        const history = getConversationHistory();

        console.log("📤 Sending to server:", {
          messageLength: sanitized.length,
          messagePreview: sanitized.slice(0, 50),
          role: currentRole,
          hasStats: !!statsSnapshot,
          historyLength: history.length,
        });

        // Call server action
        const response = await sendChatMessage(
          sanitized,
          currentRole,
          statsSnapshot,
          history
        );

        console.log("📥 Server response:", response);

        // Check if response exists
        if (!response) {
          throw new Error("No response received from server");
        }

        if (!response.success) {
          throw new Error(response.error || "Failed to get response from AI");
        }

        // Validate response has message
        if (!response.message || typeof response.message !== "string") {
          throw new Error("AI returned invalid response format");
        }

        // Add AI response
        addMessage({
          role: "assistant",
          content: response.message,
          tokenCount: response.tokenCount,
        });

        // Update token usage
        if (response.tokenCount) {
          updateTokenUsage(response.tokenCount);
        }
      } catch (err) {
        console.error("❌ Chat error:", err);

        // Better error message handling
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "An unexpected error occurred. Please try again.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      currentRole,
      statsSnapshot,
      addMessage,
      setError,
      setLoading,
      getConversationHistory,
      updateTokenUsage,
    ]
  );

  if (!currentRole) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No AI role selected</p>
        </div>
      </div>
    );
  }

  const roleData = AI_ROLES[currentRole];
  const hasMessages = messages.length > 0;

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 bg-linear-to-b from-gray-50 to-white"
        >
          {/* Welcome Message */}
          {!hasMessages && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <div className="text-6xl mb-4">{roleData.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {roleData.label}
              </h2>
              <p className="text-gray-600 mb-6">{roleData.description}</p>

              {statsSnapshot && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 justify-center text-blue-700 mb-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold">Context Loaded</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    I have access to{" "}
                    <strong>{statsSnapshot.athleteName}</strong>'s performance
                    data from{" "}
                    {new Date(statsSnapshot.recordedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="text-left bg-white rounded-lg border border-gray-200 p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  💡 Suggested Questions:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  {currentRole === "coach" && (
                    <>
                      <li>• What areas should I focus on improving?</li>
                      <li>• Create a training plan for me</li>
                      <li>• How can I improve my speed metrics?</li>
                    </>
                  )}
                  {currentRole === "comparison" && (
                    <>
                      <li>• How do my stats compare to average?</li>
                      <li>• What are my strongest categories?</li>
                      <li>• Where do I rank in stamina tests?</li>
                    </>
                  )}
                  {currentRole === "nutritionist" && (
                    <>
                      <li>• What should my daily calorie intake be?</li>
                      <li>• Suggest a meal plan for my training</li>
                      <li>• How can I optimize my body composition?</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading State */}
          {isLoading && <ChatMessageLoading />}

          {/* Error State */}
          {error && !isLoading && <ChatMessageError error={error} />}

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>

      {/* Stats Sidebar (Desktop) */}
      {sidebarOpen && statsSnapshot && <StatsSidebar stats={statsSnapshot} />}
    </div>
  );
}
