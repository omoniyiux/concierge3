import { renderToStaticMarkup } from "react-dom/server";
import { PageRenderer } from "@/components/pages-builder/PageRenderer";
import { pageStylesheet, responsiveCss } from "@/components/pages-builder/page-css";
import { getPublishedSite } from "@/lib/publishing";
import type { ConciergePage } from "@/lib/types";

/* ============================================================================
   THE PUBLISHED SITE
   ----------------------------------------------------------------------------
   A route handler rather than a page, because a customer's website needs its
   own document from the doctype down. The app's root layout carries Concierge
   fonts, Concierge metadata and globals.css; rendering a customer's site
   inside it would dress their business in the workspace's clothes and put our
   title template on their tab.

   The markup comes from the same `PageRenderer` the editor canvas uses. One
   component, two outputs — which is the only way a preview stays honest.
   ========================================================================== */

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const html = (body: string, status: number) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      /* Publishing is meant to take effect immediately, and correctness beats
         a few milliseconds here. Tag-based revalidation on publish would let
         this be cached properly; it is not worth the machinery yet. */
      "cache-control": "no-store",
    },
  });

/** A plain, unbranded page. It is not our place to put Concierge on it. */
function notFound(message: string, status: number) {
  return html(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<meta name="robots" content="noindex">` +
      `<title>Not found</title><style>` +
      `body{margin:0;min-height:100vh;display:grid;place-items:center;` +
      `font:16px/1.6 system-ui,sans-serif;color:#16181c;background:#fff;padding:24px;text-align:center}` +
      `p{color:#5c6169}</style></head><body><div><h1>Not found</h1><p>${escape(message)}</p></div></body></html>`,
    status,
  );
}

const findPageBySlug = (pages: ConciergePage[], slug: string) =>
  pages.find((page) => page.slug === slug);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ subdomain: string; slug?: string[] }> },
) {
  const { subdomain, slug } = await params;

  const published = await getPublishedSite(subdomain);
  if (published === null) {
    return notFound("There is no site at this address yet.", 404);
  }

  const { document, site } = published.snapshot;
  const path = (slug ?? []).join("/");
  const page = findPageBySlug(document.pages, path);

  if (page === undefined) {
    return notFound(`${site.name} has no page at /${path}.`, 404);
  }

  const body = renderToStaticMarkup(
    <PageRenderer document={document} page={page} site={site} breakpoint="desktop" />,
  );

  const title = page.slug === "" ? site.name : `${page.title} · ${site.name}`;

  return html(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width, initial-scale=1">` +
      `<title>${escape(title)}</title>` +
      `<style>${pageStylesheet(document.theme)}\n${responsiveCss(page)}</style>` +
      `</head><body>${body}</body></html>`,
    200,
  );
}
