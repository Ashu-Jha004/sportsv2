"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAssociateStore } from "@/stores/associate/associate-store";
import { useUploadResume } from "../../../hooks/use-associate";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const resumeSchema = z.object({
  resumeUrl: z.string().url("Invalid resume URL").min(1, "Resume is required"),
  resumePublicId: z.string().min(1, "Resume public ID is required"),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

interface ResumeUploadStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function ResumeUploadStep({
  onValidationChange,
}: ResumeUploadStepProps) {
  const { formData, updateField, resumePreview, setResumePreview } =
    useAssociateStore();
  const { mutateAsync: uploadResume, isPending: isUploading } =
    useUploadResume();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      resumeUrl: formData.resumeUrl || "",
      resumePublicId: formData.resumePublicId || "",
    },
    mode: "onChange",
  });

  const { formState, setValue, watch } = form;
  const resumeUrl = watch("resumeUrl");

  useEffect(() => {
    onValidationChange(formState.isValid);
  }, [formState.isValid, onValidationChange]);

  useEffect(() => {
    if (resumeUrl) {
      updateField("resumeUrl", resumeUrl);
    }
  }, [resumeUrl, updateField]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setResumePreview(file);
    updateField("resumeFileName", file.name);
    setIsUploaded(false);

    // Clear previous upload
    setValue("resumeUrl", "");
    setValue("resumePublicId", "");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const result = await uploadResume(selectedFile);

      // Update form with upload result
      setValue("resumeUrl", result.url);
      setValue("resumePublicId", result.publicId);

      // Update store
      updateField("resumeUrl", result.url);
      updateField("resumePublicId", result.publicId);

      setIsUploaded(true);
      toast.success("Resume uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload resume");
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setResumePreview(null);
    setIsUploaded(false);
    setValue("resumeUrl", "");
    setValue("resumePublicId", "");
    updateField("resumeUrl", "");
    updateField("resumePublicId", "");
    updateField("resumeFileName", "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload Resume
        </h2>
        <p className="text-gray-600">
          Upload your resume in PDF format (max 10MB)
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="resumeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume (PDF) *</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {/* File Upload Area */}
                    {!selectedFile && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Click to select or drag and drop your resume
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF files only, up to 10MB
                          </p>
                        </div>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="resume-upload"
                        />
                        <label htmlFor="resume-upload">
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Select Resume
                          </Button>
                        </label>
                      </div>
                    )}

                    {/* File Preview */}
                    {selectedFile && (
                      <div className="border border-gray-300 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 bg-red-100 rounded">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {selectedFile.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(selectedFile.size)}
                              </p>

                              {/* Upload Status */}
                              <div className="mt-2">
                                {isUploaded ? (
                                  <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Uploaded successfully</span>
                                  </div>
                                ) : isUploading ? (
                                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Uploading...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Ready to upload</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {!isUploading && (
                            <button
                              title="close"
                              type="button"
                              onClick={handleRemove}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>

                        {/* Upload Button */}
                        {!isUploaded && (
                          <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full mt-4"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Resume
                              </>
                            )}
                          </Button>
                        )}

                        {/* View Uploaded Resume */}
                        {isUploaded && resumeUrl && (
                          <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full mt-4"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Uploaded Resume
                            </Button>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Your resume should highlight your coaching/mentoring
                  experience
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Requirements Checklist */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-3">Resume Requirements</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>PDF format only</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Maximum file size: 10MB</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Include relevant coaching/mentoring experience</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Include any certifications or qualifications</span>
          </li>
        </ul>
      </div>

      {/* Visual Feedback */}
      {formState.isValid && isUploaded && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Resume uploaded and ready!</span>
        </div>
      )}
    </div>
  );
}
