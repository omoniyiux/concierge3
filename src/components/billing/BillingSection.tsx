"use client";

import { useRef, useState } from "react";
import { Badge, Button, Card, Panel, SectionHead } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { InvoiceDocument } from "@/components/billing/InvoiceDocument";
import { CheckIcon, DotIcon, UploadIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { ORG } from "@/lib/demo-data";
import { INVOICES, invoiceMoney, invoiceShortDate, invoiceTotals, type Invoice } from "@/lib/invoices";
import { printElement } from "@/lib/print";

/* ============================================================================
   PLAN & BILLING
   Three questions, in the order they are asked: what am I on, what have I
   used, and what have I been charged. Every row ends in a document you can
   actually keep.
   ========================================================================== */

const PLANS = [
  {
    key: "starter",
    name: "Starter",
    price: 39,
    blurb: "One site, for a business finding its feet.",
    includes: ["1 site", "Unlimited conversations", "50 SMS a month", "Email routing"],
  },
  {
    key: "growth",
    name: "Growth",
    price: 99,
    blurb: "Up to five sites, with every routing destination.",
    includes: ["5 sites", "Unlimited conversations", "250 SMS a month", "Every integration", "5 seats"],
  },
  {
    key: "scale",
    name: "Scale",
    price: 249,
    blurb: "For agencies and multi-location operators.",
    includes: ["25 sites", "Unlimited conversations", "1,000 SMS a month", "Priority support", "20 seats"],
  },
];

export function BillingSection() {
  const [plan, setPlan] = useState(ORG.plan as string);
  const [changing, setChanging] = useState(false);
  const [viewing, setViewing] = useState<Invoice | null>(null);
  const current = PLANS.find((p) => p.key === plan) ?? PLANS[1];

  return (
    <>
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="t-eyebrow text-text-muted">Current plan</p>
            <p className="t-section mt-2">{current.name}</p>
            <p className="t-body-sm mt-1.5 text-text-tertiary">
              {current.includes[0]} · unlimited conversations · renews 1 October 2026
            </p>
          </div>
          <Button variant="secondary" onClick={() => setChanging(true)}>
            Change plan
          </Button>
        </div>
      </Card>

      <Panel className="p-6">
        <SectionHead title="This month" className="mb-5" />
        <dl className="grid gap-5 sm:grid-cols-3">
          {[
            ["Conversations", "386", "Unlimited"],
            ["SMS sent", "27", "of 250"],
            ["Sites", "3", `of ${ORG.siteLimit}`],
          ].map(([label, value, limit]) => (
            <div key={label}>
              <dt className="t-eyebrow text-text-muted">{label}</dt>
              <dd className="t-num mt-2 text-[15.5px] leading-none">
                {value}
                <span className="ml-1.5 text-[11.5px] font-normal text-text-tertiary">{limit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel className="overflow-hidden">
        <SectionHead
          title="Invoices"
          hint="Every invoice is a document, not a receipt line. Open one to read it or save it as a PDF."
          className="p-6 pb-4"
        />
        <ul className="divide-y divide-divider border-t border-divider">
          {INVOICES.map((invoice) => (
            <li
              key={invoice.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-3.5 sm:px-6"
            >
              <div className="min-w-[150px] flex-1">
                <p className="text-[12.5px] font-medium">{invoiceShortDate(invoice.issuedOn)}</p>
                <p className="mt-0.5 text-[11.5px] text-text-tertiary">{invoice.number}</p>
              </div>
              <span className="text-[12.5px] tabular-nums">
                {invoiceMoney(invoiceTotals(invoice).total, invoice.currency)}
              </span>
              <Badge tone="approved">Paid</Badge>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => setViewing(invoice)}>
                  View
                </Button>
                <InvoiceDownloadButton invoice={invoice} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <InvoicePreview invoice={viewing} onClose={() => setViewing(null)} />

      <Modal
        open={changing}
        onClose={() => setChanging(false)}
        size="lg"
        eyebrow="Plan & billing"
        title="Change your plan"
        description="Changes take effect on your next renewal. Nothing about your sites, knowledge or routing changes when you move."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setChanging(false)}>
              Cancel
            </Button>
            <Button onClick={() => setChanging(false)}>Confirm {current.name}</Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => {
            const active = p.key === plan;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPlan(p.key)}
                aria-pressed={active}
                className={cx(
                  "flex h-full flex-col border p-4 text-left transition-colors",
                  active ? "border-ink ring-1 ring-ink" : "border-line-strong hover:border-line-hover",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="t-card">{p.name}</span>
                  {active && <CheckIcon size={14} strokeWidth={2.4} />}
                </div>
                <p className="t-num mt-3 text-[20px] leading-none">
                  ${p.price}
                  <span className="ml-1 text-[11.5px] font-normal text-text-tertiary">/month</span>
                </p>
                <p className="t-body-sm mt-2.5 leading-[1.45] text-text-tertiary">{p.blurb}</p>
                <ul className="mt-3.5 space-y-1.5 border-t border-divider pt-3.5">
                  {p.includes.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-[11.5px] leading-[1.45]">
                      <DotIcon size={5} className="mt-1.5 shrink-0 text-text-muted" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}

/* ---- Downloading ---------------------------------------------------------- */

/**
 * The document is rendered off-screen and printed from there, so the PDF is
 * the same drawing as the one on screen rather than a second implementation
 * of it.
 */
function InvoiceDownloadButton({ invoice, block }: { invoice: Invoice; block?: boolean }) {
  const sheet = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant={block ? "primary" : "tertiary"}
        block={block}
        loading={working}
        leading={<UploadIcon size={13} />}
        onClick={async () => {
          setWorking(true);
          try {
            await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
            if (sheet.current) {
              await printElement(sheet.current, {
                title: `Concierge invoice ${invoice.number}`,
              });
            }
          } finally {
            setWorking(false);
          }
        }}
      >
        Download
      </Button>

      <div
        ref={sheet}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 -z-10 w-[686px] opacity-0"
      >
        <InvoiceDocument invoice={invoice} />
      </div>
    </>
  );
}

/** The invoice on screen is the sheet that prints, at its own size. */
function InvoicePreview({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  if (!invoice) return null;
  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      eyebrow={`Invoice ${invoice.number}`}
      title={invoiceMoney(invoiceTotals(invoice).total, invoice.currency)}
      description={`${invoiceShortDate(invoice.periodStart)} to ${invoiceShortDate(invoice.periodEnd)} · paid in full`}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Close
          </Button>
          <InvoiceDownloadButton invoice={invoice} />
        </>
      }
    >
      <ModalSection>
        {/* The A4 sheet itself. On a narrow screen it scrolls sideways rather
            than reflowing, because a document that reflows is a different
            document to the one that prints. */}
        <div className="cg-scroll overflow-x-auto border border-line-strong bg-surface">
          <div className="w-[686px] p-7">
            <InvoiceDocument invoice={invoice} />
          </div>
        </div>
      </ModalSection>
    </Modal>
  );
}
