"use client";

import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Panel,
  SectionHead,
  Tabs,
  Toggle,
} from "@/components/ui";
import {
  ActionsIcon,
  AlertIcon,
  ArrowRight,
  CheckIcon,
  CodeIcon,
  ConversationsIcon,
  LeadsIcon,
  MailIcon,
  MoreIcon,
  PhoneIcon,
  PlusIcon,
  RefreshIcon,
  RoutingIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { DELIVERIES, DESTINATIONS, ROUTING_RULES } from "@/lib/demo-data";
import { INTENT_LABEL, relativeTime } from "@/lib/format";
import type { Destination, DestinationKind, RoutingRule } from "@/lib/types";
import type { Tone } from "@/components/ui";

const KIND_ICON: Record<DestinationKind, typeof MailIcon> = {
  email: MailIcon,
  slack: ConversationsIcon,
  sms: PhoneIcon,
  webhook: CodeIcon,
  taskologic: ActionsIcon,
  telegram: ConversationsIcon,
  inbox: LeadsIcon,
};

const STATUS: Record<Destination["status"], { tone: Tone; label: string }> = {
  connected: { tone: "approved", label: "Delivering" },
  untested: { tone: "review", label: "Untested" },
  failing: { tone: "restricted", label: "Failing" },
  paused: { tone: "neutral", label: "Paused" },
};

const FIELD_LABEL: Record<string, string> = {
  intent: "Intent",
  location: "Location",
  "lead-value": "Lead value",
  service: "Service",
  urgency: "Urgency",
  page: "Page",
};

const OP_LABEL: Record<string, string> = {
  is: "is",
  "is-not": "is not",
  contains: "contains",
  "greater-than": "is over",
  "less-than": "is under",
};

type Tab = "rules" | "destinations" | "history";

/**
 * Routing reads as a sentence — IF this, THEN that — rather than a rule
 * engine. The visual flow is the point: an owner should see where a visitor
 * ends up without learning a syntax.
 */
export default function RoutingPage() {
  const [tab, setTab] = useState<Tab>("rules");
  const [rules, setRules] = useState(ROUTING_RULES);

  const failing = DESTINATIONS.filter((d) => d.status === "failing");

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Routing"
        title="Where visitors end up"
        description="When Concierge cannot finish the job itself, these rules decide which person hears about it — and how fast."
        actions={
          <>
            <Button variant="secondary" leading={<RefreshIcon size={15} />}>
              Run a route check
            </Button>
            <Button leading={<PlusIcon size={15} />}>New rule</Button>
          </>
        }
        meta={
          failing.length > 0 ? (
            <Card className="flex flex-wrap items-center gap-3 border-danger-line bg-danger-soft p-4">
              <AlertIcon size={17} className="shrink-0 text-danger" />
              <p className="min-w-0 flex-1 text-[13px]">
                <span className="font-medium">{failing[0].name} is not delivering.</span>{" "}
                <span className="text-text-secondary">
                  Visitor requests are still captured — your team just is not hearing about them.
                </span>
              </p>
              <Button size="sm" variant="secondary" onClick={() => setTab("destinations")}>
                Inspect
              </Button>
            </Card>
          ) : undefined
        }
      />

      <Tabs
        label="Routing sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "rules", label: "Rules", count: rules.length },
          { value: "destinations", label: "Destinations", count: DESTINATIONS.length },
          { value: "history", label: "Delivery history" },
        ]}
      />

      {tab === "rules" && (
        <div className="mt-7 space-y-4">
          {rules.map((rule, i) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              order={i + 1}
              onToggle={() =>
                setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)))
              }
            />
          ))}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-5 text-[15px] font-medium text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
          >
            <PlusIcon size={15} />
            Add a rule
          </button>

          <p className="pt-2 text-[13.5px] text-text-tertiary">
            Rules run top to bottom. The first one that matches wins, so keep the most specific at the top.
          </p>
        </div>
      )}

      {tab === "destinations" && (
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {DESTINATIONS.map((d) => (
            <DestinationCard key={d.id} destination={d} />
          ))}
          <button
            type="button"
            className="flex min-h-[168px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong p-5 text-[15px] font-medium text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
          >
            <PlusIcon size={17} />
            Add a destination
          </button>
        </div>
      )}

      {tab === "history" && <DeliveryHistory />}
    </PageContainer>
  );
}

/* ---- A rule, read as a sentence ------------------------------------------ */

function RuleRow({ rule, order, onToggle }: { rule: RoutingRule; order: number; onToggle: () => void }) {
  const destination = DESTINATIONS.find((d) => d.id === rule.destinationId);
  const Icon = destination ? KIND_ICON[destination.kind] : RoutingIcon;

  return (
    <Card className={cx("p-7", !rule.enabled && "bg-surface-subtle/60")}>
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-[14.5px] font-semibold tabular-nums text-text-tertiary">
          {order}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="t-card">{rule.name}</h3>
            {!rule.enabled && <Badge tone="neutral">Paused</Badge>}
          </div>

          {/* The flow ------------------------------------------------- */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="t-eyebrow shrink-0 text-text-muted">If</span>
            {rule.conditions.map((c, i) => (
              <span key={`${c.field}-${i}`} className="flex flex-wrap items-center gap-2">
                {i > 0 && <span className="t-eyebrow text-text-muted">and</span>}
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface-subtle-subtle px-2.5 py-1.5 text-[13.5px]">
                  <span className="text-text-tertiary">{FIELD_LABEL[c.field]}</span>
                  <span className="text-text-muted">{OP_LABEL[c.operator]}</span>
                  <span className="font-medium">
                    {c.field === "intent" ? (INTENT_LABEL[c.value] ?? c.value) : c.value}
                  </span>
                </span>
              </span>
            ))}

            <ArrowRight size={15} className="shrink-0 text-text-muted" />

            <span className="t-eyebrow shrink-0 text-text-muted">Then</span>
            <span className="inline-flex items-center gap-2 rounded-xl bg-surface-subtle px-2.5 py-1.5 text-[15px] font-medium">
              <Icon size={13} className="text-text-tertiary" />
              {destination?.name ?? "No destination"}
            </span>
          </div>

          <p className="mt-3 text-[14px] text-text-tertiary">
            Matched {rule.matches30d} times in the last 30 days
            {destination?.status === "failing" && (
              <span className="ml-1.5 font-medium text-danger">· destination is failing</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Toggle size="sm" checked={rule.enabled} onChange={onToggle} label={`Enable ${rule.name}`} />
          <IconButton label={`More options for ${rule.name}`} size={28}>
            <MoreIcon size={15} />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}

/* ---- Destinations -------------------------------------------------------- */

function DestinationCard({ destination: d }: { destination: Destination }) {
  const Icon = KIND_ICON[d.kind];
  const s = STATUS[d.status];
  const failing = d.status === "failing";

  return (
    <Card className={cx("flex flex-col p-7", failing && "border-danger-line")}>
      <div className="flex items-start gap-3">
        <span
          className={cx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            failing ? "bg-danger-soft text-danger" : "bg-surface-subtle text-text-secondary",
          )}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{d.name}</h3>
          <p className="mt-0.5 truncate text-[14px] text-text-tertiary">{d.target}</p>
        </div>
        <Badge tone={s.tone} dot={d.status === "connected"} pulse={d.status === "connected"}>
          {s.label}
        </Badge>
      </div>

      <div className="mt-4">
        <p className="t-eyebrow text-text-muted">Tells this destination when</p>
        <ul className="mt-2 space-y-1">
          {d.moments.map((m) => (
            <li key={m} className="flex items-center gap-1.5 text-[13.5px] text-text-secondary">
              <CheckIcon size={12} className="shrink-0 text-text-muted" />
              {m === "specialist-requested" && "A visitor asks for a person"}
              {m === "call-requested" && "A visitor asks for a call"}
              {m === "conversation-started" && "Any conversation starts"}
              {m === "high-intent" && "Concierge spots a strong lead"}
              {m === "brain-approved" && "Site Brain is approved"}
              {m === "agent-launched" && "The Agent goes live"}
            </li>
          ))}
        </ul>
      </div>

      {failing ? (
        <div className="mt-4 rounded-lg border border-danger-line bg-danger-soft p-3">
          <p className="text-[15px] font-medium text-danger">Last delivery failed</p>
          <p className="mt-1 text-[14px] leading-[1.55] text-text-secondary">
            The endpoint returned 503. Concierge will keep retrying for an hour, then stop.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[14px] text-text-tertiary">
          Last delivered {d.lastDeliveryAt ? relativeTime(d.lastDeliveryAt) : "never"}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button size="sm" variant={failing ? "primary" : "secondary"}>
          {failing ? "Fix connection" : "Configure"}
        </Button>
        <Button size="sm" variant="tertiary">
          Send a test
        </Button>
      </div>
    </Card>
  );
}

/* ---- History ------------------------------------------------------------- */

function DeliveryHistory() {
  if (DELIVERIES.length === 0) {
    return (
      <Panel className="mt-6">
        <EmptyState
          icon={<RoutingIcon size={19} />}
          title="No deliveries yet"
          body="Once a visitor asks for a person or Concierge spots a strong lead, every handoff will be logged here with its outcome."
        />
      </Panel>
    );
  }

  return (
    <Panel className="mt-6 overflow-hidden">
      <SectionHead
        title="Every handoff, and whether it landed"
        hint="Kept for 90 days. Failures are retried automatically for an hour."
        className="p-7 pb-5"
      />
      <div className="hidden grid-cols-[1fr_1.2fr_0.8fr_auto] gap-4 border-y border-divider px-6 py-2.5 lg:grid">
        {["Destination", "Moment", "Result", "When"].map((h) => (
          <span key={h} className="t-eyebrow text-text-muted">
            {h}
          </span>
        ))}
      </div>
      <ul className="divide-y divide-divider border-t border-divider lg:border-t-0">
        {DELIVERIES.map((rec) => {
          const dest = DESTINATIONS.find((d) => d.id === rec.destinationId);
          const tone: Tone =
            rec.state === "delivered" ? "approved" : rec.state === "failed" ? "restricted" : "review";
          return (
            <li
              key={rec.id}
              className="grid grid-cols-1 gap-x-4 gap-y-1.5 px-7 py-4.5 lg:grid-cols-[1fr_1.2fr_0.8fr_auto] lg:items-center"
            >
              <span className="truncate text-[15px] font-medium">{dest?.name ?? "Removed destination"}</span>
              <span className="truncate text-[13.5px] text-text-secondary">
                {rec.moment.replace(/-/g, " ")}
              </span>
              <span>
                <Badge tone={tone}>{rec.state}</Badge>
                {rec.error && <span className="ml-2 text-[13.5px] text-text-tertiary">{rec.error}</span>}
              </span>
              <span className="text-[13px] tabular-nums text-text-muted lg:text-right">{relativeTime(rec.at)}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
