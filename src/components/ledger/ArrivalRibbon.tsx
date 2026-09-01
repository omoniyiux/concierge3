"use client";

import { cx } from "@/lib/cx";

/* ============================================================================
   ARRIVAL RIBBON
   ----------------------------------------------------------------------------
   Twenty-four hours across, one bar per hour, with the business's own opening
   envelope shaded behind them. The argument the chart makes is the one the
   owner cannot make from a total: the bars standing outside the shading are
   people who arrived when there was nobody to answer them.

   Orange marks exactly those bars and nothing else on the page — it is the
   signal, not the series colour.
   ========================================================================== */

const W = 720;
const H = 108;
const PAD_T = 10;
const PAD_B = 22;
const PAD_X = 2;

function hhmm(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

export function ArrivalRibbon({
  hours,
  opens,
  closes,
  className,
}: {
  /** Twenty-four counts, midnight first. */
  hours: number[];
  /** Minutes from midnight. Omit both for a business with no fixed hours. */
  opens?: number;
  closes?: number;
  className?: string;
}) {
  const max = Math.max(...hours, 1);
  const innerH = H - PAD_T - PAD_B;
  const slot = (W - PAD_X * 2) / 24;
  const barW = slot - 5;

  const openHour = opens !== undefined ? opens / 60 : null;
  const closeHour = closes !== undefined ? closes / 60 : null;
  const bandX = openHour !== null ? PAD_X + openHour * slot : 0;
  const bandW = openHour !== null && closeHour !== null ? (closeHour - openHour) * slot : 0;

  /** An hour is "closed" when it starts before opening or at/after closing. */
  const isClosed = (h: number) =>
    openHour === null || closeHour === null ? false : h < Math.floor(openHour) || h >= closeHour;

  const closedTotal = hours.reduce((n, v, h) => (isClosed(h) ? n + v : n), 0);
  const total = hours.reduce((n, v) => n + v, 0);

  return (
    <figure className={cx("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        role="img"
        aria-label={`Arrivals by hour of day. ${closedTotal} of ${total} conversations began outside opening hours.`}
      >
        {/* The open window, drawn behind everything ---------------------- */}
        {bandW > 0 && (
          <>
            <rect
              x={bandX}
              y={PAD_T - 4}
              width={bandW}
              height={innerH + 4}
              fill="var(--color-surface-sunken)"
            />
            <line
              x1={bandX}
              x2={bandX}
              y1={PAD_T - 4}
              y2={PAD_T + innerH}
              stroke="var(--color-line-hover)"
              strokeWidth="1"
            />
            <line
              x1={bandX + bandW}
              x2={bandX + bandW}
              y1={PAD_T - 4}
              y2={PAD_T + innerH}
              stroke="var(--color-line-hover)"
              strokeWidth="1"
            />
          </>
        )}

        {/* Baseline ------------------------------------------------------- */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={PAD_T + innerH}
          y2={PAD_T + innerH}
          stroke="var(--color-line-strong)"
          strokeWidth="1"
        />

        {/* Bars ----------------------------------------------------------- */}
        {hours.map((v, h) => {
          const barH = v === 0 ? 0 : Math.max(2, (v / max) * innerH);
          const closed = isClosed(h);
          return (
            <rect
              key={h}
              x={PAD_X + h * slot + 2.5}
              y={PAD_T + innerH - barH}
              width={barW}
              height={barH}
              fill={closed ? "var(--color-accent)" : "var(--color-text-secondary)"}
            />
          );
        })}

        {/* Hour marks: the two that carry meaning are the opening times --- */}
        {[0, 6, 12, 18].map((h) => (
          <text
            key={h}
            x={PAD_X + h * slot + slot / 2}
            y={H - 7}
            textAnchor="middle"
            className="fill-[var(--color-text-muted)] text-[9.5px]"
          >
            {h === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`}
          </text>
        ))}
        {opens !== undefined && (
          <text
            x={bandX}
            y={H - 7}
            textAnchor="middle"
            className="fill-[var(--color-text-secondary)] text-[9.5px] font-medium"
          >
            {hhmm(opens)}
          </text>
        )}
        {closes !== undefined && (
          <text
            x={bandX + bandW}
            y={H - 7}
            textAnchor="middle"
            className="fill-[var(--color-text-secondary)] text-[9.5px] font-medium"
          >
            {hhmm(closes)}
          </text>
        )}
      </svg>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span className="flex items-center gap-2 text-[11.5px] text-text-tertiary">
          <span className="h-2.5 w-2.5 bg-text-secondary" aria-hidden />
          Arrived while you were open
        </span>
        <span className="flex items-center gap-2 text-[11.5px] text-text-tertiary">
          <span className="h-2.5 w-2.5 bg-accent" aria-hidden />
          Arrived when nobody was there
        </span>
      </figcaption>
    </figure>
  );
}
