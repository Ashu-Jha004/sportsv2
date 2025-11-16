// app/api/cloudinary-signature/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY!;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET!;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const CLOUDINARY_UPLOAD_FOLDER =
  process.env.CLOUDINARY_UPLOAD_FOLDER ?? "avatars";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("CLOUDINARY env", {
      name: CLOUDINARY_CLOUD_NAME,
      key: CLOUDINARY_API_KEY,
      hasSecret: !!CLOUDINARY_API_SECRET,
    });

    const timestamp = Math.round(Date.now() / 1000);

    // Allow client to optionally send extra params to sign
    let clientParams: Record<string, unknown> = {};
    try {
      const body = await request.json().catch(() => null);
      if (body && typeof body === "object" && "paramsToSign" in body) {
        clientParams =
          (body as { paramsToSign?: Record<string, unknown> }).paramsToSign ??
          {};
      }
    } catch {
      // ignore body parsing errors and use default params
    }

    const paramsToSign = {
      timestamp,
      folder: CLOUDINARY_UPLOAD_FOLDER,
      ...clientParams,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      CLOUDINARY_API_SECRET
    );

    return NextResponse.json(
      {
        success: true,
        signature,
        timestamp,
        apiKey: CLOUDINARY_API_KEY,
        cloudName: CLOUDINARY_CLOUD_NAME,
        folder: CLOUDINARY_UPLOAD_FOLDER,
        paramsToSign,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Cloudinary signature error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate upload signature." },
      { status: 500 }
    );
  }
}
