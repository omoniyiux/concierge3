import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageRenderer } from "@/components/pages-builder/PageRenderer";
import { pageStylesheet, responsiveCss } from "@/components/pages-builder/page-css";
import { getPublishedSite } from "@/lib/publishing";

/* ============================================================================
   THE PUBLISHED SITE
   ----------------------------------------------------------------------------
   Reached only through `proxy.ts`, which rewrites
   `atlasmoving.poweredbyconcierge.com/services` to `/site/atlasmoving/services`.
   The visitor's address bar never shows this path.

   The markup comes from the same `PageRenderer` the editor canvas uses, and the
   responsive rules from the same override table the editor writes. One source,
   two outputs — which is the only thing that keeps a preview honest.
   ========================================================================== */

/* Publishing is meant to take effect immediately, so nothing is cached ahead
   of the request. Revalidating on publish instead would be faster; it needs
   tagging that is not worth the machinery yet. */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ subdomain: string; slug?: string[] }> };

async function load({ params }: Params) {
  const { subdomain, slug } = await params;
  const published = await getPublishedSite(subdomain);
  if (published === null) return null;

  const page = published.snapshot.document.pages.find((p) => p.slug === (slug ?? []).join("/"));
  return page === undefined ? null : { published, page };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await load({ params });
  if (found === null) return { title: "Not found", robots: { index: false } };

  const { site } = found.published.snapshot;
  return {
    title: found.page.slug === "" ? site.name : `${found.page.title} · ${site.name}`,
    /* No template, no Concierge branding: this is the customer's tab. */
  };
}

export default async function PublishedPage({ params }: Params) {
  const found = await load({ params });
  if (found === null) notFound();

  const { document, site } = found.published.snapshot;
  const css = `${pageStylesheet(document.theme)}\n${responsiveCss(found.page)}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PageRenderer document={document} page={found.page} site={site} breakpoint="desktop" />
    </>
  );
}
