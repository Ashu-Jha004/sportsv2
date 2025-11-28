"use client";

import * as React from "react";
import { AIDialogWrapper } from "./AIDialogWrapper";
import { ChatInterface } from "./ChatInterface"; // We'll create this in Step 2.3

export function AIDialogProvider() {
  return (
    <AIDialogWrapper>
      <ChatInterface />
    </AIDialogWrapper>
  );
}
