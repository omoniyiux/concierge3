/* ============================================================================
   INVOICES
   What an owner is actually charged for, in the shape a document needs it:
   a number, a period, the lines, and the usage behind them. Concierge bills
   on a plan rather than per conversation, so the usage block is there to
   justify the figure rather than to add to it.
   ========================================================================== */

export type InvoiceLine = {
  description: string;
  detail: string;
  quantity: number;
  unit: number;
};

export type Invoice = {
  id: string;
  number: string;
  issuedOn: string;
  paidOn?: string;
  periodStart: string;
  periodEnd: string;
  status: "paid" | "due" | "failed";
  currency: string;
  lines: InvoiceLine[];
  /** What the money bought, in the period's own numbers. */
  usage: { label: string; value: string; detail: string }[];
  payment: { method: string; last4: string; reference: string };
};

const CARD = { method: "Visa", last4: "4242", reference: "ch_3PqR8k2eZvKYlo2C" };

export const BILLED_TO = {
  name: "Collab Auto",
  attention: "Olaifa Promise",
  lines: ["1201 Barton Springs Rd", "Suite 400", "Austin, TX 78704", "United States"],
  email: "olaifapromise1@gmail.com",
  taxId: "US-EIN 88-4120397",
};

export const BILLED_FROM = {
  name: "Concierge, Inc.",
  lines: ["228 Park Avenue South", "New York, NY 10003", "United States"],
  email: "billing@poweredbyconcierge.com",
  taxId: "US-EIN 92-3318874",
};

export const INVOICES: Invoice[] = [
  {
    id: "in_2026_09",
    number: "CGE-2026-0912",
    issuedOn: "2026-09-01",
    paidOn: "2026-09-01",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    status: "paid",
    currency: "USD",
    lines: [
      {
        description: "Growth plan",
        detail: "5 sites · unlimited conversations · 250 SMS included",
        quantity: 1,
        unit: 99,
      },
    ],
    usage: [
      { label: "Conversations", value: "386", detail: "unlimited on this plan" },
      { label: "Qualified leads", value: "74", detail: "up 24% on August" },
      { label: "SMS sent", value: "27", detail: "of 250 included" },
      { label: "Sites live", value: "3", detail: "of 5 included" },
    ],
    payment: CARD,
  },
  {
    id: "in_2026_08",
    number: "CGE-2026-0811",
    issuedOn: "2026-08-01",
    paidOn: "2026-08-01",
    periodStart: "2026-08-01",
    periodEnd: "2026-08-31",
    status: "paid",
    currency: "USD",
    lines: [
      {
        description: "Growth plan",
        detail: "5 sites · unlimited conversations · 250 SMS included",
        quantity: 1,
        unit: 99,
      },
    ],
    usage: [
      { label: "Conversations", value: "327", detail: "unlimited on this plan" },
      { label: "Qualified leads", value: "60", detail: "up 11% on July" },
      { label: "SMS sent", value: "31", detail: "of 250 included" },
      { label: "Sites live", value: "3", detail: "of 5 included" },
    ],
    payment: CARD,
  },
  {
    id: "in_2026_07",
    number: "CGE-2026-0710",
    issuedOn: "2026-07-01",
    paidOn: "2026-07-01",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    status: "paid",
    currency: "USD",
    lines: [
      {
        description: "Growth plan",
        detail: "5 sites · unlimited conversations · 250 SMS included",
        quantity: 1,
        unit: 99,
      },
    ],
    usage: [
      { label: "Conversations", value: "241", detail: "unlimited on this plan" },
      { label: "Qualified leads", value: "54", detail: "first full month" },
      { label: "SMS sent", value: "18", detail: "of 250 included" },
      { label: "Sites live", value: "2", detail: "of 5 included" },
    ],
    payment: CARD,
  },
];

export function invoiceTotals(invoice: Invoice) {
  const subtotal = invoice.lines.reduce((n, l) => n + l.quantity * l.unit, 0);
  // Software as a service in Texas is taxed on 80% of the sale price.
  const tax = Math.round(subtotal * 0.8 * 0.0825 * 100) / 100;
  return { subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 };
}

export function invoiceMoney(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function invoiceDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function invoiceShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
