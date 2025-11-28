// Export all AI-related server actions and types
"use server";

export { sendChatMessage } from "./geminiChat";
export type { GeminiChatResponse } from "./geminiChat";

// Re-export utilities from the correct location
export {
  validateStatsSnapshot,
  sanitizeUserInput,
} from "../../../../lib/ai/chatUtils";
