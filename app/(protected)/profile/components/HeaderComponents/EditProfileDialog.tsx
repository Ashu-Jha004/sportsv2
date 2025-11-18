// components/profile/EditProfileDialog.tsx

"use client";

import { useState } from "react";
import { ProfileData, RankType, ClassType } from "../../types/profile.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileData;
  onSave: (updatedProfile: Partial<ProfileData>) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
}: EditProfileDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    username: profile.username,
    bio: profile.bio,
    sports: profile.sports.join(", "),
    city: profile.city, // ✅ ADD THIS
    state: profile.state,
    country: profile.country,
    rank: profile.rank,
    class: profile.class,
  });

  const [charCount, setCharCount] = useState(profile.bio.length);
  const maxBioLength = 200;

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxBioLength) {
      setFormData({ ...formData, bio: value });
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const updatedProfile: Partial<ProfileData> = {
      fullName: formData.fullName,
      username: formData.username,
      bio: formData.bio,
      sports: formData.sports
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      city: profile.city, // ✅ ADD THIS
      state: profile.state,
      country: profile.country,
      rank: formData.rank,
      class: formData.class,
    };

    onSave(updatedProfile);
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Update your profile information. Changes will be visible to other
            athletes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              className="text-sm font-semibold text-slate-700"
            >
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="Enter your full name"
              required
              className="border-slate-300 focus:border-blue-500"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-semibold text-slate-700"
            >
              Username *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                @
              </span>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="username"
                required
                className="pl-7 border-slate-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="bio"
                className="text-sm font-semibold text-slate-700"
              >
                Bio
              </Label>
              <span className="text-xs text-slate-500">
                {charCount}/{maxBioLength}
              </span>
            </div>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="resize-none border-slate-300 focus:border-blue-500"
            />
          </div>

          {/* Sports */}
          <div className="space-y-2">
            <Label
              htmlFor="sports"
              className="text-sm font-semibold text-slate-700"
            >
              Sports (comma-separated) *
            </Label>
            <Input
              id="sports"
              value={formData.sports}
              onChange={(e) =>
                setFormData({ ...formData, sports: e.target.value })
              }
              placeholder="Basketball, Swimming, Track & Field"
              required
              className="border-slate-300 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500">
              Separate multiple sports with commas
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="state"
                className="text-sm font-semibold text-slate-700"
              >
                State *
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="California"
                required
                className="border-slate-300 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="country"
                className="text-sm font-semibold text-slate-700"
              >
                Country *
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="USA"
                required
                className="border-slate-300 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Rank & Class */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="rank"
                className="text-sm font-semibold text-slate-700"
              >
                Rank *
              </Label>
              <Select
                value={formData.rank}
                onValueChange={(value: RankType) =>
                  setFormData({ ...formData, rank: value })
                }
              >
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pawn">Pawn</SelectItem>
                  <SelectItem value="Knight">Knight</SelectItem>
                  <SelectItem value="Bishop">Bishop</SelectItem>
                  <SelectItem value="Rook">Rook</SelectItem>
                  <SelectItem value="Queen">Queen</SelectItem>
                  <SelectItem value="King">King</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="class"
                className="text-sm font-semibold text-slate-700"
              >
                Class *
              </Label>
              <Select
                value={formData.class}
                onValueChange={(value: ClassType) =>
                  setFormData({ ...formData, class: value })
                }
              >
                <SelectTrigger className="border-slate-300">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Class A</SelectItem>
                  <SelectItem value="B">Class B</SelectItem>
                  <SelectItem value="C">Class C</SelectItem>
                  <SelectItem value="D">Class D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
