// app/(guide)/dashboard/components/GuideDashboardBody.tsx
"use client";

import { useCallback, useState, useTransition } from "react";
import {
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { updateGuideProfile } from "../actions";
import { AlertCircle } from "lucide-react";

const guideProfileEditSchema = z.object({
  guideEmail: z.string().trim().email("Please provide a valid email."),
  primarySport: z.string().min(1, "Primary sport is required."),
  secondarySportsRaw: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : []
    ),
  experience: z
    .union([
      z
        .string()
        .trim()
        .length(0)
        .transform(() => null),
      z
        .string()
        .trim()
        .regex(/^\d+$/, "Experience must be a whole number.")
        .transform((v) => Number(v)),
    ])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  country: z.string().trim().min(1, "Country is required."),
  state: z.string().trim().min(1, "State/Province is required."),
  city: z.string().trim().min(1, "City is required."),
});

type GuideProfileEditInput = z.infer<typeof guideProfileEditSchema>;

export default function GuideDashboardBody({ guide }: any) {
  return (
    <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
      <AboutCard guide={guide} />
      <GuideActionsCard />
    </section>
  );
}

// === About card with edit dialog ===

type AboutCardProps = {
  guide: any["guide"];
};

function AboutCard({ guide }: any) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const defaultValues: any = {
    guideEmail: guide.guideEmail ?? "",
    primarySport: guide.primarySport ?? "",
    secondarySportsRaw: guide.secondarySports.join(", "),
    experience: guide.experience != null ? String(guide.experience) : "",
    country: guide.country ?? "",
    state: guide.state ?? "",
    city: guide.city ?? "",
  };

  const form = useForm<any>({
    resolver: zodResolver(guideProfileEditSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit: SubmitHandler<any> = useCallback(
    async (values) => {
      setFormError(null);

      startTransition(async () => {
        const payload = {
          guideEmail: values.guideEmail,
          primarySport: values.primarySport,
          secondarySports: values.secondarySportsRaw ?? [],
          experience: values.experience === null ? null : values.experience,
          country: values.country,
          state: values.state,
          city: values.city,
        };

        const result = await updateGuideProfile(payload);

        if (!result.success) {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([name, messages]) => {
              const message = messages?.[0];
              if (!message) return;
              if (name === "secondarySports") {
                form.setError("secondarySportsRaw", {
                  type: "server",
                  message,
                });
              } else if (name === "experience" || name === "Experience") {
                form.setError("experience", {
                  type: "server",
                  message,
                });
              } else {
                form.setError(name as any, {
                  type: "server",
                  message,
                });
              }
            });
          }

          setFormError(
            process.env.NODE_ENV === "development" && result.traceId
              ? `${result.message} (trace: ${result.traceId})`
              : result.message
          );

          return;
        }

        setOpen(false);
      });
    },
    [form]
  );

  return (
    <Card className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            About you as a guide
          </h2>
          <p className="text-xs text-gray-500">
            This information helps athletes understand your expertise.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit guide profile</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="guideEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guide email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="primarySport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary sport</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. FOOTBALL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondarySportsRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary sports</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Comma-separated, e.g. CRICKET, TENNIS"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          placeholder="e.g. 3"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? "" : e.target.value
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2 rounded-md bg-red-50 p-2 text-xs text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <p>{formError}</p>
                  </div>
                )}

                <DialogFooter className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-medium">Email:</span> {guide.guideEmail}
        </p>
        <p>
          <span className="font-medium">Primary sport:</span>{" "}
          {guide.primarySport ?? "Not set"}
        </p>
        <p>
          <span className="font-medium">Secondary sports:</span>{" "}
          {guide.secondarySports.length > 0
            ? guide.secondarySports.join(", ")
            : "None"}
        </p>
        <p>
          <span className="font-medium">Experience:</span>{" "}
          {guide.experience != null
            ? `${guide.experience} years`
            : "Not provided"}
        </p>
        <p>
          <span className="font-medium">Location:</span>{" "}
          {guide.city && guide.country
            ? `${guide.city}, ${guide.state ?? ""} ${guide.country}`
            : "Not set"}
        </p>
      </div>
    </Card>
  );
}

// === Guide actions card ===

function GuideActionsCard() {
  return (
    <Card className="flex flex-col gap-4 p-4 md:p-6">
      <h2 className="text-base font-semibold text-gray-900">Guide actions</h2>
      <p className="text-xs text-gray-500">
        Quick actions for managing your work as a guide. More tools will be
        added over time.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled
        className="justify-start"
      >
        Stat update (coming soon)
      </Button>
    </Card>
  );
}
