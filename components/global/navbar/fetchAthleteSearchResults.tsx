"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Search, Loader2, TrendingUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteSummary } from "@/app/api/user/athlete.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getSportColor } from "@/lib/design-system/utils";

interface AthleteSearchProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

async function fetchAthleteSearchResults(
  query: string
): Promise<AthleteSummary[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({ q: query, pageSize: "8", page: "1" });
  const res = await fetch(`/api/user/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch athletes");
  }

  const response = await res.json();
  const items = response.data?.items ?? [];

  return items.map((item: AthleteSummary) => ({
    ...item,
    profileImage: item.profileImage ?? null,
  }));
}

export default function AthleteSearch({ onFocus, onBlur }: AthleteSearchProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(inputValue, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    data: results = [],
    isPending,
    isError,
  } = useQuery<AthleteSummary[]>({
    queryKey: ["athlete-search", debouncedQuery],
    queryFn: () => fetchAthleteSearchResults(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleSelect(username: any) {
    router.push(`/profile/${username}`);
    setInputValue("");
    setIsFocused(false);
  }

  function handleFocus() {
    setIsFocused(true);
    onFocus?.();
  }

  function handleBlur() {
    // Delay to allow click on results
    setTimeout(() => {
      onBlur?.();
    }, 200);
  }

  const hasResults = results.length > 0;
  const hasQuery = debouncedQuery.length > 0;
  const showDropdown = isFocused && hasQuery;

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
          strokeWidth={2.5}
        />
        <Input
          type="search"
          placeholder="Search athletes by name, sport, or location..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "pl-10 pr-10 h-10 bg-slate-50 border-slate-200 rounded-xl",
            "focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            "placeholder:text-slate-400 text-sm font-medium transition-all duration-200"
          )}
          aria-label="Search athletes"
        />
        {isPending && hasQuery && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="animate-spin text-blue-600" size={18} />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
          {isPending ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <p className="text-sm text-slate-500 font-medium">Searching...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <p className="text-sm text-red-600 font-medium">
                Failed to load results
              </p>
            </div>
          ) : hasResults ? (
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Athletes ({results.length})
                </p>
                <div className="space-y-1">
                  {results.map((athlete) => (
                    <button
                      key={athlete.username}
                      onClick={() => handleSelect(athlete.username)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                    >
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-slate-100 group-hover:border-blue-200 transition-colors">
                        <AvatarImage
                          src={athlete.profileImage || undefined}
                          alt={`${athlete.firstName} ${athlete.lastName}`}
                        />
                        <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                          {athlete.firstName?.charAt(0)}
                          {athlete.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {athlete.firstName} {athlete.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">
                            @{athlete.username}
                          </span>
                          {athlete.primarySport && (
                            <>
                              <span className="text-slate-300">•</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-0"
                                style={{
                                  backgroundColor: `${getSportColor(
                                    athlete.primarySport
                                  )}15`,
                                  color: getSportColor(athlete.primarySport),
                                }}
                              >
                                {athlete.primarySport}
                              </Badge>
                            </>
                          )}
                        </div>
                        {(athlete.city || athlete.state || athlete.country) && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {[athlete.city, athlete.state, athlete.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Rank/Class */}
                      {athlete.rank && (
                        <div className="shrink-0">
                          <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            #{athlete.rank}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <User className="text-slate-400" size={24} />
              </div>
              <p className="text-sm text-slate-600 font-medium">
                No athletes found
              </p>
              <p className="text-xs text-slate-400">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
