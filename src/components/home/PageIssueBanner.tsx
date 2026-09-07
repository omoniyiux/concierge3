"use client";

import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";

/**
 * When a widget fails, Symphony says so plainly and hands the user two
 * real next steps — not a dead-end error.
 */
export function PageIssueBanner() {
  const { setChatMode } = useWorkspace();
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="flex flex-col items-start gap-x-6 gap-y-1 rounded-[10px] bg-danger-soft px-4 py-2.5 sm:h-10 sm:flex-row sm:items-center sm:py-0"
    >
      <p className="mr-auto min-w-0 text-[13.5px] text-[#b03b28]">
        Some things on this page didn&rsquo;t load correctly.
      </p>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            ?.writeText("Symphony home · widget load failure · retry on next refresh")
            .catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="shrink-0 text-[13.5px] text-[#b03b28] underline underline-offset-[3px] transition-opacity hover:opacity-70"
      >
        {copied ? "Details copied" : "Copy details"}
      </button>
      <button
        type="button"
        onClick={() => {
          setChatMode("docked");
          setDismissed(true);
        }}
        className="shrink-0 text-[13.5px] font-medium text-[#b03b28] underline underline-offset-[3px] transition-opacity hover:opacity-70"
      >
        Ask Symphony to fix
      </button>
    </div>
  );
}
