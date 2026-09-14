
/* ============================================================================
   THE GOLDEN PATH
   Add website → Concierge learns → review Site Brain → configure Agent →
   connect routing → preview → install.

   Each step is a URL. It used to be one `useState` on a single `/onboarding`
   page, which meant Back left the flow entirely, a refresh started over from
   step one, and there was no way to resume or to send someone the step you
   were stuck on — in the one place in the product least able to absorb that.
   ========================================================================== */

export const STEPS = [
  { key: "website", label: "Website", blurb: "Tell Concierge which site to read." },
  { key: "learning", label: "Learning", blurb: "It reads your public pages." },
  { key: "review", label: "Review", blurb: "You approve what it may say." },
  { key: "agent", label: "Agent", blurb: "Give it a role and an opening line." },
  { key: "routing", label: "Routing", blurb: "Say where a real lead should land." },
  { key: "preview", label: "Preview", blurb: "Try it before a visitor does." },
  { key: "install", label: "Install", blurb: "One line on your site, and it is live." },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export const STEP_KEYS = STEPS.map((s) => s.key) as readonly StepKey[];

export function isStepKey(value: string): value is StepKey {
  return (STEP_KEYS as readonly string[]).includes(value);
}

export const stepHref = (key: StepKey) => `/onboarding/${key}`;
export const stepIndex = (key: StepKey) => STEPS.findIndex((s) => s.key === key);

/** The step before/after this one, or null at either end of the flow. */
export const prevStep = (key: StepKey): StepKey | null => STEPS[stepIndex(key) - 1]?.key ?? null;
export const nextStep = (key: StepKey): StepKey | null => STEPS[stepIndex(key) + 1]?.key ?? null;

/* ---- Turning a typed address into a site ---------------------------------- */

/** The bare hostname an owner typed, or null if it is not one. */
export function tidyUrl(input: string): string | null {
  const host = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : null;
}

/**
 * A readable name from a hostname: "atlas-moving.com" becomes "Atlas Moving".
 * A guess, and the owner renames it in Settings — but it beats showing a bare
 * domain in the switcher next to "Northlane Dental".
 */
export function siteNameFrom(host: string): string {
  return (
    host
      .split(".")[0]
      .split(/[-_]/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ") || host
  );
}

/** Stable across re-runs, so connecting the same address twice is idempotent. */
export function siteIdFor(host: string): string {
  return `site_${host.replace(/[^a-z0-9]/g, "_")}`;
}
