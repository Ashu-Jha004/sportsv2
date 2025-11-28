import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types
export type AIRole = "coach" | "comparison" | "nutritionist";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokenCount?: number;
}

export interface StatsSnapshot {
  athleteId: string;
  athleteName: string;
  recordedAt: string;
  overallScore?: number;
  categories: {
    strength?: any;
    speed?: any;
    stamina?: any;
    anthropometric?: any;
  };
  rawData?: any; // Full stats if needed
}

interface AISessionState {
  isOpen: boolean;
  currentRole: AIRole | null;
  messages: ChatMessage[];
  statsSnapshot: StatsSnapshot | null;
  isLoading: boolean;
  error: string | null;
  tokenUsage: {
    session: number;
    lastRequest: number;
  };
  sidebarOpen: boolean;
}

interface AISessionActions {
  // Dialog control
  openDialog: (role: AIRole, stats: StatsSnapshot) => void;
  closeDialog: () => void;

  // Role management
  switchRole: (role: AIRole) => void;

  // Message management
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;

  // Stats management
  updateStats: (stats: StatsSnapshot) => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;

  // Token tracking
  updateTokenUsage: (tokens: number) => void;

  // Conversation management
  getConversationHistory: (limit?: number) => ChatMessage[];
  resetSession: () => void;
}

type AISessionStore = AISessionState & AISessionActions;

const MAX_MESSAGES = 10; // Keep last 10 messages for context

const initialState: AISessionState = {
  isOpen: false,
  currentRole: null,
  messages: [],
  statsSnapshot: null,
  isLoading: false,
  error: null,
  tokenUsage: {
    session: 0,
    lastRequest: 0,
  },
  sidebarOpen: true,
};

export const useAIChatStore = create<AISessionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Open dialog with role and stats context
      openDialog: (role, stats) => {
        console.log(`🤖 Opening AI ${role} with stats:`, stats);
        set({
          isOpen: true,
          currentRole: role,
          statsSnapshot: stats,
          messages: [],
          error: null,
          tokenUsage: { session: 0, lastRequest: 0 },
        });
      },

      // Close dialog and preserve state briefly for recovery
      closeDialog: () => {
        const state = get();
        console.log("🚪 Closing AI dialog");

        // Optional: Store in sessionStorage for recovery
        try {
          sessionStorage.setItem(
            "aiChatBackup",
            JSON.stringify({
              role: state.currentRole,
              messages: state.messages.slice(-5), // Keep last 5
              timestamp: Date.now(),
            })
          );
        } catch (err) {
          console.warn("Failed to backup chat:", err);
        }

        set({ isOpen: false });
      },

      // Switch AI role mid-conversation
      switchRole: (role) => {
        console.log(`🔄 Switching AI role to: ${role}`);
        set({ currentRole: role, error: null });
      },

      // Add message with auto-pruning
      addMessage: (message) => {
        const id = `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const newMessage: ChatMessage = {
          ...message,
          id,
          timestamp: new Date(),
        };

        set((state) => {
          const updatedMessages = [...state.messages, newMessage];

          // Keep only last MAX_MESSAGES
          const trimmedMessages =
            updatedMessages.length > MAX_MESSAGES
              ? updatedMessages.slice(-MAX_MESSAGES)
              : updatedMessages;

          console.log(
            `💬 Added message (${trimmedMessages.length}/${MAX_MESSAGES}):`,
            newMessage.role
          );

          return { messages: trimmedMessages };
        });
      },

      // Clear all messages
      clearMessages: () => {
        console.log("🗑️ Clearing all messages");
        set({ messages: [], tokenUsage: { session: 0, lastRequest: 0 } });
      },

      // Update stats snapshot
      updateStats: (stats) => {
        console.log("📊 Updating stats snapshot:", stats);
        set({ statsSnapshot: stats });
      },

      // Loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Error state
      setError: (error) => {
        console.error("❌ AI Chat Error:", error);
        set({ error, isLoading: false });
      },

      // Toggle stats sidebar
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      // Update token usage
      updateTokenUsage: (tokens) => {
        set((state) => ({
          tokenUsage: {
            session: state.tokenUsage.session + tokens,
            lastRequest: tokens,
          },
        }));
        console.log(
          `🎫 Tokens used: ${tokens} (session: ${get().tokenUsage.session})`
        );
      },

      // Get conversation history (for AI context)
      getConversationHistory: (limit = MAX_MESSAGES) => {
        const messages = get().messages;
        return messages.slice(-limit);
      },

      // Reset entire session
      resetSession: () => {
        console.log("🔄 Resetting AI session");
        set(initialState);
        try {
          sessionStorage.removeItem("aiChatBackup");
        } catch (err) {
          console.warn("Failed to clear backup:", err);
        }
      },
    }),
    { name: "AIChat" }
  )
);

// Utility hook for getting role-specific system prompts
export const useRoleSystemPrompt = (role: AIRole | null): string => {
  if (!role) return "";

  const prompts: Record<AIRole, string> = {
    coach: `You are an expert AI Sports Coach and Performance Trainer. Analyze the athlete's performance data and provide actionable training advice, technique improvements, and personalized workout recommendations. Be encouraging, specific, and data-driven.`,

    comparison: `You are an AI Athlete Comparison Analyst. Compare performance metrics between athletes objectively, highlighting strengths, weaknesses, and areas for improvement. Provide statistical insights and benchmarking data.`,

    nutritionist: `You are a certified AI Sports Nutritionist. Analyze the athlete's body composition and performance data to provide personalized nutrition recommendations, meal planning advice, and supplementation guidance. Focus on performance optimization and health.`,
  };

  return prompts[role];
};

// Recovery utility (call on app mount if needed)
export const recoverChatSession = (): {
  role: AIRole;
  messages: ChatMessage[];
} | null => {
  try {
    const backup = sessionStorage.getItem("aiChatBackup");
    if (!backup) return null;

    const data = JSON.parse(backup);
    const age = Date.now() - data.timestamp;

    // Only recover if less than 30 minutes old
    if (age > 30 * 60 * 1000) {
      sessionStorage.removeItem("aiChatBackup");
      return null;
    }

    return {
      role: data.role,
      messages: data.messages.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    };
  } catch (err) {
    console.warn("Failed to recover chat:", err);
    return null;
  }
};
