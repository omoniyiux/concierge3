
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
  { key: "website", label: "Website" },
  { key: "learning", label: "Learning" },
  { key: "review", label: "Review" },
  { key: "agent", label: "Agent" },
  { key: "routing", label: "Routing" },
  { key: "preview", label: "Preview" },
  { key: "install", label: "Install" },
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
