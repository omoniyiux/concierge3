import {
  ACTIONS,
  BRAIN,
  CONVERSATIONS,
  DESTINATIONS,
  INTEGRATIONS,
  LEADS,
  OUTCOMES,
  SITES,
  UNANSWERED,
} from "@/lib/demo-data";
import { SEED_NOW } from "@/lib/sim/clock";
import type {
  ActionDef,
  Conversation,
  Destination,
  Integration,
  KnowledgeItem,
  Lead,
  Outcome,
  Site,
  SiteBrain,
  UnansweredQuestion,
} from "@/lib/types";

/* ============================================================================
   THE WORLD
   ----------------------------------------------------------------------------
   One object holding everything the workspace can change or be changed by,
   so the product can be used end to end before a line of backend exists.

   It is deliberately the same shapes the real thing will use — conversations,
   leads, outcomes, destinations — rather than a convenient demo-only model.
   When the API arrives, this is what it has to return.
   ========================================================================== */

export type World = {
  /** Milliseconds. The simulated present. */
  now: number;
  /** Which story is being told: a business on day one, or one months in. */
  scenario: Scenario;
  sites: Site[];
  brains: Record<string, SiteBrain>;
  knowledge: KnowledgeItem[];
  conversations: Conversation[];
  leads: Lead[];
  outcomes: Outcome[];
  destinations: Destination[];
  integrations: Integration[];
  actions: ActionDef[];
  gaps: UnansweredQuestion[];
  /** Everything that has happened since the world started, newest first. */
  feed: WorldEvent[];
  /** Notifications the person has already seen. */
  readNotifications: string[];
};

export type WorldEvent = {
  id: string;
  at: number;
  siteId: string;
  kind:
    | "conversation-started"
    | "message"
    | "lead-qualified"
    | "outcome"
    | "handoff"
    | "gap"
    | "delivery"
    | "delivery-failed"
    | "install-detected"
    | "install-lost";
  title: string;
  detail?: string;
  conversationId?: string;
};

export type Scenario = "day-one" | "first-week" | "established";

export const SCENARIOS: { key: Scenario; label: string; blurb: string }[] = [
  {
    key: "day-one",
    label: "Day one",
    blurb: "Just signed up. Nothing read, nothing installed, nobody has visited.",
  },
  {
    key: "first-week",
    label: "First week",
    blurb: "Live on the site, a handful of conversations, the first lead in.",
  },
  {
    key: "established",
    label: "Three months in",
    blurb: "A full history, a ledger with money in it, and a webhook that has fallen over.",
  },
];

/* ---- Seeding --------------------------------------------------------------- */

const PRIMARY = "site_northlane";

function emptyBrain(siteId: string): SiteBrain {
  return {
    siteId,
    ready: false,
    itemCount: 0,
    approvedCount: 0,
    needsReviewCount: 0,
    missingCount: 0,
    coverage: 0,
    lastLearnedAt: new Date(SEED_NOW).toISOString(),
  };
}

/**
 * Builds the starting world for a scenario. Every scenario uses the same
 * business so the story is continuous — only how much has happened to it
 * changes.
 */
export function seedWorld(scenario: Scenario = "established"): World {
  const base: World = {
    now: SEED_NOW,
    scenario,
    sites: SITES.map((s) => ({ ...s })),
    brains: { [BRAIN.siteId]: { ...BRAIN } },
    knowledge: [],
    conversations: CONVERSATIONS.map((c) => ({ ...c })),
    leads: LEADS.map((l) => ({ ...l })),
    outcomes: OUTCOMES.map((o) => ({ ...o })),
    destinations: DESTINATIONS.map((d) => ({ ...d })),
    integrations: INTEGRATIONS.map((i) => ({ ...i })),
    actions: ACTIONS.map((a) => ({ ...a })),
    gaps: UNANSWERED.map((u) => ({ ...u })),
    feed: [],
    readNotifications: [],
  };

  if (scenario === "established") return base;

  const primary = base.sites.find((s) => s.id === PRIMARY)!;

  if (scenario === "day-one") {
    // Nothing has happened yet, and the script is not on the site.
    primary.installState = "not-installed";
    primary.status = "learning";
    primary.launchProgress = 15;
    return {
      ...base,
      brains: { [PRIMARY]: emptyBrain(PRIMARY) },
      conversations: [],
      leads: [],
      outcomes: [],
      gaps: [],
      destinations: base.destinations.map((d) => ({ ...d, status: "untested" as const })),
      integrations: base.integrations.map((i) =>
        i.status === "connected" || i.status === "error"
          ? { ...i, status: "available" as const, accountLabel: undefined, lastSyncAt: undefined }
          : i,
      ),
      actions: base.actions.map((a) => ({ ...a, completions30d: 0 })),
    };
  }

  // First week: live, with the earliest few conversations only.
  primary.installState = "detected";
  primary.status = "live";
  primary.launchProgress = 100;
  const keep = base.conversations.slice(0, 3).map((c) => c.id);
  return {
    ...base,
    brains: {
      [PRIMARY]: { ...BRAIN, ready: true, itemCount: 24, approvedCount: 19, needsReviewCount: 4, coverage: 62 },
    },
    conversations: base.conversations.filter((c) => keep.includes(c.id)),
    leads: base.leads.filter((l) => keep.includes(l.conversationId)),
    outcomes: base.outcomes.filter((o) => keep.includes(o.conversationId)),
    gaps: base.gaps.slice(0, 2),
    destinations: base.destinations.map((d) => (d.status === "failing" ? { ...d, status: "connected" as const } : d)),
    actions: base.actions.map((a) => ({ ...a, completions30d: Math.round(a.completions30d / 8) })),
  };
}

/* ---- Derived ---------------------------------------------------------------- */

export function siteOf(world: World, siteId: string): Site {
  return world.sites.find((s) => s.id === siteId) ?? world.sites[0];
}

export function brainOf(world: World, siteId: string): SiteBrain {
  return world.brains[siteId] ?? emptyBrain(siteId);
}

/** Whether the business is open at a given moment, by its own hours. */
export function isOpen(site: Site, at: Date): boolean {
  const day = site.openingHours.days[at.getDay()];
  if (!day) return false;
  const minutes = at.getHours() * 60 + at.getMinutes();
  return minutes >= day.opens && minutes < day.closes;
}
