"use server";

/**
 * =============================================================================
 * MEDIA UPLOAD SERVER ACTIONS
 * =============================================================================
 * Server actions for uploading images/videos to Cloudinary
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import prisma from "@/lib/prisma";

// Configure Cloudinary (add your credentials to .env)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload image/video to Cloudinary
 * @param formData - Multipart form data containing file
 */
export async function uploadMedia(formData: FormData): Promise<{
  success: boolean;
  url: string | null;
  error?: string;
}> {
  try {
    // Authentication check
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return {
        success: false,
        url: null,
        error: "UNAUTHORIZED",
      };
    }

    // Get the uploaded file
    const file = formData.get("file") as File;
    if (!file) {
      return {
        success: false,
        url: null,
        error: "NO_FILE",
      };
    }

    console.log(
      `📤 [uploadMedia] Uploading: ${file.name} (${file.size} bytes)`
    );

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        url: null,
        error: "INVALID_FILE_TYPE",
      };
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        url: null,
        error: "FILE_TOO_LARGE",
      };
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sports-chat",
          transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
          resource_type: file.type.startsWith("video") ? "video" : "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });

    console.log(`✅ [uploadMedia] Success: ${uploadResult.secure_url}`);

    return {
      success: true,
      url: uploadResult.secure_url,
    };
  } catch (error) {
    console.error("[uploadMedia] Error:", error);
    return {
      success: false,
      url: null,
      error: error instanceof Error ? error.message : "UPLOAD_FAILED",
    };
  }
}
