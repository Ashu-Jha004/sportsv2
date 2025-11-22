// components/guide/GuideResumeUpload.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileText, UploadCloud } from "lucide-react";
import type { UploadedDocument } from "@/lib/validations/guideOnboarding/guide-onboarding-schema";

type GuideResumeUploadProps = {
  value: UploadedDocument[]; // usually length 0 or 1
  onChange: (value: UploadedDocument[]) => void;
  label?: string;
  maxSizeMb?: number;
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

export function GuideResumeUpload({
  value,
  onChange,
  label = "Upload resume (PDF)",
  maxSizeMb = 10,
}: GuideResumeUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentFile = useMemo(() => value[0], [value]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) return;

      setError(null);

      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed.");
        return;
      }

      const maxBytes = maxSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File size must be less than ${maxSizeMb} MB.`);
        return;
      }

      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        const msg =
          "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_GUIDE_RESUME_PRESET.";
        console.error("[GuideResumeUpload] Missing Cloudinary env vars", {
          CLOUD_NAME,
          UPLOAD_PRESET_SET: Boolean(UPLOAD_PRESET),
        });
        setError(msg);
        return;
      }

      try {
        setIsUploading(true);
        setProgress(10);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text().catch(() => "");
          console.error("[GuideResumeUpload] Cloudinary upload failed", {
            status: response.status,
            statusText: response.statusText,
            body: text,
          });
          throw new Error("Failed to upload resume. Please try again.");
        }

        setProgress(70);

        const json = await response.json();

        // Cloudinary response fields: public_id, secure_url, format, bytes, etc.
        const uploaded: UploadedDocument = {
          url: json.secure_url,
          publicId: json.public_id,
          format: (json.format ?? "pdf") as string,
          bytes: typeof json.bytes === "number" ? json.bytes : undefined,
        };

        setProgress(100);

        onChange([uploaded]);

        console.info("[GuideResumeUpload] Resume uploaded successfully", {
          publicId: uploaded.publicId,
          bytes: uploaded.bytes,
        });
      } catch (err) {
        console.error("[GuideResumeUpload] Unexpected upload error", {
          error: err,
        });
        setError(
          process.env.NODE_ENV === "development"
            ? `Upload failed: ${(err as Error).message}`
            : "Upload failed. Please try again."
        );
      } finally {
        setIsUploading(false);
        setTimeout(() => setProgress(0), 800);
      }
    },
    [maxSizeMb, onChange]
  );

  const handleRemove = useCallback(() => {
    onChange([]);
    setError(null);
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {currentFile && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-red-500 hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          <UploadCloud className="h-6 w-6 text-indigo-500" />
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              Drag and drop your PDF resume here, or click to browse.
            </p>
            <p className="text-xs text-gray-500">
              Only PDF files up to {maxSizeMb} MB are supported.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            <span>{isUploading ? "Uploading..." : "Choose file"}</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={isUploading}
              onChange={handleFileChange}
            />
          </label>
        </div>

        {isUploading && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-gray-500">Uploading to Cloudinary…</p>
          </div>
        )}

        {currentFile && !isUploading && (
          <div className="flex items-center gap-2 rounded-md bg-white p-2 shadow-sm">
            <FileText className="h-4 w-4 text-emerald-600" />
            <div className="flex flex-col text-xs">
              <span className="font-medium text-gray-900">
                {currentFile.publicId}
              </span>
              <span className="text-gray-500">
                {currentFile.bytes
                  ? `${(currentFile.bytes / 1024 / 1024).toFixed(2)} MB`
                  : "PDF file"}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
