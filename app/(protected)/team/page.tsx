// app/team/page.tsx (Next.js 13+ app router)
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Search, Swords } from "lucide-react";

export default function TeamPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 pb-16 pt-14 md:pt-20">
        {/* Hero */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Competitive teams, guided by experts
          </div>

          <div className="space-y-4">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Build. Join. <span className="text-emerald-400">Compete.</span>
            </h1>
            <p className="max-w-2xl text-balance text-sm text-slate-300 sm:text-base">
              Create your own high‑performance squad, find the perfect team to
              grow with, or challenge another team to a head‑to‑head match — all
              from one place.
            </p>
          </div>
        </section>

        {/* Actions grid */}
        <section className="grid gap-5 md:grid-cols-3">
          <ActionCard
            icon={Users}
            label="Create a team"
            description="Start a new team, set your sport and level, and invite athletes to join."
            href="/team/application"
            variant="primary"
          />

          <ActionCard
            icon={Search}
            label="Find a team"
            description="Discover nearby or sport‑specific teams and send a join request in seconds."
            href="/team/discover"
          />

          <ActionCard
            icon={Swords}
            label="Challenge a team"
            description="Issue match challenges, schedule games, and track competitive results."
            href="/team/challenges"
          />
        </section>
      </div>
    </div>
  );
}

type ActionCardProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  href: string;
  variant?: "primary" | "default";
};

function ActionCard({
  icon: Icon,
  label,
  description,
  href,
  variant = "default",
}: ActionCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border",
        "border-slate-800/80 bg-slate-900/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.75)]",
        "transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-500/70"
      )}
    >
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 blur-3xl transition-opacity duration-200 group-hover:opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/40 via-cyan-500/30 to-sky-500/20" />
      </div>

      <div className="relative space-y-4">
        <div className="inline-flex items-center justify-center rounded-xl bg-slate-800/80 p-3 text-emerald-400 ring-1 ring-slate-700/80">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
          <p className="text-xs text-slate-300/90 sm:text-sm">{description}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <Button
          asChild
          size="lg"
          className={cn(
            "w-full justify-between text-sm font-medium",
            "transition-all duration-200 group-hover:shadow-[0_18px_40px_rgba(16,185,129,0.40)]",
            variant === "primary"
              ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              : "bg-slate-800 text-slate-50 hover:bg-slate-700"
          )}
        >
          <Link href={href}>
            <span>{label}</span>
            <span className="ml-2 inline-flex items-center gap-1 text-xs">
              Go
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M7 5l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
