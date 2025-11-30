"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  UserCheck,
  Trophy,
  Star,
  Calendar,
  Mail,
  Globe,
  Crown,
  ShieldCheck,
  Landmark,
  Flag,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AboutTabProps } from "@/types/profile/athlete-profile.types";

interface ExtendedAthlete {
  firstName: string;
  lastName: string;
  username?: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  primarySport?: string;
  secondarySports?: string[];
  rank?: string;
  class?: string;
  gender?: string;
  email?: string;
  dateOfBirth?: string;
  roles?: string[];
  createdAt?: string;
  onboardingComplete?: boolean;
}

export default function AboutTab({
  athlete,
}: AboutTabProps & { athlete: ExtendedAthlete }) {
  const {
    firstName,
    lastName,
    username = "",
    bio = "",
    city = "",
    state = "",
    country = "",
    primarySport = "",
    secondarySports = [],
    rank = "",
    class: athleteClass = "",
    gender = "",
    email = "",
    dateOfBirth = "",
    roles = [],
    createdAt = "",
    onboardingComplete = false,
  } = athlete;

  const fullName = useMemo(
    () => `${firstName} ${lastName}`.trim(),
    [firstName, lastName]
  );
  const location = [city, state, country].filter(Boolean).join(", ");
  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : null;
  const age = dateOfBirth
    ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
    : null;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Bio Section */}
      {bio && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group bg-linear-to-br from-blue-50/90 to-indigo-50/70 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/3 to-indigo-500/3" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border shrink-0 mt-1">
              <User className="w-7 h-7 text-slate-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
                About {fullName}
              </h2>
              <p className="text-lg text-slate-800 leading-relaxed font-medium">
                {bio}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal & Sports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-1"
        >
          {/* Personal Info */}
          <div className="group bg-white/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2.5 bg-linear-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shrink-0">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Personal Info
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                  Username
                </span>
                <span className="font-bold text-slate-900">@{username}</span>
              </div>
              {gender && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-600">
                    Gender
                  </span>
                  <Badge className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                    {gender}
                  </Badge>
                </div>
              )}
              {age && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-600">
                    Age
                  </span>
                  <span className="text-2xl font-black text-emerald-600">
                    {age}
                  </span>
                </div>
              )}
              {email && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                  <span className="text-sm text-slate-700 font-mono truncate max-w-xs">
                    {email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sports */}
          <div className="group bg-linear-to-br from-emerald-50/90 to-green-50/70 backdrop-blur-xl border border-emerald-200/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start gap-3 mb-5">
              <div className="p-2.5 bg-linear-to-br from-orange-500 to-yellow-600 rounded-xl shadow-lg shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-linear-to-r from-emerald-900 to-green-800 bg-clip-text text-transparent">
                Sports
              </h3>
            </div>
            <div className="space-y-3">
              <Badge className="w-full justify-center bg-linear-to-r from-emerald-600 to-green-700 text-white font-bold py-3 text-sm h-auto shadow-lg">
                {primarySport}
              </Badge>
              {secondarySports.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {secondarySports.map((sport: string, index: number) => (
                    <Badge
                      key={`${sport}-${index}`}
                      variant="outline"
                      className="bg-white/80 backdrop-blur-sm border-emerald-300 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 shadow-md text-xs"
                    >
                      {sport}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Rank & Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-1"
        >
          {/* Rank */}
          <div className="group bg-linear-to-br from-yellow-50/90 to-orange-50/70 backdrop-blur-xl border border-yellow-200/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-2.5 bg-linear-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="relative mx-auto mb-4">
              <div className="w-20 h-20 bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/50 mx-auto">
                <Star className="w-9 h-9 text-white" />
              </div>
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-yellow-500 to-orange-500 text-white font-bold px-3 py-1.5 shadow-xl">
                {athleteClass}
              </Badge>
            </div>
            <div className="text-3xl font-black bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
              {rank}
            </div>
            <div className="text-sm text-yellow-800 font-semibold uppercase tracking-wider">
              Current Rank
            </div>
          </div>

          {/* Location */}
          {location && (
            <div className="group bg-linear-to-br from-indigo-50/90 to-purple-50/70 backdrop-blur-xl border border-indigo-200/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-3 mb-5">
                <div className="p-2.5 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shrink-0 mt-1">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-linear-to-r from-indigo-900 to-purple-800 bg-clip-text text-transparent">
                  Location
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-lg font-semibold text-slate-800">
                <span className="flex items-center gap-2 flex-1">
                  <Landmark className="w-5 h-5 text-indigo-600" />
                  {city}
                </span>
                <Separator
                  orientation="vertical"
                  className="h-8 bg-slate-300/50 hidden sm:block"
                />
                <span className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-purple-600" />
                  {state}, {country}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Account Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-linear-to-br from-slate-50/90 to-slate-100/70 backdrop-blur-xl border border-slate-200/50 rounded-2xl p-7 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start gap-3 mb-6">
          <div className="p-2.5 bg-linear-to-br from-slate-500 to-slate-700 rounded-xl shadow-lg shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              Account Details
            </h3>
            {joinedDate && (
              <p className="text-sm text-slate-600">
                Member since {joinedDate}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3 block">
                Roles
              </span>
              <div className="flex flex-wrap gap-2">
                {roles.map((role: string, index: number) => (
                  <Badge
                    key={`${role}-${index}`}
                    className="bg-linear-to-r from-slate-600 to-slate-800 text-white font-semibold px-3 py-1 shadow-md hover:shadow-lg transition-all text-xs"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {onboardingComplete && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50/80 rounded-xl border-2 border-emerald-200/50 shadow-md">
              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-emerald-900 text-sm">
                  Profile Verified
                </span>
                <p className="text-xs text-emerald-700 mt-1">
                  Onboarding complete
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}
