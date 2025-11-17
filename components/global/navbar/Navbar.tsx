"use client";

import React, { useState } from "react";
import { Menu, Bell, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export default function Navbar({
  brandName = "Brand",
  collapsed = false,
  setCollapsed,
}: {
  brandName?: string;
  collapsed?: boolean;
  setCollapsed?: (v: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const doSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between gap-4">
          <form onSubmit={doSearch} className="flex-1 flex justify-center">
            <div className="w-full max-w-lg">
              <Input
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="p-2">
              <Bell size={16} />
            </Button>
            <Button variant="ghost" className="p-2">
              <MessageCircle size={16} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
