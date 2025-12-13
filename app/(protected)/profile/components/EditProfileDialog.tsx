"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useUpdateProfile } from "../hooks/profile/use-athlete-profile";
import {
  editProfileSchema,
  type EditProfileFormData,
  profileToFormDefaults,
  Sport,
  Gender,
} from "../schemas/edit-profile-schema";
import {
  uploadToCloudinary,
  createPreviewUrl,
  revokePreviewUrl,
} from "../lib/cloudinary/upload";
import type { AthleteProfile } from "@/types/profile/athlete-profile.types";

// =============================================================================
// TYPES
// =============================================================================

interface EditProfileDialogProps {
  children: React.ReactNode;
  athlete: AthleteProfile;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EditProfileDialog({
  children,
  athlete,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // ✅ Mutation hook with optimistic updates
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  // ✅ Form with validation
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: useMemo(() => profileToFormDefaults(athlete), [athlete]),
  });

  // ✅ Watch profile image for preview
  const currentProfileImage = watch("profileImage");

  // ✅ Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset(profileToFormDefaults(athlete));
      setImagePreview(null);
      setUploadProgress(0);
    }
  }, [open, athlete, reset]);

  // ============================================================================
  // IMAGE UPLOAD HANDLER
  // ============================================================================

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload a JPEG, PNG, or WebP image."
        );
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 5MB.");
        return;
      }

      // Create preview
      const previewUrl = createPreviewUrl(file);
      setImagePreview(previewUrl);

      try {
        setIsUploadingImage(true);
        setUploadProgress(0);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, (progress: any) => {
          setUploadProgress(progress.percentage);
        });

        // Update form value
        setValue("profileImage", result.secure_url, { shouldDirty: true });

        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to upload image"
        );

        // Reset preview on error
        setImagePreview(null);
        revokePreviewUrl(previewUrl);
      } finally {
        setIsUploadingImage(false);
        setUploadProgress(0);
      }
    },
    [setValue]
  );

  // ============================================================================
  // FORM SUBMIT HANDLER
  // ============================================================================

  const onSubmit = useCallback(
    (data: EditProfileFormData) => {
      console.log("📝 Submitting profile update:", data);

      // Filter out unchanged fields (only send what changed)
      const changedFields: any = {};
      Object.keys(data).forEach((key) => {
        const fieldKey = key as keyof EditProfileFormData;
        const newValue = data[fieldKey];
        const oldValue = profileToFormDefaults(athlete)[fieldKey];

        if (
          newValue !== oldValue &&
          newValue !== undefined &&
          newValue !== ""
        ) {
          changedFields[fieldKey] = newValue as any;
        }
      });

      console.log("📝 Changed fields only:", changedFields);

      // Don't submit if nothing changed
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save");
        setOpen(false);
        return;
      }

      // Submit mutation
      updateProfile(changedFields, {
        onSuccess: () => {
          toast.success("Profile updated successfully! 🎉");
          setOpen(false);

          // Cleanup preview URL
          if (imagePreview) {
            revokePreviewUrl(imagePreview);
            setImagePreview(null);
          }
        },
        onError: (error) => {
          console.error("Profile update error:", error);
          toast.error(
            error instanceof Error ? error.message : "Failed to update profile"
          );
        },
      });
    },
    [athlete, updateProfile, imagePreview]
  );

  // ============================================================================
  // DISPLAY IMAGE (preview or current)
  // ============================================================================

  const displayImage = useMemo(() => {
    return imagePreview || currentProfileImage || athlete.profileImage;
  }, [imagePreview, currentProfileImage, athlete.profileImage]);

  const displayInitials = useMemo(() => {
    return `${athlete.firstName?.charAt(0) || ""}${
      athlete.lastName?.charAt(0) || ""
    }`;
  }, [athlete.firstName, athlete.lastName]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-3xl p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm">
            Update your profile information and avatar.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col h-full"
        >
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-white shadow-2xl">
                  <AvatarImage
                    src={displayImage || undefined}
                    alt="Profile"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-bold text-white">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Upload progress overlay */}
                {isUploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="text-white text-sm font-semibold">
                      {uploadProgress}%
                    </div>
                  </div>
                )}

                {/* Upload button */}
                <label
                  htmlFor="avatar-upload"
                  className={`absolute -bottom-2 -right-2 h-12 w-12 rounded-full p-0 bg-blue-600 hover:bg-blue-700 shadow-lg border-4 border-white flex items-center justify-center cursor-pointer transition-all ${
                    isUploadingImage ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isUploadingImage ? (
                    <Loader2 size={18} className="text-white animate-spin" />
                  ) : (
                    <Camera size={18} className="text-white" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage || isSaving}
                  />
                </label>
              </div>
              <p className="text-sm text-slate-600 text-center">
                Click camera to change profile photo (Max 5MB)
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="John"
                    disabled={isSaving}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Doe"
                    disabled={isSaving}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold">
                  Username <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  {...register("username")}
                  placeholder="johndoe"
                  disabled={isSaving}
                />
                {errors.username && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself and your athletic journey..."
                  className="min-h-[100px] resize-none"
                  disabled={isSaving}
                  maxLength={160}
                />
                <p className="text-xs text-slate-500">
                  {watch("bio")?.length || 0}/160 characters
                </p>
                {errors.bio && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.bio.message}
                  </p>
                )}
              </div>

              {/* Gender & DOB */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-semibold">
                    Gender
                  </Label>
                  <Select
                    value={watch("gender") || undefined}
                    onValueChange={(value) =>
                      setValue("gender", value as any, { shouldDirty: true })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                      <SelectItem value={Gender.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="dateOfBirth"
                    className="text-sm font-semibold"
                  >
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Sports */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="primarySport"
                    className="text-sm font-semibold"
                  >
                    Primary Sport <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("primarySport") || undefined}
                    onValueChange={(value) =>
                      setValue("primarySport", value as any, {
                        shouldDirty: true,
                      })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(Sport).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {key.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="secondarySport"
                    className="text-sm font-semibold"
                  >
                    Secondary Sport
                  </Label>
                  <Select
                    value={watch("secondarySport") || undefined}
                    onValueChange={(value) =>
                      setValue("secondarySport", value as any, {
                        shouldDirty: true,
                      })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(Sport).map(([key, value]) => (
                        <SelectItem key={value} value={value}>
                          {key.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Location
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder="India"
                      disabled={isSaving}
                    />
                    {errors.country && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-sm font-semibold">
                      State
                    </Label>
                    <Input
                      id="state"
                      {...register("state")}
                      placeholder="Maharashtra"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-semibold">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Mumbai"
                    disabled={isSaving}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-6 border-t bg-slate-50">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploadingImage || !isDirty}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
