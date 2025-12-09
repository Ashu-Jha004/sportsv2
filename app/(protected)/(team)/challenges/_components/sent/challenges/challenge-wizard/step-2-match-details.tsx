"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { useChallengeStore } from "@/stores/challenges/challenge-store";
import { cn } from "@/lib/utils";

export function Step2MatchDetails() {
  const { wizardData, updateMatchDetails, nextStep, prevStep } =
    useChallengeStore();

  const [date, setDate] = useState<Date | undefined>(
    wizardData?.proposedDate || undefined
  );
  const [time, setTime] = useState(wizardData?.proposedTime || "");
  const [location, setLocation] = useState(wizardData?.proposedLocation || "");
  const [duration, setDuration] = useState(
    wizardData?.matchDurationMinutes?.toString() || "90"
  );
  const [message, setMessage] = useState(wizardData?.messageToOpponent || "");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    if (location.length > 500) {
      newErrors.location = "Location is too long (max 500 characters)";
    }

    if (message.length > 500) {
      newErrors.message = "Message is too long (max 500 characters)";
    }

    if (duration && (parseInt(duration) < 30 || parseInt(duration) > 300)) {
      newErrors.duration = "Duration must be between 30 and 300 minutes";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [location, message, duration]);

  const handleContinue = useCallback(() => {
    try {
      if (!validateForm()) {
        console.warn("⚠️ [Step2MatchDetails] Form validation failed");
        return;
      }

      const updates = {
        proposedDate: date || null,
        proposedTime: time,
        proposedLocation: location,
        proposedLatitude: null, // Can be enhanced with map picker
        proposedLongitude: null,
        matchDurationMinutes: duration ? parseInt(duration) : null,
        messageToOpponent: message,
      };

      console.log("✅ [Step2MatchDetails] Saving match details:", updates);
      updateMatchDetails(updates);
      nextStep();
    } catch (error) {
      console.error("❌ [Step2MatchDetails] Error saving details:", error);
    }
  }, [
    date,
    time,
    location,
    duration,
    message,
    validateForm,
    updateMatchDetails,
    nextStep,
  ]);

  if (!wizardData) return null;

  return (
    <div className="space-y-6">
      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label>Proposed Date (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            The opposing team can suggest a different date
          </p>
        </div>

        {/* Time Input */}
        <div className="space-y-2">
          <Label htmlFor="time">Proposed Time (Optional)</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10"
              placeholder="Select time"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">
          Match Location <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={cn("pl-10", errors.location && "border-destructive")}
            placeholder="e.g., City Sports Complex, Field 2"
            maxLength={500}
          />
        </div>
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {location.length}/500 characters
        </p>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Match Duration (minutes)</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className={cn(errors.duration && "border-destructive")}
          placeholder="90"
          min={30}
          max={300}
        />
        {errors.duration && (
          <p className="text-sm text-destructive">{errors.duration}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Typical: 90 minutes (range: 30-300)
        </p>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message to Opposing Team (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(errors.message && "border-destructive")}
          placeholder="Looking forward to a great match!"
          rows={4}
          maxLength={500}
        />
        {errors.message && (
          <p className="text-sm text-destructive">{errors.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {message.length}/500 characters
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button onClick={handleContinue} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );
}
