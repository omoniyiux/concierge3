"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const SKELETON =
  '<!doctype html><html data-ps-frame><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>';

/**
 * The canvas is a real iframe rendering the real page, and the editor's own
 * chrome never goes inside it. That separation is the whole reason for the
 * frame: Tailwind and the Concierge tokens stop at the boundary, so a
 * customer's site cannot inherit the workspace's look, and the workspace
 * cannot be restyled by whatever the customer picks.
 *
 * React renders through a portal rather than into a serialised `srcDoc`, so
 * the page updates from ordinary state without a reload and keeps its scroll
 * position while the owner edits.
 *
 * The document is written synchronously into the blank frame instead of going
 * through `srcDoc` and waiting for `load`: an iframe with no `src` already has
 * a same-origin document, and using it directly removes the race where the
 * portal could attach to the transient `about:blank` that a `srcDoc` load
 * subsequently replaces.
 */
export function PageFrame({
  css,
  children,
  title,
  className,
  onDocument,
}: {
  css: string;
  children: ReactNode;
  title: string;
  className?: string;
  /** The frame's document, so the editor can hit-test and measure inside it. */
  onDocument?: (doc: Document | null) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    const frame = ref.current;
    const frameDoc = frame?.contentDocument;
    if (!frameDoc) return;

    // Guard the write so a StrictMode double-effect does not blank the page.
    if (frameDoc.documentElement.hasAttribute("data-ps-frame") === false) {
      frameDoc.open();
      frameDoc.write(SKELETON);
      frameDoc.close();
    }
    setDoc(frameDoc);
  }, []);

  useEffect(() => {
    onDocument?.(doc);
  }, [doc, onDocument]);

  /* The stylesheet is upserted rather than re-created, so changing a theme
     token restyles the page without the flash of an unstyled document. */
  useEffect(() => {
    if (doc === null) return;
    let style = doc.getElementById("ps-styles") as HTMLStyleElement | null;
    if (style === null) {
      style = doc.createElement("style");
      style.id = "ps-styles";
      doc.head.append(style);
    }
    style.textContent = css;
  }, [doc, css]);

  return (
    <>
      <iframe ref={ref} title={title} className={className} />
      {doc !== null && createPortal(children, doc.body)}
    </>
  );
}
