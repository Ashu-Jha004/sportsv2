// lib/cloudinary/upload.ts

/**
 * =============================================================================
 * CLOUDINARY UPLOAD UTILITY
 * =============================================================================
 * Client-side image upload to Cloudinary
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload image to Cloudinary
 *
 * @param file - Image file to upload
 * @param onProgress - Optional progress callback
 * @returns Cloudinary response with secure_url
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<CloudinaryUploadResponse> {
  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!validTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image."
    );
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  // Get upload preset from environment
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!uploadPreset || !cloudName) {
    throw new Error(
      "Cloudinary configuration missing. Please set environment variables."
    );
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "athlete-profiles"); // Organize uploads

  // Upload with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        const percentage = Math.round((e.loaded / e.total) * 100);
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage,
        });
      }
    });

    // Handle completion
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(
            xhr.responseText
          );
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Handle errors
    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload cancelled"));
    });

    // Send request
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    );
    xhr.send(formData);
  });
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  file: File,
  minWidth = 200,
  minHeight = 200,
  maxWidth = 4096,
  maxHeight = 4096
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width < minWidth || img.height < minHeight) {
        reject(
          new Error(
            `Image too small. Minimum size is ${minWidth}x${minHeight}px`
          )
        );
        return;
      }

      if (img.width > maxWidth || img.height > maxHeight) {
        reject(
          new Error(
            `Image too large. Maximum size is ${maxWidth}x${maxHeight}px`
          )
        );
        return;
      }

      resolve(true);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Create preview URL from file
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
