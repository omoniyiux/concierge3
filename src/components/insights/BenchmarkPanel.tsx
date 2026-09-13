"use client";

import { Badge, Panel, SectionHead } from "@/components/ui";
import { cx } from "@/lib/cx";
import {
  PEER_FLOOR,
  VERTICAL_LABEL,
  formatBenchmark,
  standing,
  type Benchmark,
  type PeerSet,
} from "@/lib/benchmarks";

/* ============================================================================
   AGAINST EVERYONE ELSE
   A figure with no comparison is a number an owner has to take on faith.
   Each row draws this site against the middle and the top quarter of its own
   trade, on one scale, with the honest sentence underneath.
   ========================================================================== */

export function BenchmarkPanel({ peers }: { peers: PeerSet }) {
  if (peers.size < PEER_FLOOR) return null;

  return (
    <Panel className="p-5 sm:p-6">
      <SectionHead
        title={`How you compare to other ${VERTICAL_LABEL[peers.vertical]}`}
        hint={`Drawn from ${peers.size} ${peers.sizeBand} using Concierge. Nobody's individual figures are ever shown, here or to them.`}
        className="mb-5"
      />

      <ul className="space-y-5">
        {peers.benchmarks.map((b) => (
          <BenchmarkRow key={b.key} benchmark={b} />
        ))}
      </ul>

      <p className="mt-6 border-t border-divider pt-4 text-[11.5px] leading-[1.5] text-text-tertiary">
        Comparisons use the same period as everything else on this page, and only businesses with at least
        thirty conversations in it. A peer set smaller than {PEER_FLOOR} is withheld rather than estimated.
      </p>
    </Panel>
  );
}

function BenchmarkRow({ benchmark: b }: { benchmark: Benchmark }) {
  const where = standing(b);
  // One scale for all three marks, with headroom past the top quartile.
  const ceiling = Math.max(b.value, b.topQuartile) * 1.18;
  const pct = (n: number) => `${Math.min(100, (n / ceiling) * 100)}%`;

  return (
    <li>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-[12.5px] font-medium">{b.label}</p>
        <div className="flex items-baseline gap-2.5">
          <span className="t-num text-[15px] leading-none">{formatBenchmark(b)}</span>
          <Badge tone={where === "ahead" ? "approved" : where === "behind" ? "review" : "neutral"}>
            {where === "ahead"
              ? `Ahead of ${formatBenchmark(b, b.median)} median`
              : where === "behind"
                ? `Behind ${formatBenchmark(b, b.median)} median`
                : `At the ${formatBenchmark(b, b.median)} median`}
          </Badge>
        </div>
      </div>

      <div className="relative mt-3 h-[22px]">
        {/* The track */}
        <div className="absolute inset-x-0 top-[9px] h-1 bg-surface-sunken" />
        {/* This site */}
        <div
          className={cx("absolute top-[9px] h-1", where === "behind" ? "bg-warning" : "bg-ink")}
          style={{ width: pct(b.value) }}
        />
        {/* The median and the top quartile, as marks rather than bars */}
        <Marker at={pct(b.median)} label="Median" tone="ink" />
        <Marker at={pct(b.topQuartile)} label="Top 25%" tone="muted" />
      </div>

      <p className="mt-2.5 text-[11.5px] leading-[1.5] text-text-tertiary">{b.note}</p>
    </li>
  );
}

function Marker({ at, label, tone }: { at: string; label: string; tone: "ink" | "muted" }) {
  return (
    <span className="absolute top-0 h-[22px]" style={{ left: at }} aria-label={label}>
      <span
        className={cx(
          "absolute left-0 top-[3px] h-[13px] w-px",
          tone === "ink" ? "bg-text-primary" : "bg-text-muted",
        )}
      />
      <span
        className={cx(
          "absolute left-1 top-[11px] whitespace-nowrap text-[9.5px] font-medium",
          tone === "ink" ? "text-text-secondary" : "text-text-muted",
        )}
      >
        {label}
      </span>
    </span>
  );
}
