"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Panel, ProgressBar, Spinner } from "@/components/ui";
import { CheckIcon, CloseIcon, GlobeIcon } from "@/components/icons";
import { PendingSticker, SparkSticker } from "@/components/stickers";
import { cx } from "@/lib/cx";

/* ============================================================================
   RE-LEARN
   ----------------------------------------------------------------------------
   A first crawl finds everything. A re-crawl only matters for what moved, so
   this reports difference rather than volume.

   The important behaviour is at the end: an approved answer whose source page
   has changed goes back to "needs review". Concierge will not quietly start
   saying something new on the owner's behalf just because their site changed —
   that is the same promise the first approval made.
   ========================================================================== */

const PAGES = [
  { label: "Homepage", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Pricing", path: "/pricing" },
  { label: "Invisalign", path: "/invisalign" },
  { label: "FAQs", path: "/faq" },
  { label: "Contact", path: "/contact" },
  { label: "About", path: "/about" },
];

const PHASES = [
  "Checking the site is reachable",
  "Looking for pages that changed",
  "Reading what is different",
  "Comparing it against what you approved",
];

export type RelearnResult = {
  changedIds: string[];
  changedTitles: string[];
  newQuestion: string;
  unchanged: number;
};

export function RelearnPanel({
  url,
  result,
  onDone,
  onClose,
}: {
  url: string;
  /** What this run found. Fixed for the demo; an API would return it. */
  result: RelearnResult;
  /** Called once, when the owner accepts the result. */
  onDone: (changedIds: string[]) => void;
  onClose: () => void;
}) {
  const [tick, setTick] = useState(0);
  const finished = tick > PAGES.length + 1;

  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setTick((t) => t + 1), 460);
    return () => clearInterval(id);
  }, [finished]);

  const read = Math.min(tick, PAGES.length);
  const phase = tick < 1 ? 0 : tick < 2 ? 1 : tick <= PAGES.length ? 2 : 3;

  return (
    <Panel className="cg-enter mb-6">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {finished ? (
            <CheckIcon size={17} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
          ) : (
            <Spinner size={17} className="mt-px shrink-0 text-accent" />
          )}
          <div className="min-w-0">
            <h2 className="t-section">
              {finished ? "Finished reading your site" : "Concierge is re-reading your site"}
            </h2>
            <p className="t-body-sm mt-1 flex flex-wrap items-center gap-x-2 text-text-tertiary">
              <GlobeIcon size={12} />
              <span className="t-mono truncate">{url}</span>
              <span aria-hidden>·</span>
              {finished ? `${PAGES.length} pages read` : `${PHASES[phase]}…`}
            </p>
          </div>
        </div>
        {finished && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            className="shrink-0 p-1 text-text-tertiary transition-colors hover:text-text-primary"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {!finished ? (
        <div className="p-6">
          <ProgressBar value={read} max={PAGES.length} label="Pages read so far" tone="accent" height={4} />
          <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {PAGES.map((p, i) => {
              const state = i < read ? "done" : i === read ? "reading" : "pending";
              return (
                <li
                  key={p.path}
                  className={cx(
                    "flex items-center gap-2.5 text-[12px] transition-colors",
                    state === "pending" ? "text-text-disabled" : "text-text-secondary",
                  )}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {state === "done" ? (
                      <CheckIcon size={13} className="text-success" strokeWidth={2.4} />
                    ) : state === "reading" ? (
                      <Spinner size={12} className="text-accent" />
                    ) : (
                      <span className="h-1 w-1 rounded-full bg-line-hover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.label}</span>
                  <span className="t-mono shrink-0 text-text-muted">{p.path}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <>
          <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Figure
              value={result.changedIds.length}
              label="answers changed"
              hint="Sent back for your approval"
              tone="accent"
            />
            <Figure value={1} label="new question found" hint="Suggested, not yet answered" />
            <Figure value={result.unchanged} label="unchanged" hint="Still saying what you approved" />
          </div>

          <div className="border-t border-line px-6 py-5">
            <ul className="space-y-2.5">
              {result.changedTitles.map((t) => (
                <li key={t} className="flex flex-wrap items-center gap-2.5">
                  <PendingSticker size={22} className="shrink-0" />
                  <span className="text-[12.5px] font-medium">{t}</span>
                  <Badge tone="review">Needs review again</Badge>
                </li>
              ))}
              <li className="flex flex-wrap items-center gap-2.5">
                <SparkSticker size={22} className="shrink-0" />
                <span className="text-[12.5px] font-medium">{result.newQuestion}</span>
                <Badge tone="neutral">New</Badge>
              </li>
            </ul>

            <p className="t-body-sm mt-4 max-w-[70ch] text-text-tertiary">
              Concierge has stopped answering from the changed items until you have read them. It will keep
              using everything else exactly as before.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button onClick={() => onDone(result.changedIds)}>Review what changed</Button>
              <Button variant="tertiary" onClick={onClose}>
                Later
              </Button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}

function Figure({
  value,
  label,
  hint,
  tone,
}: {
  value: number;
  label: string;
  hint: string;
  tone?: "accent";
}) {
  return (
    <div className="px-6 py-5">
      <p className={cx("t-num text-[23px] leading-none", tone === "accent" && "text-accent")}>{value}</p>
      <p className="mt-2 text-[12.5px] font-medium">{label}</p>
      <p className="t-meta mt-1 text-text-tertiary">{hint}</p>
    </div>
  );
}
