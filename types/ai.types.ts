import type {
  ChatMessage,
  AIRole,
  StatsSnapshot,
} from "@/stores/ai/aiChat.store";

// Re-export store types for convenience
export type { ChatMessage, AIRole, StatsSnapshot };

// Server action response type
export interface GeminiChatResponse {
  success: boolean;
  message?: string;
  tokenCount?: number;
  error?: string;
  rateLimited?: boolean;
}

// UI component props
export interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface AIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role: AIRole | null;
}

// Role metadata for UI
export interface AIRoleMetadata {
  id: AIRole;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const AI_ROLES: Record<AIRole, AIRoleMetadata> = {
  coach: {
    id: "coach",
    label: "AI Coach",
    icon: "💪",
    description: "Get personalized training advice and performance insights",
    color: "blue",
  },
  comparison: {
    id: "comparison",
    label: "AI Comparison",
    icon: "📊",
    description: "Compare your stats with other athletes objectively",
    color: "purple",
  },
  nutritionist: {
    id: "nutritionist",
    label: "AI Nutritionist",
    icon: "🥗",
    description: "Optimize your nutrition for peak performance",
    color: "green",
  },
};

// Message display helpers
export interface MessageGroup {
  date: string;
  messages: ChatMessage[];
}

export function groupMessagesByDate(messages: ChatMessage[]): MessageGroup[] {
  const groups: { [key: string]: ChatMessage[] } = {};

  messages.forEach((msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
  });

  return Object.entries(groups).map(([date, msgs]) => ({
    date,
    messages: msgs,
  }));
}

// Token usage display
export interface TokenUsageInfo {
  session: number;
  lastRequest: number;
  percentage: number; // % of daily limit (estimated)
}

export function formatTokenUsage(usage: {
  session: number;
  lastRequest: number;
}): TokenUsageInfo {
  const DAILY_LIMIT = 1_500_000; // Gemini free tier
  const percentage = (usage.session / DAILY_LIMIT) * 100;

  return {
    ...usage,
    percentage: Math.min(percentage, 100),
  };
}

// Error type guards
export function isRateLimitError(response: GeminiChatResponse): boolean {
  return (
    response.rateLimited === true ||
    (response.error?.toLowerCase().includes("rate limit") ?? false)
  );
}

export function isRetryableError(response: GeminiChatResponse): boolean {
  if (!response.error) return false;

  const retryableMessages = [
    "rate limit",
    "timeout",
    "try again",
    "temporarily unavailable",
  ];

  return retryableMessages.some((msg) =>
    response.error!.toLowerCase().includes(msg)
  );
}
