"use server";

import { getSite } from "@/lib/demo-data";
import {
  getPublishedForSite,
  isSubdomainAvailable,
  publish,
  publishedUrl,
  unpublish,
} from "@/lib/publishing";
import type { PageDocument } from "@/lib/types";

/* ============================================================================
   PUBLISH
   ----------------------------------------------------------------------------
   The editor holds the draft in the browser, so the document travels with the
   request. That is the honest shape of things until drafts are persisted too:
   the server is the authority on what is *published*, not on what is being
   edited.

   Every action returns a result rather than throwing across the boundary, so
   the editor can put the reason in front of the owner instead of showing them
   a stack trace.
   ========================================================================== */

export type PublishResult =
  | { ok: true; url: string; subdomain: string; publishedAt: string }
  | { ok: false; reason: string };

export async function publishSite(input: {
  siteId: string;
  subdomain: string;
  document: PageDocument;
}): Promise<PublishResult> {
  const site = getSite(input.siteId);

  if (site.product !== "pages") {
    return { ok: false, reason: "Only a Concierge Pages site can be published here." };
  }

  try {
    const published = await publish({
      subdomain: input.subdomain,
      siteId: site.id,
      site: { name: site.name, url: site.url, openingHours: site.openingHours },
      document: input.document,
    });
    return {
      ok: true,
      url: publishedUrl(published.subdomain),
      subdomain: published.subdomain,
      publishedAt: published.publishedAt,
    };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : "Publishing failed." };
  }
}

export async function checkSubdomain(input: {
  siteId: string;
  subdomain: string;
}): Promise<{ ok: boolean; reason?: string }> {
  const result = await isSubdomainAvailable(input.subdomain, input.siteId);
  return result.ok ? { ok: true } : { ok: false, reason: result.reason };
}

export async function currentlyPublished(siteId: string) {
  const published = await getPublishedForSite(siteId);
  return published === null
    ? null
    : {
        subdomain: published.subdomain,
        url: publishedUrl(published.subdomain),
        publishedAt: published.publishedAt,
      };
}

export async function takeDown(siteId: string): Promise<{ ok: true }> {
  await unpublish(siteId);
  return { ok: true };
}
