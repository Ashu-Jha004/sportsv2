"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useUpdateProfile } from "../../hooks/use-associate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";

const SPORTS = [
  "FOOTBALL",
  "BASKETBALL",
  "CRICKET",
  "TENNIS",
  "RUNNING",
  "SWIMMING",
  "BADMINTON",
  "VOLLEYBALL",
  "HOCKEY",
  "ATHLETICS",
  "WRESTLING",
  "BOXING",
  "MARTIAL_ARTS",
  "CYCLING",
  "GOLF",
  "OTHER",
] as const;

const editProfileSchema = z.object({
  workEmail: z.string().email("Invalid email address"),
  primaryExpertise: z.enum(SPORTS),
  secondaryExpertise: z.array(z.enum(SPORTS)).max(5),
  yearsOfExperience: z.number().int().min(0).max(50),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  profile: any;
  onClose: () => void;
}

export function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const router = useRouter();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const [secondarySportSelect, setSecondarySportSelect] = useState("");

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      workEmail: profile.workEmail,
      primaryExpertise: profile.primaryExpertise,
      secondaryExpertise: profile.secondaryExpertise || [],
      yearsOfExperience: profile.yearsOfExperience,
    },
  });

  const { watch, setValue } = form;
  const primaryExpertise = watch("primaryExpertise");
  const secondaryExpertise = watch("secondaryExpertise");

  const formatSportName = (sport: string) => {
    return sport
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleAddSecondarySport = (sport: string) => {
    if (sport === primaryExpertise) {
      return;
    }
    if (!secondaryExpertise.includes(sport as any)) {
      setValue("secondaryExpertise", [...secondaryExpertise, sport as any]);
      setSecondarySportSelect("");
    }
  };

  const handleRemoveSecondarySport = (sport: string) => {
    setValue(
      "secondaryExpertise",
      secondaryExpertise.filter((s) => s !== sport)
    );
  };

  const availableSecondary = SPORTS.filter(
    (sport) => sport !== primaryExpertise && !secondaryExpertise.includes(sport)
  );

  const onSubmit = async (data: EditProfileFormData) => {
    try {
      await updateProfile(data);
      router.refresh();
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your associate profile information
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Work Email */}
            <FormField
              control={form.control}
              name="workEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Primary Expertise */}
            <FormField
              control={form.control}
              name="primaryExpertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Sport Expertise *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SPORTS.map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {formatSportName(sport)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Secondary Expertise */}
            <FormField
              control={form.control}
              name="secondaryExpertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secondary Sports (Optional)</FormLabel>
                  <div className="space-y-4">
                    {secondaryExpertise.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {secondaryExpertise.map((sport) => (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className="px-3 py-1"
                          >
                            {formatSportName(sport)}
                            <button
                              title="close"
                              type="button"
                              onClick={() => handleRemoveSecondarySport(sport)}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {availableSecondary.length > 0 &&
                      secondaryExpertise.length < 5 && (
                        <Select
                          value={secondarySportSelect}
                          onValueChange={handleAddSecondarySport}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add a secondary sport" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSecondary.map((sport) => (
                              <SelectItem key={sport} value={sport}>
                                {formatSportName(sport)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Years of Experience */}
            <FormField
              control={form.control}
              name="yearsOfExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
