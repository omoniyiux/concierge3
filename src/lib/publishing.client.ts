/* ============================================================================
   SUBDOMAIN RULES
   ----------------------------------------------------------------------------
   The pure half of publishing: what a valid address looks like, and where
   published sites live. Split out from `publishing.ts` because that module is
   `server-only` — it holds a database handle — while the publish dialog and
   the setup flow both need to validate a name as the owner types it.

   One source, so a name the browser accepts can never be one the server
   rejects for a different reason.
   ========================================================================== */

/** Where published sites live. Every site is a label under this. */
export const PAGES_DOMAIN = process.env.NEXT_PUBLIC_PAGES_DOMAIN ?? "poweredbyconcierge.com";

export const publishedUrl = (subdomain: string): string => `https://${subdomain}.${PAGES_DOMAIN}`;

/* ---- Subdomain rules ------------------------------------------------------ */

/**
 * Names the platform needs for itself, or that would be actively misleading in
 * a customer's hands. Checked before the database, because a name being free
 * is not the same as a name being available.
 */
const RESERVED = new Set([
  "www", "app", "api", "admin", "administrator", "cdn", "assets", "static", "mail", "email",
  "smtp", "imap", "ftp", "ns", "ns1", "ns2", "dns", "blog", "help", "docs", "support", "status",
  "dashboard", "billing", "account", "accounts", "login", "signin", "signup", "auth", "sso",
  "concierge", "poweredbyconcierge", "internal", "staging", "test", "dev", "preview", "demo",
  "security", "abuse", "postmaster", "webmaster", "root", "system",
]);

export const MIN_SUBDOMAIN = 3;
export const MAX_SUBDOMAIN = 63;

/** Lowercase letters, digits and inner hyphens. The DNS label rules. */
const SHAPE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type SubdomainProblem =
  | { ok: true }
  | { ok: false; reason: string };

export function checkSubdomainShape(raw: string): SubdomainProblem {
  const value = raw.trim().toLowerCase();

  if (value.length === 0) return { ok: false, reason: "Pick a name for the address." };
  if (value.length < MIN_SUBDOMAIN)
    return { ok: false, reason: `At least ${MIN_SUBDOMAIN} characters.` };
  if (value.length > MAX_SUBDOMAIN)
    return { ok: false, reason: `At most ${MAX_SUBDOMAIN} characters.` };
  if (value.startsWith("-") || value.endsWith("-"))
    return { ok: false, reason: "Cannot start or end with a hyphen." };
  if (value.includes("--"))
    return { ok: false, reason: "No double hyphens." };
  if (SHAPE.test(value) === false)
    return { ok: false, reason: "Letters, numbers and hyphens only." };
  if (RESERVED.has(value))
    return { ok: false, reason: "That name is reserved." };

  return { ok: true };
}

/** Turn a business name into a plausible first suggestion. */
export const suggestSubdomain = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_SUBDOMAIN)
    .replace(/-+$/, "");
