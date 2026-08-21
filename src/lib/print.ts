/* ============================================================================
   PRINT / PDF
   ----------------------------------------------------------------------------
   Concierge produces two printed documents: the insights report and an
   invoice. Both are designed as pages in the product's own type and palette
   rather than handed to a generic PDF writer, so what an owner sends to an
   accountant or a partner still looks like Concierge.

   The mechanism is deliberately dependency-free. The document is already
   rendered — in the workspace, off-screen — so it is styled by the same
   stylesheet as everything else. Printing clones that markup into a hidden
   iframe, carries the page's stylesheets across, adds a print sheet, and
   opens the browser's print dialog, where "Save as PDF" is the first
   destination. No chart library, no font embedding, no server round trip.
   ========================================================================== */

/** A4 at 96dpi, less the 14mm margins the print sheet sets. */
export const PRINT_WIDTH_PX = 686;

function printCss(widthPx: number) {
  return `
    @page { size: A4 portrait; margin: 14mm; }

    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow: visible;
      height: auto;
    }

    /* Colour is the point of these documents — keep every fill and every
       sticker exactly as designed rather than letting the driver flatten
       them to grey. */
    *, *::before, *::after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .cg-print-root {
      width: ${widthPx}px;
      margin: 0 auto;
      background: #ffffff;
    }

    /* On screen the charts and stickers draw themselves in. On paper there is
       no "in" — every one of them must be at its finished state the moment
       the driver takes its snapshot. */
    .cg-draw, .cg-rise, .cg-pop, .cg-grow-x, .cg-enter, .cg-skeleton, .cg-live-dot {
      animation: none !important;
      stroke-dashoffset: 0 !important;
      transform: none !important;
      opacity: 1 !important;
    }
    .cg-print-root svg .opacity-0 { opacity: 1 !important; }

    /* Nothing that reads as one statement may be split across two sheets. */
    .cg-avoid-break { break-inside: avoid; page-break-inside: avoid; }
    .cg-page-break { break-before: page; page-break-before: always; }

    /* Controls belong to the workspace, never to the document. */
    .cg-print-hide { display: none !important; }
  `;
}

/**
 * Prints an element's rendered markup as a standalone document.
 *
 * @param el     the (usually off-screen) node holding the finished document
 * @param title  becomes the dialog's document name, and so the PDF filename
 */
export async function printElement(
  el: HTMLElement,
  { title, widthPx = PRINT_WIDTH_PX }: { title: string; widthPx?: number },
): Promise<void> {
  if (typeof document === "undefined") return;

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("tabindex", "-1");
  // 1px rather than 0: some engines skip layout entirely on a zero-sized frame.
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }

  doc.open();
  doc.write("<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>");
  doc.close();
  doc.title = title;

  // The workspace's own stylesheets, so the document prints in the product's
  // type, palette and spacing rather than in Times New Roman.
  const sheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
  await Promise.all(
    sheets.map(
      (node) =>
        new Promise<void>((resolve) => {
          const clone = node.cloneNode(true) as HTMLElement;
          if (clone.tagName === "LINK") {
            clone.addEventListener("load", () => resolve(), { once: true });
            clone.addEventListener("error", () => resolve(), { once: true });
            // A stylesheet that never answers must not hold the dialog shut.
            setTimeout(resolve, 2500);
            doc.head.appendChild(clone);
          } else {
            doc.head.appendChild(clone);
            resolve();
          }
        }),
    ),
  );

  const sheet = doc.createElement("style");
  sheet.textContent = printCss(widthPx);
  doc.head.appendChild(sheet);

  const root = doc.createElement("div");
  root.className = "cg-print-root";
  root.innerHTML = el.innerHTML;
  doc.body.appendChild(root);

  // Fonts before layout, then two frames so the clone has actually painted.
  try {
    await (doc as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* a font that fails to report is not a reason to refuse the document */
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const cleanup = () => setTimeout(() => frame.remove(), 400);
  win.addEventListener("afterprint", cleanup, { once: true });
  // Safari never fires afterprint from an iframe; this is the backstop.
  setTimeout(cleanup, 60_000);

  win.focus();
  win.print();
}

/** Filename-safe, human-readable date for document titles. */
export function printDate(d: Date = new Date()): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
