// app/sign-up/[[...sign-up]]/page.tsx
"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 text-slate-50">
      {/* Left / Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between px-12 py-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-lg">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight">Sparta</span>
        </div>

        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Join the{" "}
            <span className="text-emerald-400">Sparta athlete network</span>.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Create your profile, showcase your stats, and connect with coaches,
            scouts, and teammates across the sports ecosystem.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex h-1 w-8 rounded-full bg-emerald-400" />
            <span>
              Optimized for student‑athletes, teams, and institutions.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Sparta</span>
          <span className="h-1 w-1 rounded-full bg-slate-600" />
          <span>All rights reserved.</span>
        </div>
      </div>

      {/* Right / Auth panel */}
      <div className="flex items-center justify-center px-4 py-10 lg:px-10 bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand header */}
          <div className="flex items-center justify-between lg:hidden mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-sm">
                S
              </div>
              <span className="text-base font-semibold tracking-tight">
                Sparta
              </span>
            </div>
            <span className="text-xs text-slate-400">Create your account</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 shadow-[0_18px_45px_rgba(15,23,42,0.85)] backdrop-blur-md p-6 sm:p-8">
            <h2 className="mb-2 text-xl font-semibold tracking-tight text-slate-50">
              Get started with Sparta
            </h2>
            <p className="mb-6 text-xs text-slate-400">
              Sign up with your email or social account to start building your
              athlete profile.
            </p>
            <SignUp
              routing="path"
              path="/auth/sign-up"
              appearance={{
                elements: {
                  formButtonPrimary:
                    "bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-medium border-0 rounded-lg py-2.5 px-4 transition-colors",
                  formFieldInput:
                    "bg-slate-900/70 border border-slate-700 text-slate-50 text-sm rounded-lg focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0",
                  card: "shadow-none bg-transparent border-0 p-0",
                  headerTitle: "Sign Up to Sparta",
                  headerSubtitle: "sparta",
                  footerAction:
                    "text-xs text-slate-400 mt-4 flex justify-center",
                  footerActionLink:
                    "text-emerald-400 hover:text-emerald-300 font-medium",
                },
                layout: {
                  socialButtonsVariant: "blockButton",
                  socialButtonsPlacement: "bottom",
                },
              }}
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
