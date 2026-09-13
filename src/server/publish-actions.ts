"use server";

import {
  getPublishedForSite,
  isSubdomainAvailable,
  publish,
  publishedUrl,
  unpublish,
} from "@/lib/publishing";
import type { PageDocument, PublishedSiteFacts } from "@/lib/types";

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

   The site's own details travel with the request for the same reason as the
   document: a site created by the setup flow does not exist in the fixtures
   yet, so there is nothing on the server to look it up in. That also means
   nothing here proves the caller owns the site they are publishing. It cannot,
   until there are accounts — this is the first thing that must be revisited
   when authentication lands, not something to leave as it is.
   ========================================================================== */

export type PublishResult =
  | { ok: true; url: string; subdomain: string; publishedAt: string }
  | { ok: false; reason: string };

export async function publishSite(input: {
  siteId: string;
  subdomain: string;
  site: PublishedSiteFacts;
  document: PageDocument;
}): Promise<PublishResult> {
  if (input.site.name.trim().length === 0) {
    return { ok: false, reason: "The site needs a name before it can go live." };
  }

  try {
    const published = await publish({
      subdomain: input.subdomain,
      siteId: input.siteId,
      site: input.site,
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
