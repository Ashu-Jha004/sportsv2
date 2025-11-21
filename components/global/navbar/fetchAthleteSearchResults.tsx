"use client";

import React, { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchStore } from "@/stores/athlete/search/search-store";
import { Input } from "@/components/ui/input";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AthleteSummary } from "@/app/api/user/athlete.types";

async function fetchAthleteSearchResults(
  query: string
): Promise<AthleteSummary[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({ q: query, pageSize: "10", page: "1" });
  const res = await fetch(`/api/user/search?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch athletes");
  }

  const response = await res.json();
  console.log("API Response:", response);

  // Your API shape: { success, data: { items: [...] , pagination }, timestamp }
  const items = response.data?.items ?? [];

  return items.map((item: AthleteSummary) => ({
    ...item,
    profileImage: item.profileImage ?? null,
  }));
}

export default function AthleteSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue, 300);

  const setSearchResults = useSearchStore((state) => state.setSearchResults);
  const clearSearchResults = useSearchStore(
    (state) => state.clearSearchResults
  );
  const searchResultsFromStore = useSearchStore((state) => state.searchResults);

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

  // Keep Zustand in sync (if other parts of app need the results)
  useEffect(() => {
    setSearchResults(results);
  }, [results, setSearchResults]);

  // Use query data for rendering
  const searchResults = results;

  console.log("Search results (query):", searchResults);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function handleSelect(username: string) {
    redirect(`/profile/${username}`);
    setInputValue("");
    clearSearchResults();
  }

  const hasResults = searchResults.length > 0;
  const hasQuery = debouncedQuery.length > 0;

  return (
    <div className="relative max-w-lg mx-auto">
      <Input
        type="search"
        placeholder="Search athletes by name, sport, city..."
        value={inputValue}
        onChange={handleInputChange}
        className="pr-10"
        aria-label="Search athletes"
        title="Search athletes"
      />

      {isPending && hasQuery && (
        <div className="absolute right-3 top-3 animate-spin text-gray-400">
          <List size={20} />
        </div>
      )}

      {!isPending && hasResults && (
        <ul
          title="list"
          className={cn(
            "absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-72 overflow-auto shadow-lg"
          )}
          role="listbox"
        >
          {searchResults.map((athlete) => (
            <li
              key={athlete.username}
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100"
              role="option"
              onClick={() => handleSelect(athlete.username)}
            >
              <img
                src={athlete.profileImage || "/default-avatar.png"}
                alt={`${athlete.firstName} ${athlete.lastName}`}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {athlete.firstName} {athlete.lastName} (@{athlete.username})
                </span>
                <span className="text-gray-600 text-sm">
                  {athlete.primarySport}{" "}
                  {athlete.city || athlete.state || athlete.country
                    ? `• ${[athlete.city, athlete.state, athlete.country]
                        .filter(Boolean)
                        .join(", ")}`
                    : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isPending && hasQuery && !hasResults && !isError && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 p-2 text-gray-500 text-center">
          No results found
        </div>
      )}

      {isError && (
        <div className="absolute z-10 w-full bg-red-50 border border-red-300 rounded-md mt-1 p-2 text-red-600 text-center">
          Error loading results
        </div>
      )}
    </div>
  );
}
