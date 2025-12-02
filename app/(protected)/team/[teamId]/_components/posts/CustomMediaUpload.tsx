"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CustomMediaUploadProps {
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

const acceptedFormats = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max per file

const isImage = (file: File) => file.type.startsWith("image/");
const isVideo = (file: File) => file.type.startsWith("video/");

// Utility to generate Cloudinary optimized URL
const getOptimizedCloudinaryUrl = (url: string, width = 800, height = 800) => {
  if (url.includes("cloudinary.com")) {
    return url.replace(
      "/upload/",
      `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`
    );
  }
  return url;
};

export function CustomMediaUpload({
  onChange,
  maxFiles = 6,
}: CustomMediaUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create preview URLs on file selection
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Upload function for all selected files
  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error("Please select files before uploading");
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File ${file.name} exceeds 50MB size limit.`);
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.secure_url);
      }

      onChange(uploadedUrls);
      setFiles([]);
      setPreviewUrls([]);
      toast.success("Upload successful!");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Limit total files count
    if (selectedFiles.length + files.length > maxFiles) {
      toast.error(`You can upload up to ${maxFiles} files`);
      return;
    }

    const validFiles = Array.from(selectedFiles).filter((file) =>
      acceptedFormats.includes(file.type)
    );

    if (validFiles.length === 0) {
      toast.error("Unsupported file types selected.");
      return;
    }

    setFiles((prev) => [...prev, ...validFiles]);
    if (inputRef.current) inputRef.current.value = ""; // Reset input
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <input
        title={"upload"}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleFilesSelected}
        multiple
        disabled={uploading}
        ref={inputRef}
        className="block"
      />
      {/* Previews */}
      <div className="flex flex-wrap gap-3">
        {previewUrls.map((url, i) => (
          <div
            key={i}
            className="relative w-20 h-20 rounded-md overflow-hidden"
          >
            {isVideo(files[i]) ? (
              <video
                src={url}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              />
            ) : (
              <img
                src={url}
                alt={`preview-${i}`}
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={() => removeFile(i)}
              className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              aria-label="Remove file"
              type="button"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      <Button onClick={uploadFiles} disabled={uploading || files.length === 0}>
        {uploading ? "Uploading..." : "Upload Media"}
      </Button>
    </div>
  );
}
