/* ============================================================================
   BENCHMARKS
   ----------------------------------------------------------------------------
   "Booking converts at 41%" means nothing on its own. "41% against 34% for
   practices your size" means something immediately — and it is a number
   nobody can copy from a standing start, because it only exists once you have
   the customers.

   Two rules, or it becomes a vanity chart:

   1. A peer set is only shown when it is large enough to be worth quoting.
      Below the floor the figure is withheld rather than softened.
   2. Being below the median is never dressed up. It is stated, with the one
      thing that usually moves it.
   ========================================================================== */

export type Vertical = "dental" | "legal" | "home-services" | "clinic" | "retail" | "other";

export const VERTICAL_LABEL: Record<Vertical, string> = {
  dental: "dental practices",
  legal: "law firms",
  "home-services": "home services businesses",
  clinic: "clinics",
  retail: "retailers",
  other: "businesses",
};

export type Benchmark = {
  key: string;
  label: string;
  /** This site's figure. */
  value: number;
  /** The middle of the peer set. */
  median: number;
  /** What the top quarter achieve, so there is somewhere to aim. */
  topQuartile: number;
  unit: "percent" | "number" | "minutes";
  /** Said plainly, whichever side of the median they land on. */
  note: string;
};

/** Below this many businesses, a peer figure is not worth quoting. */
export const PEER_FLOOR = 40;

export type PeerSet = {
  vertical: Vertical;
  /** How many businesses the comparison is drawn from. */
  size: number;
  sizeBand: string;
  benchmarks: Benchmark[];
};

export function peerSetFor(siteId: string): PeerSet | null {
  if (siteId !== "site_northlane") return null;
  return {
    vertical: "dental",
    size: 312,
    sizeBand: "single-location practices",
    benchmarks: [
      {
        key: "booking-conversion",
        label: "Booking intent that reaches an action",
        value: 41,
        median: 34,
        topQuartile: 48,
        unit: "percent",
        note: "Ahead of the median. The gap is mostly your opening-hours answer, which most practices leave vague.",
      },
      {
        key: "pricing-conversion",
        label: "Pricing intent that reaches an action",
        value: 22,
        median: 29,
        topQuartile: 38,
        unit: "percent",
        note: "Behind the median. Practices above it publish a starting price rather than “it depends” — Concierge can only be as specific as your approved knowledge.",
      },
      {
        key: "after-hours",
        label: "Conversations arriving out of hours",
        value: 36,
        median: 31,
        topQuartile: 44,
        unit: "percent",
        note: "Normal for a practice with evening search traffic. It is the strongest argument for answering at all.",
      },
      {
        key: "resolved",
        label: "Resolved without a person",
        value: 83,
        median: 71,
        topQuartile: 85,
        unit: "percent",
        note: "Near the top quartile. Your Site Brain coverage is doing the work here.",
      },
    ],
  };
}

export function standing(b: Benchmark): "ahead" | "behind" | "level" {
  if (b.value >= b.topQuartile) return "ahead";
  if (b.value < b.median - 1) return "behind";
  return b.value > b.median + 1 ? "ahead" : "level";
}

export function formatBenchmark(b: Benchmark, value = b.value): string {
  if (b.unit === "percent") return `${value}%`;
  if (b.unit === "minutes") return `${value} min`;
  return String(value);
}
