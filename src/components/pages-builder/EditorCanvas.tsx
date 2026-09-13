"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getBreakpoint } from "@/lib/pages-builder";
import { dispatch, handleEditorShortcut, useEditor } from "@/lib/pages-editor";
import type { ConciergePage, ID, PageBreakpoint, PageDocument, PublishedSiteFacts } from "@/lib/types";
import { PageFrame } from "./PageFrame";
import { PageRenderer } from "./PageRenderer";
import { pageStylesheet } from "./page-css";

/** Breathing room around the device frame, in px. */
const GUTTER = 28;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Nodes inside the frame belong to a different realm with its own copies of
 * the DOM constructors, so `target instanceof Element` is false for every one
 * of them and would silently swallow every click. Duck-typing is the check
 * that actually works across the boundary.
 */
const sectionIdAt = (target: EventTarget | null): ID | null => {
  const node = target as { closest?: (selector: string) => Element | null } | null;
  if (node == null || typeof node.closest !== "function") return null;
  return node.closest("[data-section-id]")?.getAttribute("data-section-id") ?? null;
};

/**
 * The device frame, scaled to fit whatever room the workspace has left, with
 * the selection chrome drawn on top of it.
 *
 * A desktop page is authored at 1280px and the middle column is rarely that
 * wide, so the frame renders at its true width and is scaled down visually.
 * Everything inside therefore lays out at the width it will really be viewed
 * at — squeezing the iframe instead would show a narrow page and call it a
 * desktop preview.
 *
 * Outlines and labels live in *this* document, never inside the frame. The
 * page being edited belongs to the customer, and injecting editor furniture
 * into it would change the thing being measured: heights would shift, their
 * CSS could restyle our chrome, and a stray element could end up published.
 * Measuring through the boundary leaves the page untouched.
 */
export function EditorCanvas({
  document: doc,
  page,
  site,
  breakpoint,
}: {
  document: PageDocument;
  page: ConciergePage;
  site: PublishedSiteFacts;
  breakpoint: PageBreakpoint;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  const [frameDoc, setFrameDoc] = useState<Document | null>(null);
  const [hovered, setHovered] = useState<ID | null>(null);
  const [boxes, setBoxes] = useState<{ selected?: Box; hovered?: Box }>({});

  const { selectedId } = useEditor();
  const frameWidth = getBreakpoint(breakpoint).frameWidth;

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    const observer = new ResizeObserver(([entry]) => setAvailable(entry.contentRect.width));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  /* Never scale up: a phone frame stays phone-sized in a wide workspace. */
  const scale = available === 0 ? 1 : Math.min(1, (available - GUTTER * 2) / frameWidth);

  const css = useMemo(() => pageStylesheet(doc.theme), [doc.theme]);

  const onDocument = useCallback((next: Document | null) => setFrameDoc(next), []);

  /* ---- Hit testing ------------------------------------------------------ */

  useEffect(() => {
    if (frameDoc === null) return;

    const onClick = (event: MouseEvent) => {
      /* The page is inert while editing: a click selects rather than
         navigates, including on any link the renderers did not intercept. */
      event.preventDefault();
      dispatch({ type: "select", sectionId: sectionIdAt(event.target) });
    };
    const onMove = (event: MouseEvent) => setHovered(sectionIdAt(event.target));
    const onLeave = () => setHovered(null);

    /* A keystroke only reaches the document it landed in, so the frame needs
       the same shortcuts the workspace has. */
    const onKeyDown = (event: KeyboardEvent) => {
      if (handleEditorShortcut(event)) event.preventDefault();
    };

    frameDoc.addEventListener("click", onClick, true);
    frameDoc.addEventListener("mousemove", onMove);
    frameDoc.addEventListener("mouseleave", onLeave);
    frameDoc.addEventListener("keydown", onKeyDown);
    return () => {
      frameDoc.removeEventListener("click", onClick, true);
      frameDoc.removeEventListener("mousemove", onMove);
      frameDoc.removeEventListener("mouseleave", onLeave);
      frameDoc.removeEventListener("keydown", onKeyDown);
    };
  }, [frameDoc]);

  /* ---- Measuring through the frame boundary ----------------------------- */

  useLayoutEffect(() => {
    const host = hostRef.current;
    const frame = frameDoc?.defaultView?.frameElement;
    if (host === null || frameDoc == null || frame == null) return;

    const measure = () => {
      const hostRect = host.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();

      /* An element's rect is in the frame's own unscaled coordinates, so it is
         scaled first and then offset by where the frame sits in this page. */
      const toHost = (el: Element): Box => {
        const r = el.getBoundingClientRect();
        return {
          left: frameRect.left - hostRect.left + r.left * scale,
          top: frameRect.top - hostRect.top + r.top * scale,
          width: r.width * scale,
          height: r.height * scale,
        };
      };

      const find = (id: ID | null) =>
        id === null ? null : frameDoc.querySelector(`[data-section-id="${id}"]`);

      const selectedEl = find(selectedId);
      const hoveredEl = hovered === selectedId ? null : find(hovered);

      setBoxes({
        selected: selectedEl ? toHost(selectedEl) : undefined,
        hovered: hoveredEl ? toHost(hoveredEl) : undefined,
      });
    };

    measure();
    /* Content just committed into the portal may still be settling. */
    const raf = requestAnimationFrame(measure);

    const view = frameDoc.defaultView;
    view?.addEventListener("scroll", measure, true);
    const observer = new ResizeObserver(measure);
    observer.observe(frameDoc.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      view?.removeEventListener("scroll", measure, true);
      observer.disconnect();
    };
  }, [frameDoc, scale, selectedId, hovered, doc, page, breakpoint]);

  const selectedTitle = page.sections.find((s) => s.id === selectedId)?.title;

  return (
    <div ref={hostRef} className="relative h-full w-full overflow-hidden bg-surface-sunken">
      <div className="flex h-full justify-center" style={{ paddingInline: GUTTER }}>
        <div className="relative h-full" style={{ width: frameWidth * scale }}>
          <div
            className="origin-top-left bg-surface"
            style={{ width: frameWidth, height: `${100 / scale}%`, transform: `scale(${scale})` }}
          >
            <PageFrame
              css={css}
              title={`${page.title} — preview`}
              className="h-full w-full border-0 bg-white"
              onDocument={onDocument}
            >
              <PageRenderer document={doc} page={page} site={site} breakpoint={breakpoint} />
            </PageFrame>
          </div>
        </div>
      </div>

      {/* Selection chrome. Orange is Concierge's signal colour, and "this is
          the thing you are editing" is exactly a signal. */}
      {boxes.hovered && (
        <div
          className="pointer-events-none absolute z-10 outline outline-1 outline-accent/45"
          style={boxes.hovered}
          aria-hidden
        />
      )}
      {boxes.selected && (
        <div className="pointer-events-none absolute z-20" style={boxes.selected} aria-hidden>
          <div className="absolute inset-0 outline outline-2 outline-accent" />
          {selectedTitle && (
            <span className="absolute left-0 top-0 -translate-y-full bg-accent px-1.5 py-0.5 text-[10.5px] font-semibold text-ink">
              {selectedTitle}
            </span>
          )}
        </div>
      )}

      {scale < 0.995 && (
        <span className="pointer-events-none absolute bottom-3 left-3 z-30 bg-ink px-2 py-1 text-[10.5px] font-medium text-text-inverse tabular-nums">
          {Math.round(scale * 100)}%
        </span>
      )}
    </div>
  );
}
