// app/api/onboarding/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OnboardingRequestSchema } from "@/lib/validations/onboarding/onboarding.dto";
import { OnboardingService } from "@/server/onboarding/onboarding.service";

const service = new OnboardingService();

export async function POST(request: Request) {
  try {
    // 1. Auth check via Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.log("[/api/onboarding] auth userId:", userId);

    // 2. Parse and validate body
    const body = await request.json();
    console.log("[/api/onboarding] body parsed");
    console.log("DATABASE_URL host:", new URL(process.env.DATABASE_URL!).host);

    const payload = OnboardingRequestSchema.parse(body);
    console.log("[/api/onboarding] payload validated");

    // 3. Delegate to service
    const result = await service.completeOnboarding(userId, payload);
    console.log("[/api/onboarding] service result:", result);

    if (!result.success) {
      console.log("[/api/onboarding] result failed");
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 4. Success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    // Zod validation errors or unexpected issues
    console.error("Onboarding route error:", err);

    // Handle Zod errors explicitly if desired
    if (err instanceof Error && "issues" in err) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid onboarding data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
