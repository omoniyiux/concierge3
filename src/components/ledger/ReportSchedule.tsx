"use client";

import { useRef, useState } from "react";
import { Badge, Button, Card, Field, Input, SectionHead, Toggle } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { WeeklyDigest, type DigestData } from "@/components/ledger/WeeklyDigest";
import { CheckIcon, CloseIcon, MailIcon, PlusIcon, SendIcon, UploadIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { longDate, relativeTime } from "@/lib/format";
import { printElement } from "@/lib/print";
import type { OwnerReport } from "@/lib/types";

/* ============================================================================
   WHAT GETS SENT, AND HOW OFTEN
   ----------------------------------------------------------------------------
   The monthly report is what a client forwards. The weekly note is what stops
   them drifting — churn is decided in weeks, and a product that only speaks
   once a month is silent for three of every four decisions.

   Both are here, with their recipients, a real preview of what lands, and a
   way to send one now.
   ========================================================================== */

export function ReportSchedule({
  scheduled,
  previous,
  digest,
}: {
  scheduled?: OwnerReport;
  previous: OwnerReport[];
  digest: DigestData;
}) {
  const [weekly, setWeekly] = useState(true);
  const [monthly, setMonthly] = useState(true);
  const [recipients, setRecipients] = useState<string[]>(
    scheduled?.recipients ?? ["olaifa@northlanedental.com"],
  );
  const [adding, setAdding] = useState("");
  const [preview, setPreview] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(null);
  const sheet = useRef<HTMLDivElement>(null);

  const validNew = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(adding.trim());

  return (
    <>
      <Card className="overflow-hidden">
        <SectionHead
          title="What Concierge sends you"
          hint="Written for someone who will never open the workspace — a partner, a practice manager, a client."
          className="p-6 pb-5"
        />

        {/* ---- The weekly note ------------------------------------------ */}
        <div className="border-t border-divider p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 max-w-[52ch]">
              <div className="flex flex-wrap items-center gap-2">
                <p className="t-card">The weekly note</p>
                <Badge tone="accent">Mondays, 8am</Badge>
              </div>
              <p className="t-body-sm mt-2 leading-[1.5] text-text-tertiary">
                Short, and opens with the number nobody else can give you: what happened while you were
                closed. This is the one that keeps the fortnight honest.
              </p>
              <p className="t-serif mt-3.5 text-[14px] leading-[1.45]">
                &ldquo;{digest.afterHours} of last week&rsquo;s {digest.conversations} conversations arrived
                while you were closed. Every one of them was answered.&rdquo;
              </p>
            </div>
            <Toggle checked={weekly} onChange={setWeekly} label="Send the weekly note" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              leading={<MailIcon size={13} />}
              onClick={() => setPreview(true)}
            >
              Read what lands
            </Button>
            {sentAt ? (
              <span className="flex items-center gap-2 text-[12px] font-medium text-success">
                <CheckIcon size={13} strokeWidth={2.4} />
                Sent {relativeTime(sentAt)} to {recipients.length} recipient
                {recipients.length === 1 ? "" : "s"}
              </span>
            ) : (
              <Button
                size="sm"
                variant="tertiary"
                leading={<SendIcon size={13} />}
                onClick={() => setSentAt(new Date().toISOString())}
              >
                Send this week&rsquo;s now
              </Button>
            )}
          </div>
        </div>

        {/* ---- The monthly report --------------------------------------- */}
        {scheduled && (
          <div className="border-t border-divider p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[52ch]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="t-card">The monthly report</p>
                  <Badge tone="neutral">
                    {scheduled.scheduledFor ? longDate(scheduled.scheduledFor) : "1st of the month"}
                  </Badge>
                </div>
                <p className="t-body-sm mt-2 leading-[1.5] text-text-tertiary">
                  One page, the whole period, written to be forwarded. {scheduled.periodLabel}.
                </p>
                <p className="t-serif mt-3.5 text-[14px] leading-[1.45]">
                  &ldquo;{scheduled.headline}&rdquo;
                </p>
              </div>
              <Toggle checked={monthly} onChange={setMonthly} label="Send the monthly report" />
            </div>
          </div>
        )}

        {/* ---- Who gets them -------------------------------------------- */}
        <div className="border-t border-divider bg-surface-subtle p-6">
          <p className="t-eyebrow text-text-muted">Sent to</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recipients.map((r) => (
              <li
                key={r}
                className="inline-flex items-center gap-2 border border-line-strong bg-surface px-3 py-1.5 text-[12px]"
              >
                {r}
                {recipients.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Remove ${r}`}
                    onClick={() => setRecipients((list) => list.filter((x) => x !== r))}
                    className="text-text-muted transition-colors hover:text-danger"
                  >
                    <CloseIcon size={12} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Field label="Add someone" htmlFor="digest-to" className="min-w-[200px] flex-1 sm:max-w-[320px]">
              <Input
                id="digest-to"
                type="email"
                value={adding}
                onChange={(e) => setAdding(e.target.value)}
                placeholder="partner@northlanedental.com"
              />
            </Field>
            <Button
              variant="secondary"
              disabled={!validNew}
              leading={<PlusIcon size={13} />}
              onClick={() => {
                setRecipients((l) => [...l, adding.trim()]);
                setAdding("");
              }}
            >
              Add
            </Button>
          </div>
          <p className="mt-3 text-[11.5px] leading-[1.5] text-text-tertiary">
            Recipients see the report only. They cannot open conversations, leads or settings, and adding
            one does not use a seat.
          </p>
        </div>

        {previous.length > 0 && (
          <ul className="divide-y divide-divider border-t border-divider">
            {previous.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3">
                <span className="min-w-[140px] text-[12.5px] font-medium">{r.periodLabel}</span>
                <span className="t-meta min-w-0 flex-1 truncate text-text-tertiary">{r.headline}</span>
                <Badge tone="approved">Sent {r.sentAt && relativeTime(r.sentAt)}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ---- What actually lands in the inbox -------------------------- */}
      <Modal
        open={preview}
        onClose={() => setPreview(false)}
        size="lg"
        eyebrow="Weekly note"
        title={`${digest.site.name} · ${digest.weekLabel}`}
        description="Exactly what arrives on Monday morning. Nothing in it needs the workspace to make sense."
        footer={
          <>
            <Button
              variant="secondary"
              leading={<UploadIcon size={13} />}
              onClick={async () => {
                await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
                if (sheet.current)
                  await printElement(sheet.current, {
                    title: `Concierge weekly note — ${digest.site.name}`,
                    widthPx: 560,
                  });
              }}
            >
              Save as PDF
            </Button>
            <Button
              leading={<SendIcon size={13} />}
              onClick={() => {
                setSentAt(new Date().toISOString());
                setPreview(false);
              }}
            >
              Send it now
            </Button>
          </>
        }
      >
        <div className={cx("border border-line-strong bg-canvas p-4 sm:p-6")}>
          <div ref={sheet}>
            <WeeklyDigest data={digest} />
          </div>
        </div>
      </Modal>
    </>
  );
}
