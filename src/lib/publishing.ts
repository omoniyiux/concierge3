import "server-only";

import { getSql } from "./db";
import { PAGE_DOCUMENT_VERSION } from "./pages-builder";
import { checkSubdomainShape, type SubdomainProblem } from "./publishing.client";
import type { ID, PageDocument, PublishedSiteFacts } from "./types";

export { PAGES_DOMAIN, checkSubdomainShape, publishedUrl, suggestSubdomain } from "./publishing.client";
export type { SubdomainProblem } from "./publishing.client";

/* ============================================================================
   PUBLISHING
   ----------------------------------------------------------------------------
   A published site is one row: the subdomain that addresses it and a frozen
   copy of the document that produced it. Publishing copies rather than
   references, so an owner can keep editing a draft without the live site
   changing under their visitors — which is the whole reason the two are
   separate ideas rather than one `published` flag.

   `server-only` because this module reads DATABASE_URL. Importing it from a
   client component should fail the build, loudly, rather than leak a
   connection string into a bundle.
   ========================================================================== */

/* ---- Reads ---------------------------------------------------------------- */

/**
 * A frozen copy of everything needed to render the site, so a published page
 * never reaches back into workspace state. Whatever a visitor sees was true at
 * the moment Publish was pressed and stays true until it is pressed again.
 */
export interface SiteSnapshot {
  document: PageDocument;
  site: PublishedSiteFacts;
}

export interface PublishedSite {
  subdomain: string;
  siteId: ID;
  siteName: string;
  snapshot: SiteSnapshot;
  publishedAt: string;
}

type Row = {
  subdomain: string;
  site_id: string;
  site_name: string;
  snapshot: SiteSnapshot;
  published_at: string | Date;
};

const toSite = (row: Row): PublishedSite => ({
  subdomain: row.subdomain,
  siteId: row.site_id,
  siteName: row.site_name,
  snapshot: row.snapshot,
  publishedAt: new Date(row.published_at).toISOString(),
});

export async function getPublishedSite(subdomain: string): Promise<PublishedSite | null> {
  const rows = (await getSql()`
    select subdomain, site_id, site_name, snapshot, published_at
    from published_sites
    where subdomain = ${subdomain.toLowerCase()}
    limit 1
  `) as Row[];
  return rows.length === 0 ? null : toSite(rows[0]);
}

/** What this site is currently published at, if anything. */
export async function getPublishedForSite(siteId: ID): Promise<PublishedSite | null> {
  const rows = (await getSql()`
    select subdomain, site_id, site_name, snapshot, published_at
    from published_sites
    where site_id = ${siteId}
    order by published_at desc
    limit 1
  `) as Row[];
  return rows.length === 0 ? null : toSite(rows[0]);
}

/**
 * Free means: a legal name, not reserved, and either unclaimed or already this
 * site's own. The last clause matters — republishing to your own address must
 * not report a clash with yourself.
 */
export async function isSubdomainAvailable(subdomain: string, siteId: ID): Promise<SubdomainProblem> {
  const shape = checkSubdomainShape(subdomain);
  if (shape.ok === false) return shape;

  const rows = (await getSql()`
    select site_id from published_sites where subdomain = ${subdomain.toLowerCase()} limit 1
  `) as { site_id: string }[];

  if (rows.length > 0 && rows[0].site_id !== siteId) {
    return { ok: false, reason: "Somebody already has that address." };
  }
  return { ok: true };
}

/* ---- Writes --------------------------------------------------------------- */

/**
 * Publish, or republish. A site holds one address at a time, so moving to a
 * new one releases the old in the same transaction-shaped pair of statements —
 * otherwise an owner who renamed twice would silently squat three addresses.
 */
export async function publish(args: {
  subdomain: string;
  siteId: ID;
  site: PublishedSiteFacts;
  document: PageDocument;
}): Promise<PublishedSite> {
  const subdomain = args.subdomain.trim().toLowerCase();

  const available = await isSubdomainAvailable(subdomain, args.siteId);
  if (available.ok === false) throw new Error(available.reason);

  const sql = getSql();
  await sql`delete from published_sites where site_id = ${args.siteId} and subdomain <> ${subdomain}`;

  /* Only published pages reach the snapshot. A draft is work in progress; it
     should not be reachable by URL or listed in the site's own navigation
     just because it happens to live in the same document. */
  const pages = args.document.pages.filter((page) => page.published);
  if (pages.length === 0) {
    throw new Error("Nothing to publish — every page is still a draft.");
  }

  const snapshot: SiteSnapshot = {
    document: { ...args.document, version: PAGE_DOCUMENT_VERSION, pages },
    site: args.site,
  };

  const rows = (await sql`
    insert into published_sites (subdomain, site_id, site_name, snapshot, published_at)
    values (${subdomain}, ${args.siteId}, ${args.site.name}, ${JSON.stringify(snapshot)}::jsonb, now())
    on conflict (subdomain) do update
      set site_id = excluded.site_id,
          site_name = excluded.site_name,
          snapshot = excluded.snapshot,
          published_at = now()
    returning subdomain, site_id, site_name, snapshot, published_at
  `) as Row[];

  return toSite(rows[0]);
}

export async function unpublish(siteId: ID): Promise<void> {
  await getSql()`delete from published_sites where site_id = ${siteId}`;
}
