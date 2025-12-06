"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  PlusCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ============================================
// TYPE DEFINITIONS
// ============================================

type NoTeamStateProps = {
  variant?: "default" | "compact" | "detailed";
};

// ============================================
// MAIN COMPONENT
// ============================================

export const NoTeamState: React.FC<NoTeamStateProps> = React.memo(
  ({ variant = "default" }) => {
    console.log("🎨 [NoTeamState] Rendering with variant:", variant);

    if (variant === "compact") {
      return <NoTeamStateCompact />;
    }

    if (variant === "detailed") {
      return <NoTeamStateDetailed />;
    }

    return <NoTeamStateDefault />;
  }
);

NoTeamState.displayName = "NoTeamState";

// ============================================
// DEFAULT VARIANT
// ============================================

const NoTeamStateDefault: React.FC = () => {
  return (
    <Card className="w-full overflow-hidden border-border/50 bg-linear-to-br from-card to-card/80 shadow-lg backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-linear-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
              <Users className="h-10 w-10 text-primary" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground mb-3">
          You're Not in a Team Yet
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
          Join an existing team or create your own to start competing, tracking
          progress, and connecting with athletes.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link href="/teams/discover" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discover Teams
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border/50 hover:bg-muted/50 font-semibold transition-all duration-300"
          >
            <Link href="/teams/create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Team
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Teams unlock exclusive features and competitions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// COMPACT VARIANT
// ============================================

const NoTeamStateCompact: React.FC = () => {
  return (
    <Card className="w-full overflow-hidden border-border/50 bg-linear-to-br from-card to-card/80 shadow-md">
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">No Team Yet</h3>

        <p className="text-sm text-muted-foreground mb-4">
          Discover and join a team to get started
        </p>

        <Button
          asChild
          size="default"
          className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-semibold"
        >
          <Link
            href="/teams/discover"
            className="flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            Discover Teams
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

// ============================================
// DETAILED VARIANT
// ============================================

const NoTeamStateDetailed: React.FC = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor team and individual performance metrics",
    },
    {
      icon: Users,
      title: "Collaborate",
      description: "Connect with teammates and share strategies",
    },
    {
      icon: Sparkles,
      title: "Compete",
      description: "Participate in exclusive team competitions",
    },
  ];

  return (
    <Card className="w-full overflow-hidden border-border/50 bg-linear-to-br from-card to-card/80 shadow-lg backdrop-blur-sm">
      <CardContent className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative h-24 w-24 rounded-full bg-linear-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg">
                <Users className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-foreground mb-3">
            Ready to Join a Team?
          </h3>

          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Teams are the heart of our platform. Connect with athletes, compete
            together, and achieve your goals as a unit.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
            >
              <div className="mb-3 flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h4 className="font-semibold text-foreground mb-1 text-center">
                {feature.title}
              </h4>
              <p className="text-xs text-muted-foreground text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            size="lg"
            className="flex-1 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Link
              href="/teams/discover"
              className="flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              Discover Teams
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="flex-1 border-border/50 hover:bg-muted/50 font-semibold transition-all duration-300"
          >
            <Link
              href="/teams/create"
              className="flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-5 w-5" />
              Create Your Team
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoTeamState;
