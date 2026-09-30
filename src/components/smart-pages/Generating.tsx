"use client";

import { useEffect, useState } from "react";
import { ConciergeMark } from "@/components/shell/ConciergeMark";
import { CheckIcon } from "@/components/icons";
import { ProgressBar, Spinner } from "@/components/ui";
import { cx } from "@/lib/cx";

/* ============================================================================
   GENERATING
   ----------------------------------------------------------------------------
   The document is built the instant the owner presses Generate. This screen
   exists for the owner, not the computer: it names each thing that was just
   made for them, in order, so the page they land on next is something they
   understand rather than something that appeared.
   ========================================================================== */

const STAGES = [
  "Building your page",
  "Adding your business content",
  "Embedding your AI agent",
  "Preparing the mobile version",
  "Setting up visitor actions",
];

export function Generating({ businessName, onDone }: { businessName: string; onDone: () => void }) {
  const [done, setDone] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduced ? 160 : 620;
    const timers = STAGES.map((_, i) => window.setTimeout(() => setDone(i + 1), step * (i + 1)));
    const finish = window.setTimeout(onDone, step * (STAGES.length + 1));
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-center py-16 text-center" role="status" aria-live="polite">
      <div className="relative">
        <ConciergeMark size={56} />
        <span className="absolute -inset-3 border border-accent/40 cg-live-dot" aria-hidden />
      </div>
      <h1 className="t-display mt-8">Creating your smart page…</h1>
      <p className="t-body mt-3 text-[13.5px] text-text-secondary">
        {businessName}, with your Concierge agent already on it.
      </p>

      <div className="mt-8 w-full">
        <ProgressBar value={done} max={STAGES.length} label="Generation progress" tone="accent" height={4} />
      </div>

      <ol className="mt-6 w-full space-y-0 border-t border-divider text-left">
        {STAGES.map((stage, i) => {
          const state = i < done ? "done" : i === done ? "active" : "todo";
          return (
            <li key={stage} className="flex items-center gap-3 border-b border-divider py-3">
              <span
                className={cx(
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  state === "done" ? "bg-success-soft text-success" : "text-text-disabled",
                )}
              >
                {state === "done" ? (
                  <CheckIcon size={11} strokeWidth={2.6} />
                ) : state === "active" ? (
                  <Spinner size={13} className="text-accent" />
                ) : (
                  <span className="h-1.5 w-1.5 bg-line-hover" />
                )}
              </span>
              <span className={cx("text-[12.5px]", state === "todo" ? "text-text-disabled" : "font-medium")}>{stage}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
