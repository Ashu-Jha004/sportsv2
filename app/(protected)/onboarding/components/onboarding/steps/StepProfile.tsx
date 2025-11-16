// src/features/onboarding/components/steps/StepProfile.tsx
"use client";

import { useCallback, useState } from "react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

type ProfileFormValues = OnboardingProfileDTO;

export default function StepProfile() {
  const { profile, updateProfile, nextStep } = useOnboardingStore();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(OnboardingProfileSchema),
    defaultValues: {
      username: profile.username ?? "",
      email: profile.email ?? "",
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      profileImage: profile.profileImage ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: (profile.gender as any) ?? "OTHER",
      bio: profile.bio ?? "",
    },
    mode: "onChange",
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      try {
        setUploading(true);

        // 1. Get Cloudinary signature & config
        const sigRes = await fetch("/api/cloudinary-signature", {
          method: "POST",
        });

        if (!sigRes.ok) {
          throw new Error("Failed to get upload signature.");
        }
        console.log("sigRes status", sigRes.status);

        const { signature, timestamp, apiKey, cloudName, folder } =
          (await sigRes.json()) as {
            signature: string;
            timestamp: number;
            apiKey: string;
            cloudName: string;
            folder: string;
          };

        // 2. Upload file to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData },
        );

        const uploadText = await uploadRes.text();
        console.log("uploadRes status", uploadRes.status);
        console.log("uploadRes body", uploadText.slice(0, 200));

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image.");
        }

        const uploadData = JSON.parse(uploadText) as { secure_url?: string };

        if (!uploadData.secure_url) {
          throw new Error("Upload response missing URL.");
        }

        // 3. Update form value
        form.setValue("profileImage", uploadData.secure_url, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        // Optional: surface user-facing toast/error here
      } finally {
        setUploading(false);
      }
    },
    [form],
  );

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(values);
    nextStep();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="athlete123"
                    autoComplete="username"
                    {...field}
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
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
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
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
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex flex-wrap gap-4"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="gender-male" />
                    <FormLabel htmlFor="gender-male">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="gender-female" />
                    <FormLabel htmlFor="gender-female">Female</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHER" id="gender-other" />
                    <FormLabel htmlFor="gender-other">Other</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="PREFER_NOT_TO_SAY" id="gender-na" />
                    <FormLabel htmlFor="gender-na">Prefer not to say</FormLabel>
                  </FormItem>
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
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a bit about your athletic journey..."
                  rows={4}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Profile image + hidden input */}
        <FormField
          control={form.control}
          name="profileImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile image</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleImageUpload(file);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" disabled={uploading}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </FormControl>
              {field.value && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Image uploaded.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!form.formState.isValid}>
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
