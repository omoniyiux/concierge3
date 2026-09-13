import { neon } from "@neondatabase/serverless";

/* ============================================================================
   THE DATABASE HANDLE
   ----------------------------------------------------------------------------
   Created on first use, never at module scope. Next evaluates top-level module
   code during the build, and `neon()` throws when DATABASE_URL is absent — so
   a module-level client turns a missing env var into a failed build rather
   than a failed request.

   A plain lazy `let` rather than a Proxy wrapper: a Proxy intercepts the
   property checks that libraries do on a client object and breaks them in ways
   that surface as a hang with no error.
   ========================================================================== */

type Sql = ReturnType<typeof neon>;

let client: Sql | null = null;

export function getSql(): Sql {
  if (client === null) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set. Run `vercel env pull` to fetch it.");
    client = neon(url);
  }
  return client;
}

/** True when the app has a database to talk to at all. */
export const hasDatabase = (): boolean => Boolean(process.env.DATABASE_URL);
