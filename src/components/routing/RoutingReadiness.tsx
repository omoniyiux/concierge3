"use client";

import { Card, LinkButton } from "@/components/ui";
import { AlertSticker, ApprovedSticker, GapSticker, PendingSticker, TargetSticker } from "@/components/stickers";
import { MOMENT_CHIP, MOMENT_LABEL, VISITOR_MOMENTS } from "@/components/routing/MomentLabels";
import { cx } from "@/lib/cx";
import type { Destination, RoutingMoment } from "@/lib/types";

/* ============================================================================
   ROUTING READINESS
   ----------------------------------------------------------------------------
   One verdict, then the four numbers behind it.

   Coverage is the number that did not exist before: a visitor moment with no
   destination is a request that is captured and then never mentioned to
   anybody. Counting connections told you how much you had set up; counting
   moments tells you what is still falling on the floor, so the uncovered ones
   are named rather than left as arithmetic.
   ========================================================================== */

export type Readiness = {
  connected: number;
  tested: number;
  needsWork: number;
  covered: RoutingMoment[];
  uncovered: RoutingMoment[];
  verdict: "ready" | "gaps" | "broken" | "empty";
};

/** Derived in one place so the strip, the tabs and the check all agree. */
export function readRouting(destinations: Destination[]): Readiness {
  const live = destinations.filter((d) => d.status !== "paused");
  const connected = destinations.filter((d) => d.status === "connected").length;
  const tested = destinations.filter((d) => d.lastTestedAt && d.status !== "failing").length;
  const needsWork = destinations.filter((d) => d.status === "failing" || d.status === "untested").length;

  const covered = VISITOR_MOMENTS.filter((m) =>
    live.some((d) => d.status !== "failing" && d.moments.includes(m)),
  );
  const uncovered = VISITOR_MOMENTS.filter((m) => !covered.includes(m));

  const verdict =
    destinations.length === 0
      ? "empty"
      : destinations.some((d) => d.status === "failing")
        ? "broken"
        : uncovered.length > 0 || needsWork > 0
          ? "gaps"
          : "ready";

  return { connected, tested, needsWork, covered, uncovered, verdict };
}

const VERDICT = {
  ready: {
    Sticker: ApprovedSticker,
    title: "Launch ready",
    body: "Every visitor moment reaches a person, and each path has been tested.",
    tone: "text-success",
    surface: "bg-approved-soft",
  },
  gaps: {
    Sticker: PendingSticker,
    title: "Nearly there",
    body: "Concierge is routing, but some paths are untested or have nowhere to go.",
    tone: "text-warning",
    surface: "bg-review-soft",
  },
  broken: {
    Sticker: AlertSticker,
    title: "A path is failing",
    body: "Requests are still captured. Your team is not being told about them.",
    tone: "text-danger",
    surface: "bg-restricted-soft",
  },
  empty: {
    Sticker: GapSticker,
    title: "Nothing connected",
    body: "Handoffs are landing in the Concierge Inbox and nowhere else.",
    tone: "text-text-muted",
    surface: "bg-surface-subtle",
  },
} as const;

export function RoutingReadiness({
  destinations,
  siteId,
  onFixCoverage,
}: {
  destinations: Destination[];
  siteId: string;
  /** Takes the owner to the place a missing moment can be given a home. */
  onFixCoverage?: () => void;
}) {
  const r = readRouting(destinations);
  const v = VERDICT[r.verdict];
  const total = VISITOR_MOMENTS.length;
  const pct = Math.round((r.covered.length / total) * 100);

  const cells = [
    {
      value: r.connected,
      label: "Connected",
      detail: r.connected === 1 ? "1 place saved" : `${r.connected} places saved`,
      tone: "",
    },
    {
      value: r.tested,
      label: "Tested",
      detail: r.tested === 0 ? "Nothing proven yet" : "Paths proven to deliver",
      tone: r.tested > 0 ? "text-success" : "text-text-muted",
    },
    {
      value: r.needsWork,
      label: "Needs work",
      detail: "Failing or never tested",
      tone: r.needsWork > 0 ? "text-warning" : "",
    },
    {
      value: `${pct}%`,
      label: "Coverage",
      detail: `${r.covered.length} of ${total} visitor moments`,
      tone: r.uncovered.length === 0 ? "text-success" : "text-warning",
    },
  ];

  return (
    <Card className="grid grid-cols-1 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
      <div className={cx("border-b border-divider px-6 py-6 lg:border-b-0 lg:border-r", v.surface)}>
        <v.Sticker size={34} />
        <p className="t-eyebrow mt-4 text-text-muted">Routing readiness</p>
        <p className={cx("mt-2 text-[19px] font-semibold leading-[1.2]", v.tone)}>{v.title}</p>
        <p className="mt-2 text-[11.5px] leading-[1.5] text-text-secondary">{v.body}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={cx("px-5 py-5", i > 1 && "border-t border-divider lg:border-t-0", i % 2 === 1 && "border-l border-divider", i === 2 && "lg:border-l")}
          >
            <p className={cx("t-num text-[22px] leading-none", c.tone)}>{c.value}</p>
            <p className="mt-2 text-[12.5px] font-semibold leading-[1.3]">{c.label}</p>
            <p className="mt-1 text-[11.5px] leading-[1.45] text-text-tertiary">{c.detail}</p>
          </div>
        ))}

        {r.uncovered.length > 0 && (
          <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-divider px-5 py-4 lg:col-span-4">
            <TargetSticker size={24} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] leading-[1.5]">
                <span className="font-semibold">
                  {r.uncovered.length === 1
                    ? "One moment has nowhere to go."
                    : `${r.uncovered.length} moments have nowhere to go.`}
                </span>{" "}
                <span className="text-text-secondary">
                  Concierge captures these and nobody hears about them.
                </span>
              </p>
              {/* Named as chips rather than folded into the sentence: an owner
                  scanning this needs to recognise the moment, not parse a list
                  that has been lowercased to fit the grammar. */}
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {r.uncovered.map((m) => (
                  <li
                    key={m}
                    title={MOMENT_LABEL[m]}
                    className="border border-line-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary"
                  >
                    {MOMENT_CHIP[m]}
                  </li>
                ))}
              </ul>
            </div>
            {onFixCoverage ? (
              <button
                type="button"
                onClick={onFixCoverage}
                className="shrink-0 border border-line-strong bg-surface px-3 py-1.5 text-[11.5px] font-medium transition-colors hover:border-ink"
              >
                Give them a home
              </button>
            ) : (
              <LinkButton href={`/sites/${siteId}/routing`} variant="secondary" size="sm">
                Give them a home
              </LinkButton>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
