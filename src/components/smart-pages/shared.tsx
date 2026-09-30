import type { ReactNode } from "react";
import { SparkIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { PAGES_DOMAIN, suggestSubdomain } from "@/lib/publishing.client";
import { displayName } from "@/lib/starters";
import type { BusinessInfo, OpeningHours, PublishedSiteFacts } from "@/lib/types";

/** Mon–Fri, nine to five, until the owner says otherwise in settings. */
export const DEFAULT_HOURS = (): OpeningHours => ({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  days: [null, ...Array(5).fill({ opens: 540, closes: 1020 }), null],
});

/** What the preview needs to know about a site that does not exist yet. */
export function previewFacts(business: BusinessInfo, subdomain?: string): PublishedSiteFacts {
  const name = displayName(business);
  return {
    name,
    url: `${subdomain || suggestSubdomain(name) || "yourbusiness"}.${PAGES_DOMAIN}`,
    openingHours: DEFAULT_HOURS(),
  };
}

export function StepHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header className={className}>
      <p className="t-eyebrow text-accent-ink">{eyebrow}</p>
      <h1 className="t-display mt-3 max-w-[20ch] text-balance">{title}</h1>
      <p className="t-body mt-3 max-w-[56ch] text-[13.5px] leading-[1.55] text-text-secondary">{description}</p>
    </header>
  );
}

/**
 * The promise on every template and preview. Orange, because it is the one
 * thing on these screens that is Concierge itself rather than the page.
 */
export function AgentIncluded({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 bg-ink font-medium text-text-inverse",
        compact ? "h-[22px] px-2 text-[10.5px]" : "h-7 px-2.5 text-[11.5px]",
        className,
      )}
    >
      <SparkIcon size={compact ? 11 : 13} className="text-accent" />
      AI agent included
    </span>
  );
}

/** A panel beside a step, pinned while the step scrolls. */
export function StickyAside({ children, className }: { children: ReactNode; className?: string }) {
  return <aside className={cx("min-w-0 lg:sticky lg:top-[calc(var(--topbar-h)+24px)] lg:self-start", className)}>{children}</aside>;
}
