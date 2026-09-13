"use client";

import { ConciergeMark } from "@/components/shell/ConciergeMark";
import { Sparkline } from "@/components/ui/charts";
import { ChatSticker, GapSticker, HandoffSticker, LeadSticker, SalesSticker } from "@/components/stickers";
import { cx } from "@/lib/cx";
import { money } from "@/lib/format";
import type { LedgerPeriod, MetricPoint, Site, UnansweredQuestion } from "@/lib/types";

/* ============================================================================
   THE WEEKLY NOTE
   ----------------------------------------------------------------------------
   The monthly report is the artefact that gets forwarded. This is the one
   that keeps an owner subscribed: short, arriving on a Monday, opening with
   the number that only Concierge can claim — what happened while they were
   closed — and ending with the one thing that needs them.

   Written as an email, not as a dashboard: it has to be legible in a preview
   pane, on a phone, by someone who will never open the workspace.
   ========================================================================== */

export type DigestData = {
  site: Site;
  ledger: LedgerPeriod;
  weekLabel: string;
  conversations: number;
  leads: number;
  bookings: number;
  afterHours: number;
  confirmed: number;
  estimated: number;
  handoffs: number;
  series: MetricPoint[];
  topGap?: UnansweredQuestion;
  needsYou: { title: string; detail: string }[];
};

export function WeeklyDigest({ data }: { data: DigestData }) {
  const {
    site,
    weekLabel,
    conversations,
    leads,
    bookings,
    afterHours,
    confirmed,
    estimated,
    handoffs,
    series,
    topGap,
    needsYou,
  } = data;

  return (
    <article className="mx-auto w-full max-w-[560px] bg-surface text-text-primary">
      {/* ---- Header --------------------------------------------------- */}
      <header className="flex items-center gap-3 border-b-2 border-ink px-6 py-5">
        <ConciergeMark size={26} />
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold">{site.name}</p>
          <p className="text-[11.5px] text-text-tertiary">Your week · {weekLabel}</p>
        </div>
      </header>

      {/* ---- The line that only we can write --------------------------- */}
      <section className="bg-accent-subtle px-6 py-6">
        <p className="t-eyebrow text-accent-ink">While you were closed</p>
        <p className="t-display mt-3 text-[30px] leading-[1.05]">{afterHours} conversations</p>
        <p className="t-body mt-3 text-text-secondary">
          {afterHours} of this week&rsquo;s {conversations} arrived outside your opening hours. Every one of
          them was answered.
        </p>
      </section>

      {/* ---- The week in four figures ---------------------------------- */}
      <section className="grid grid-cols-2 border-b border-divider">
        {[
          { Sticker: ChatSticker, value: String(conversations), label: "Conversations" },
          { Sticker: LeadSticker, value: String(leads), label: "Qualified leads" },
          { Sticker: SalesSticker, value: String(bookings), label: "Bookings made" },
          { Sticker: HandoffSticker, value: String(handoffs), label: "Passed to a person" },
        ].map(({ Sticker, value, label }, i) => (
          <div
            key={label}
            className={cx(
              "px-6 py-5",
              i % 2 === 1 && "border-l border-divider",
              i > 1 && "border-t border-divider",
            )}
          >
            <Sticker size={26} />
            <p className="t-num mt-3 text-[22px] leading-none">{value}</p>
            <p className="mt-1.5 text-[12px] font-medium">{label}</p>
          </div>
        ))}
      </section>

      {/* ---- Money, kept honest ---------------------------------------- */}
      <section className="border-b border-divider px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-eyebrow text-text-muted">Confirmed this week</p>
            <p className="t-num mt-2 text-[22px] leading-none">{money(confirmed, site.currency)}</p>
            <p className="mt-1.5 text-[11.5px] text-text-tertiary">
              Settled. {money(estimated, site.currency)} more is estimated and kept separate.
            </p>
          </div>
          <Sparkline points={series} width={120} height={34} />
        </div>
      </section>

      {/* ---- The one thing that needs them ------------------------------ */}
      {(topGap || needsYou.length > 0) && (
        <section className="px-6 py-5">
          <p className="t-eyebrow text-text-muted">Worth five minutes</p>

          {topGap && (
            <div className="mt-3 flex items-start gap-3 border border-accent-line bg-accent-subtle p-4">
              <GapSticker size={28} className="shrink-0" />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium">&ldquo;{topGap.question}&rdquo;</p>
                <p className="mt-1.5 text-[12px] leading-[1.5] text-text-secondary">
                  Asked {topGap.askCount} times this week and answered by nobody. Adding it takes a minute and
                  Concierge uses it immediately.
                </p>
              </div>
            </div>
          )}

          {needsYou.map((n) => (
            <div key={n.title} className="mt-2.5 border border-line-strong p-4">
              <p className="text-[12.5px] font-medium">{n.title}</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-text-tertiary">{n.detail}</p>
            </div>
          ))}
        </section>
      )}

      {/* ---- Foot ------------------------------------------------------- */}
      <footer className="border-t border-divider bg-surface-subtle px-6 py-5">
        <p className="text-[12px] leading-[1.55] text-text-secondary">
          Every figure traces back to the conversation that produced it. Estimates are never added to
          confirmed money.
        </p>
        <p className="mt-3 text-[11px] text-text-tertiary">
          Concierge · {site.url} · You are getting this weekly. Change it in Settings.
        </p>
      </footer>
    </article>
  );
}
