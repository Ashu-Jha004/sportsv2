import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/actions/social/upload-media.actions";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser for streaming
  },
};

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const result = await uploadMedia(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[upload-media API] Error:", error);
    return NextResponse.json(
      { success: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
