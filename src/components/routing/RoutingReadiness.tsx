"use client";

import { Card, LinkButton } from "@/components/ui";
import { AlertSticker, ApprovedSticker, PendingSticker, TargetSticker } from "@/components/stickers";
import { MOMENT_CHIP, MOMENT_LABEL, VISITOR_MOMENTS } from "@/components/routing/MomentLabels";
import { cx } from "@/lib/cx";
import type { Destination, RoutingMoment } from "@/lib/types";

/* ============================================================================
   ROUTING READINESS
   ----------------------------------------------------------------------------
   One verdict, and the single next thing to do about it.

   This used to be four numbers — connected, tested, needs work, coverage —
   which an owner could read in full and still not know what to touch. Worse,
   they were counted on different axes: "tested" meant a destination had ever
   been tested, "needs work" meant its status was bad right now, so a run of
   six destinations could report 5 tested and 6 needing work and look broken
   when it was not.

   So it says one thing. Whatever is most in the way of launching, named, with
   the button that fixes it. The counts that are still worth having live as a
   quiet line underneath, where they inform rather than instruct.

   The Concierge Inbox is excluded from all of it. It ships with the product,
   cannot be disconnected, and cannot meaningfully be tested — counting it as
   an untested destination told owners to go and fix something that was never
   broken.
   ========================================================================== */

export type Readiness = {
  /** Destinations the owner set up. Never the built-in inbox. */
  configured: Destination[];
  delivering: number;
  failing: Destination[];
  untested: Destination[];
  covered: RoutingMoment[];
  uncovered: RoutingMoment[];
  verdict: "ready" | "failing" | "uncovered" | "untested" | "empty";
};

/** Derived in one place so the strip, the tabs and the check all agree. */
export function readRouting(destinations: Destination[]): Readiness {
  const configured = destinations.filter((d) => d.kind !== "inbox");
  const live = destinations.filter((d) => d.status !== "paused");

  const delivering = configured.filter((d) => d.status === "connected").length;
  const failing = configured.filter((d) => d.status === "failing");
  const untested = configured.filter((d) => d.status === "untested");

  // A moment is covered if some live, non-failing destination listens for it.
  // The built-in inbox counts here — it genuinely does catch these.
  const covered = VISITOR_MOMENTS.filter((m) =>
    live.some((d) => d.status !== "failing" && d.moments.includes(m)),
  );
  const uncovered = VISITOR_MOMENTS.filter((m) => !covered.includes(m));

  // Ordered by what actually hurts: a broken path loses messages, an uncovered
  // moment means nobody is told, an untested one is merely unproven.
  const verdict =
    configured.length === 0
      ? "empty"
      : failing.length > 0
        ? "failing"
        : uncovered.length > 0
          ? "uncovered"
          : untested.length > 0
            ? "untested"
            : "ready";

  return { configured, delivering, failing, untested, covered, uncovered, verdict };
}

export function RoutingReadiness({
  destinations,
  siteId,
  onFixCoverage,
  onFixDestination,
}: {
  destinations: Destination[];
  siteId: string;
  /** Takes the owner to the place a missing moment can be given a home. */
  onFixCoverage?: () => void;
  /** Takes the owner to one destination that needs attention. */
  onFixDestination?: (d: Destination) => void;
}) {
  const r = readRouting(destinations);

  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

  /** The verdict, the sentence under it, and the one button. */
  const view = (() => {
    switch (r.verdict) {
      case "failing":
        return {
          Sticker: AlertSticker,
          tone: "text-danger",
          surface: "border-danger-line bg-danger-soft",
          title: `${r.failing[0].name} is not delivering`,
          body: "Visitor requests are still captured — your team just is not hearing about them.",
          action: onFixDestination
            ? { label: "Inspect it", run: () => onFixDestination(r.failing[0]) }
            : undefined,
        };
      case "uncovered":
        return {
          Sticker: TargetSticker,
          tone: "text-warning",
          surface: "border-review-line bg-review-soft",
          title: plural(
            r.uncovered.length,
            "One moment has nowhere to go",
            `${r.uncovered.length} moments have nowhere to go`,
          ),
          body: "Concierge captures these and nobody hears about them.",
          chips: r.uncovered,
          action: onFixCoverage ? { label: "Give them a home", run: onFixCoverage } : undefined,
        };
      case "untested":
        return {
          Sticker: PendingSticker,
          tone: "text-warning",
          surface: "border-review-line bg-review-soft",
          title: plural(
            r.untested.length,
            "One path has never been tested",
            `${r.untested.length} paths have never been tested`,
          ),
          body: "Every visitor moment reaches somebody. Send a test to prove the path works.",
          action: onFixCoverage ? { label: "Test them", run: onFixCoverage } : undefined,
        };
      case "empty":
        return {
          Sticker: PendingSticker,
          tone: "text-text-secondary",
          surface: "border-line bg-surface-subtle",
          title: "Everything is landing in your Concierge Inbox",
          body: "That works, but somebody has to be looking at it. Add a destination to reach your team where they already are.",
          action: onFixCoverage ? { label: "Add a destination", run: onFixCoverage } : undefined,
        };
      default:
        return {
          Sticker: ApprovedSticker,
          tone: "text-success",
          surface: "border-success-line bg-approved-soft",
          title: "Routing is ready",
          body: `Every visitor moment reaches a person, and all ${r.configured.length} paths have been tested.`,
        };
    }
  })();

  return (
    <Card className={cx("flex flex-wrap items-start gap-4 border p-5", view.surface)}>
      <view.Sticker size={30} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <p className={cx("text-[15px] font-semibold leading-[1.3]", view.tone)}>{view.title}</p>
        <p className="mt-1 text-[12.5px] leading-[1.5] text-text-secondary">{view.body}</p>

        {/* Named as chips rather than folded into the sentence: an owner
            scanning this needs to recognise the moment, not parse a list that
            has been lowercased to fit the grammar. */}
        {view.chips && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {view.chips.map((m) => (
              <li
                key={m}
                title={MOMENT_LABEL[m]}
                className="border border-line-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary"
              >
                {MOMENT_CHIP[m]}
              </li>
            ))}
          </ul>
        )}

        {/* The counts still exist — as background, not as instructions. */}
        <p className="mt-3 text-[11.5px] text-text-tertiary">
          {r.configured.length === 0
            ? "No destinations of your own yet"
            : `${r.delivering} of ${r.configured.length} ${plural(r.configured.length, "destination", "destinations")} delivering`}
          {" · "}
          {r.covered.length} of {VISITOR_MOMENTS.length} visitor moments covered
        </p>
      </div>

      {view.action ? (
        <button
          type="button"
          onClick={view.action.run}
          className="shrink-0 border border-line-strong bg-surface px-3.5 py-2 text-[12.5px] font-medium transition-colors hover:border-ink"
        >
          {view.action.label}
        </button>
      ) : r.verdict !== "ready" ? (
        <LinkButton href={`/sites/${siteId}/agent/routing`} variant="secondary" size="sm">
          Open routing
        </LinkButton>
      ) : null}
    </Card>
  );
}
