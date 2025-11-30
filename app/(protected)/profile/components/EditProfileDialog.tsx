"use client";

import React, { useState, ReactNode } from "react";
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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";

interface EditProfileDialogProps {
  children: ReactNode; // Accept children as trigger
  className?: string;
}

export function EditProfileDialog({
  children,
  className,
}: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Profile updated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className={cn("max-w-2xl p-0 max-h-[90vh] overflow-hidden", className)}
      >
        {/* Rest of the dialog content remains the same */}
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm">
            Update your profile information and avatar.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Avatar Upload - same as before */}
          <div className="flex flex-col items-center gap-4 mb-8 p-6 bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-white shadow-2xl">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-3xl font-bold">
                  JD
                </AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full p-0 bg-blue-600 hover:bg-blue-700 shadow-lg border-4 border-white"
              >
                <Camera size={18} className="text-white" />
              </Button>
            </div>
            <p className="text-sm text-slate-600 text-center">
              Click camera to change profile photo
            </p>
          </div>

          {/* Form Fields - same as before */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-semibold">
                  First Name
                </Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-semibold">
                  Last Name
                </Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-semibold">
                Bio
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your athletic journey..."
                className="min-h-[100px] resize-none"
                defaultValue="Passionate athlete dedicated to continuous improvement and peak performance."
              />
              <p className="text-xs text-slate-500">Max 160 characters</p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-slate-50">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
