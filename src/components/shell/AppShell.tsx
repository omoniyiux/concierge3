"use client";

import { useEffect, type ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { CommandMenu } from "@/components/shell/CommandMenu";
import { PanelIcon, SearchIcon } from "@/components/icons";
import { getSite } from "@/lib/demo-data";
import { IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";
import { useWorkspace } from "@/lib/workspace";

/** Mobile only: the sidebar is a drawer there, so one slim bar opens it. */
function MobileBar({ siteId }: { siteId: string }) {
  const { setMobileNavOpen, setCommandOpen } = useWorkspace();
  const site = getSite(siteId);
  return (
    <div className="flex h-16 shrink-0 items-center gap-2 bg-surface px-3 lg:hidden">
      <IconButton label="Open navigation" size={38} onClick={() => setMobileNavOpen(true)}>
        <PanelIcon size={20} />
      </IconButton>
      <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">{site.name}</span>
      <IconButton label="Search Concierge" size={38} onClick={() => setCommandOpen(true)}>
        <SearchIcon size={20} />
      </IconButton>
    </div>
  );
}

export function AppShell({ siteId, children }: { siteId: string; children: ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen } = useWorkspace();

  // The workspace owns its own scrolling; the document must not also scroll,
  // or the shell ends up shorter than the page behind it.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div className="flex h-dvh max-h-dvh w-full overflow-hidden bg-canvas">
      {/* Desktop navigation --------------------------------------------- */}
      <div className="hidden lg:flex">
        <Sidebar siteId={siteId} />
      </div>

      {/* Mobile navigation: a drawer, not a squeezed sidebar ------------- */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-ink/25"
          />
          {/* The drawer is exactly the sidebar's width: the extra few pixels
              left a sliver of overlay down its edge. */}
          <div className="cg-enter absolute inset-y-0 left-0 flex w-[var(--sidebar-w)]">
            <Sidebar siteId={siteId} onClose={() => setMobileNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileBar siteId={siteId} />
        <main id="workspace" className="cg-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>

      <CommandMenu siteId={siteId} />
    </div>
  );
}

/* ============================================================================
   PAGE FURNITURE
   Every workspace page opens the same way: eyebrow, title, one sentence that
 says why the surface exists, and at most one primary action.
   ========================================================================== */

export function PageContainer({
  children,
  className,
  flush,
}: {
  children: ReactNode;
  className?: string;
  /** Full-bleed surfaces (split inboxes, the page editor) opt out entirely. */
  flush?: boolean;
}) {
  if (flush) return <div className={cx("h-full", className)}>{children}</div>;
  return (
    <div
      style={{ maxWidth: "var(--content-max)" }}
      className={cx("mx-auto w-full px-5 pb-24 pt-16 sm:px-7 lg:px-9", className)}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cx("mb-8", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-[64ch]">
          <p className="t-eyebrow text-text-muted">{eyebrow}</p>
          <h1 className="t-page mt-2.5">{title}</h1>
          {description && <p className="t-body mt-3 max-w-[62ch] text-text-primary">{description}</p>}
        </div>
        {actions && <div className="flex max-w-full shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {meta && <div className="mt-5">{meta}</div>}
    </header>
  );
}
