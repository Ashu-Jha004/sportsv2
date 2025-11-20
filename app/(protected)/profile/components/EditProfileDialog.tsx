"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpdateAthlete } from "../../profile/hooks/use-athlete"; // Your React Query mutation hook
import axios from "axios";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 chars"),
  email: z.string().email("Invalid email"),
  primarySport: z.string().min(1, "Primary sport required"),
  secondarySport: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  profileImageUrl: z.string().url().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  athlete: ProfileFormData;
  onClose: () => void;
}

export function EditProfileDialog({
  athlete,
  onClose,
}: EditProfileDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      ...athlete,
      profileImageUrl: athlete.profileImageUrl ?? athlete.profileImageUrl ?? "",
    },
  });

  // Update lat/lng using browser geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude);
        setValue("longitude", pos.coords.longitude);
      },
      () => {
        // Defer silently if unavailable
      }
    );
  }, [setValue]);

  const { mutateAsync: updateProfile } = useUpdateAthlete();

  async function onSubmit(data: ProfileFormData) {
    try {
      const updatedData = {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        primarySport: data.primarySport,
        secondarySport: data.secondarySport,
        dateOfBirth: data.dateOfBirth,
        latitude: data.latitude,
        longitude: data.longitude,
        profileImage: uploadedImageUrl ?? data.profileImageUrl,
      };
      await updateProfile(updatedData);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("[EditProfileDialog] update error:", error);
    }
  }

  // Cloudinary Image Upload
  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    const file = files[0];
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );
      formData.append(
        "folder",
        `messages/${new Date().toISOString().split("T")[0]}`
      );

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );

      setUploadedImageUrl(res.data.secure_url);
      toast.success("Image uploaded successfully.");
    } catch (err) {
      toast.error("Image upload failed.");
      console.error("[EditProfileDialog] upload error:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 w-full max-w-lg"
    >
      <label className="block">
        <span>First Name</span>
        <Input {...register("firstName")} />
        {errors.firstName && (
          <p className="text-red-600">{errors.firstName.message}</p>
        )}
      </label>

      <label className="block">
        <span>Last Name</span>
        <Input {...register("lastName")} />
        {errors.lastName && (
          <p className="text-red-600">{errors.lastName.message}</p>
        )}
      </label>

      <label className="block">
        <span>Username</span>
        <Input {...register("username")} />
        {errors.username && (
          <p className="text-red-600">{errors.username.message}</p>
        )}
      </label>

      <label className="block">
        <span>Email</span>
        <Input type="email" {...register("email")} />
        {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      </label>

      <label className="block">
        <span>Primary Sport</span>
        <Input {...register("primarySport")} />
        {errors.primarySport && (
          <p className="text-red-600">{errors.primarySport.message}</p>
        )}
      </label>

      <label className="block">
        <span>Secondary Sport</span>
        <Input {...register("secondarySport")} />
      </label>

      <label className="block">
        <span>Date of Birth</span>
        <Input type="date" {...register("dateOfBirth")} />
        {errors.dateOfBirth && (
          <p className="text-red-600">{errors.dateOfBirth.message}</p>
        )}
      </label>

      <label className="block">
        <span>Profile Image</span>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          disabled={uploading}
        />
        {uploading && <p>Uploading image...</p>}
        {uploadedImageUrl && (
          <img
            className="mt-2 h-24 w-24 object-cover rounded"
            src={uploadedImageUrl}
            alt="Uploaded profile"
          />
        )}
      </label>

      <label className="block">
        <span>Latitude</span>
        <Input
          type="number"
          step="any"
          {...register("latitude", { valueAsNumber: true })}
        />
      </label>

      <label className="block">
        <span>Longitude</span>
        <Input
          type="number"
          step="any"
          {...register("longitude", { valueAsNumber: true })}
        />
      </label>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
