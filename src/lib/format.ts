/** Shared formatting so numbers and times read the same on every surface. */

export function relativeTime(iso: string, now = new Date("2026-09-07T09:00:00Z")): string {
  const then = new Date(iso);
  const mins = Math.round((now.getTime() - then.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return then.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function formatMetric(value: number, format: "number" | "percent" | "duration" | "currency"): string {
  switch (format) {
    case "percent":
      return `${value.toFixed(1)}%`;
    case "duration": {
      const m = Math.floor(value / 60);
      const s = Math.round(value % 60);
      return `${m}m ${s}s`;
    }
    case "currency":
      return `$${value.toLocaleString()}`;
    default:
      return value.toLocaleString();
  }
}

export const INTENT_LABEL: Record<string, string> = {
  pricing: "Pricing",
  booking: "Booking",
  support: "Support",
  product: "Product question",
  human: "Wants a person",
  quote: "Quote request",
  hours: "Hours & location",
  unknown: "Unclear",
};

export const STATUS_LABEL: Record<string, string> = {
  new: "New",
  active: "Active",
  qualified: "Qualified",
  converted: "Converted",
  "handed-off": "Handed off",
  closed: "Closed",
};

export const KNOWLEDGE_STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  "needs-review": "Needs review",
  suggested: "Suggested",
  imported: "Imported",
  restricted: "Restricted",
  missing: "Missing",
};

export const CATEGORY_LABEL: Record<string, string> = {
  business: "Business",
  products: "Products",
  services: "Services",
  pricing: "Pricing",
  faqs: "FAQs",
  policies: "Policies",
  voice: "Brand voice",
  rules: "Rules",
  restrictions: "Restrictions",
};

/* ---- Money --------------------------------------------------------------- */

/**
 * Values are stored in minor units so nothing is ever lost to a float. The
 * ledger shows whole currency units — an owner reading a monthly total does
 * not want cents, and the precision would imply a certainty we do not have.
 */
export function money(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export const OUTCOME_LABEL: Record<string, string> = {
  booking: "Booking",
  payment: "Payment",
  quote: "Quote",
  "lead-routed": "Lead routed",
  answer: "Answered",
  recovered: "Recovered",
};

/** Read aloud, these are the words the owner should hear. */
export const BASIS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  estimated: "Estimated",
  none: "No value claimed",
};

/* ---- Opening hours ------------------------------------------------------- */

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * The widest window the business is ever open, used to shade the arrival
 * ribbon. Days differ, so the band is the outer envelope and the caption
 * says so rather than pretending every day is the same.
 */
export function openingEnvelope(days: ({ opens: number; closes: number } | null)[]): {
  opens: number;
  closes: number;
} | null {
  const open = days.filter((d): d is { opens: number; closes: number } => d !== null);
  if (open.length === 0) return null;
  return {
    opens: Math.min(...open.map((d) => d.opens)),
    closes: Math.max(...open.map((d) => d.closes)),
  };
}

/** "Mon–Thu 8:00–17:00 · Fri 8:00–13:00 · Closed Sat, Sun" */
export function openingSummary(days: ({ opens: number; closes: number } | null)[]): string {
  const hhmm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  const groups: { label: string; days: string[] }[] = [];
  const closed: string[] = [];

  days.forEach((d, i) => {
    const short = DAY_NAMES[i].slice(0, 3);
    if (!d) {
      closed.push(short);
      return;
    }
    const label = `${hhmm(d.opens)}–${hhmm(d.closes)}`;
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.days.push(short);
    else groups.push({ label, days: [short] });
  });

  const span = (g: { label: string; days: string[] }) =>
    g.days.length > 1 ? `${g.days[0]}–${g.days[g.days.length - 1]} ${g.label}` : `${g.days[0]} ${g.label}`;

  const parts = groups.map(span);
  // Sunday is index 0 in the data but reads last in a working week.
  if (closed.length) {
    const ordered = closed[0] === "Sun" ? [...closed.slice(1), "Sun"] : closed;
    parts.push(`Closed ${ordered.join(", ")}`);
  }
  return parts.join(" · ");
}

/* ---- Channels ------------------------------------------------------------ */

export const CHANNEL_LABEL: Record<string, string> = {
  web: "On the site",
  sms: "Text",
  whatsapp: "WhatsApp",
  email: "Email",
};

/** Used on a message that did not arrive the way the thread started. */
export const CHANNEL_VERB: Record<string, string> = {
  web: "on the site",
  sms: "by text",
  whatsapp: "on WhatsApp",
  email: "by email",
};

export const AUTONOMY_LABEL: Record<string, string> = {
  suggest: "Draft only",
  approve: "Draft and wait for me",
  send: "Follow up on its own",
};
