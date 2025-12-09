import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Gemini 2.0 Flash - Free tier (15 RPM, 1M TPM, 1.5M tokens/day)
export const GEMINI_MODEL = "gemini-2.5-flash";

// Safety settings
export const safetySettings: any = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

// Generation config for optimal performance
export const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 65536, // Reasonable limit for chat
};

// Get model instance
export function getGeminiModel() {
  try {
    return genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      safetySettings,
      generationConfig,
    });
  } catch (error) {
    console.error("❌ Failed to initialize Gemini model:", error);
    throw new Error("AI service unavailable. Please check API key.");
  }
}

// Token estimation (approximate)
export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 4000; // 4 seconds (15 RPM = 4s between requests)

export async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastRequestTime = Date.now();
}

// Format stats for AI context

export function formatStatsForAI(stats: any): string {
  try {
    const sections: string[] = [];

    // // Header
    // sections.push(`ATHLETE PERFORMANCE ANALYSIS`);
    // sections.push(`Name: ${stats.athleteName}`);
    // sections.push(`Date: ${new Date(stats.recordedAt).toLocaleDateString()}`);
    // sections.push(``);

    // Anthropometrics
    if (stats.rawData?.anthropometrics) {
      sections.push(`ANTHROPOMETRICS:`);
      const anthro = stats.rawData.anthropometrics;
      if (anthro.basic) {
        sections.push(`- Height: ${anthro.basic.height}cm`);
        sections.push(`- Weight: ${anthro.basic.weight}kg`);
        sections.push(`- Age: ${anthro.basic.age}`);
        sections.push(`- Body Fat: ${anthro.basic.bodyFat}%`);
        sections.push(`- BMI: ${anthro.basic.bmi}`);
      }
      sections.push(``);
    }

    // Strength Scores
    if (stats.categories?.strength) {
      sections.push(`STRENGTH SCORES:`);
      const str = stats.categories.strength;
      sections.push(`- Muscle Mass: ${str.muscleMass || "N/A"}`);
      sections.push(`- Endurance Strength: ${str.enduranceStrength || "N/A"}`);
      sections.push(
        `- Explosive Power: ${str.explosivePower?.toFixed(2) || "N/A"}`
      );
      sections.push(``);
    }

    // Recent Strength Tests
    if (stats.rawData?.tests?.strength?.[0]?.tests) {
      sections.push(`STRENGTH TESTS (Most Recent):`);
      const tests = stats.rawData.tests.strength[0].tests;

      if (tests.countermovementJump) {
        sections.push(
          `- Countermovement Jump: ${tests.countermovementJump.bestAttempt?.jumpHeight.toFixed(
            1
          )}cm, ${tests.countermovementJump.bestAttempt?.relativePeakPower.toFixed(
            1
          )}W/kg`
        );
      }
      if (tests.deadliftVelocity) {
        sections.push(
          `- Deadlift: ${tests.deadliftVelocity.loadUsedKg}kg x ${tests.deadliftVelocity.reps} reps, 1RM: ${tests.deadliftVelocity.oneRepMaxKg}kg`
        );
      }
      if (tests.plankHold) {
        sections.push(
          `- Plank Hold: ${tests.plankHold.calculated?.totalHoldTimeSeconds}s total`
        );
      }
      sections.push(``);
    }

    // Speed Tests
    if (stats.rawData?.tests?.speed?.[0]?.tests) {
      sections.push(`SPEED & AGILITY TESTS:`);
      const tests = stats.rawData.tests.speed[0].tests;

      if (tests.tenMeterSprint) {
        sections.push(`- 10m Sprint: ${tests.tenMeterSprint.timeSeconds}s`);
      }
      if (tests.fourtyMeterDash) {
        sections.push(`- 40m Dash: ${tests.fourtyMeterDash.timeSeconds}s`);
      }
      if (tests.illinoisAgility) {
        sections.push(
          `- Illinois Agility: Best ${tests.illinoisAgility.calculated?.bestTime}s, Rating: ${tests.illinoisAgility.calculated?.performanceRating}`
        );
      }
      if (tests.standingLongJump) {
        sections.push(
          `- Standing Long Jump: ${tests.standingLongJump.distanceMeters}m`
        );
      }
      sections.push(``);
    }

    // Stamina Tests
    if (stats.rawData?.tests?.stamina?.[0]?.tests) {
      sections.push(`STAMINA & ENDURANCE TESTS:`);
      const tests = stats.rawData.tests.stamina[0].tests;

      if (tests.beepTest) {
        sections.push(
          `- Beep Test: Level ${tests.beepTest.levelReached}.${tests.beepTest.shuttlesInFinalLevel}, VO2Max: ${tests.beepTest.calculated?.estimatedVO2Max}, Rating: ${tests.beepTest.calculated?.vo2MaxRating}`
        );
      }
      if (tests.yoYoTest) {
        sections.push(
          `- Yo-Yo Test: ${tests.yoYoTest.calculated?.totalDistance}m, Speed Level ${tests.yoYoTest.speedLevelReached}, ${tests.yoYoTest.calculated?.performanceLevel}`
        );
      }
      if (tests.cooperTest) {
        sections.push(`- Cooper Test: ${tests.cooperTest.distanceMeters}m`);
      }
      if (tests.sitAndReach) {
        sections.push(
          `- Sit & Reach: ${tests.sitAndReach.calculated?.bestReach}cm, Flexibility: ${tests.sitAndReach.calculated?.flexibilityRating}`
        );
      }
      sections.push(``);
    }

    // Injuries
    if (stats.rawData?.injuries && stats.rawData.injuries.length > 0) {
      sections.push(`INJURY HISTORY:`);
      stats.rawData.injuries.forEach((injury: any) => {
        sections.push(`- ${injury.type}: ${injury.status}`);
      });
      sections.push(``);
    } else {
      sections.push(`INJURY HISTORY: None reported`);
      sections.push(``);
    }

    return sections.join("\n");
  } catch (error) {
    console.error("❌ Error formatting stats:", error);
    return `ATHLETE DATA: ${stats.athleteName || "Unknown"} - ${
      stats.recordedAt || "No date"
    }`;
  }
}
