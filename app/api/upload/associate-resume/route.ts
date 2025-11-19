import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";

// Force environment variable check
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Validate environment variables
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Missing Cloudinary environment variables:", {
    cloud_name: !!CLOUDINARY_CLOUD_NAME,
    api_key: !!CLOUDINARY_API_KEY,
    api_secret: !!CLOUDINARY_API_SECRET,
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    // Verify Cloudinary is configured
    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          error: "Cloudinary is not configured",
          code: "CLOUDINARY_NOT_CONFIGURED",
          details: "Missing environment variables",
        },
        { status: 500 }
      );
    }

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided", code: "FILE_MISSING" },
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed", code: "INVALID_FILE_TYPE" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    console.log("Starting upload for user:", userId);
    console.log("File name:", file.name, "Size:", file.size);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sparta/associate/resume",
          resource_type: "raw",
          public_id: `${userId}_${Date.now()}`,
          format: "pdf",
          allowed_formats: ["pdf"],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            console.log("Upload successful:", result?.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: "Resume uploaded successfully",
    });
  } catch (error: any) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload resume",
        code: "UPLOAD_FAILED",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Optional: DELETE endpoint to remove old resume
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID required" },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    return NextResponse.json({ success: true, message: "Resume deleted" });
  } catch (error: any) {
    console.error("Resume deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete resume", details: error.message },
      { status: 500 }
    );
  }
}
