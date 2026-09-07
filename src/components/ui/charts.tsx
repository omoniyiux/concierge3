"use client";

import { useId } from "react";
import { cx } from "@/lib/cx";
import type { MetricPoint } from "@/lib/types";

/* ============================================================================
   CHARTS
   Hand-rolled SVG — no charting dependency. Every chart answers a business
   question; none of them exist to fill space. One accent colour, one ink
   colour, nothing rainbow.
   ========================================================================== */

function path(points: MetricPoint[], w: number, h: number, pad = 2) {
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  return points.map((p, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (p.value - min) / span);
    return { x, y };
  });
}

/** Inline trend, used beside a number. Never carries an axis. */
export function Sparkline({
  points,
  width = 72,
  height = 24,
  tone = "ink",
  className,
}: {
  points: MetricPoint[];
  width?: number;
  height?: number;
  tone?: "ink" | "accent" | "success" | "danger";
  className?: string;
}) {
  if (points.length < 2) return null;
  const pts = path(points, width, height);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const stroke =
    tone === "accent"
      ? "var(--color-accent)"
      : tone === "success"
        ? "var(--color-success)"
        : tone === "danger"
          ? "var(--color-danger)"
          : "var(--color-text-secondary)";
  return (
    <svg width={width} height={height} className={cx("overflow-visible", className)} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="2" fill={stroke} />
    </svg>
  );
}

/** The one chart with axes. Used where trend over time is the point. */
export function AreaChart({
  points,
  height = 200,
  label,
  valueSuffix = "",
}: {
  points: MetricPoint[];
  height?: number;
  label: string;
  valueSuffix?: string;
}) {
  const gid = useId();
  const w = 720;
  const h = height;
  const padL = 34;
  const padB = 24;
  const padT = 12;
  const vals = points.map((p) => p.value);
  const max = Math.max(...vals);
  const min = 0;
  const span = max - min || 1;
  const innerW = w - padL - 12;
  const innerH = h - padT - padB;
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;

  const pts = points.map((p, i) => ({
    x: padL + i * step,
    y: padT + innerH * (1 - (p.value - min) / span),
    p,
  }));
  const line = pts.map((q, i) => `${i === 0 ? "M" : "L"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const ticks = [0, 0.5, 1].map((t) => ({
    y: padT + innerH * (1 - t),
    v: Math.round(min + span * t),
  }));

  return (
    <figure className="w-full">
      <figcaption className="sr-only">{label}</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} role="img" aria-label={label}>
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t.v}>
            <line x1={padL} x2={w - 12} y1={t.y} y2={t.y} stroke="var(--color-divider)" strokeWidth="1" />
            <text x={padL - 8} y={t.y + 3.5} textAnchor="end" className="fill-[var(--color-text-muted)] text-[10px]">
              {t.v}
              {valueSuffix}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gid}-fill)`} />
        <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />

        {pts.map((q, i) =>
          i % 3 === 0 || i === pts.length - 1 ? (
            <text
              key={q.p.date}
              x={q.x}
              y={h - 6}
              textAnchor="middle"
              className="fill-[var(--color-text-muted)] text-[10px]"
            >
              {new Date(q.p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </text>
          ) : null,
        )}
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3.2" fill="var(--color-accent)" />
      </svg>
    </figure>
  );
}

/**
 * Ranked bars. Better than a pie for "what are visitors actually asking?" —
 * it stays readable, sorts meaningfully and needs no legend.
 */
export function BarList({
  items,
  valueLabel,
  className,
}: {
  items: { label: string; value: number; sub?: string; href?: string }[];
  valueLabel?: string;
  className?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className={cx("space-y-1", className)}>
      {items.map((item) => (
        <li key={item.label} className="group relative">
          <div className="relative flex items-center gap-3 rounded-lg px-2.5 py-2">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-lg bg-accent-soft transition-[width] duration-[var(--dur-large)] ease-[var(--ease-out-cg)]"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
            <span className="relative min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{item.label}</span>
              {item.sub && <span className="block truncate text-[11.5px] text-text-tertiary">{item.sub}</span>}
            </span>
            <span className="relative shrink-0 text-[13px] font-semibold tabular-nums">
              {item.value}
              {valueLabel && <span className="ml-1 text-[11.5px] font-normal text-text-tertiary">{valueLabel}</span>}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A single proportion, shown honestly. Used for coverage and readiness. */
export function RadialGauge({
  value,
  size = 64,
  label,
  tone = "accent",
}: {
  value: number;
  size?: number;
  label: string;
  tone?: "accent" | "success" | "ink";
}) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const stroke =
    tone === "success" ? "var(--color-success)" : tone === "ink" ? "var(--color-ink)" : "var(--color-accent)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-sunken)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
          className="transition-[stroke-dashoffset] duration-[600ms] ease-[var(--ease-out-cg)]"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold tabular-nums">
        {value}%
      </span>
    </div>
  );
}
