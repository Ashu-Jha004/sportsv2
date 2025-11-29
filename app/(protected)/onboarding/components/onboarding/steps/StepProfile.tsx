// src/features/onboarding/components/steps/StepProfile.tsx
"use client";

import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  OnboardingProfileSchema,
  type OnboardingProfileDTO,
} from "@/lib/validations/onboarding/onboarding.dto";
import { useOnboardingStore } from "@/stores/onboarding/store";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Upload, X, User, Loader2, CheckCircle2 } from "lucide-react";

type ProfileFormValues = OnboardingProfileDTO;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function StepProfile() {
  const { profile, updateProfile } = useOnboardingStore();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profile.profileImage || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(OnboardingProfileSchema),
    defaultValues: {
      username: profile.username ?? "",
      email: profile.email ?? "",
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      profileImage: profile.profileImage ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender ?? "OTHER",
      bio: profile.bio ?? "",
    },
    mode: "onChange",
  });

  // REMOVED: The problematic useEffect with form.watch()
  // Store updates will happen on field blur instead

  const handleFieldUpdate = useCallback(
    (field: keyof ProfileFormValues, value: any) => {
      updateProfile({ [field]: value });
    },
    [updateProfile]
  );

  // ... rest of upload handlers remain the same ...

  const validateImageFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Please upload a valid image file (JPEG, PNG, or WebP).";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5MB.";
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploadError(null);
      setUploadSuccess(false);

      const error = validateImageFile(file);
      if (error) {
        setUploadError(error);
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [validateImageFile]
  );

  const handleImageUpload = useCallback(async () => {
    if (!selectedFile) return;

    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        setUploading(true);
        setUploadError(null);
        setUploadSuccess(false);

        const sigRes = await fetch("/api/cloudinary-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!sigRes.ok) {
          throw new Error("Failed to get upload signature.");
        }

        const sigData = await sigRes.json();

        if (!sigData.success) {
          throw new Error(sigData.error || "Failed to get upload signature.");
        }

        const { signature, timestamp, apiKey, cloudName, folder } = sigData;

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          console.error("Cloudinary upload failed:", errorText);
          throw new Error("Failed to upload image to cloud storage.");
        }

        const uploadData = await uploadRes.json();

        if (!uploadData.secure_url) {
          throw new Error("Upload response missing URL.");
        }

        form.setValue("profileImage", uploadData.secure_url, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // Update store immediately
        handleFieldUpdate("profileImage", uploadData.secure_url);

        setUploadSuccess(true);
        setSelectedFile(null);
        setUploading(false);
        return;
      } catch (err) {
        console.error(`Upload attempt ${attempt + 1} failed:`, err);

        if (attempt === maxRetries - 1) {
          const message =
            err instanceof Error ? err.message : "Failed to upload image.";
          setUploadError(
            `${message} ${
              maxRetries > 1 ? `(after ${maxRetries} attempts)` : ""
            }`
          );
          setUploading(false);
          return;
        }

        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }, [selectedFile, form, handleFieldUpdate]);

  const handleRemoveImage = useCallback(() => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    form.setValue("profileImage", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    handleFieldUpdate("profileImage", "");
  }, [form, handleFieldUpdate]);

  return (
    <Form {...form}>
      <form className="space-y-6">
        {/* Profile Image Section - same as before */}
        <div className="rounded-lg border border-slate-200 bg-linear-to-br from-emerald-50 to-teal-50 p-6">
          {/* ... image upload UI ... */}
        </div>

        {/* Personal Info - UPDATE with onBlur */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">
                  Username
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="athlete_pro"
                    autoComplete="username"
                    className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldUpdate("username", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldUpdate("email", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="John"
                    className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldUpdate("firstName", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Doe"
                    className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      handleFieldUpdate("lastName", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700">
                Date of Birth
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    handleFieldUpdate("dateOfBirth", e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700">
                Gender
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex flex-wrap gap-4"
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val);
                    handleFieldUpdate("gender", val);
                  }}
                >
                  {/* Radio options same as before */}
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="MALE"
                      id="gender-male"
                      className="border-emerald-600 text-emerald-600"
                    />
                    <FormLabel
                      htmlFor="gender-male"
                      className="cursor-pointer font-normal"
                    >
                      Male
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="FEMALE"
                      id="gender-female"
                      className="border-emerald-600 text-emerald-600"
                    />
                    <FormLabel
                      htmlFor="gender-female"
                      className="cursor-pointer font-normal"
                    >
                      Female
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="OTHER"
                      id="gender-other"
                      className="border-emerald-600 text-emerald-600"
                    />
                    <FormLabel
                      htmlFor="gender-other"
                      className="cursor-pointer font-normal"
                    >
                      Other
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="PREFER_NOT_TO_SAY"
                      id="gender-na"
                      className="border-emerald-600 text-emerald-600"
                    />
                    <FormLabel
                      htmlFor="gender-na"
                      className="cursor-pointer font-normal"
                    >
                      Prefer not to say
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700">
                Bio
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your athletic journey, goals, and what drives you..."
                  rows={4}
                  className="resize-none rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
                  {...field}
                  value={field.value ?? ""}
                  onBlur={(e) => {
                    field.onBlur();
                    handleFieldUpdate("bio", e.target.value);
                  }}
                />
              </FormControl>
              <FormDescription className="text-xs text-slate-500">
                Share your experience, achievements, and aspirations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
