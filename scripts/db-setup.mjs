/* Idempotent schema setup.
   Run with: node --env-file=.env.local scripts/db-setup.mjs                  */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

/* Reshaping is opt-in: `node --env-file=.env.local scripts/db-setup.mjs --reset`.
   Without the flag this script only ever creates what is missing. */
if (process.argv.includes("--reset")) {
  await sql`drop table if exists published_sites`;
  console.log("dropped published_sites");
}

await sql`
  create table if not exists published_sites (
    subdomain     text primary key,
    site_id       text        not null,
    site_name     text        not null,
    snapshot      jsonb       not null,
    published_at  timestamptz not null default now()
  )
`;
await sql`create index if not exists published_sites_site_id_idx on published_sites (site_id)`;

const [{ count }] = await sql`select count(*)::int as count from published_sites`;
console.log(`published_sites ready — ${count} row(s)`);
