import type { ReactNode } from "react";

/* ============================================================================
   THE PUBLISHED SITE'S OWN DOCUMENT
   ----------------------------------------------------------------------------
   A second root layout, so a customer's website is not rendered inside the
   workspace's. The workspace layout carries Concierge's fonts, its metadata
   and `globals.css`; every one of those would be wrong on a moving company's
   homepage, and the title template would put our name in their browser tab.

   Deliberately bare. Everything a published page needs to look like itself
   arrives with the page, generated from the site's own theme.
   ========================================================================== */

export default function PublishedLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
