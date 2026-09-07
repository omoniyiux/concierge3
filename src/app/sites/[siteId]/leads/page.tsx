"use client";

import { use, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Panel,
  SearchInput,
  SegmentedControl,
} from "@/components/ui";
import {
  ConversationsIcon,
  LeadsIcon,
  MailIcon,
  PhoneIcon,
  RoutingIcon,
  UploadIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { LEADS } from "@/lib/demo-data";
import { INTENT_LABEL, relativeTime } from "@/lib/format";
import type { Lead, LeadQualification } from "@/lib/types";
import type { Tone } from "@/components/ui";

const QUAL_TONE: Record<LeadQualification, Tone> = {
  hot: "restricted",
  warm: "accent",
  cool: "neutral",
  unqualified: "neutral",
};

type Filter = "all" | "hot" | "warm" | "cool";

/**
 * Leads are ranked by what Concierge worked out, not by when they arrived.
 * Score is the signal; colour is a secondary cue, never the only one.
 */
export default function LeadsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LEADS.filter((l) => {
      if (filter !== "all" && l.qualification !== filter) return false;
      if (q && !`${l.name} ${l.service ?? ""} ${l.email ?? ""}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [filter, query]);

  const hot = LEADS.filter((l) => l.qualification === "hot").length;

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Leads"
        title="People worth following up"
        description="Every visitor Concierge qualified, with what it learned about them and where it sent them."
        actions={
          <Button variant="secondary" leading={<UploadIcon size={15} />}>
            Export CSV
          </Button>
        }
        meta={
          <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-none bg-transparent sm:grid-cols-4">
            {[
              { label: "Total leads", value: LEADS.length, hint: "Last 30 days" },
              { label: "High intent", value: hot, hint: "Score 80 or above" },
              { label: "Average score", value: Math.round(LEADS.reduce((n, l) => n + l.score, 0) / LEADS.length), hint: "Out of 100" },
              { label: "Routed", value: LEADS.filter((l) => l.routedTo).length, hint: "Reached a person" },
            ].map((s) => (
              <div key={s.label} className="bg-surface p-4">
                <p className="t-eyebrow text-text-muted">{s.label}</p>
                <p className="t-num mt-2 text-[19px] leading-none">{s.value}</p>
                <p className="mt-1.5 text-[14px] text-text-tertiary">{s.hint}</p>
              </div>
            ))}
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, service or email"
          className="min-w-[220px] flex-1 sm:max-w-[320px]"
          aria-label="Search leads"
        />
        <SegmentedControl
          label="Filter by qualification"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "hot", label: "Hot" },
            { value: "warm", label: "Warm" },
            { value: "cool", label: "Cool" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<LeadsIcon size={19} />}
            title="No leads match that"
            body="Leads appear here the moment Concierge captures contact details or spots high intent in a conversation."
            action={
              <Button variant="secondary" onClick={() => { setQuery(""); setFilter("all"); }}>
                Clear filters
              </Button>
            }
          />
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          {/* Header row: 12–13px, semibold, as the table spec calls for. */}
          <div className="hidden grid-cols-[1.6fr_1fr_0.9fr_0.9fr_auto] gap-4 border-b border-divider px-5 py-2.5 lg:grid">
            {["Lead", "Interested in", "Urgency", "Routed to", "Score"].map((h) => (
              <span key={h} className="t-eyebrow text-text-muted">
                {h}
              </span>
            ))}
          </div>

          <ul className="divide-y divide-divider">
            {rows.map((lead) => (
              <li key={lead.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(openId === lead.id ? null : lead.id)}
                  aria-expanded={openId === lead.id}
                  className="grid w-full grid-cols-1 items-center gap-x-4 gap-y-2 px-6 py-3.5 text-left transition-colors hover:bg-surface-subtle lg:grid-cols-[1.6fr_1fr_0.9fr_0.9fr_auto]"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-medium">{lead.name}</span>
                      <Badge tone={QUAL_TONE[lead.qualification]}>{lead.qualification}</Badge>
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[14px] text-text-tertiary">
                      {lead.email && <span className="truncate">{lead.email}</span>}
                      {lead.phone && <span className="truncate">{lead.phone}</span>}
                      <span aria-hidden>·</span>
                      <span>{relativeTime(lead.capturedAt)}</span>
                    </span>
                  </span>

                  <span className="min-w-0 truncate text-[13.5px] text-text-secondary">
                    {lead.service ?? INTENT_LABEL[lead.intent]}
                  </span>

                  <span className="text-[13.5px] capitalize text-text-secondary">
                    {lead.urgency?.replace("-", " ") ?? "—"}
                  </span>

                  <span className="min-w-0 truncate text-[13.5px] text-text-secondary">{lead.routedTo ?? "Not routed"}</span>

                  <span className="flex items-center gap-2.5 lg:justify-end">
                    <span className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-sunken">
                      <span
                        className={cx(
                          "block h-full rounded-full",
                          lead.score >= 80 ? "bg-success" : lead.score >= 50 ? "bg-accent" : "bg-text-muted",
                        )}
                        style={{ width: `${lead.score}%` }}
                      />
                    </span>
                    <span className="t-num w-7 text-right text-[14px]">{lead.score}</span>
                  </span>
                </button>

                {openId === lead.id && <LeadDetail lead={lead} siteId={siteId} />}
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </PageContainer>
  );
}

function LeadDetail({ lead, siteId }: { lead: Lead; siteId: string }) {
  return (
    <div className="cg-enter border-t border-divider bg-surface-subtle px-5 py-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <h3 className="t-eyebrow text-text-muted">What Concierge worked out</h3>
          <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              ["Intent", INTENT_LABEL[lead.intent]],
              ["Service", lead.service ?? "—"],
              ["Budget", lead.budget ?? "Not stated"],
              ["Location", lead.location ?? "Unknown"],
              ["Urgency", lead.urgency?.replace("-", " ") ?? "—"],
              ["Captured", relativeTime(lead.capturedAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 border-b border-divider pb-2">
                <dt className="text-[14px] text-text-tertiary">{k}</dt>
                <dd className="text-[15px] font-medium capitalize">{v}</dd>
              </div>
            ))}
          </dl>

          {lead.notes && (
            <>
              <h3 className="t-eyebrow mt-6 text-text-muted">Notes</h3>
              <p className="mt-2 text-[14px] leading-[1.6] text-text-secondary">{lead.notes}</p>
            </>
          )}
        </div>

        <Card className="p-6">
          <h3 className="t-card">Follow up</h3>
          <div className="mt-3 space-y-3">
            {lead.email && (
              <Button variant="secondary" size="sm" block leading={<MailIcon size={13} />}>
                Email {lead.name.split(" ")[0]}
              </Button>
            )}
            {lead.phone && (
              <Button variant="secondary" size="sm" block leading={<PhoneIcon size={13} />}>
                Call {lead.phone}
              </Button>
            )}
            <LinkButton
              href={`/sites/${siteId}/conversations?c=${lead.conversationId}`}
              variant="secondary"
              size="sm"
              block
              leading={<ConversationsIcon size={13} />}
            >
              Read the conversation
            </LinkButton>
          </div>
          {lead.routedTo && (
            <p className="mt-4 flex items-center gap-2 border-t border-divider pt-3 text-[14px] text-text-tertiary">
              <RoutingIcon size={13} />
              Sent to {lead.routedTo}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
