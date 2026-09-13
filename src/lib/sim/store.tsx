"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { MINUTE, setSimNow } from "@/lib/sim/clock";
import { inject, tick, type Injection } from "@/lib/sim/engine";
import {
  brainFrom,
  brainOf,
  documentOf,
  seedWorld,
  siteOf,
  type Scenario,
  type World,
} from "@/lib/sim/world";
import { LEDGER, METRICS } from "@/lib/demo-data";
import type {
  ActionDef,
  KnowledgeItem,
  KnowledgeStatus,
  OpeningHours,
  PageDocument,
  Conversation,
  DeliveryRecord,
  Destination,
  InboxItem,
  Integration,
  Lead,
  LedgerPeriod,
  Metric,
  Outcome,
  RoutingRule,
  Site,
  SiteBrain,
  UnansweredQuestion,
} from "@/lib/types";

/* ============================================================================
   THE SIMULATED BACKEND
   ----------------------------------------------------------------------------
   One store standing in for the API that does not exist yet. It does the
   three things a backend does that a constant cannot:

   1. It remembers. Approve a knowledge item, connect a tool, answer a gap —
      reload the page and it is still true.
   2. It moves. Time passes, visitors arrive, leads qualify, outcomes land,
      and the numbers on every surface change while you watch.
   3. It can be pushed. A hot lead at eleven at night, a webhook falling over,
      the script coming off the site — each on demand, so the parts of the
      product that only matter when something goes wrong can be seen going
      wrong.

   The world lives outside React and components subscribe to it, which is what
   a real backend looks like from a component's point of view — and means the
   clock can tick without a component owning it. Replacing this with fetch
   calls should be a swap rather than a rewrite.
   ========================================================================== */

const STORAGE_KEY = "concierge.sim.v1";
/** Simulated minutes advanced per real second at 1×. */
const MINUTES_PER_SECOND = 4;

type SimSnapshot = {
  world: World;
  running: boolean;
  speed: number;
  /** True once anything persisted has replaced the seed. */
  hydrated: boolean;
};

/* ---- The store itself ------------------------------------------------------ */

// The server and the first client paint must agree, so both start here.
const SERVER_SNAPSHOT: SimSnapshot = {
  world: seedWorld("established"),
  running: false,
  speed: 1,
  hydrated: false,
};

let snapshot: SimSnapshot = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: Partial<SimSnapshot>) {
  snapshot = { ...snapshot, ...next };
  if (next.world) setSimNow(next.world.now);
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SERVER_SNAPSHOT;

/* ---- Persistence ----------------------------------------------------------- */

let saveTimer: number | undefined;

function save() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ world: snapshot.world, running: snapshot.running, speed: snapshot.speed }),
      );
    } catch {
      /* over quota: the session still works, it just will not survive a reload */
    }
  }, 400);
}

function restore() {
  if (snapshot.hydrated) return;
  let saved: Partial<SimSnapshot> | null = null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw) as Partial<SimSnapshot>;
  } catch {
    /* a workspace that cannot read storage still has to open */
  }
  emit({
    world: saved?.world ?? snapshot.world,
    // Nothing on screen starts the clock any more, so it starts itself:
    // visitors arrive, leads qualify and the ledger fills while you use it.
    running: saved?.running ?? true,
    speed: saved?.speed ?? 1,
    hydrated: true,
  });
}

/* ---- Commands -------------------------------------------------------------- */

export function setRunning(next: boolean) {
  emit({ running: next });
  save();
}

export function setSpeed(next: number) {
  emit({ speed: next });
  save();
}

export function loadScenario(scenario: Scenario) {
  emit({ world: seedWorld(scenario), running: false });
  save();
}

export function resetWorld() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  emit({ world: seedWorld(snapshot.world.scenario), running: false, speed: 1 });
}

export function makeItHappen(what: Injection, siteId: string) {
  emit({ world: inject(snapshot.world, what, siteId).world });
  save();
}

/**
 * Writes the knowledge list and recounts the brain from it in one step. No
 * caller is trusted to keep the two in step by hand, because for a long time
 * none of them did.
 */
function withKnowledge(
  world: World,
  siteId: string,
  knowledge: KnowledgeItem[],
  /** Only a read of the site moves this. Approving something is not learning it. */
  learnedAt = brainOf(world, siteId).lastLearnedAt,
): World {
  return {
    ...world,
    knowledge,
    brains: { ...world.brains, [siteId]: brainFrom(siteId, knowledge, learnedAt) },
  };
}

/**
 * A site built by the setup flow, written into the world so the rest of the
 * workspace can see it.
 *
 * This is a module function rather than a hook because the setup flow lives
 * outside `SimProvider` — and it restores first, so creating a site never
 * writes on top of the seed and discards a world that was already stored.
 *
 * Without this the flow pushed to `/sites/<new id>/pages/...` and the site
 * layout 404ed, because the only sites that existed were the fixtures.
 */
export function createSite(
  site: {
    id: string;
    name: string;
    url: string;
    subdomain: string;
    openingHours: OpeningHours;
  },
  doc: PageDocument,
) {
  restore();
  const now = new Date(snapshot.world.now).toISOString();
  const created: Site = {
    id: site.id,
    orgId: "org_1",
    name: site.name,
    url: site.url,
    product: "pages",
    status: "draft",
    // A Pages site carries the Agent already; there is no script to paste.
    installState: "not-installed",
    accentColor: "#FF7A00",
    createdAt: now,
    updatedAt: now,
    launchProgress: 0,
    currency: "USD",
    openingHours: site.openingHours,
  };

  emit({
    world: {
      ...snapshot.world,
      sites: [...snapshot.world.sites.filter((s) => s.id !== site.id), created],
      documents: { ...snapshot.world.documents, [site.id]: doc },
      brains: { ...snapshot.world.brains, [site.id]: brainFrom(site.id, [], now) },
    },
  });
  save();
}

/** The editor saving its work back to the world, so a reload keeps it. */
export function saveDocument(siteId: string, doc: PageDocument) {
  if (!snapshot.hydrated) return;
  if (documentOf(snapshot.world, siteId) === doc) return;
  emit({
    world: { ...snapshot.world, documents: { ...snapshot.world.documents, [siteId]: doc } },
  });
  save();
}

/** Every write the workspace makes goes through here. */
export function updateWorld(fn: (world: World) => World) {
  emit({ world: fn(snapshot.world) });
  save();
}

/* ---- The clock ------------------------------------------------------------- */

let clock: number | undefined;

function startClock(siteId: string) {
  window.clearInterval(clock);
  clock = window.setInterval(() => {
    if (!snapshot.running) return;
    const elapsed = MINUTES_PER_SECOND * snapshot.speed * MINUTE;
    emit({ world: tick(snapshot.world, elapsed, siteId).world });
    save();
  }, 1000);
}

/* The site being looked at, so writes know what they belong to. */
const SiteIdContext = createContext<string>("site_northlane");
function SimSiteContext({ value, children }: { value: string; children: ReactNode }) {
  return <SiteIdContext.Provider value={value}>{children}</SiteIdContext.Provider>;
}

/**
 * Holds the clock and the restore. It renders nothing of its own: the store
 * is the external system, and this only starts and stops it.
 */
export function SimProvider({ siteId, children }: { siteId: string; children: ReactNode }) {
  useEffect(() => {
    restore();
    startClock(siteId);
    return () => window.clearInterval(clock);
  }, [siteId]);

  return <SimSiteContext value={siteId}>{children}</SimSiteContext>;
}

/* ============================================================================
   READS
   The same names the pages already used, so a surface switches from a
   constant to the live world by changing one import.
   ========================================================================== */

export function useSim() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const siteId = useContext(SiteIdContext);
  return {
    ...state,
    siteId,
    setRunning,
    setSpeed,
    loadScenario,
    reset: resetWorld,
    makeItHappen: (what: Injection) => makeItHappen(what, siteId),
  };
}

export function useWorld(): World {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).world;
}

export function useSite(siteId: string): Site {
  return siteOf(useWorld(), siteId);
}

export function useBrain(siteId: string): SiteBrain {
  return brainOf(useWorld(), siteId);
}

/** The stored page document for a Pages site, if it has one. */
export function useDocument(siteId: string): PageDocument | undefined {
  return documentOf(useWorld(), siteId);
}

/** True once the stored world is back. Nothing may 404 on a site before this. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).hydrated;
}

/** Everything Concierge knows about this site, as one live list. */
export function useKnowledge(siteId: string): KnowledgeItem[] {
  const world = useWorld();
  return useMemo(() => world.knowledge.filter((k) => k.siteId === siteId), [world.knowledge, siteId]);
}

export function useConversations(siteId: string): Conversation[] {
  const world = useWorld();
  return useMemo(
    () =>
      world.conversations
        .filter((c) => c.siteId === siteId)
        .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    [world.conversations, siteId],
  );
}

export function useLeads(siteId: string): Lead[] {
  const world = useWorld();
  return useMemo(
    () =>
      world.leads
        .filter((l) => l.siteId === siteId)
        .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)),
    [world.leads, siteId],
  );
}

export function useOutcomes(siteId: string): Outcome[] {
  const world = useWorld();
  return useMemo(() => world.outcomes.filter((o) => o.siteId === siteId), [world.outcomes, siteId]);
}

export function useDestinations(siteId: string): Destination[] {
  const world = useWorld();
  return useMemo(() => world.destinations.filter((d) => d.siteId === siteId), [world.destinations, siteId]);
}

export function useRoutingInbox(siteId: string): InboxItem[] {
  const world = useWorld();
  return useMemo(() => world.inbox.filter((i) => i.siteId === siteId), [world.inbox, siteId]);
}

export function useRoutingRules(siteId: string): RoutingRule[] {
  const world = useWorld();
  return useMemo(() => world.rules.filter((r) => r.siteId === siteId), [world.rules, siteId]);
}

export function useDeliveries(): DeliveryRecord[] {
  return useWorld().deliveries;
}

export function useIntegrations(): Integration[] {
  return useWorld().integrations;
}

export function useActions(siteId: string): ActionDef[] {
  const world = useWorld();
  return useMemo(() => world.actions.filter((a) => a.siteId === siteId), [world.actions, siteId]);
}

export function useGaps(): UnansweredQuestion[] {
  const world = useWorld();
  return useMemo(
    () => world.gaps.filter((g) => g.status === "open").sort((a, b) => b.askCount - a.askCount),
    [world.gaps],
  );
}

/**
 * Metrics counted off the world rather than read from a constant, so the
 * headline figures move with everything else.
 */
export function useMetrics(siteId: string): Metric[] {
  const world = useWorld();
  return useMemo(() => {
    const conversations = world.conversations.filter((c) => c.siteId === siteId);
    const leads = world.leads.filter((l) => l.siteId === siteId);
    const outcomes = world.outcomes.filter((o) => o.siteId === siteId);
    const handoffs = conversations.filter((c) => c.status === "handed-off").length;
    const converted = conversations.filter((c) => c.status === "converted").length;

    const counted: Record<string, number> = {
      // Visitors are not modelled one by one; a conversation is roughly one in
      // seven of them, the ratio the seed data was built on.
      visitors: Math.round(conversations.length * 7.4),
      conversations: conversations.length,
      leads: leads.length,
      actions: outcomes.filter((o) => o.actionId).length,
      handoffs,
      conversion: conversations.length ? Number(((converted / conversations.length) * 100).toFixed(1)) : 0,
    };

    return METRICS.map((m) => {
      const value = counted[m.key] ?? m.value;
      // The series keeps the seed's shape but ends at the live figure, so the
      // sparkline and the number beside it never disagree.
      const scale = m.value > 0 ? value / m.value : 0;
      return {
        ...m,
        value,
        series: m.series.map((p) => ({ ...p, value: Math.max(0, Math.round(p.value * scale)) })),
      };
    });
  }, [world.conversations, world.leads, world.outcomes, siteId]);
}

export function useLedger(siteId: string): LedgerPeriod {
  const world = useWorld();
  return useMemo(() => {
    const conversations = world.conversations.filter((c) => c.siteId === siteId);
    const outcomes = world.outcomes.filter((o) => o.siteId === siteId);
    const confirmed = outcomes.filter((o) => o.basis === "confirmed").reduce((n, o) => n + o.value, 0);
    const estimated = outcomes.filter((o) => o.basis === "estimated").reduce((n, o) => n + o.value, 0);
    const resolved = conversations.filter((c) => c.status !== "handed-off").length;

    const hours = new Array(24).fill(0) as number[];
    for (const c of conversations) hours[new Date(c.startedAt).getHours()] += 1;

    return {
      ...LEDGER,
      siteId,
      conversations: conversations.length,
      afterHoursConversations: conversations.filter((c) => c.afterHours).length,
      confirmedValue: confirmed,
      estimatedValue: estimated,
      hourHistogram: hours,
      resolvedWithoutHuman: resolved,
      hoursSaved: Math.round((resolved * 3) / 60),
    };
  }, [world.conversations, world.outcomes, siteId]);
}

/* ============================================================================
   WRITES
   Every one of these is something the product claims it can do. They change
   the world, so the change survives a reload and shows up everywhere at once.
   ========================================================================== */

export function useSimActions() {
  const siteId = useContext(SiteIdContext);

  return useMemo(
    () => ({
      /** A gap answered: it leaves the list and the brain grows. */
      answerGap: (gapId: string) =>
        updateWorld((w) => {
          const brain = brainOf(w, siteId);
          return {
            ...w,
            gaps: w.gaps.map((g) => (g.id === gapId ? { ...g, status: "resolved" as const } : g)),
            brains: {
              ...w.brains,
              [siteId]: {
                ...brain,
                itemCount: brain.itemCount + 1,
                approvedCount: brain.approvedCount + 1,
                coverage: Math.min(100, brain.coverage + 2),
              },
            },
          };
        }),

      dismissGap: (gapId: string) =>
        updateWorld((w) => ({
          ...w,
          gaps: w.gaps.map((g) => (g.id === gapId ? { ...g, status: "resolved" as const } : g)),
        })),

      /** An estimate settled by the owner, in either direction. */
      settleOutcome: (outcomeId: string, happened: boolean) =>
        updateWorld((w) => ({
          ...w,
          outcomes: w.outcomes.map((o) =>
            o.id === outcomeId
              ? happened
                ? { ...o, basis: "confirmed" as const, valueNote: "Confirmed by you." }
                : {
                    ...o,
                    basis: "none" as const,
                    value: 0,
                    valueNote: "You said this one did not happen.",
                  }
              : o,
          ),
        })),

      setIntegration: (id: string, patch: Partial<Integration>) =>
        updateWorld((w) => ({
          ...w,
          integrations: w.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),

      addIntegration: (integration: Integration) =>
        updateWorld((w) => ({ ...w, integrations: [integration, ...w.integrations] })),

      setAction: (id: string, patch: Partial<ActionDef>) =>
        updateWorld((w) => ({
          ...w,
          actions: w.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      addAction: (action: ActionDef) =>
        updateWorld((w) => ({ ...w, actions: [action, ...w.actions] })),

      addDestination: (destination: Destination) =>
        updateWorld((w) => ({ ...w, destinations: [...w.destinations, destination] })),

      setRules: (next: RoutingRule[]) => updateWorld((w) => ({ ...w, rules: next })),

      /** A test that came back, in either direction. This clears — or fails — the
          launch step that asks for somewhere to send people. */
      testDestination: (id: string, ok: boolean) =>
        updateWorld((w) => ({
          ...w,
          destinations: w.destinations.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: ok ? ("connected" as const) : ("failing" as const),
                  lastTestedAt: new Date(w.now).toISOString(),
                }
              : d,
          ),
        })),

      setDestination: (id: string, patch: Partial<Destination>) =>
        updateWorld((w) => ({
          ...w,
          destinations: w.destinations.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        })),

      /** Taking a thread, replying on it, or putting it down. */
      updateConversation: (id: string, patch: Partial<Conversation>) =>
        updateWorld((w) => ({
          ...w,
          conversations: w.conversations.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      markNotificationsRead: (ids: string[]) =>
        updateWorld((w) => ({
          ...w,
          readNotifications: [...new Set([...w.readNotifications, ...ids])],
        })),

      /**
       * Approving knowledge moves the brain on, which the launch checklist
       * reads. Everything below writes the knowledge list and then recounts
       * the brain from it, so the gauge, the counters and the checklist can
       * never tell three different stories about the same click.
       */
      setKnowledgeStatus: (ids: string | string[], status: KnowledgeStatus) => {
        const set = new Set(Array.isArray(ids) ? ids : [ids]);
        updateWorld((w) =>
          withKnowledge(
            w,
            siteId,
            w.knowledge.map((k) =>
              set.has(k.id) ? { ...k, status, updatedAt: new Date(w.now).toISOString() } : k,
            ),
          ),
        );
      },

      /** An owner's own words. Editing an answer is approving it. */
      setKnowledgeBody: (id: string, body: string) =>
        updateWorld((w) =>
          withKnowledge(
            w,
            siteId,
            w.knowledge.map((k) =>
              k.id === id
                ? { ...k, body, status: "approved" as const, updatedAt: new Date(w.now).toISOString() }
                : k,
            ),
          ),
        ),

      addKnowledge: (item: KnowledgeItem) =>
        updateWorld((w) => withKnowledge(w, siteId, [item, ...w.knowledge])),

      /**
       * The read itself. Until this has run there is nothing to approve, which
       * is why the checklist step in front of it could never be cleared.
       */
      learnSite: (items: KnowledgeItem[]) =>
        updateWorld((w) => {
          const mine = new Set(items.map((i) => i.id));
          const next = [...items, ...w.knowledge.filter((k) => !mine.has(k.id))];
          return {
            ...withKnowledge(w, siteId, next, new Date(w.now).toISOString()),
            sites: w.sites.map((s) =>
              s.id === siteId && s.status === "draft" ? { ...s, status: "review" as const } : s,
            ),
          };
        }),

      /** The owner has settled the Agent's job, tone and limits. */
      configureAgent: () =>
        updateWorld((w) => ({
          ...w,
          sites: w.sites.map((s) =>
            s.id === siteId ? { ...s, agentConfiguredAt: new Date(w.now).toISOString() } : s,
          ),
        })),

      /** Finishing the install, from the install hub or the checklist. */
      setInstalled: (detected: boolean) =>
        updateWorld((w) => ({
          ...w,
          sites: w.sites.map((s) =>
            s.id === siteId
              ? {
                  ...s,
                  installState: detected ? ("detected" as const) : ("not-installed" as const),
                  status: detected ? ("live" as const) : s.status,
                  launchProgress: detected ? 100 : s.launchProgress,
                }
              : s,
          ),
        })),
    }),
    [siteId],
  );
}
