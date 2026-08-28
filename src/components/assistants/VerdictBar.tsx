"use client";

import type { MentionVerdict } from "@/lib/types";

/* ============================================================================
   VERDICT BAR
   ----------------------------------------------------------------------------
   One bar, four segments, sized to their share. It exists instead of four stat
   tiles because the question the owner is asking is proportional — "how much
   of what assistants say about me is right?" — and a proportion should be
   drawn as one whole rather than four separate numbers to add up.

   The three failing segments carry the accent in descending weight, so the
   worst outcome reads loudest and "right" stays quiet.
   ========================================================================== */

const FILL: Record<MentionVerdict, string> = {
  absent: "var(--color-accent)",
  outdated: "var(--color-accent-light)",
  incomplete: "var(--color-accent-soft)",
  accurate: "var(--color-surface-sunken)",
};

const TEXT: Record<MentionVerdict, string> = {
  absent: "text-accent-ink",
  outdated: "text-accent-ink",
  incomplete: "text-text-secondary",
  accurate: "text-text-tertiary",
};

export function VerdictBar({
  counts,
}: {
  counts: { verdict: MentionVerdict; label: string; count: number }[];
}) {
  const total = counts.reduce((n, c) => n + c.count, 0) || 1;
  const present = counts.filter((c) => c.count > 0);

  return (
    <div>
      <div
        className="flex h-9 w-full overflow-hidden border border-line-strong"
        role="img"
        aria-label={present.map((c) => `${c.count} ${c.label.toLowerCase()}`).join(", ")}
      >
        {present.map((c) => (
          <div
            key={c.verdict}
            style={{ width: `${(c.count / total) * 100}%`, background: FILL[c.verdict] }}
            className="transition-[width] duration-[var(--dur-large)] ease-[var(--ease-out-cg)]"
          />
        ))}
      </div>

      <ul className="mt-3.5 flex flex-wrap gap-x-7 gap-y-2">
        {counts.map((c) => (
          <li key={c.verdict} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 border border-line-strong"
              style={{ background: FILL[c.verdict] }}
            />
            <span className="t-num text-[13px] leading-none">{c.count}</span>
            <span className={`text-[11.5px] ${TEXT[c.verdict]}`}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
