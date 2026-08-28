"use client";

import { ConciergeMark } from "@/components/shell/ConciergeMark";
import { ChatSticker, LeadSticker, PhoneSticker, LiveSticker } from "@/components/stickers";
import { cx } from "@/lib/cx";
import {
  BILLED_FROM,
  BILLED_TO,
  invoiceDate,
  invoiceMoney,
  invoiceTotals,
  type Invoice,
} from "@/lib/invoices";

/* ============================================================================
   THE INVOICE
   Most invoices are a table with a logo above it. This one is a Concierge
   document: the amount is the headline, set in the display face at the size
   the page deserves; the plan is stated in a sentence rather than a code; and
   the period's usage sits underneath in the product's own drawings, because
   what an owner wants from an invoice — beyond the figure — is the feeling
   that the figure was worth it.

   Rules, not shadows. Square, not rounded. Orange exactly twice.
   ========================================================================== */

const USAGE_STICKER = [ChatSticker, LeadSticker, PhoneSticker, LiveSticker];

const STATUS_COPY: Record<Invoice["status"], { label: string; className: string }> = {
  paid: { label: "Paid in full", className: "border-success-line bg-success-soft text-success" },
  due: { label: "Due", className: "border-warning-line bg-warning-soft text-warning" },
  failed: { label: "Payment failed", className: "border-danger-line bg-danger-soft text-danger" },
};

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const { subtotal, tax, total } = invoiceTotals(invoice);
  const status = STATUS_COPY[invoice.status];

  return (
    <article className="bg-surface text-text-primary">
      {/* ---- Masthead ---------------------------------------------------- */}
      <header className="flex items-start justify-between gap-8">
        <div className="flex items-center gap-3">
          <ConciergeMark size={34} />
          <span
            className="text-[17px] font-medium tracking-[-0.028em]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Concierge
          </span>
        </div>
        <div className="text-right">
          <p className="t-eyebrow text-accent-ink">Invoice</p>
          <p className="t-num mt-2 text-[14px] leading-none">{invoice.number}</p>
        </div>
      </header>

      {/* ---- The figure, which is what anyone opens an invoice for ------- */}
      <section className="mt-7 border-t-2 border-ink pt-7">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow text-text-muted">Amount {invoice.status === "paid" ? "paid" : "due"}</p>
            <p className="t-display mt-3 text-[46px] leading-[0.95]">
              {invoiceMoney(total, invoice.currency)}
            </p>
            <p className="t-body mt-3 text-text-secondary">
              {invoice.lines[0].description} · {invoiceDate(invoice.periodStart)} to{" "}
              {invoiceDate(invoice.periodEnd)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span
              className={cx(
                "inline-flex items-center gap-2 border px-3 py-1.5 text-[12px] font-semibold",
                status.className,
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {status.label}
            </span>
            {invoice.paidOn && (
              <p className="t-body-sm text-text-tertiary">Received {invoiceDate(invoice.paidOn)}</p>
            )}
          </div>
        </div>
      </section>

      {/* ---- Parties ------------------------------------------------------ */}
      <section className="mt-8 grid grid-cols-3 gap-6 border-t border-line-strong pt-6">
        <div>
          <p className="t-eyebrow text-text-muted">Billed to</p>
          <p className="mt-3 text-[12.5px] font-semibold">{BILLED_TO.name}</p>
          <p className="mt-1 text-[12.5px] text-text-secondary">Attn. {BILLED_TO.attention}</p>
          <address className="mt-2 not-italic text-[12.5px] leading-[1.55] text-text-tertiary">
            {BILLED_TO.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-2 text-[12.5px] text-text-tertiary">{BILLED_TO.taxId}</p>
        </div>

        <div>
          <p className="t-eyebrow text-text-muted">From</p>
          <p className="mt-3 text-[12.5px] font-semibold">{BILLED_FROM.name}</p>
          <address className="mt-2 not-italic text-[12.5px] leading-[1.55] text-text-tertiary">
            {BILLED_FROM.lines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <p className="mt-2 text-[12.5px] text-text-tertiary">{BILLED_FROM.email}</p>
          <p className="mt-1 text-[12.5px] text-text-tertiary">{BILLED_FROM.taxId}</p>
        </div>

        <div>
          <p className="t-eyebrow text-text-muted">Details</p>
          <dl className="mt-3 space-y-2">
            {[
              ["Issued", invoiceDate(invoice.issuedOn)],
              ["Period", `${invoiceDate(invoice.periodStart)} — ${invoiceDate(invoice.periodEnd)}`],
              ["Method", `${invoice.payment.method} ending ${invoice.payment.last4}`],
              ["Reference", invoice.payment.reference],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11.5px] text-text-tertiary">{k}</dt>
                <dd className="mt-0.5 break-words text-[12.5px] font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- Lines --------------------------------------------------------- */}
      <section className="cg-avoid-break mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-ink">
              <th className="t-eyebrow pb-3 text-text-muted">Description</th>
              <th className="t-eyebrow pb-3 text-right text-text-muted">Qty</th>
              <th className="t-eyebrow pb-3 text-right text-text-muted">Unit</th>
              <th className="t-eyebrow pb-3 text-right text-text-muted">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l) => (
              <tr key={l.description} className="border-b border-divider align-top">
                <td className="py-4">
                  <p className="text-[13px] font-semibold">{l.description}</p>
                  <p className="mt-1 text-[12px] text-text-tertiary">{l.detail}</p>
                </td>
                <td className="py-4 text-right text-[12.5px] tabular-nums">{l.quantity}</td>
                <td className="py-4 text-right text-[12.5px] tabular-nums">
                  {invoiceMoney(l.unit, invoice.currency)}
                </td>
                <td className="py-4 text-right text-[13px] font-semibold tabular-nums">
                  {invoiceMoney(l.quantity * l.unit, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <dl className="w-[260px]">
            <div className="flex items-baseline justify-between py-1.5">
              <dt className="text-[12.5px] text-text-secondary">Subtotal</dt>
              <dd className="text-[12.5px] tabular-nums">{invoiceMoney(subtotal, invoice.currency)}</dd>
            </div>
            <div className="flex items-baseline justify-between py-1.5">
              <dt className="text-[12.5px] text-text-secondary">Sales tax · 8.25%</dt>
              <dd className="text-[12.5px] tabular-nums">{invoiceMoney(tax, invoice.currency)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t-2 border-ink pt-3">
              <dt className="t-section">Total</dt>
              <dd className="t-num text-[22px] leading-none">{invoiceMoney(total, invoice.currency)}</dd>
            </div>
            {invoice.status === "paid" && (
              <p className="mt-2 text-right text-[11.5px] font-medium text-success">
                Paid {invoice.paidOn ? invoiceDate(invoice.paidOn) : ""} — nothing outstanding
              </p>
            )}
          </dl>
        </div>
      </section>

      {/* ---- What the money bought ----------------------------------------- */}
      <section className="cg-avoid-break mt-8 border border-accent-line bg-accent-subtle">
        <div className="border-b border-accent-line px-5 py-4">
          <p className="t-eyebrow text-accent-ink">What this period produced</p>
          <p className="t-body-sm mt-1.5 text-text-secondary">
            Included in the plan. Nothing here is charged by the unit.
          </p>
        </div>
        <div className="grid grid-cols-4">
          {invoice.usage.map((u, i) => {
            const Sticker = USAGE_STICKER[i % USAGE_STICKER.length];
            return (
              <div key={u.label} className={cx("px-5 py-4", i > 0 && "border-l border-accent-line")}>
                <Sticker size={26} />
                <p className="t-num mt-3 text-[19px] leading-none">{u.value}</p>
                <p className="mt-1.5 text-[12px] font-semibold">{u.label}</p>
                <p className="mt-1 text-[11.5px] leading-[1.4] text-text-secondary">{u.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---- Foot ----------------------------------------------------------- */}
      <footer className="mt-8 flex items-end justify-between gap-8 border-t border-line-strong pt-5">
        <div className="max-w-[46ch]">
          <p className="t-serif text-[15px] leading-[1.4]">Thank you — the front desk never slept.</p>
          <p className="t-body-sm mt-2.5 leading-[1.55] text-text-tertiary">
            Questions about this invoice? Reply to {BILLED_FROM.email} quoting {invoice.number} and a person
            will answer. Retain this document for your records.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <ConciergeMark size={26} />
          <p className="t-body-sm mt-2 text-text-tertiary">poweredbyconcierge.com</p>
        </div>
      </footer>
    </article>
  );
}
