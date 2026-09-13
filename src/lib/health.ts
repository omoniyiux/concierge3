import type {
  Conversation,
  Destination,
  KnowledgeItem,
  Site,
  SiteBrain,
  UnansweredQuestion,
} from "@/lib/types";

/* ============================================================================
   LAUNCH AND HEALTH
   ----------------------------------------------------------------------------
   Two questions the workspace could not previously answer:

   1. "I have just signed up — am I nearly there, and what is left?"
   2. "It has been live for months — is it still working?"

   Both are the same shape: a small set of named conditions, each either met
   or not, each with the one link that fixes it. A site walks up the first
   list once and is watched by the second forever.

   Nothing here invents a status. Every signal reads a fact already in the
   model — the install state, a destination's last delivery, when the brain
   last learned — so an owner can always chase a warning back to its cause.
   ========================================================================== */

/** The demo data is written against a fixed moment; staleness is judged from it. */
const NOW = new Date("2026-09-07T09:00:00Z");

const DAY = 86_400_000;

function daysSince(iso: string, now: Date = NOW) {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / DAY);
}

/* ---- Brain readiness ------------------------------------------------------- */

export type BrainReadiness = {
  /** 0–100, and it can actually reach 100. */
  percent: number;
  ready: boolean;
  /** Approved, and therefore answerable. */
  approved: number;
  /** Everything that is *supposed* to end up answerable. The denominator. */
  answerable: number;
  /** Read and waiting on a decision. One click each. */
  pending: KnowledgeItem[];
  /** Asked for but never found. These need writing, not approving. */
  missing: KnowledgeItem[];
  /** Of the pending, the ones nothing can launch without. */
  blocking: KnowledgeItem[];
  /** The one sentence that says what is between here and 100%. */
  nextStep: string;
};

/**
 * What "ready to answer" is worth as a number.
 *
 * The denominator is deliberately not "everything in the brain". Two statuses
 * are not debts and must never be counted as one:
 *
 *   restricted — withheld on purpose. Counting it as a shortfall punishes the
 *                owner for the safest thing they can do, and puts 100% out of
 *                reach forever no matter what they click.
 *   suggested  — Concierge's idea, not yet anyone's obligation.
 *
 * What is left is what the owner actually owes an answer on: approved, waiting
 * for a decision, or asked for and never found. Every point of the gap has a
 * named item and one action behind it, so the figure is always explainable and
 * always closable.
 */
export function brainReadiness(items: KnowledgeItem[]): BrainReadiness {
  const approvedItems = items.filter((i) => i.status === "approved");
  const pending = items.filter((i) => i.status === "needs-review");
  const missing = items.filter((i) => i.status === "missing");
  const answerable = approvedItems.length + pending.length + missing.length;
  const blocking = [...pending, ...missing].filter((i) => i.required);

  const percent = answerable === 0 ? 0 : Math.round((approvedItems.length / answerable) * 100);
  const ready = blocking.length === 0 && approvedItems.length > 0;

  let nextStep: string;
  if (answerable === 0) {
    nextStep = "Concierge has not read your site yet.";
  } else if (blocking.length) {
    nextStep = `${blocking.length} required ${blocking.length === 1 ? "item" : "items"} still to settle.`;
  } else if (pending.length) {
    nextStep = `Approve ${pending.length} more ${pending.length === 1 ? "item" : "items"} to reach 100%.`;
  } else if (missing.length) {
    nextStep = `Write ${missing.length} ${missing.length === 1 ? "answer" : "answers"} Concierge could not find to reach 100%.`;
  } else {
    nextStep = "Everything Concierge found is approved.";
  }

  return { percent, ready, approved: approvedItems.length, answerable, pending, missing, blocking, nextStep };
}

/* ---- Launch --------------------------------------------------------------- */

export type LaunchStepKey = "website" | "learning" | "review" | "agent" | "routing" | "install";

export type LaunchStep = {
  key: LaunchStepKey;
  label: string;
  /** What this step is for, in the owner's terms. */
  blurb: string;
  done: boolean;
  /** The step that is neither done nor blocked — exactly one is current. */
  current: boolean;
  href: string;
  cta: string;
};

/**
 * The six things that must be true before a visitor can be answered. Derived
 * from the site rather than stored, so it cannot drift out of step with the
 * thing it describes.
 */
export function launchChecklist(
  site: Site,
  brain: SiteBrain,
  destinations: Destination[],
  siteId = site.id,
): LaunchStep[] {
  const base = `/sites/${siteId}`;
  const learned = brain.itemCount > 0;
  // Launching needs the *required* knowledge approved, which is what
  // `ready` means. A live site always has something in the review queue —
  // judging the step on an empty queue would keep it setting up forever.
  const reviewed = brain.ready || (brain.approvedCount > 0 && brain.needsReviewCount === 0);
  const routed = destinations.some((d) => d.status === "connected");
  // A Pages site carries the Agent already: there is nothing to install, so
  // the step is satisfied the moment the page is published.
  const installed = site.product === "pages" || site.installState === "detected";

  const steps: Omit<LaunchStep, "current">[] = [
    {
      key: "website",
      label: "Website added",
      blurb: "Where Concierge reads from, and where the Agent will live.",
      done: Boolean(site.url),
      href: `${base}/settings`,
      cta: "Add your website",
    },
    {
      key: "learning",
      label: "Site read",
      blurb: "Concierge reads every page it is allowed to and writes down what it finds.",
      done: learned,
      href: `${base}/agent/brain`,
      cta: "Start reading",
    },
    {
      key: "review",
      label: "Knowledge approved",
      blurb: "Nothing reaches a visitor until you have approved it.",
      done: reviewed,
      href: `${base}/agent/brain`,
      cta: `Review ${brain.needsReviewCount || ""}`.trim(),
    },
    {
      key: "agent",
      label: "Agent set up",
      blurb: "Its job, its tone, and the things it must never say.",
      // A fact the owner creates by confirming the Agent, not a number that
      // happens to be past a threshold. The old test read `launchProgress`,
      // which no screen in the product could move — so this step could never
      // be completed by using the product.
      done: Boolean(site.agentConfiguredAt),
      href: `${base}/agent`,
      cta: "Set up the Agent",
    },
    {
      key: "routing",
      label: "Somewhere to send people",
      blurb: "When Concierge cannot finish the job, a person has to hear about it.",
      done: routed,
      href: `${base}/agent/routing`,
      cta: "Add a destination",
    },
    {
      key: "install",
      label: site.product === "pages" ? "Page published" : "Script installed",
      blurb:
        site.product === "pages"
          ? "Your hosted page is live and answering."
          : "One line before the closing body tag. You never replace it.",
      done: installed,
      href: `${base}/settings?section=install`,
      cta: site.product === "pages" ? "Publish the page" : "Install the script",
    },
  ];

  const firstOpen = steps.findIndex((s) => !s.done);
  return steps.map((s, i) => ({ ...s, current: i === firstOpen }));
}

export type LaunchPhase = "setting-up" | "waiting" | "live";

/**
 * Three states, because they need three different pages: still building it,
 * built but nobody has arrived yet, and running.
 */
export function launchPhase(steps: LaunchStep[], conversationCount: number): LaunchPhase {
  if (steps.some((s) => !s.done)) return "setting-up";
  return conversationCount === 0 ? "waiting" : "live";
}

export function launchProgress(steps: LaunchStep[]): number {
  return Math.round((steps.filter((s) => s.done).length / steps.length) * 100);
}

/* ---- Health --------------------------------------------------------------- */

export type HealthSeverity = "critical" | "warn" | "watch" | "good";

export type HealthSignal = {
  id: string;
  severity: HealthSeverity;
  title: string;
  detail: string;
  actionLabel: string;
  href: string;
};

export type SiteHealth = {
  score: number;
  band: "healthy" | "watch" | "at-risk";
  signals: HealthSignal[];
  /** The single worst thing, for a one-line summary. */
  headline: HealthSignal | null;
};

const WEIGHT: Record<HealthSeverity, number> = { critical: 34, warn: 16, watch: 7, good: 0 };

/**
 * The quiet ways this product dies: the script comes off in a redesign, a
 * destination starts bouncing, the knowledge goes stale against a business
 * that moved on. None of them announce themselves, so they are watched.
 */
export function siteHealth({
  site,
  brain,
  destinations,
  conversations,
  gaps,
  siteId = site.id,
}: {
  site: Site;
  brain: SiteBrain;
  destinations: Destination[];
  conversations: Conversation[];
  gaps: UnansweredQuestion[];
  siteId?: string;
}): SiteHealth {
  const base = `/sites/${siteId}`;
  const signals: HealthSignal[] = [];

  if (site.product !== "pages" && site.installState !== "detected") {
    signals.push({
      id: "install",
      severity: "critical",
      title:
        site.installState === "not-installed"
          ? "Concierge is not on your website"
          : "The script has stopped responding",
      detail:
        site.installState === "stale"
          ? "It answered before but has not been seen for several days. A redesign or a caching change usually explains it."
          : "Until the script is on the page, nothing can be answered and nothing can be captured.",
      actionLabel: "Check the install",
      href: `${base}/settings?section=install`,
    });
  }

  const failing = destinations.filter((d) => d.status === "failing");
  if (failing.length) {
    signals.push({
      id: "routing",
      severity: "critical",
      title: `${failing[0].name} is not delivering`,
      detail:
        "Requests are still captured, but nobody is being told about them. Anything queued is replayed once it reconnects.",
      actionLabel: "Fix routing",
      href: `${base}/agent/routing`,
    });
  }

  const untested = destinations.filter((d) => d.status === "untested");
  if (untested.length) {
    signals.push({
      id: "untested",
      severity: "watch",
      title: `${untested.length} destination${untested.length === 1 ? "" : "s"} never tested`,
      detail: "A destination that has never delivered anything is a promise nobody has checked.",
      actionLabel: "Send a test",
      href: `${base}/agent/routing`,
    });
  }

  const staleDays = daysSince(brain.lastLearnedAt);
  if (staleDays > 30) {
    signals.push({
      id: "stale",
      severity: "warn",
      title: `Site Brain last read your site ${staleDays} days ago`,
      detail:
        "Prices, hours and services move. Knowledge that has not been re-read is the most common cause of a confidently wrong answer.",
      actionLabel: "Re-learn the site",
      href: `${base}/agent/brain`,
    });
  }

  if (brain.needsReviewCount > 0) {
    signals.push({
      id: "review",
      severity: brain.needsReviewCount > 5 ? "warn" : "watch",
      title: `${brain.needsReviewCount} items waiting for approval`,
      detail:
        "Concierge will not use any of them until someone decides. Until then it says less than it could.",
      actionLabel: "Review them",
      href: `${base}/agent/brain`,
    });
  }

  const lastConversation = conversations
    .map((c) => c.lastMessageAt)
    .sort()
    .at(-1);
  const quietDays = lastConversation ? daysSince(lastConversation) : null;
  if (quietDays !== null && quietDays >= 7) {
    signals.push({
      id: "quiet",
      severity: quietDays >= 14 ? "warn" : "watch",
      title: `No conversations for ${quietDays} days`,
      detail:
        "Either your traffic has dropped or the launcher is no longer reachable. The install check will tell you which.",
      actionLabel: "Check the install",
      href: `${base}/settings?section=install`,
    });
  }

  const openGaps = gaps.filter((g) => g.status === "open");
  if (openGaps.length >= 4) {
    signals.push({
      id: "gaps",
      severity: "watch",
      title: `${openGaps.length} questions your site could not answer`,
      detail: `“${openGaps[0].question}” came up ${openGaps[0].askCount} times. Each one is demand you are not meeting.`,
      actionLabel: "Close the gaps",
      href: `${base}/insights`,
    });
  }

  const score = Math.max(0, 100 - signals.reduce((n, s) => n + WEIGHT[s.severity], 0));
  const band = signals.some((s) => s.severity === "critical") ? "at-risk" : score >= 85 ? "healthy" : "watch";

  const order: HealthSeverity[] = ["critical", "warn", "watch", "good"];
  signals.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  return { score, band, signals, headline: signals[0] ?? null };
}

export const HEALTH_COPY: Record<SiteHealth["band"], { label: string; line: string }> = {
  healthy: { label: "Healthy", line: "Everything Concierge depends on is working." },
  watch: { label: "Worth a look", line: "Nothing is broken, but something is drifting." },
  "at-risk": { label: "Needs you", line: "Something Concierge depends on has stopped working." },
};
