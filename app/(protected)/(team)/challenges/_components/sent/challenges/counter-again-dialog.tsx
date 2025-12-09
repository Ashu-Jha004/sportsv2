"use client";

import React, { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useSentChallengeStore } from "@/stores/challenges/sent/sent-challenge-store";
import { handleSentChallengeAction } from "@/actions/challenges/negotition/sent/sent-challenge-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CounterAgainDialog() {
  const queryClient = useQueryClient();
  const { selectedMatchId, selectedChallenge, closeActionDialog } =
    useSentChallengeStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const challenge = selectedChallenge;

  // Form state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("90");
  const [message, setMessage] = useState("");

  // Initialize form when challenge loads
  React.useEffect(() => {
    if (challenge) {
      console.log(
        "📝 [CounterAgainDialog] Initializing form with challenge:",
        challenge
      );
      setDate(
        challenge.proposedDate ? new Date(challenge.proposedDate) : undefined
      );
      setTime(challenge.proposedTime || "");
      setLocation(challenge.proposedLocation || "");
      setDuration(challenge.matchDurationMinutes?.toString() || "90");
      setMessage("");
    }
  }, [challenge]);

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

  const handleCounterAgain = useCallback(async () => {
    if (!selectedMatchId) return;

    if (!validateForm()) {
      console.warn("⚠️ [CounterAgainDialog] Form validation failed");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log(
        "✏️ [CounterAgainDialog] Sending new counter-proposal:",
        selectedMatchId
      );

      const result = await handleSentChallengeAction({
        matchId: selectedMatchId,
        action: "COUNTER_AGAIN",
        proposedDate: date || null,
        proposedTime: time,
        proposedLocation: location,
        proposedLatitude: null,
        proposedLongitude: null,
        matchDurationMinutes: duration ? parseInt(duration) : null,
        counterMessage: message.trim() || undefined,
      });

      if (result.success) {
        toast("Counter-Proposal Sent! ✏️");

        queryClient.invalidateQueries({ queryKey: ["sent-challenges"] });
        queryClient.invalidateQueries({ queryKey: ["received-challenges"] });

        closeActionDialog();
      } else {
        toast("Failed to Send");
      }
    } catch (error) {
      console.error(
        "❌ [CounterAgainDialog] Error sending counter-proposal:",
        error
      );
      toast("Error");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedMatchId,
    date,
    time,
    location,
    duration,
    message,
    validateForm,
    toast,
    queryClient,
    closeActionDialog,
  ]);

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Challenge data not found. Please try again.
        </p>
        <Button onClick={closeActionDialog} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  const teamInitials = challenge.challengedTeamName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert>
        <Edit className="h-4 w-4" />
        <AlertDescription>
          Propose different match details. The opponent team can then accept or
          suggest further changes until you both agree.
        </AlertDescription>
      </Alert>

      {/* Team */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarImage
            src={challenge.challengedTeamLogo || undefined}
            alt={challenge.challengedTeamName}
          />
          <AvatarFallback className="text-sm font-bold">
            {teamInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate">{challenge.challengedTeamName}</h3>
          {challenge.challengedTeamSchool && (
            <p className="text-xs text-muted-foreground truncate">
              {challenge.challengedTeamSchool}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Their Current Proposal */}
      <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
        <h4 className="font-semibold text-sm mb-3 text-amber-900 dark:text-amber-100">
          Their Current Proposal:
        </h4>
        <div className="space-y-2 text-sm">
          {challenge.proposedDate ? (
            <p className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(challenge.proposedDate), "PPP")}
              {challenge.proposedTime && ` at ${challenge.proposedTime}`}
            </p>
          ) : (
            <p className="flex items-center gap-2 text-amber-800 dark:text-amber-200 italic">
              <CalendarIcon className="h-3 w-3" />
              Date to be decided
            </p>
          )}
          <p className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <MapPin className="h-3 w-3" />
            {challenge.proposedLocation}
          </p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

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
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(errors.message && "border-destructive")}
          placeholder="Explain your proposed changes..."
          rows={3}
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
        <Button
          variant="outline"
          onClick={closeActionDialog}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCounterAgain}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Send Counter-Proposal
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
