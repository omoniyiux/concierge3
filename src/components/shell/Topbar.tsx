"use client";

import Link from "next/link";
import { SiteSwitcher } from "@/components/shell/SiteSwitcher";
import { BellIcon, ExternalIcon, HelpIcon, PanelIcon, SearchIcon } from "@/components/icons";
import { Badge, IconButton} from "@/components/ui";
import { cx } from "@/lib/cx";
import { getSite } from "@/lib/demo-data";
import { useWorkspace } from "@/lib/workspace";

/**
 * Deliberately quiet. The topbar answers "which site am I in?" and offers the
 * command surface. It is not a second dashboard.
 */
export function Topbar({ siteId }: { siteId: string }) {
  const { setCommandOpen, setMobileNavOpen } = useWorkspace();
  const site = getSite(siteId);

  return (
    <header className="flex h-[84px] shrink-0 items-center gap-2 bg-surface px-3 lg:px-4">
      <IconButton label="Open navigation" size={32} className="lg:hidden" onClick={() => setMobileNavOpen(true)}>
        <PanelIcon size={17} />
      </IconButton>

      <SiteSwitcher siteId={siteId} />

      <Badge tone="neutral" className="hidden sm:inline-flex">
        {site.product === "agent" ? "Agent" : "Pages"}
      </Badge>

      <a
        href={`https://${site.url}`}
        target="_blank"
        rel="noreferrer"
        className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-[13.5px] text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary md:inline-flex"
      >
        {site.url}
        <ExternalIcon size={13} />
      </a>

      {/* Command surface ------------------------------------------------ */}
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={cx(
          "ml-auto flex h-8 items-center gap-2 rounded-xl bg-surface-subtle-subtle pl-2.5 pr-2 text-text-muted",
          "transition-colors duration-[var(--dur-micro)] hover:border-line-strong hover:text-text-secondary",
          "w-8 justify-center sm:w-[200px] sm:justify-start",
        )}
        aria-label="Search Concierge"
      >
        <SearchIcon size={15} className="shrink-0" />
        <span className="hidden text-[13.5px] sm:inline">Search</span>
        <kbd className="ml-auto hidden rounded bg-surface px-1.5 py-px font-sans text-[11px] text-text-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      <Link
        href="/help"
        className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13.5px] text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary md:inline-flex"
      >
        <HelpIcon size={15} />
        Help
      </Link>

      <span className="relative">
        <IconButton label="Notifications" size={32}>
          <BellIcon size={17} />
        </IconButton>
        <span className="pointer-events-none absolute right-[7px] top-[6px] h-2 w-2 rounded-full border-2 border-surface bg-accent" />
      </span>

      <Link
        href="/account"
        aria-label="Account"
        className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-text-inverse"
      >
        OP
      </Link>
    </header>
  );
}
