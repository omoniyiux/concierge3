/* ============================================================================
   THE SIMULATED CLOCK
   ----------------------------------------------------------------------------
   Everything in the workspace is written in relative time — "1h ago", "synced
   3h ago", "arrived after hours". Those phrases are only true against a
   particular moment, and the demo data was written against one: 7 September
   2026, nine in the morning.

   The simulation moves that moment forward. So the moment itself lives here,
   in one place, and `relativeTime` reads it rather than the wall clock —
   otherwise a conversation the simulation created ten seconds ago would be
   described as having happened eight months in the future.
   ========================================================================== */

/** Where the demo data's own "now" sits. */
export const SEED_NOW = new Date("2026-09-07T09:00:00Z").getTime();

let current = SEED_NOW;

/** The moment the whole workspace is currently being read from. */
export function simNow(): Date {
  return new Date(current);
}

export function simNowMs(): number {
  return current;
}

export function setSimNow(ms: number) {
  current = ms;
}

export function advanceSimNow(byMs: number) {
  current += byMs;
  return current;
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
