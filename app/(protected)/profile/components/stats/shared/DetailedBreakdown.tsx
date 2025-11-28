// components/stats/shared/DetailedBreakdown.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BreakdownSection {
  title: string;
  icon?: string;
  content: React.ReactNode;
}

interface DetailedBreakdownProps {
  sections: BreakdownSection[];
  defaultOpen?: string[];
  className?: string;
}

export function DetailedBreakdown({
  sections,
  defaultOpen = [],
  className,
}: DetailedBreakdownProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className={cn("space-y-2", className)}
    >
      {sections.map((section, index) => (
        <AccordionItem
          key={index}
          value={`section-${index}`}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              {section.icon && <span className="text-lg">{section.icon}</span>}
              <span>{section.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2">
            {section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
