// components/team/application/TeamApplicationStep1.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { teamApplicationStep1Schema } from "../../../lib/validations/team";
import { useTeamApplicationStore } from "@/stores/team/creation/use-team-application-store";
import { Sport, Class, Rank } from "@prisma/client";
import { ChevronRight } from "lucide-react";

export function TeamApplicationStep1() {
  const { formData, setFormData, nextStep } = useTeamApplicationStore();

  const form = useForm({
    resolver: zodResolver(teamApplicationStep1Schema),
    defaultValues: {
      name: formData.name || "",
      sport: formData.sport || undefined,
      class: formData.class || undefined,
      rank: formData.rank || undefined,
      bio: formData.bio || "",
      logoUrl: formData.logoUrl || "",
    },
  });

  const onSubmit = useCallback(
    (data: any) => {
      console.log("[STEP_1] Form data:", data);
      setFormData(data);
      nextStep();
    },
    [setFormData, nextStep]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Thunder Strikers" {...field} />
              </FormControl>
              <FormDescription>
                Choose a unique name for your team
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary Sport *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(Sport).map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {sport.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Class).map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        Class {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rank (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rank" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Rank).map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {rank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell others about your team's goals and values..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>Max 500 characters</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormDescription>
                Provide a link to your team logo
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="gap-2">
            Next Step
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
