"use client";

import { useEffect, useState } from "react";
import { CheckIcon, GlobeIcon, SourceIcon } from "@/components/icons";
import { Badge, ProgressBar, Spinner } from "@/components/ui";
import { cx } from "@/lib/cx";

const PAGES = [
  { label: "Homepage", path: "/", items: 8 },
  { label: "Services", path: "/services", items: 11 },
  { label: "Pricing", path: "/pricing", items: 6 },
  { label: "Invisalign", path: "/invisalign", items: 5 },
  { label: "FAQs", path: "/faq", items: 7 },
  { label: "Contact", path: "/contact", items: 3 },
  { label: "About", path: "/about", items: 2 },
];

const PHASES = [
  { key: "validating", label: "Checking the site is reachable" },
  { key: "scanning", label: "Finding pages worth reading" },
  { key: "extracting", label: "Reading what your business does" },
  { key: "building", label: "Building your Site Brain" },
] as const;

/**
 * The crawl is the first time Concierge does something visible, so it reads as
 * learning rather than loading: named pages, real counts, an honest phase.
 */
export function CrawlProgress({ url, onComplete }: { url: string; onComplete: () => void }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 620);
    return () => clearInterval(id);
  }, []);

  const done = Math.min(tick, PAGES.length);
  const finished = tick > PAGES.length + 2;
  const phaseIndex = tick < 1 ? 0 : tick < 2 ? 1 : tick <= PAGES.length + 1 ? 2 : 3;
  const itemsFound = PAGES.slice(0, done).reduce((n, p) => n + p.items, 0);

  useEffect(() => {
    if (finished) {
      const id = setTimeout(onComplete, 900);
      return () => clearTimeout(id);
    }
  }, [finished, onComplete]);

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="flex items-center gap-2.5">
        <GlobeIcon size={17} className="text-accent" />
        <p className="t-mono truncate text-text-secondary">{url}</p>
      </div>

      <h2 className="t-page mt-5">
        {finished ? "Site Brain ready" : "Concierge is learning your business"}
      </h2>
      <p className="t-body mt-2.5 text-text-tertiary">
        {finished
          ? `${itemsFound} knowledge items found across ${PAGES.length} pages. Next you will approve what Concierge is allowed to say.`
          : PHASES[phaseIndex].label + "…"}
      </p>

      {/* Phase rail ------------------------------------------------------ */}
      <ol className="mt-7 space-y-0">
        {PHASES.map((phase, i) => {
          const state = finished || i < phaseIndex ? "done" : i === phaseIndex ? "active" : "pending";
          return (
            <li key={phase.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center self-stretch">
                <span
                  className={cx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    state === "done"
                      ? "border-success bg-success text-white"
                      : state === "active"
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-line-strong bg-surface text-text-disabled",
                  )}
                >
                  {state === "done" ? (
                    <CheckIcon size={11} strokeWidth={2.6} />
                  ) : state === "active" ? (
                    <Spinner size={11} />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-current" />
                  )}
                </span>
                {i < PHASES.length - 1 && (
                  <span className={cx("w-px flex-1", state === "done" ? "bg-success/30" : "bg-line")} />
                )}
              </div>
              <p
                className={cx(
                  "pb-4 text-[13.5px]",
                  state === "pending" ? "text-text-disabled" : "text-text-primary",
                  state === "active" && "font-medium",
                )}
              >
                {phase.label}
              </p>
            </li>
          );
        })}
      </ol>

      {/* Pages, named as they land -------------------------------------- */}
      <div className="mt-2 overflow-hidden rounded-2xl bg-surface">
        <div className="flex items-center justify-between border-b border-divider px-4 py-2.5">
          <p className="t-eyebrow text-text-muted">Pages read</p>
          <p className="text-[13px] tabular-nums text-text-tertiary">
            {done} of {PAGES.length}
          </p>
        </div>
        <ul className="divide-y divide-divider">
          {PAGES.map((page, i) => {
            const state = i < done ? "done" : i === done && !finished ? "reading" : "pending";
            return (
              <li
                key={page.path}
                className={cx(
                  "relative flex items-center gap-3 overflow-hidden px-4 py-2.5",
                  state === "reading" && "cg-sweep",
                )}
              >
                <span
                  className={cx(
                    "shrink-0",
                    state === "done" ? "text-success" : state === "reading" ? "text-accent" : "text-text-disabled",
                  )}
                >
                  {state === "done" ? (
                    <CheckIcon size={14} strokeWidth={2.4} />
                  ) : state === "reading" ? (
                    <Spinner size={13} />
                  ) : (
                    <SourceIcon size={14} />
                  )}
                </span>
                <span
                  className={cx(
                    "min-w-0 flex-1 truncate text-[13px]",
                    state === "pending" ? "text-text-disabled" : "text-text-primary",
                  )}
                >
                  {page.label}
                  <span className="ml-2 text-[13px] text-text-muted">{page.path}</span>
                </span>
                {state === "done" && (
                  <Badge tone="neutral">
                    {page.items} item{page.items === 1 ? "" : "s"}
                  </Badge>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={finished ? 100 : (done / PAGES.length) * 92}
          label="Crawl progress"
          tone="accent"
        />
        <p className="mt-2.5 text-[13.5px] tabular-nums text-text-tertiary">
          {itemsFound} knowledge items found
          {!finished && " so far"}
        </p>
      </div>
    </div>
  );
}
