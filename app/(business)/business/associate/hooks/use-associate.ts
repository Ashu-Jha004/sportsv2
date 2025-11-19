"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
interface AssociateStatus {
  hasApplication: boolean;
  hasProfile: boolean;
  application: any | null;
  profile: any | null;
}

interface UploadResumeResponse {
  success: boolean;
  url: string;
  publicId: string;
  message: string;
}

// Query Keys
export const associateKeys = {
  all: ["associate"] as const,
  status: () => [...associateKeys.all, "status"] as const,
  application: () => [...associateKeys.all, "application"] as const,
  profile: () => [...associateKeys.all, "profile"] as const,
};

// Fetch associate status
async function fetchAssociateStatus(): Promise<AssociateStatus> {
  const response = await fetch("/api/associate/status");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch associate status");
  }

  return response.json();
}

// Upload resume to Cloudinary
async function uploadResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/associate-resume", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload resume");
  }

  return response.json();
}

// Submit application
async function submitApplication(data: any) {
  const response = await fetch("/api/associate/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit application");
  }

  return response.json();
}

// Update associate profile (post-approval)
async function updateAssociateProfile(data: any) {
  const response = await fetch("/api/associate/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
}

// Update location coordinates
async function updateLocation(data: { latitude: number; longitude: number }) {
  const response = await fetch("/api/associate/update-location", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update location");
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook to check associate status
 */
export function useAssociateStatus() {
  return useQuery({
    queryKey: associateKeys.status(),
    queryFn: fetchAssociateStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to upload resume
 */
export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => {
      toast.success("Resume uploaded successfully");
      console.log("Resume uploaded:", data);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload resume");
      console.error("Upload error:", error);
    },
  });
}

/**
 * Hook to submit application
 */
export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitApplication,
    onSuccess: (data) => {
      toast.success("Application submitted successfully!");
      // Invalidate queries to refetch status
      queryClient.invalidateQueries({ queryKey: associateKeys.status() });
      queryClient.invalidateQueries({ queryKey: associateKeys.application() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
      console.error("Submission error:", error);
    },
  });
}

/**
 * Hook to update associate profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAssociateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: associateKeys.profile() });
      queryClient.invalidateQueries({ queryKey: associateKeys.status() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
      console.error("Update error:", error);
    },
  });
}

/**
 * Hook to update location
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLocation,
    onSuccess: () => {
      toast.success("Location updated successfully");
      queryClient.invalidateQueries({ queryKey: associateKeys.profile() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update location");
      console.error("Location update error:", error);
    },
  });
}
