"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { CommandMenu } from "@/components/shell/CommandMenu";
import { CloseIcon } from "@/components/icons";
import { IconButton} from "@/components/ui";
import { cx } from "@/lib/cx";
import { useWorkspace } from "@/lib/workspace";

export function AppShell({ siteId, children }: { siteId: string; children: ReactNode }) {
  const { mobileNavOpen, setMobileNavOpen } = useWorkspace();

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
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
          <div className="cg-enter absolute inset-y-0 left-0 flex w-[264px]">
            <Sidebar siteId={siteId} />
            <IconButton
              label="Close navigation"
              size={32}
              className="absolute right-2 top-3 bg-surface"
              onClick={() => setMobileNavOpen(false)}
            >
              <CloseIcon size={16} />
            </IconButton>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar siteId={siteId} />
        <main id="workspace" className="cg-scroll min-h-0 flex-1 overflow-y-auto">
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
  wide,
  flush,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
  /** Full-bleed surfaces (split inboxes) opt out of the max width. */
  flush?: boolean;
}) {
  if (flush) return <div className={cx("h-full", className)}>{children}</div>;
  return (
    <div
      style={{ maxWidth: wide ? "var(--content-max-wide)" : "var(--content-max)" }}
      className={cx("mx-auto w-full px-5 py-7 sm:px-7 lg:px-9", className)}
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
    <header className={cx("mb-7", className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-[60ch]">
          <p className="t-eyebrow text-text-muted">{eyebrow}</p>
          <h1 className="t-page mt-2">{title}</h1>
          {description && <p className="t-body mt-2.5 text-text-tertiary">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {meta && <div className="mt-5">{meta}</div>}
    </header>
  );
}
