import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ============================================================================
   SUBDOMAIN ROUTING
   ----------------------------------------------------------------------------
   `proxy.ts`, not `middleware.ts` — the convention was renamed in Next 16 and
   the old name is deprecated.

   A request to `atlasmoving.poweredbyconcierge.com/services` is rewritten to
   `/_sites/atlasmoving/services`, where the published document is looked up
   and rendered. The visitor's URL never changes.

   This file does the routing and nothing else. Proxy runs before rendering and
   is deployed to the CDN in optimised cases, so it must not reach for shared
   modules, globals or a database — hence a hardcoded reserved list here rather
   than an import, and the document lookup happening in the route instead.
   ========================================================================== */

const PAGES_DOMAIN = process.env.NEXT_PUBLIC_PAGES_DOMAIN ?? "poweredbyconcierge.com";

/**
 * Labels that address the platform rather than a customer site. Kept in step
 * with the reserved list in `lib/publishing.ts` by the test that compares
 * them — duplicated here only because proxy cannot import it.
 */
const PLATFORM_LABELS = new Set(["www", "app", "api", "admin", "cdn", "assets", "static"]);

/** The site label in this hostname, or null when it addresses the app itself. */
function siteLabel(hostname: string): string | null {
  const host = hostname.toLowerCase().split(":")[0];

  /* Local development: `atlasmoving.localhost` resolves to 127.0.0.1 in every
     current browser, so the real routing can be exercised without DNS. */
  if (host.endsWith(".localhost")) {
    const label = host.slice(0, -".localhost".length);
    return label.length > 0 && PLATFORM_LABELS.has(label) === false ? label : null;
  }

  const suffix = `.${PAGES_DOMAIN}`;
  if (host.endsWith(suffix) === false) return null;

  const label = host.slice(0, -suffix.length);
  /* Only a single label. `a.b.domain` is not a published site. */
  if (label.length === 0 || label.includes(".")) return null;
  return PLATFORM_LABELS.has(label) ? null : label;
}

export function proxy(request: NextRequest) {
  const label = siteLabel(request.headers.get("host") ?? request.nextUrl.hostname);
  if (label === null) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/_sites/${label}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /* Everything except Next's own assets and the favicon: a published site has
     its own pages at arbitrary paths, so the matcher cannot enumerate them. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)"],
};
