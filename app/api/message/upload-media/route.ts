import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/actions/social/upload-media.actions";

// --- START Next.js 14 App Router Configuration ---

/**
 * Force the route to be dynamically rendered (SSR).
 * This is the recommended practice for API routes handling complex dynamic data
 * like file uploads, preventing potential static caching/optimization issues
 * that can occur with streaming large bodies.
 */
export const dynamic = "force-dynamic";

// --- END Next.js 14 App Router Configuration ---

export async function POST(request: NextRequest) {
  try {
    // 1. Next.js Route Handlers automatically read multipart/form-data when you use
    //    request.formData(), so the old 'config' is not needed and should be removed.

    // 2. The manual Content-Type check is good, but if request.formData() succeeds,
    //    it means the content type was correct. We can simplify this.

    const formData = await request.formData();

    // You can still perform specific checks if needed, but the core issue is resolved
    // by removing the deprecated 'config' export.

    const result = await uploadMedia(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[upload-media API] Error:", error);
    // Best practice: return a specific error code for an expected failure case
    // (e.g., if formData() failed due to a malformed request body).
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to parse body as FormData")
    ) {
      return NextResponse.json(
        { success: false, error: "INVALID_FORM_DATA" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
