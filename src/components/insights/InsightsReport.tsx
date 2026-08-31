"use client";

import type { ComponentType } from "react";
import { ConciergeMark } from "@/components/shell/ConciergeMark";
import { AreaChart, BarList, Sparkline } from "@/components/ui/charts";
import {
  ChatSticker,
  ContactSticker,
  GapSticker,
  HandoffSticker,
  LeadSticker,
  SalesSticker,
  TargetSticker,
} from "@/components/stickers";
import { cx } from "@/lib/cx";
import { printDate } from "@/lib/print";
import { CATEGORY_LABEL, INTENT_LABEL, formatMetric, relativeTime } from "@/lib/format";
import type { IntentBreakdown, Metric, Site, UnansweredQuestion } from "@/lib/types";

/* ============================================================================
   THE INSIGHTS REPORT, AS A PRINTED DOCUMENT
   The same facts as the Insights page, re-laid out for A4: a masthead that
   says whose site and which period, the headline gap, the six figures with
   their drawings intact, the two charts, and the questions themselves as a
   table someone can work down.

   It is rendered off-screen in the workspace and printed from there, so the
   page and the paper cannot drift apart — one set of components, one
   stylesheet, one palette.
   ========================================================================== */

const METRIC_STICKER: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  visitors: ContactSticker,
  conversations: ChatSticker,
  leads: LeadSticker,
  actions: SalesSticker,
  handoffs: HandoffSticker,
  conversion: TargetSticker,
};

export const RANGE_LABEL: Record<string, string> = {
  "7d": "Last 7 days",
  "14d": "Last 14 days",
  "30d": "Last 30 days",
};

export function InsightsReport({
  site,
  range,
  metrics,
  intents,
  unanswered,
  generatedAt = new Date(),
}: {
  site: Site;
  range: string;
  metrics: Metric[];
  intents: IntentBreakdown[];
  unanswered: UnansweredQuestion[];
  generatedAt?: Date;
}) {
  const conversations = metrics.find((m) => m.key === "conversations") ?? metrics[0];
  const missedDemand = unanswered.reduce((n, u) => n + u.askCount, 0);
  const values = conversations.series.map((p) => p.value);
  const total = values.reduce((n, v) => n + v, 0);
  const peak = conversations.series.reduce((b, p) => (p.value > b.value ? p : b), conversations.series[0]);

  return (
    <article className="bg-surface text-text-primary">
      {/* ---- Masthead --------------------------------------------------- */}
      <header className="flex items-start justify-between gap-8 border-b-2 border-ink pb-5">
        <div>
          <ConciergeMark size={34} />
          <p className="t-eyebrow mt-4 text-accent-ink">Insights report</p>
          <h1 className="t-display mt-2 text-[26px]">{site.name}</h1>
          <p className="t-body mt-2 text-text-secondary">
            {RANGE_LABEL[range] ?? range} · {site.url}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="t-eyebrow text-text-muted">Generated</p>
          <p className="t-body mt-2 font-medium">{printDate(generatedAt)}</p>
          <p className="t-body-sm mt-1 text-text-tertiary">by Concierge</p>
        </div>
      </header>

      {/* ---- The headline ----------------------------------------------- */}
      <section className="cg-avoid-break mt-7 flex items-start gap-5 border border-accent-line bg-accent-subtle p-5">
        <GapSticker size={40} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="t-eyebrow text-accent-ink">The gap worth closing</p>
          <h2 className="t-feature mt-2">
            {missedDemand} visitors asked something the site could not answer
          </h2>
          <p className="t-body mt-2 text-text-secondary">
            Across {unanswered.length} distinct questions. Each one ended in a handoff or a dead end — they
            are the questions customers actually have, ranked by how often they came up.
          </p>
        </div>
      </section>

      {/* ---- The six figures --------------------------------------------- */}
      <section className="cg-avoid-break mt-8">
        <h2 className="t-section">How Concierge performed</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">
          Measured against the previous period of the same length.
        </p>
        <div className="mt-4 grid grid-cols-3 border border-line-strong">
          {metrics.map((m, i) => {
            const Sticker = METRIC_STICKER[m.key] ?? TargetSticker;
            return (
              <div
                key={m.key}
                className={cx(
                  "cg-avoid-break p-4",
                  i % 3 !== 0 && "border-l border-divider",
                  i > 2 && "border-t border-divider",
                )}
              >
                <Sticker size={28} />
                <p className="t-num mt-3 text-[20px] leading-none">{formatMetric(m.value, m.format)}</p>
                <p className="mt-2 text-[12.5px] font-semibold leading-[1.3]">{m.label}</p>
                <div className="mt-2.5 flex items-end justify-between gap-3">
                  <span
                    className={cx(
                      "text-[12px] font-medium tabular-nums",
                      m.delta > 0 ? "text-success" : "text-danger",
                    )}
                  >
                    {m.delta > 0 ? "↑" : "↓"} {Math.abs(m.delta)}%
                  </span>
                  <Sparkline points={m.series} width={64} height={24} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Volume ------------------------------------------------------ */}
      <section className="cg-avoid-break mt-8 border border-line-strong p-5">
        <h2 className="t-section">Conversation volume</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">Daily conversations across the period.</p>
        <div className="mt-4">
          <AreaChart points={conversations.series} label="Conversations per day" height={200} />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-divider pt-4">
          {[
            {
              label: "Busiest day",
              value: String(peak.value),
              detail: new Date(peak.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
            },
            {
              label: "Daily average",
              value: String(Math.round(total / values.length)),
              detail: "across the period",
            },
            { label: "Total", value: total.toLocaleString(), detail: "conversations handled" },
          ].map((f) => (
            <div key={f.label}>
              <dt className="t-eyebrow text-text-muted">{f.label}</dt>
              <dd className="t-num mt-2 text-[17px] leading-none">{f.value}</dd>
              <dd className="mt-1.5 text-[11.5px] text-text-tertiary">{f.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---- Intent ------------------------------------------------------ */}
      <section className="cg-avoid-break mt-6 border border-line-strong p-5">
        <h2 className="t-section">What visitors came for</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">
          Ranked by volume. Conversion is the share that reached an action.
        </p>
        <div className="mt-4">
          <BarList
            items={intents.map((i) => ({
              label: INTENT_LABEL[i.intent],
              value: i.count,
              sub: `${i.conversionRate}% reached an action`,
            }))}
          />
        </div>
      </section>

      {/* ---- The questions themselves ------------------------------------ */}
      <section className="cg-page-break mt-8">
        <h2 className="t-section">Questions to answer</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">
          In the order worth working down. Answering one in Site Brain takes effect immediately.
        </p>
        <table className="mt-4 w-full border border-line-strong text-left">
          <thead>
            <tr className="bg-surface-subtle">
              {["Question", "Asked", "Last asked", "Belongs in"].map((h) => (
                <th key={h} className="t-eyebrow px-4 py-3 text-text-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unanswered.map((q) => (
              <tr key={q.id} className="cg-avoid-break border-t border-divider">
                <td className="px-4 py-3 text-[12.5px] font-medium">&ldquo;{q.question}&rdquo;</td>
                <td className="px-4 py-3 text-[12.5px] tabular-nums text-text-secondary">
                  {q.askCount} times
                </td>
                <td className="px-4 py-3 text-[12.5px] text-text-secondary">{relativeTime(q.lastAskedAt)}</td>
                <td className="px-4 py-3 text-[12.5px] text-text-secondary">
                  {CATEGORY_LABEL[q.suggestedCategory]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ---- Behaviour ---------------------------------------------------- */}
      <section className="cg-avoid-break mt-6 grid grid-cols-3 border border-line-strong">
        {[
          ["Answered without a person", "83%", "320 of 386 conversations resolved from approved knowledge."],
          ["Average time to a person", "4s", "From a visitor asking to your team being told."],
          ["Refused safely", "28", "Times Concierge declined to guess and offered a handoff."],
        ].map(([label, value, detail], i) => (
          <div key={label} className={cx("p-4", i > 0 && "border-l border-divider")}>
            <p className="t-eyebrow text-text-muted">{label}</p>
            <p className="t-num mt-2.5 text-[18px] leading-none">{value}</p>
            <p className="t-body-sm mt-2 leading-[1.45] text-text-tertiary">{detail}</p>
          </div>
        ))}
      </section>

      <footer className="mt-8 flex items-center justify-between gap-6 border-t border-line-strong pt-4">
        <p className="t-body-sm text-text-tertiary">
          Concierge · {site.url} · {RANGE_LABEL[range] ?? range}
        </p>
        <p className="t-body-sm text-text-tertiary">Generated {printDate(generatedAt)}</p>
      </footer>
    </article>
  );
}
