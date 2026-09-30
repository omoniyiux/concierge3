"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PageFrame } from "@/components/pages-builder/PageFrame";
import { PageRenderer } from "@/components/pages-builder/PageRenderer";
import { pageStylesheet, responsiveCss } from "@/components/pages-builder/page-css";
import { getBreakpoint } from "@/lib/pages-builder";
import { cx } from "@/lib/cx";
import type { PageBreakpoint, PageDocument, PublishedSiteFacts } from "@/lib/types";

/* ============================================================================
   A LIVE PREVIEW OF A PAGES SITE
   ----------------------------------------------------------------------------
   The real renderer in a real iframe, scaled to whatever room it is given —
   the same approach as the editor canvas, without the selection chrome. Every
   template card, every "here is your page" moment in the create flow is this,
   so what an owner picks is exactly what they get: there are no screenshots
   in the product to fall out of date.

   The frame lays out at the device's true width and is scaled down visually,
   so a desktop preview shows a desktop layout rather than a squeezed one.
   ========================================================================== */

export function SitePreview({
  document,
  site,
  device = "desktop",
  pageId,
  height,
  aspect,
  agentOpen = false,
  interactive = false,
  className,
}: {
  document: PageDocument;
  site: PublishedSiteFacts;
  device?: PageBreakpoint;
  pageId?: string;
  /** Visible height in px. Or give `aspect` (width / height) instead. */
  height?: number;
  aspect?: number;
  agentOpen?: boolean;
  /** Off for thumbnails, so a card can be clicked rather than the page in it. */
  interactive?: boolean;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  /* A gallery holds twenty of these, each a whole page with photographs, so
     a frame is only built once it is about to scroll into view — and then
     kept, so scrolling back does not rebuild it. */
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeen(true);
      },
      { rootMargin: "300px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [seen]);

  const page = document.pages.find((p) => p.id === pageId) ?? document.pages[0];
  const frameWidth = getBreakpoint(device).frameWidth;
  const scale = width === 0 ? 0 : width / frameWidth;
  const visible = height ?? (aspect ? width / aspect : 480);

  const css = useMemo(
    () => (page ? `${pageStylesheet(document.theme)}\n${responsiveCss(page)}` : ""),
    [document.theme, page],
  );

  return (
    <div
      ref={hostRef}
      style={{ height: visible || undefined }}
      className={cx("relative w-full overflow-hidden bg-white", !interactive && "pointer-events-none", className)}
    >
      {seen && scale > 0 && page && (
        <div
          className="origin-top-left"
          style={{ width: frameWidth, height: visible / scale, transform: `scale(${scale})` }}
        >
          <PageFrame
            css={css}
            title={`${site.name} — ${device} preview`}
            className="block h-full w-full border-0 bg-white"
          >
            <PageRenderer
              document={document}
              page={page}
              site={site}
              breakpoint={device}
              mode="preview"
              agentOpen={agentOpen}
            />
          </PageFrame>
        </div>
      )}
    </div>
  );
}

/** A browser window around a desktop preview: three dots and the address. */
export function BrowserFrame({
  url,
  children,
  trailing,
  className,
}: {
  url: string;
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("overflow-hidden border border-line-strong bg-surface", className)}>
      <div className="flex h-8 items-center gap-2 border-b border-divider bg-surface-subtle px-3">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2 w-2 bg-line-hover" />
          <span className="h-2 w-2 bg-line-hover" />
          <span className="h-2 w-2 bg-line-hover" />
        </span>
        <span className="t-mono ml-1 min-w-0 flex-1 truncate text-text-tertiary">{url}</span>
        {trailing}
      </div>
      {children}
    </div>
  );
}

/** A phone around a mobile preview. Square, like everything else we draw. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("border-[5px] border-ink bg-ink shadow-lg", className)}>
      <div className="flex h-4 items-center justify-center bg-white" aria-hidden>
        <span className="h-1 w-10 bg-ink" />
      </div>
      {children}
    </div>
  );
}
