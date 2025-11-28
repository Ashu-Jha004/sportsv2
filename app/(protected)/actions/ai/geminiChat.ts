"use server";

import {
  getGeminiModel,
  waitForRateLimit,
  estimateTokens,
  formatStatsForAI,
} from "@/lib/ai/geminiConfig";
import type {
  ChatMessage,
  AIRole,
  StatsSnapshot,
} from "@/stores/ai/aiChat.store";

// Response type
export interface GeminiChatResponse {
  success: boolean;
  message?: string;
  tokenCount?: number;
  error?: string;
  rateLimited?: boolean;
}

// Role-specific system prompts
const SYSTEM_PROMPTS: Record<AIRole, string> = {
  coach: `You are an expert AI Sports Coach and Performance Trainer with 20+ years of experience. 

YOUR ROLE:
- Analyze athlete performance data scientifically
- Provide actionable, personalized training advice
- Focus on technique improvements and progressive overload
- Be encouraging yet realistic about timeframes
- Always cite specific metrics from the data

RESPONSE STYLE:
- Start with key insights from their data
- Use bullet points for action items
- Include specific exercises/drills when relevant
- Keep responses concise (under 300 words unless asked for detail)
- Use emojis sparingly for engagement (💪 🎯 ⚡)`,

  comparison: `You are an AI Athlete Performance Analyst specializing in comparative analytics.

YOUR ROLE:
- Compare performance metrics objectively
- Highlight statistical differences and trends
- Provide percentile rankings when possible
- Identify competitive advantages and gaps
- Suggest areas for improvement based on comparison

RESPONSE STYLE:
- Present data in clear comparisons
- Use tables or structured lists
- Avoid subjective judgments, focus on numbers
- Provide context (e.g., "X is 15% faster than Y in sprints")
- Keep responses data-driven and factual`,

  nutritionist: `You are a certified Sports Nutritionist (RD, CSSD equivalent) specializing in athletic performance.

YOUR ROLE:
- Analyze body composition and performance data
- Provide evidence-based nutrition recommendations
- Focus on performance optimization, not weight loss
- Consider training demands and recovery needs
- Tailor advice to athlete's specific sport/goals

RESPONSE STYLE:
- Start with key nutritional insights from their data
- Provide specific macro/micro recommendations
- Include meal timing strategies
- Suggest practical food choices
- Mention supplements only when evidence-based
- Keep responses actionable (under 300 words)`,
};

// Build conversation context
function buildConversationContext(
  role: AIRole,
  stats: StatsSnapshot | null,
  history: ChatMessage[]
): string {
  let context = SYSTEM_PROMPTS[role];

  // Add stats context if available
  if (stats) {
    context += "\n\n" + formatStatsForAI(stats);
  }

  // Add conversation history (last 8 messages for context)
  if (history.length > 0) {
    context += "\n\nCONVERSATION HISTORY:";
    history.slice(-8).forEach((msg) => {
      if (msg.role !== "system") {
        context += `\n${msg.role.toUpperCase()}: ${msg.content}`;
      }
    });
  }

  return context;
}

// Main chat function
export async function sendChatMessage(
  userMessage: string,
  role: AIRole,
  statsSnapshot: StatsSnapshot | null,
  conversationHistory: ChatMessage[]
): Promise<GeminiChatResponse> {
  try {
    // Type validation
    if (typeof userMessage !== "string") {
      console.error("❌ Server received non-string:", typeof userMessage);
      return {
        success: false,
        error: "Invalid message format",
      };
    }

    console.log(
      `🤖 Server processing ${role} message (${userMessage.length} chars)`
    );

    // Validation
    if (!userMessage.trim()) {
      return {
        success: false,
        error: "Message cannot be empty",
      };
    }

    if (userMessage.length > 4000) {
      return {
        success: false,
        error: "Message too long. Please keep it under 4000 characters.",
      };
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in environment");
      return {
        success: false,
        error: "AI service not configured. Please contact support.",
      };
    }

    console.log("✅ API key exists");

    // Rate limiting
    console.log("⏳ Applying rate limit...");
    await waitForRateLimit();
    console.log("✅ Rate limit passed");

    // Build context
    const systemContext = buildConversationContext(
      role,
      statsSnapshot,
      conversationHistory
    );

    // Estimate tokens for logging
    const estimatedInputTokens =
      estimateTokens(systemContext) + estimateTokens(userMessage);

    console.log(`📊 Estimated input tokens: ${estimatedInputTokens}`);

    // Get model and generate response
    console.log("🔧 Initializing Gemini model...");
    const model = getGeminiModel();
    console.log("✅ Model initialized");

    console.log("💬 Starting chat...");
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood. I'm ready to assist as your AI " + role + ".",
            },
          ],
        },
      ],
    });
    console.log("✅ Chat started");

    // Send message with timeout
    console.log("📤 Sending message to Gemini...");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout (30s)")), 30000)
    );

    const responsePromise = chat.sendMessage(userMessage);

    const result = await Promise.race([responsePromise, timeoutPromise]);
    console.log("✅ Received response from Gemini");

    // Extract response
    const responseText = result.response.text();

    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Empty response from AI");
    }

    // Estimate response tokens
    const estimatedOutputTokens = estimateTokens(responseText);
    const totalTokens = estimatedInputTokens + estimatedOutputTokens;

    console.log(
      `✅ Response generated: ${responseText.length} chars, ~${totalTokens} tokens`
    );

    return {
      success: true,
      message: responseText,
      tokenCount: totalTokens,
    };
  } catch (error: any) {
    console.error("❌ Gemini chat error:", error);
    console.error("❌ Error type:", error?.constructor?.name);
    console.error("❌ Error message:", error?.message);
    console.error("❌ Error status:", error?.status);

    // Check for specific Gemini API errors
    const errorMessage = error?.message || "";
    const errorStatus = error?.status || error?.statusCode || 0;

    // Rate limit detection (HTTP 429)
    if (
      errorStatus === 429 ||
      errorMessage.toLowerCase().includes("resource exhausted")
    ) {
      return {
        success: false,
        error: "Rate limit reached. Please wait a moment and try again.",
        rateLimited: true,
      };
    }

    // Timeout
    if (errorMessage.includes("timeout")) {
      return {
        success: false,
        error:
          "Request took too long. Please try again with a shorter message.",
      };
    }

    // Safety/content filter
    if (
      errorMessage.toLowerCase().includes("safety") ||
      errorMessage.toLowerCase().includes("blocked")
    ) {
      return {
        success: false,
        error:
          "Response blocked by safety filters. Please rephrase your question.",
      };
    }

    // API key issues (HTTP 401/403)
    if (
      errorStatus === 401 ||
      errorStatus === 403 ||
      errorMessage.toLowerCase().includes("api key")
    ) {
      return {
        success: false,
        error: "Authentication error. Please check your API key.",
      };
    }

    // Generic error with full message for debugging
    return {
      success: false,
      error: `Failed to process your message: ${errorMessage}. Please try again.`,
    };
  }
}
