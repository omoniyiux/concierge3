"use client";

import { useState } from "react";
import { Badge, Button, Card, Field, Input, Panel, SectionHead, Select, Toggle } from "@/components/ui";
import { ConciergeMark } from "@/components/shell/ConciergeMark";
import { CheckIcon, GlobeIcon, MailIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { ORG, SITES } from "@/lib/demo-data";

/* ============================================================================
   AGENCY
   ----------------------------------------------------------------------------
   An agency reselling Concierge is not selling Concierge — it is selling the
   thing it always sold, now able to answer at two in the morning. So the
   parts a client sees can carry the agency's name instead of ours: the
   monthly report, the emails, and the badge on the launcher.

   What is never white-labelled: the consent language a visitor is shown, and
   the fact that an agent is answering. Those belong to the visitor.
   ========================================================================== */

const REPORT_SENDERS = [
  { value: "agency", label: "From the agency — reports come from your address" },
  { value: "concierge", label: "From Concierge — we send, you are cc'd" },
];

export function AgencySettings() {
  const [brandName, setBrandName] = useState(ORG.name);
  const [replyTo, setReplyTo] = useState("hello@collabauto.co");
  const [domain, setDomain] = useState("concierge.collabauto.co");
  const [sender, setSender] = useState("agency");
  const [hideMark, setHideMark] = useState(true);
  const [clientAccess, setClientAccess] = useState(true);
  const [rebill, setRebill] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <>
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <Badge tone="accent">Agency</Badge>
        <p className="min-w-0 flex-1 text-[12.5px] leading-[1.5] text-text-secondary">
          <span className="font-medium text-text-primary">
            {SITES.length} client sites on the {ORG.plan} plan.
          </span>{" "}
          Everything below applies to every one of them.
        </p>
      </Card>

      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="Your brand, not ours"
          hint="What a client sees on a report, an email, or the badge under the launcher."
          className="mb-5"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name" htmlFor="ag-name" hint="Used wherever a client would read a sender.">
            <Input id="ag-name" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </Field>
          <Field label="Reply-to address" htmlFor="ag-reply" hint="Where a client's reply actually lands.">
            <Input id="ag-reply" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
          </Field>
          <Field
            label="Workspace domain"
            htmlFor="ag-domain"
            className="sm:col-span-2"
            hint="Clients sign in here instead of at poweredbyconcierge.com. We issue the certificate."
          >
            <Input id="ag-domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </Field>
        </div>

        <div className="mt-5 space-y-3">
          <Row
            title="Hide the Concierge mark on the launcher"
            description="The badge under the launcher reads your brand instead. Visitors are still told they are talking to an assistant."
            control={<Toggle checked={hideMark} onChange={setHideMark} label="Hide the Concierge mark" />}
          />
          <Row
            title="Let clients sign in to their own site"
            description="They see conversations, leads and their report — never billing, and never your other clients."
            control={
              <Toggle checked={clientAccess} onChange={setClientAccess} label="Client sign-in" />
            }
          />
        </div>

        {/* What the client will actually receive. */}
        <div className="mt-6 border border-line-strong">
          <p className="t-eyebrow border-b border-divider bg-surface-subtle px-4 py-2.5 text-text-muted">
            What a client sees
          </p>
          <div className="flex items-start gap-3 p-4">
            <span
              className={cx(
                "flex h-9 w-9 shrink-0 items-center justify-center text-[11px] font-semibold",
                hideMark ? "bg-ink text-text-inverse" : "bg-surface-subtle",
              )}
            >
              {hideMark ? (
                brandName
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
              ) : (
                <ConciergeMark size={22} />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium">
                {brandName} · Monthly report for Northlane Dental
              </p>
              <p className="mt-1 text-[12px] leading-[1.5] text-text-tertiary">
                From {replyTo} · &ldquo;Concierge handled 214 conversations, 78 of them while you were
                closed, and booked 34 appointments.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="Client reporting"
          hint="The artefact a client forwards to their partner. It is what keeps them paying you."
          className="mb-5"
        />
        <Field label="Reports are sent" htmlFor="ag-sender">
          <Select id="ag-sender" value={sender} onChange={(e) => setSender(e.target.value)}>
            {REPORT_SENDERS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <p className="mt-4 flex items-start gap-2.5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
          <MailIcon size={14} className="mt-px shrink-0 text-text-tertiary" />
          Every client gets a weekly summary and a monthly report. You are copied on all of them, and you
          can read what was sent before they open it.
        </p>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="Billing"
          hint="You are billed for the whole portfolio. What you charge a client is your business."
          className="mb-5"
        />
        <Row
          title="Show each client what their site costs you"
          description="Off by default. Most agencies bundle Concierge into a retainer rather than itemising it."
          control={<Toggle checked={rebill} onChange={setRebill} label="Show client cost" />}
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-divider pt-4">
          <div>
            <p className="t-eyebrow text-text-muted">Sites</p>
            <p className="t-num mt-1.5 text-[15px] leading-none">
              {SITES.length}
              <span className="ml-1.5 text-[11.5px] font-normal text-text-tertiary">
                of {ORG.siteLimit}
              </span>
            </p>
          </div>
          <div>
            <p className="t-eyebrow text-text-muted">Domain</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px]">
              <GlobeIcon size={13} className="text-text-tertiary" />
              {domain}
            </p>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          leading={<CheckIcon size={13} />}
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2600);
          }}
        >
          Save agency settings
        </Button>
        {saved && (
          <span className="cg-enter text-[12px] font-medium text-success">
            Saved · applied to all {SITES.length} client sites
          </span>
        )}
      </div>
    </>
  );
}

function Row({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 bg-surface-subtle px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium">{title}</p>
        {description && <p className="mt-0.5 text-[12px] leading-[1.45] text-text-tertiary">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
