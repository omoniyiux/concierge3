"use client";

import { use, useState } from "react";
import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { ArrivalRibbon } from "@/components/ledger/ArrivalRibbon";
import { Badge, Button, EmptyState, Panel, SectionHead, SegmentedControl } from "@/components/ui";
import {
  ArrowRight,
  CheckIcon,
  ClockIcon,
  ReturnIcon,
  ShieldIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { ACTIONS, reportsFor } from "@/lib/demo-data";
import {
  useBrain,
  useConversations,
  useDestinations,
  useGaps,
  useLedger,
  useOutcomes,
  useSimActions,
  useSite,
} from "@/lib/sim/store";
import { launchChecklist } from "@/lib/health";
import { ReportSchedule } from "@/components/ledger/ReportSchedule";
import { NothingYet } from "@/components/shell/NothingYet";
import {
  BASIS_LABEL,
  OUTCOME_LABEL,
  longDate,
  money,
  openingEnvelope,
  openingSummary,
  relativeTime,
} from "@/lib/format";
import type { Outcome, OutcomeKind, ValueBasis } from "@/lib/types";

/* ============================================================================
   RETURN
   ----------------------------------------------------------------------------
   The one surface that answers "did this make me any money". Two rules hold
   the whole page together:

   1. Confirmed money and estimated value are never added into one figure.
   2. Every number on the page reaches the conversation that produced it in
      one click.

   Break either and the owner stops believing the rest of the product.
   ========================================================================== */

type Filter = "all" | "confirmed" | "estimated" | "none";

const BASIS_TONE = { confirmed: "approved", estimated: "neutral", none: "neutral" } as const;

export default function LedgerPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const site = useSite(siteId);
  const ledger = useLedger(siteId);
  const outcomes = useOutcomes(siteId);
  const reports = reportsFor(siteId);
  const conversations = useConversations(siteId);
  const brain = useBrain(siteId);
  const destinations = useDestinations(siteId);
  const gaps = useGaps();
  const { settleOutcome } = useSimActions();
  const [filter, setFilter] = useState<Filter>("all");
  /** Estimates an owner has since settled, one way or the other. */
  const [settled, setSettled] = useState<Record<string, "happened" | "did-not">>({});

  const setupComplete = launchChecklist(site, brain, destinations, siteId).every((s) => s.done);
  const envelope = openingEnvelope(site.openingHours.days);
  // The world recomputes both totals the moment an estimate is settled, so
  // the headline and the row can never disagree.
  const confirmedValue = ledger.confirmedValue;
  const estimatedValue = ledger.estimatedValue;

  const confirmedDelta = pctChange(confirmedValue, ledger.previousConfirmedValue);
  const estimatedDelta = pctChange(estimatedValue, ledger.previousEstimatedValue);

  const ordered = [...outcomes].sort((a, b) => b.at.localeCompare(a.at));
  const shown = filter === "all" ? ordered : ordered.filter((o) => o.basis === filter);

  const answered = outcomes.filter((o) => o.kind === "answer").length;
  const scheduled = reports.find((r) => r.state === "scheduled");
  const previous = reports.filter((r) => r.state === "sent");

  // The last seven days, which is what the weekly note reports on.
  const weekStart = new Date(ledger.end);
  weekStart.setDate(weekStart.getDate() - 7);
  const thisWeek = outcomes.filter((o) => new Date(o.at) >= weekStart);
  const weekConfirmed = thisWeek
    .filter((o) => o.basis === "confirmed")
    .reduce((n, o) => n + o.value, 0);
  const weekEstimated = thisWeek.filter((o) => o.basis === "estimated").reduce((n, o) => n + o.value, 0);
  const bookings = thisWeek.filter((o) => o.kind === "booking").length;
  const weekSeries = ledger.hourHistogram
    .slice(8, 20)
    .map((v, i) => ({ date: `h${i}`, value: v }));
  const openGaps = gaps;
  const topGap = openGaps[0];
  const needsYou = destinations
    .filter((d) => d.status === "failing")
    .map((d) => ({
      title: `${d.name} stopped delivering`,
      detail: "Requests are queued rather than lost, but nobody is being told. It takes one click to replay them.",
    }));

  if (outcomes.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Return"
          title="What Concierge did for the business"
          description="Every figure here traces back to the conversation that produced it. Where a number is an estimate, it says so and shows its arithmetic."
        />
        <NothingYet
          siteId={siteId}
          setupComplete={setupComplete}
          noun="return to report"
          body="The moment Concierge books an appointment, captures a lead or takes a payment, it is recorded here against the conversation that produced it — confirmed money and estimated value kept apart."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Return"
        title="What Concierge did for the business"
        description="Every figure below traces back to the conversation that produced it. Where a number is an estimate, it says so and shows its arithmetic."
        meta={
          <p className="t-body-sm text-text-tertiary">
            {longDate(ledger.start)} – {longDate(ledger.end)} · {ledger.conversations.toLocaleString()}{" "}
            conversations · Open {openingSummary(site.openingHours.days)}
          </p>
        }
      />

      {/* ---- The headline. Two figures, deliberately kept apart. --------- */}
      <Panel className="mb-4">
        <div className="grid sm:grid-cols-2">
          <ValueHalf
            label="Money confirmed"
            value={money(confirmedValue, site.currency)}
            delta={confirmedDelta}
            hint="Settled through a connected system. Not a projection."
            icon={<ShieldIcon size={15} className="text-success" />}
          />
          <ValueHalf
            label="Value estimated"
            value={money(estimatedValue, site.currency)}
            delta={estimatedDelta}
            hint="Your own figures applied to bookings, quotes and leads Concierge produced."
            className="border-t border-line-strong sm:border-l sm:border-t-0"
          />
        </div>
        <p className="border-t border-line bg-surface-subtle px-6 py-3.5 text-[11.5px] leading-[1.55] text-text-tertiary">
          These are not added together. Confirmed money has actually moved; estimated value is arithmetic you
          can check on every row below. Concierge would rather show you two honest numbers than one impressive
          one.
        </p>
      </Panel>

      {/* ---- When people arrived ---------------------------------------- */}
      <Panel className="mb-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <SectionHead
            title="When people actually arrived"
            hint="Hour of day across the period. The shaded window is the widest your doors are ever open."
          />
          <div className="shrink-0 text-right">
            <p className="t-num text-[23px] leading-none text-accent">
              {ledger.afterHoursConversations}
              <span className="text-text-tertiary">/{ledger.conversations}</span>
            </p>
            <p className="mt-1.5 text-[11.5px] text-text-secondary">arrived with nobody there</p>
          </div>
        </div>

        <div className="mt-6">
          <ArrivalRibbon hours={ledger.hourHistogram} opens={envelope?.opens} closes={envelope?.closes} />
        </div>

        <p className="t-body-sm mt-5 max-w-[74ch] border-t border-line pt-4 text-text-tertiary">
          The chart reads hour of day only. The {ledger.afterHoursConversations} figure also counts every
          conversation that landed on a day you were shut, which is why it runs higher than the orange bars
          alone.
        </p>
      </Panel>

      {/* ---- Composition + time saved ----------------------------------- */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="p-6">
          <SectionHead
            title="Where the value came from"
            hint="Grouped by what Concierge completed, not by what it talked about."
          />
          <ul className="mt-5 divide-y divide-divider border-t border-line">
            {composition(outcomes).map((row) => (
              <li key={row.kind} className="flex items-center gap-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium">{OUTCOME_LABEL[row.kind]}</span>
                  <span className="t-meta block text-text-tertiary">
                    {row.count} {row.count === 1 ? "outcome" : "outcomes"}
                    {row.note ? ` · ${row.note}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="t-num block text-[14px] leading-none">
                    {row.value > 0 ? money(row.value, site.currency) : "—"}
                  </span>
                  {row.value > 0 && (
                    <span className="t-meta mt-1 block text-text-tertiary">{BASIS_LABEL[row.basis]}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex flex-col p-6">
          <SectionHead title="What it saved you" hint="Work that never reached a person." />
          <div className="mt-6 flex items-baseline gap-2.5">
            <span className="t-num text-[34px] leading-none">{ledger.hoursSaved}</span>
            <span className="text-[12.5px] text-text-secondary">hours of front-desk time</span>
          </div>
          <p className="t-body-sm mt-4 text-text-tertiary">
            The {ledger.resolvedWithoutHuman} conversations Concierge closed out on its own, at the six
            minutes a phone enquiry costs you.
          </p>
          <div className="mt-auto border-t border-line pt-4">
            <p className="t-meta text-text-tertiary">
              {answered === 1 ? "One" : answered} of the {outcomes.length} most recent outcomes{" "}
              {answered === 1 ? "was a question" : "were questions"} answered outright.
            </p>
          </div>
        </Panel>
      </div>

      {/* ---- The ledger itself ------------------------------------------ */}
      <Panel className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-4">
          <SectionHead
            title="Every outcome, most recent first"
            hint="The audit trail. Open any row to read the conversation it came from."
          />
          <SegmentedControl
            label="Filter by how the value was arrived at"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "confirmed", label: "Confirmed" },
              { value: "estimated", label: "Estimated" },
              { value: "none", label: "No value" },
            ]}
          />
        </div>

        {shown.length === 0 ? (
          <EmptyState
            icon={<ReturnIcon size={19} />}
            title="Nothing on this filter"
            body="No outcome in this period was recorded that way. Try another filter, or look at everything Concierge completed."
            action={
              <Button variant="secondary" size="sm" onClick={() => setFilter("all")}>
                Show everything
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-divider border-t border-line">
            {shown.map((o) => {
              const conversation = conversations.find((c) => c.id === o.conversationId);
              return (
                <li key={o.id}>
                  <Link
                    href={`/sites/${siteId}/conversations?c=${o.conversationId}`}
                    className="group flex flex-wrap items-start gap-x-5 gap-y-2.5 px-6 py-4 transition-colors duration-[var(--dur-micro)] hover:bg-surface-subtle"
                  >
                    <span className="min-w-[260px] flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{OUTCOME_LABEL[o.kind]}</Badge>
                        {o.afterHours && (
                          <Badge tone="accent">
                            <ClockIcon size={11} />
                            After hours
                          </Badge>
                        )}
                      </span>
                      <span className="mt-2 block text-[12.5px] font-medium">{o.summary}</span>
                      <span className="t-meta mt-1 block text-text-tertiary">
                        {conversation ? conversation.visitorName : "Visitor"} · {relativeTime(o.at)}
                        {o.valueNote ? ` · ${o.valueNote}` : ""}
                      </span>
                    </span>

                    <span className="flex shrink-0 items-center gap-4">
                      <span className="text-right">
                        <span
                          className={cx(
                            "t-num block text-[14px] leading-none",
                            o.basis === "none" && "text-text-muted",
                          )}
                        >
                          {o.value > 0 ? money(o.value, site.currency) : "—"}
                        </span>
                        <span className="t-meta mt-1 block">
                          <Badge tone={BASIS_TONE[o.basis]}>{BASIS_LABEL[o.basis]}</Badge>
                        </span>
                      </span>
                      <ArrowRight
                        size={15}
                        className="mt-1 text-text-muted transition-transform duration-[var(--dur-micro)] group-hover:translate-x-0.5 group-hover:text-text-primary"
                      />
                    </span>
                  </Link>

                  {/* An estimate is a question until somebody answers it. The
                      row asks, because this is where an owner is already
                      reading the figure. */}
                  {o.basis === "estimated" && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-divider bg-surface-subtle px-6 py-2.5">
                      {settled[o.id] === "happened" ? (
                        <p className="flex items-center gap-2 text-[12px] font-medium text-success">
                          <CheckIcon size={13} strokeWidth={2.4} />
                          Confirmed by you — now counted as settled money.
                        </p>
                      ) : settled[o.id] === "did-not" ? (
                        <p className="flex items-center gap-2 text-[12px] text-text-tertiary">
                          Marked as not happening. Removed from the estimate, and the average it feeds.
                        </p>
                      ) : (
                        <>
                          <p className="min-w-[180px] flex-1 text-[12px] text-text-secondary">
                            Did this one actually happen? Telling us makes every figure above it truer.
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            leading={<CheckIcon size={13} />}
                            onClick={() => {
                              setSettled((m) => ({ ...m, [o.id]: "happened" }));
                              settleOutcome(o.id, true);
                            }}
                          >
                            It happened
                          </Button>
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => {
                              setSettled((m) => ({ ...m, [o.id]: "did-not" }));
                              settleOutcome(o.id, false);
                            }}
                          >
                            It did not
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* ---- What gets sent, and how often ------------------------------ */}
      <ReportSchedule
        scheduled={scheduled}
        previous={previous}
        digest={{
          site,
          ledger,
          weekLabel: "1–7 September",
          conversations: 52,
          leads: 17,
          bookings: bookings,
          afterHours: 19,
          confirmed: weekConfirmed,
          estimated: weekEstimated,
          handoffs: 9,
          series: weekSeries,
          topGap: topGap,
          needsYou: needsYou,
        }}
      />

    </PageContainer>
  );
}

/* ---- Pieces --------------------------------------------------------------- */

function ValueHalf({
  label,
  value,
  delta,
  hint,
  icon,
  className,
}: {
  label: string;
  value: string;
  delta: number | null;
  hint: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("p-6", className)}>
      <p className="t-eyebrow flex items-center gap-2 text-text-muted">
        {icon}
        {label}
      </p>
      <div className="mt-3.5 flex flex-wrap items-baseline gap-3">
        <span className="t-num text-[34px] leading-none">{value}</span>
        {delta !== null && (
          <span
            className={cx(
              "text-[12.5px] font-medium tabular-nums",
              delta >= 0 ? "text-success" : "text-danger",
            )}
          >
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}% on the month before
          </span>
        )}
      </div>
      <p className="t-body-sm mt-3 max-w-[42ch] text-text-tertiary">{hint}</p>
    </div>
  );
}

/* ---- Derivations ---------------------------------------------------------- */

function pctChange(now: number, before: number): number | null {
  if (before <= 0) return null;
  return Math.round(((now - before) / before) * 100);
}

/**
 * Grouped by outcome kind. A group's basis is only "confirmed" when every
 * outcome in it is — one estimate in the group and the whole line is an
 * estimate, because that is what it has become.
 */
function composition(outcomes: Outcome[]): {
  kind: OutcomeKind;
  count: number;
  value: number;
  basis: ValueBasis;
  note?: string;
}[] {
  const byKind = new Map<OutcomeKind, { count: number; value: number; bases: Set<ValueBasis> }>();

  for (const o of outcomes) {
    const row = byKind.get(o.kind) ?? { count: 0, value: 0, bases: new Set<ValueBasis>() };
    row.count += 1;
    row.value += o.value;
    row.bases.add(o.basis);
    byKind.set(o.kind, row);
  }

  return [...byKind.entries()]
    .map(([kind, row]) => ({
      kind,
      count: row.count,
      value: row.value,
      basis: (row.bases.has("estimated")
        ? "estimated"
        : row.bases.has("confirmed")
          ? "confirmed"
          : "none") as ValueBasis,
      note: noteFor(kind, row.value),
    }))
    .sort((a, b) => b.value - a.value || b.count - a.count);
}

/**
 * The owner's own arithmetic, surfaced where the total is — but only on a
 * row that actually carries value. "$95 each" above a dash reads as a
 * contradiction, and one of those is enough to lose the page's credibility.
 */
function noteFor(kind: OutcomeKind, value: number): string | undefined {
  if (value <= 0) return undefined;
  // A recovery is still an appointment; it is valued the same way.
  const lookup = kind === "lead-routed" ? "lead-capture" : kind === "recovered" ? "booking" : kind;
  const action = ACTIONS.find((a) => a.kind === lookup);
  return action?.unitValue ? `${money(action.unitValue)} each` : undefined;
}
