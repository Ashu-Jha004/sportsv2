"use client";

import React, { useEffect, useState, useMemo } from "react";
import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProfileSchema } from "@/app/(protected)/profile/schemas/edit-profile-schema";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useProfileActions, useProfile } from "@/stores/athlete/athlete-store";
import { useUpdateProfile } from "@/app/(protected)/profile/hooks/profile/use-athlete-profile";
import { Sport } from "@/types/profile/athlete-profile.types";
import { MapPin } from "lucide-react";

interface EditProfileDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProfileDialog({
  isOpen,
  onOpenChange,
}: EditProfileDialogProps) {
  const profile = useProfile();

  const { setLoadingLocation } = useProfileActions();
  const updateProfileMutation = useUpdateProfile();

  const [locationError, setLocationError] = useState<string | null>(null);

  // Memoized default form values with defaults for optional fields
  const defaultValues = useMemo(
    () => ({
      username: profile?.username ?? "",
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      bio: profile?.bio || "",
      primarySport: profile?.primarySport ?? Sport.OTHER,
      secondarySports: profile?.secondarySports ?? [],
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "",
      latitude: profile?.latitude,
      longitude: profile?.longitude,
    }),
    [profile]
  );

  const form = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  // getCurrentLocation as a const inside component to avoid duplicate identifier errors
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser.");
      return;
    }
    setLocationError(null);
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude);
        form.setValue("longitude", position.coords.longitude);
        setLoadingLocation(false);
      },
      () => {
        setLocationError("Unable to retrieve location. Please try again.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const onSubmit: SubmitHandler<z.infer<typeof editProfileSchema>> = async (
    data
  ) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile details</DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1 font-medium">
              Username
            </label>
            <Input id="username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block mb-1 font-medium">
                First Name
              </label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-red-600 text-sm">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block mb-1 font-medium">
                Last Name
              </label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-red-600 text-sm">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block mb-1 font-medium">
              Bio
            </label>
            <Textarea id="bio" rows={4} {...form.register("bio")} />
            {form.formState.errors.bio && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.bio.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">Primary Sport</label>
            <Select
              onValueChange={(val) =>
                form.setValue("primarySport", val as Sport)
              }
              value={form.watch("primarySport") ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary sport" />
              </SelectTrigger>
              <SelectContent>
                {(Object.values(Sport) as string[]).map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Secondary Sports</label>
            <Select
              onValueChange={(val) =>
                form.setValue("secondarySports", val ? [val as Sport] : [])
              }
              value={form.watch("secondarySports")?.[0] ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select secondary sport" />
              </SelectTrigger>
              <SelectContent>
                {(Object.values(Sport) as string[]).map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="city" className="block mb-1 font-medium">
              City
            </label>
            <Input id="city" {...form.register("city")} />
            {form.formState.errors.city && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.city.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="state" className="block mb-1 font-medium">
              State
            </label>
            <Input id="state" {...form.register("state")} />
            {form.formState.errors.state && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.state.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="country" className="block mb-1 font-medium">
              Country
            </label>
            <Input id="country" {...form.register("country")} />
            {form.formState.errors.country && (
              <p className="text-red-600 text-sm">
                {form.formState.errors.country.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="latitude" className="block mb-1 font-medium">
                Latitude
              </label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...form.register("latitude", { valueAsNumber: true })}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="longitude" className="block mb-1 font-medium">
                Longitude
              </label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...form.register("longitude", { valueAsNumber: true })}
              />
            </div>
            <Button
              type="button"
              onClick={getCurrentLocation}
              variant="outline"
              className="mt-6"
              title="Use browser location"
            >
              <MapPin size={16} />
            </Button>
          </div>

          {locationError && (
            <p className="text-sm text-red-600">{locationError}</p>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
