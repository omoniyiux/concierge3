"use client";

import { useState } from "react";
import { Badge, Button, Field, Input, Panel, SectionHead } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { AlertIcon, CheckIcon, LockIcon, ShieldIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { relativeTime } from "@/lib/format";
import { downloadFile } from "@/lib/download";
import { conversationsFor, leadsFor, outcomesFor } from "@/lib/demo-data";

/* ============================================================================
   DATA RIGHTS
   ----------------------------------------------------------------------------
   Consent was modelled properly from the start — every contact detail carries
   the moment and the basis on which it was given. What was missing was the
   other half: a person can ask for all of it back, or ask for it to be gone,
   and the business has to be able to do that without writing to support.

   Deleting is genuinely destructive here, so it names exactly what goes,
   says what survives and why, and makes you type the address.
   ========================================================================== */

const SUBPROCESSORS = [
  { name: "Anthropic", role: "Generates answers from your approved knowledge", region: "United States" },
  { name: "Amazon Web Services", role: "Hosting and storage", region: "United States (us-east-1)" },
  { name: "Twilio", role: "SMS delivery, where you have enabled it", region: "United States" },
  { name: "Stripe", role: "Payments, where you have connected it", region: "United States" },
];

type Found = {
  email: string;
  conversations: number;
  leads: number;
  outcomes: number;
  firstSeen?: string;
  lastSeen?: string;
};

export function DataRights({ siteId }: { siteId: string }) {
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<Found | null>(null);
  const [searched, setSearched] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [erased, setErased] = useState<string[]>([]);

  function search() {
    const q = query.trim().toLowerCase();
    setSearched(true);
    if (!q) {
      setFound(null);
      return;
    }

    const leads = leadsFor(siteId).filter(
      (l) => l.email?.toLowerCase() === q || l.phone?.replace(/\s/g, "") === q.replace(/\s/g, ""),
    );
    const conversations = conversationsFor(siteId).filter(
      (c) =>
        c.consent.some((k) => k.address.toLowerCase() === q) || leads.some((l) => l.conversationId === c.id),
    );
    const outcomes = outcomesFor(siteId).filter((o) => conversations.some((c) => c.id === o.conversationId));

    if (!leads.length && !conversations.length) {
      setFound(null);
      return;
    }

    const times = conversations.map((c) => c.startedAt).sort();
    setFound({
      email: query.trim(),
      conversations: conversations.length,
      leads: leads.length,
      outcomes: outcomes.length,
      firstSeen: times[0],
      lastSeen: times.at(-1),
    });
  }

  function exportPerson(f: Found) {
    const leads = leadsFor(siteId).filter((l) => l.email?.toLowerCase() === f.email.toLowerCase());
    const conversations = conversationsFor(siteId).filter((c) =>
      leads.some((l) => l.conversationId === c.id),
    );
    downloadFile(
      `concierge-data-${f.email.replace(/[^a-z0-9]/gi, "-")}.json`,
      JSON.stringify(
        { subject: f.email, exportedAt: new Date().toISOString(), leads, conversations },
        null,
        2,
      ),
      "application/json",
    );
  }

  return (
    <>
      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="Someone has asked about their data"
          hint="Find everything held about one person, hand it to them, or delete it. Search by the email or number they gave in a conversation."
          className="mb-4"
        />

        <div className="flex flex-wrap items-end gap-2">
          <Field label="Email or phone" htmlFor="dsr-q" className="min-w-[220px] flex-1 sm:max-w-[340px]">
            <Input
              id="dsr-q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="maya.robinson@gmail.com"
            />
          </Field>
          <Button variant="secondary" onClick={search}>
            Find everything
          </Button>
        </div>

        {searched && !found && (
          <p className="mt-4 text-[12.5px] text-text-tertiary">
            Nothing is held against that address or number on this site.
          </p>
        )}

        {found && !erased.includes(found.email) && (
          <div className="mt-5 border border-line-strong">
            <div className="border-b border-divider bg-surface-subtle px-4 py-3">
              <p className="text-[12.5px] font-medium">{found.email}</p>
              <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                First seen {found.firstSeen ? relativeTime(found.firstSeen) : "—"} · last{" "}
                {found.lastSeen ? relativeTime(found.lastSeen) : "—"}
              </p>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-divider">
              {[
                ["Conversations", found.conversations],
                ["Lead records", found.leads],
                ["Outcomes", found.outcomes],
              ].map(([label, value]) => (
                <div key={label as string} className="px-4 py-3.5">
                  <dt className="t-eyebrow text-text-muted">{label}</dt>
                  <dd className="t-num mt-1.5 text-[15px] leading-none">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-2 border-t border-divider px-4 py-3">
              <Button
                size="sm"
                variant="secondary"
                leading={<UploadIcon size={13} />}
                onClick={() => exportPerson(found)}
              >
                Export everything
              </Button>
              <Button
                size="sm"
                variant="danger"
                leading={<TrashIcon size={13} />}
                onClick={() => {
                  setTyped("");
                  setConfirming(true);
                }}
              >
                Delete permanently
              </Button>
            </div>
          </div>
        )}

        {found && erased.includes(found.email) && (
          <p className="mt-5 flex items-start gap-2.5 border border-success-line bg-success-soft p-4 text-[12.5px] leading-[1.5] text-text-secondary">
            <CheckIcon size={15} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
            Everything about {found.email} has been deleted, including transcripts and the lead record. The
            deletion itself is logged in the activity log, which is the one thing that must survive it.
          </p>
        )}
      </Panel>

      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="Your own copy"
          hint="Everything on this site, in machine-readable form, whenever you want it. There is no lock-in here."
          className="mb-4"
        />
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            leading={<UploadIcon size={13} />}
            onClick={() =>
              downloadFile(
                `concierge-export-${siteId}.json`,
                JSON.stringify(
                  {
                    exportedAt: new Date().toISOString(),
                    siteId,
                    conversations: conversationsFor(siteId),
                    leads: leadsFor(siteId),
                    outcomes: outcomesFor(siteId),
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            Export this site
          </Button>
          <p className="text-[12px] text-text-tertiary">
            Conversations, leads, outcomes and your approved knowledge.
          </p>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="Who else touches your data"
          hint="Every company involved in answering a visitor, and what they do. Nobody is added without notice."
          className="mb-4"
        />
        <ul className="divide-y divide-divider border-t border-divider">
          {SUBPROCESSORS.map((s) => (
            <li key={s.name} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <span className="min-w-[140px] text-[12.5px] font-medium">{s.name}</span>
              <span className="min-w-0 flex-1 text-[12px] text-text-tertiary">{s.role}</span>
              <Badge tone="neutral">{s.region}</Badge>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <Button variant="secondary" size="sm" leading={<ShieldIcon size={13} />}>
            Download the DPA
          </Button>
          <p className="flex items-center gap-2 text-[12px] text-text-tertiary">
            <LockIcon size={13} />
            Answers are generated without your data being used to train anyone&rsquo;s model.
          </p>
        </div>
      </Panel>

      {/* Deleting is irreversible, so it is slow on purpose. */}
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        size="sm"
        eyebrow="Danger zone"
        title="Delete everything about this person?"
        description="This cannot be undone, and it is meant to be used when someone has asked you to do it."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={typed.trim().toLowerCase() !== found?.email.toLowerCase()}
              leading={<TrashIcon size={13} />}
              onClick={() => {
                if (found) setErased((e) => [...e, found.email]);
                setConfirming(false);
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <ModalSection>
          <div className="flex items-start gap-3 border border-danger-line bg-danger-soft p-4">
            <AlertIcon size={16} className="mt-px shrink-0 text-danger" />
            <div className="min-w-0 text-[12.5px] leading-[1.55] text-text-secondary">
              <p className="font-medium text-danger">What goes</p>
              <p className="mt-1">
                Every transcript, the lead record, the contact details and the consent record itself.
              </p>
              <p className="mt-2.5 font-medium text-text-primary">What stays</p>
              <p className="mt-1">
                The fact that a conversation happened, with no personal detail in it, so your ledger and your
                counts do not silently change — and the log entry recording this deletion.
              </p>
            </div>
          </div>
        </ModalSection>
        <ModalSection>
          <Field label={`Type ${found?.email ?? ""} to confirm`} htmlFor="dsr-confirm">
            <Input
              id="dsr-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={found?.email}
            />
          </Field>
        </ModalSection>
      </Modal>
    </>
  );
}
