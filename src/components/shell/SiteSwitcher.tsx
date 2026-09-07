"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteMark } from "@/components/shell/ConciergeMark";
import { CheckIcon, ChevronUpDown, PlusIcon } from "@/components/icons";
import { Badge} from "@/components/ui";
import { cx } from "@/lib/cx";
import { ORG, SITES } from "@/lib/demo-data";
import type { Site } from "@/lib/types";

const STATUS_TONE = {
  live: "approved",
  ready: "approved",
  review: "review",
  learning: "accent",
  draft: "neutral",
  paused: "neutral",
} as const;

const STATUS_LABEL = {
  live: "Live",
  ready: "Ready",
  review: "In review",
  learning: "Learning",
  draft: "Draft",
  paused: "Paused",
} as const;

export function SiteStatusBadge({ site }: { site: Site }) {
  return (
    <Badge tone={STATUS_TONE[site.status]} dot pulse={site.status === "live"}>
      {STATUS_LABEL[site.status]}
    </Badge>
  );
}

/**
 * Org → Site. Written so an agency with many client orgs can slot in without
 * the component changing shape.
 */
export function SiteSwitcher({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const current = SITES.find((s) => s.id === siteId) ?? SITES[0];

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          "flex h-[46px] w-full items-center gap-2.5 rounded-xl bg-surface-subtle px-2.5 transition-colors duration-[var(--dur-micro)]",
          open ? "bg-surface-hover" : "hover:bg-surface-hover",
        )}
      >
        <SiteMark name={current.name} size={28} />
        <span className="min-w-0 text-left">
          <span className="block truncate text-[14.5px] font-semibold leading-tight">{current.name}</span>
          <span className="block truncate text-[13.5px] leading-tight text-text-tertiary">{ORG.name}</span>
        </span>
        <ChevronUpDown size={16} className="ml-auto shrink-0 text-text-muted" />
      </button>

      {open && (
        <div
          role="listbox"
          className="cg-enter absolute left-0 top-[calc(100%+6px)] z-50 w-[300px] overflow-hidden rounded-[18px] bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-divider px-3 py-2">
            <p className="t-eyebrow text-text-muted">{ORG.name}</p>
            <span className="text-[13.5px] text-text-tertiary">
              {SITES.length} of {ORG.siteLimit} sites
            </span>
          </div>

          <ul className="max-h-[320px] overflow-y-auto p-1.5">
            {SITES.map((s) => {
              const active = s.id === siteId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setOpen(false);
                      router.push(`/sites/${s.id}/overview`);
                    }}
                    className={cx(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                      active ? "bg-surface-hover" : "hover:bg-surface-subtle",
                    )}
                  >
                    <SiteMark name={s.name} size={28} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">{s.name}</span>
                      <span className="block truncate text-[13.5px] text-text-tertiary">{s.url}</span>
                    </span>
                    <SiteStatusBadge site={s} />
                    {active && <CheckIcon size={15} className="shrink-0 text-text-primary" />}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-divider p-1.5">
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[15px] font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-[7px] border border-dashed border-line-strong">
                <PlusIcon size={14} />
              </span>
              Add a website
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
