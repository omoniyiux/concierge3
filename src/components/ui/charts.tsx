"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import type { MetricPoint } from "@/lib/types";

/* ============================================================================
   CHARTS
   Hand-rolled SVG — no charting dependency. Every chart answers a business
   question; none of them exist to fill space.

   Motion here is not decoration: a line draws in the direction time runs, a
   bar grows to its share, a gauge fills to its value. Each one plays once, on
   first paint, and the global prefers-reduced-motion rule turns them off.
   ========================================================================== */

/** True once the browser has painted, and only when motion is welcome. */
function useMotionReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return ready;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

/* ---------------------------------------------------------------------------
   SPARKLINE
   Trend beside a number. It colours itself: a series that ends above where it
   started is green, one that ends below is red. Grey said nothing at all.
   ------------------------------------------------------------------------- */

const TREND_INK = {
  up: { line: "#0F7A4A", wash: "#0F7A4A" },
  down: { line: "#C42A1D", wash: "#C42A1D" },
  flat: { line: "#6B6B6B", wash: "#6B6B6B" },
  accent: { line: "var(--color-accent)", wash: "var(--color-accent)" },
  ink: { line: "#1A1A1A", wash: "#1A1A1A" },
} as const;

export function Sparkline({
  points,
  width = 72,
  height = 24,
  tone = "auto",
  className,
}: {
  points: MetricPoint[];
  width?: number;
  height?: number;
  /** "auto" reads the direction of the series itself. */
  tone?: "auto" | "ink" | "accent" | "success" | "danger";
  className?: string;
}) {
  const gid = useId();
  const ready = useMotionReady();
  if (points.length < 2) return null;

  const first = points[0].value;
  const last = points[points.length - 1].value;
  const direction = last > first ? "up" : last < first ? "down" : "flat";
  const key =
    tone === "auto"
      ? direction
      : tone === "success"
        ? "up"
        : tone === "danger"
          ? "down"
          : tone === "accent"
            ? "accent"
            : "ink";
  const { line, wash } = TREND_INK[key];

  const pts = path(points, width, height, 3);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("");
  const area = `${d} L${pts[pts.length - 1].x.toFixed(1)},${height} L${pts[0].x.toFixed(1)},${height} Z`;
  const end = pts[pts.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cx("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-wash`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={wash} stopOpacity="0.22" />
          <stop offset="100%" stopColor={wash} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid}-wash)`} className={ready ? "cg-rise" : "opacity-0"} />
      <path
        d={d}
        fill="none"
        stroke={line}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={ready ? "cg-draw" : "opacity-0"}
      />
      <circle
        cx={end.x}
        cy={end.y}
        r="2.6"
        fill={line}
        className={ready ? "cg-pop [animation-delay:520ms]" : "opacity-0"}
      />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   AREA CHART
   The one chart with axes. Labels are sized in viewBox units, so they are set
   deliberately large — the SVG is scaled down to the card width and anything
   under 12 here arrives unreadable.
   ------------------------------------------------------------------------- */

export function AreaChart({
  points,
  height = 240,
  label,
  valueSuffix = "",
}: {
  points: MetricPoint[];
  height?: number;
  label: string;
  valueSuffix?: string;
}) {
  const gid = useId();
  const ready = useMotionReady();
  /** Which day the pointer or the keyboard is on. null means "none". */
  const [active, setActive] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const w = 720;
  const h = height;
  const padL = 44;
  const padB = 34;
  const padT = 14;
  const vals = points.map((p) => p.value);
  const max = Math.max(...vals);
  const min = 0;
  const span = max - min || 1;
  const innerW = w - padL - 16;
  const innerH = h - padT - padB;
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;

  const pts = points.map((p, i) => ({
    x: padL + i * step,
    y: padT + innerH * (1 - (p.value - min) / span),
    p,
  }));
  const line = pts.map((q, i) => `${i === 0 ? "M" : "L"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join("");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${padT + innerH} L${padL},${padT + innerH} Z`;

  const ticks = [0, 0.5, 1].map((t) => ({
    y: padT + innerH * (1 - t),
    v: Math.round(min + span * t),
  }));

  const dayLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  /* The SVG scales to the card, so a client x has to come back through the
     viewBox before it means anything in chart units. */
  function indexAt(clientX: number) {
    const el = svgRef.current;
    if (!el) return null;
    const box = el.getBoundingClientRect();
    if (box.width === 0) return null;
    const x = ((clientX - box.left) / box.width) * w;
    const i = step === 0 ? 0 : Math.round((x - padL) / step);
    return Math.max(0, Math.min(points.length - 1, i));
  }

  function onKeyDown(e: ReactKeyboardEvent<SVGSVGElement>) {
    const last = points.length - 1;
    const at = active ?? last;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.min(last, at + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.max(0, at - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(last);
    } else if (e.key === "Escape") {
      setActive(null);
    }
  }

  const cur = active === null ? null : pts[active];

  /* The readout is drawn in chart units so it tracks the point exactly, and
     clamped at both ends so it never hangs off the card. */
  const TIP_W = 168;
  const TIP_H = 52;
  const tipX = cur ? Math.max(padL, Math.min(cur.x - TIP_W / 2, w - 16 - TIP_W)) : 0;
  const tipAbove = cur ? cur.y > padT + TIP_H + 12 : true;
  const tipY = cur ? (tipAbove ? cur.y - TIP_H - 12 : cur.y + 12) : 0;

  return (
    <figure className="w-full">
      <figcaption className="sr-only">{label}</figcaption>
      {/* No fixed pixel height: the viewBox sets the ratio and the SVG takes the
          card's width, so the drawing fills its box instead of being letterboxed
          inside one and leaving a band of white underneath. */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`}
        className="block w-full touch-pan-y focus:outline-none"
        style={{ height: "auto" }}
        role="img"
        aria-label={label}
        tabIndex={0}
        onPointerMove={(e) => setActive(indexAt(e.clientX))}
        onPointerDown={(e) => setActive(indexAt(e.clientX))}
        onPointerLeave={() => setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={onKeyDown}
      >
        <defs>
          <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.20" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - 16} y1={t.y} y2={t.y} stroke="var(--color-line)" strokeWidth="1" />
            <text
              x={padL - 12}
              y={t.y + 5}
              textAnchor="end"
              fill="var(--color-text-tertiary)"
              style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}
            >
              {t.v}
              {valueSuffix}
            </text>
          </g>
        ))}

        <path d={area} fill={`url(#${gid}-fill)`} className={ready ? "cg-rise" : "opacity-0"} />
        <path
          d={line}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className={ready ? "cg-draw" : "opacity-0"}
        />

        {pts.map((q, i) =>
          // Every third day, plus the last one — but never a label close enough
          // to the last that the two collide.
          (i % 3 === 0 && pts.length - 1 - i >= 3) || i === pts.length - 1 ? (
            <text
              key={q.p.date}
              x={Math.min(q.x, w - 34)}
              y={h - 8}
              textAnchor={i === pts.length - 1 ? "end" : "middle"}
              fill="var(--color-text-tertiary)"
              style={{ fontSize: 14 }}
            >
              {new Date(q.p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </text>
          ) : null,
        )}

        {/* The end-of-series marker steps aside while a day is being read, so
            there are never two dots claiming to be the point of interest. */}
        {!cur && (
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="5"
            fill="var(--color-surface)"
            stroke="var(--color-accent)"
            strokeWidth="3"
            className={ready ? "cg-pop [animation-delay:640ms]" : "opacity-0"}
          />
        )}

        {/* ---- Hover / keyboard readout -------------------------------- */}
        {cur && (
          <g pointerEvents="none">
            <line
              x1={cur.x}
              x2={cur.x}
              y1={padT}
              y2={padT + innerH}
              stroke="var(--color-line-strong)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle
              cx={cur.x}
              cy={cur.y}
              r="6"
              fill="var(--color-surface)"
              stroke="var(--color-accent)"
              strokeWidth="3"
            />
            <g transform={`translate(${tipX}, ${tipY})`}>
              <rect
                width={TIP_W}
                height={TIP_H}
                rx="2"
                fill="var(--color-ink)"
                opacity="0.96"
              />
              <text x="12" y="21" fill="#FFFFFF" style={{ fontSize: 13, opacity: 0.72 }}>
                {dayLabel(cur.p.date)}
              </text>
              <text
                x="12"
                y="41"
                fill="#FFFFFF"
                style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
              >
                {cur.p.value}
                {valueSuffix}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Announced to a screen reader as the selection moves; the full series
          is below, because a lone <svg role="img"> cannot be walked. */}
      <p aria-live="polite" className="sr-only">
        {cur ? `${dayLabel(cur.p.date)}: ${cur.p.value}${valueSuffix}` : ""}
      </p>
      <dl className="sr-only">
        {points.map((p) => (
          <div key={p.date}>
            <dt>{dayLabel(p.date)}</dt>
            <dd>
              {p.value}
              {valueSuffix}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

/* ---------------------------------------------------------------------------
   BAR LIST
   Better than a pie for "what are visitors actually asking?" — it stays
   readable, sorts meaningfully and needs no legend.

   Each row carries its own hue so a reader can hold "booking is the blue one"
   across the page. The fill is a soft left-to-right gradient that fades as the
   bar runs out, which keeps the eye on where it starts. Both ends are pale
   enough that ink text on them clears 15:1, so colour never has to be read as
   text — the number at the right says the same thing.
   ------------------------------------------------------------------------- */

const BAR_HUES = [
  { from: "#CBE2FF", to: "#EFF6FF" }, // sky
  { from: "#FFD1E4", to: "#FFF0F6" }, // pink
  { from: "#DCD2FF", to: "#F3F0FF" }, // violet
  { from: "#FFE0B8", to: "#FFF6E8" }, // amber
  { from: "#C8EDDE", to: "#EEF9F4" }, // green
  { from: "#FFD2C7", to: "#FFF1ED" }, // coral
  { from: "#CBEAEF", to: "#EFF9FA" }, // teal
];

export function BarList({
  items,
  valueLabel,
  className,
}: {
  items: { label: string; value: number; sub?: string; href?: string }[];
  valueLabel?: string;
  className?: string;
}) {
  const ready = useMotionReady();
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className={cx("space-y-1.5", className)}>
      {items.map((item, i) => {
        const hue = BAR_HUES[i % BAR_HUES.length];
        return (
          <li key={item.label} className="relative">
            <div className="relative flex items-center gap-3 py-2 pl-3.5 pr-3">
              <span
                aria-hidden
                className={cx("absolute inset-y-0 left-0", ready && "cg-grow-x")}
                style={{
                  width: `${Math.max((item.value / max) * 100, 12)}%`,
                  background: `linear-gradient(90deg, ${hue.from} 0%, ${hue.to} 100%)`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
              <span className="relative min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-semibold text-text-primary">
                  {item.label}
                </span>
                {item.sub && (
                  <span className="mt-0.5 block truncate text-[11.5px] text-text-secondary">{item.sub}</span>
                )}
              </span>
              <span className="relative shrink-0 text-[13px] font-semibold tabular-nums">
                {item.value}
                {valueLabel && (
                  <span className="ml-1 text-[11.5px] font-normal text-text-tertiary">{valueLabel}</span>
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------------------
   RADIAL GAUGE
   A single proportion, shown honestly. The ring sweeps to its value and the
   figure counts with it, so the number reads as something measured rather
   than something printed.
   ------------------------------------------------------------------------- */

export function RadialGauge({
  value,
  size = 64,
  label,
  tone = "accent",
}: {
  value: number;
  size?: number;
  label: string;
  tone?: "accent" | "success" | "ink" | "danger";
}) {
  const stroke = Math.max(5, Math.round(size * 0.095));
  const r = (size - stroke - 2) / 2;
  const c = 2 * Math.PI * r;
  const colour =
    tone === "success"
      ? "var(--color-success)"
      : tone === "danger"
        ? "var(--color-danger)"
        : tone === "ink"
          ? "var(--color-ink)"
          : "var(--color-accent)";

  const [shown, setShown] = useState(0);
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Straight to the value, but scheduled rather than set inline: a
      // synchronous setState in an effect body forces a second render pass.
      frame.current = requestAnimationFrame(() => setShown(value));
      return () => {
        if (frame.current) cancelAnimationFrame(frame.current);
      };
    }
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      // Same curve as --ease-out-cg, so the ring and the figure agree.
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value]);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-surface-sunken)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
        />
      </svg>
      <span
        className="t-num absolute inset-0 flex items-center justify-center"
        style={{ fontSize: Math.max(11, Math.round(size * 0.24)) }}
      >
        {shown}%
      </span>
    </div>
  );
}
