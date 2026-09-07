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
