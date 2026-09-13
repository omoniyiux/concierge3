"use client";

import { use, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { Badge, Button, Card, EmptyState, Panel, SectionHead, Tabs, Toggle } from "@/components/ui";
import { ArrowRight, CheckIcon, PlusIcon, RefreshIcon, RoutingIcon, SendIcon } from "@/components/icons";
import { AlertSticker, RoutingSticker } from "@/components/stickers";
import { DESTINATION_STICKER } from "@/components/stickers/maps";
import { DestinationEditor } from "@/components/routing/DestinationEditor";
import { RuleEditor } from "@/components/routing/RuleEditor";
import { RouteCheckPanel, type CheckOutcome } from "@/components/routing/RouteCheckPanel";
import { RowMenu } from "@/components/routing/RowMenu";
import { RoutingInbox } from "@/components/routing/RoutingInbox";
import { RoutingReadiness } from "@/components/routing/RoutingReadiness";
import { ChannelConnect } from "@/components/routing/ChannelConnect";
import { FIELD_LABEL, MOMENT_LABEL, OP_LABEL } from "@/components/routing/MomentLabels";
import { EscalationLadder } from "@/components/routing/EscalationLadder";
import { cx } from "@/lib/cx";
import { DELIVERIES, DESTINATIONS, INBOX, ROUTING_RULES } from "@/lib/demo-data";
import { INTENT_LABEL, relativeTime } from "@/lib/format";
import type { Destination, RoutingRule } from "@/lib/types";
import type { Tone } from "@/components/ui";

const STATUS: Record<Destination["status"], { tone: Tone; label: string }> = {
  connected: { tone: "approved", label: "Delivering" },
  untested: { tone: "review", label: "Untested" },
  failing: { tone: "restricted", label: "Failing" },
  paused: { tone: "neutral", label: "Paused" },
};

type Tab = "inbox" | "rules" | "destinations" | "history";

/**
 * Routing reads as a sentence — IF this, THEN that — rather than a rule
 * engine. The visual flow is the point: an owner should see where a visitor
 * ends up without learning a syntax.
 */
export default function RoutingPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [tab, setTab] = useState<Tab>("inbox");
  const [rules, setRules] = useState(ROUTING_RULES);
  const [destinations, setDestinations] = useState(DESTINATIONS);

  // Only one panel is ever open: they all sit in the same slot under the
  // header, and stacking them would bury the thing being edited.
  const [checking, setChecking] = useState(false);
  const [ruleEdit, setRuleEdit] = useState<RoutingRule | "new" | null>(null);
  const [destEdit, setDestEdit] = useState<Destination | "new" | null>(null);

  const failing = destinations.filter((d) => d.status === "failing");
  const waiting = INBOX.filter((i) => i.state === "unread" || i.state === "open").length;

  const closeAll = () => {
    setChecking(false);
    setRuleEdit(null);
    setDestEdit(null);
  };

  function editDestination(d: Destination) {
    closeAll();
    setDestEdit(d);
    setTab("destinations");
  }

  function saveDestination(next: Destination) {
    setDestinations((prev) =>
      prev.some((d) => d.id === next.id) ? prev.map((d) => (d.id === next.id ? next : d)) : [...prev, next],
    );
    setDestEdit(null);
  }

  function testDestination(id: string, ok: boolean) {
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: ok ? "connected" : "failing", lastTestedAt: new Date().toISOString() }
          : d,
      ),
    );
  }

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Agent"
        title="Where visitors end up"
        description="When Concierge cannot finish the job itself, these rules decide which person hears about it — and how fast."
        actions={
          <>
            <Button
              variant="secondary"
              leading={<RefreshIcon size={15} />}
              disabled={checking}
              onClick={() => {
                closeAll();
                setChecking(true);
              }}
            >
              {checking ? "Checking…" : "Run a route check"}
            </Button>
            <Button
              leading={<PlusIcon size={15} />}
              onClick={() => {
                closeAll();
                setRuleEdit("new");
                setTab("rules");
              }}
            >
              New rule
            </Button>
          </>
        }
        meta={
          <div className="space-y-3">
            <RoutingReadiness
              destinations={destinations}
              siteId={siteId}
              onFixCoverage={() => {
                closeAll();
                setTab("destinations");
              }}
            />
            {failing.length > 0 ? (
            <Card className="flex flex-wrap items-center gap-3 border-danger-line bg-danger-soft p-4">
              <AlertSticker size={28} className="shrink-0" />
              <p className="min-w-0 flex-1 text-[11.5px]">
                <span className="font-medium">{failing[0].name} is not delivering.</span>{" "}
                <span className="text-text-secondary">
                  Visitor requests are still captured — your team just is not hearing about them.
                </span>
              </p>
              <Button size="sm" variant="secondary" onClick={() => editDestination(failing[0])}>
                Inspect
              </Button>
              </Card>
            ) : null}
          </div>
        }
      />

      {checking && (
        <RouteCheckPanel
          destinations={destinations}
          siteId={siteId}
          onApply={(outcomes: CheckOutcome[]) => {
            setDestinations((prev) =>
              prev.map((d) => {
                const o = outcomes.find((x) => x.id === d.id);
                return o
                  ? { ...d, status: o.ok ? "connected" : "failing", lastTestedAt: new Date().toISOString() }
                  : d;
              }),
            );
            setChecking(false);
            setTab("destinations");
          }}
          onClose={() => setChecking(false)}
        />
      )}

      {ruleEdit && (
        <RuleEditor
          rule={ruleEdit === "new" ? undefined : ruleEdit}
          destinations={destinations}
          onSave={(next) => {
            setRules((prev) =>
              prev.some((r) => r.id === next.id)
                ? prev.map((r) => (r.id === next.id ? next : r))
                : [...prev, next],
            );
            setRuleEdit(null);
          }}
          onClose={() => setRuleEdit(null)}
        />
      )}

      {destEdit && (
        <DestinationEditor
          destination={destEdit === "new" ? undefined : destEdit}
          onSave={saveDestination}
          onClose={() => setDestEdit(null)}
        />
      )}

      <Tabs
        label="Routing sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "inbox", label: "Inbox", count: waiting },
          { value: "rules", label: "Rules", count: rules.length },
          { value: "destinations", label: "Destinations", count: destinations.length },
          { value: "history", label: "Delivery history" },
        ]}
      />

      {tab === "inbox" && <RoutingInbox items={INBOX} destinations={destinations} siteId={siteId} />}

      {tab === "rules" && (
        <div className="mt-7 space-y-4">
          {rules.map((rule, i) => (
            <RuleRow
              key={rule.id}
              rule={rule}
              order={i + 1}
              destinations={destinations}
              onToggle={() =>
                setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r)))
              }
              onEdit={() => {
                closeAll();
                setRuleEdit(rule);
              }}
              onDuplicate={() =>
                setRules((prev) => {
                  const copy = {
                    ...rule,
                    id: `rule_${Date.now()}`,
                    name: `${rule.name} (copy)`,
                    enabled: false,
                    matches30d: 0,
                  };
                  return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
                })
              }
              onDelete={() => setRules((prev) => prev.filter((r) => r.id !== rule.id))}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              closeAll();
              setRuleEdit("new");
            }}
            className="flex w-full items-center justify-center gap-2 border border-dashed border-line-strong py-5 text-[13px] font-medium text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
          >
            <PlusIcon size={15} />
            Add a rule
          </button>

          <p className="pt-2 text-[11.5px] text-text-tertiary">
            Rules run top to bottom. The first one that matches wins, so keep the most specific at the top.
          </p>
        </div>
      )}

      {tab === "destinations" && (
        <>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard
              key={d.id}
              destination={d}
              onConfigure={() => editDestination(d)}
              onTested={(ok) => testDestination(d.id, ok)}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              closeAll();
              document.getElementById("connect-a-destination")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex min-h-[168px] flex-col items-center justify-center gap-2 border border-dashed border-line-strong p-5 text-[13px] font-medium text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
          >
            <PlusIcon size={17} />
            Add a destination
          </button>
        </div>

        {/* Delivering is not the same as somebody dealing with it. */}
        <div className="mt-10 space-y-4">
          <EscalationLadder destinations={destinations} />
        </div>

        <div id="connect-a-destination" className="mt-10 scroll-mt-24">
          <ChannelConnect
            destinations={destinations}
            onConnect={(d) =>
              setDestinations((prev) => [...prev, { ...d, id: `dest_${Date.now()}`, siteId }])
            }
          />
        </div>
        </>
      )}

      {tab === "history" && <DeliveryHistory destinations={destinations} />}
    </PageContainer>
  );
}

/* ---- A rule, read as a sentence ------------------------------------------ */

function RuleRow({
  rule,
  order,
  destinations,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  rule: RoutingRule;
  order: number;
  destinations: Destination[];
  onToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const destination = destinations.find((d) => d.id === rule.destinationId);
  const Sticker = destination ? DESTINATION_STICKER[destination.kind] : RoutingSticker;

  return (
    <Card className={cx("p-5", !rule.enabled && "bg-surface-subtle/60")}>
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-surface-subtle text-[12.5px] font-semibold tabular-nums text-text-tertiary">
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
                <span className="inline-flex items-center gap-1.5 bg-surface-subtle px-2.5 py-1.5 text-[12px]">
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
            <span className="inline-flex items-center gap-2 rounded-xl bg-surface-subtle px-2.5 py-1.5 text-[12.5px] font-medium">
              <Sticker size={18} className="shrink-0" />
              {destination?.name ?? "No destination"}
            </span>
          </div>

          <p className="mt-3 text-[12.5px] text-text-tertiary">
            Matched {rule.matches30d} times in the last 30 days
            {destination?.status === "failing" && (
              <span className="ml-1.5 font-medium text-danger">· destination is failing</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Toggle size="sm" checked={rule.enabled} onChange={onToggle} label={`Enable ${rule.name}`} />
          <RowMenu
            label={`More options for ${rule.name}`}
            items={[
              { label: "Edit rule", onSelect: onEdit },
              { label: "Duplicate", onSelect: onDuplicate },
              { label: rule.enabled ? "Pause rule" : "Enable rule", onSelect: onToggle },
              { label: "Delete rule", onSelect: onDelete, danger: true },
            ]}
          />
        </div>
      </div>
    </Card>
  );
}

/* ---- Destinations -------------------------------------------------------- */

function DestinationCard({
  destination: d,
  onConfigure,
  onTested,
}: {
  destination: Destination;
  onConfigure: () => void;
  onTested: (ok: boolean) => void;
}) {
  const Sticker = DESTINATION_STICKER[d.kind];
  const s = STATUS[d.status];
  const failing = d.status === "failing";

  // The test result lives on the card that ran it, so two cards can be
  // mid-test without one overwriting the other's answer.
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; ms: number } | null>(null);

  function sendTest() {
    setTesting(true);
    setResult(null);
    window.setTimeout(() => {
      const ok = d.status !== "failing";
      setTesting(false);
      setResult({ ok, ms: 120 + ((d.name.length * 37) % 300) });
      onTested(ok);
    }, 900);
  }

  return (
    <Card className={cx("flex flex-col p-5", failing && "border-danger-line")}>
      <div className="flex items-start gap-3">
        <Sticker size={34} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{d.name}</h3>
          <p className="mt-0.5 truncate text-[12.5px] text-text-tertiary">{d.target}</p>
        </div>
        <Badge tone={s.tone} dot={d.status === "connected"} pulse={d.status === "connected"}>
          {s.label}
        </Badge>
      </div>

      <div className="mt-4">
        <p className="t-eyebrow text-text-muted">Tells this destination when</p>
        <ul className="mt-2 space-y-1">
          {d.moments.map((m) => (
            <li key={m} className="flex items-center gap-1.5 text-[12px] text-text-secondary">
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
        <div className="mt-4 border border-danger-line bg-danger-soft p-3">
          <p className="text-[13px] font-medium text-danger">Last delivery failed</p>
          <p className="mt-1 text-[12.5px] leading-[1.55] text-text-secondary">
            The endpoint returned 503. Concierge will keep retrying for an hour, then stop.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[12.5px] text-text-tertiary">
          Last delivered {d.lastDeliveryAt ? relativeTime(d.lastDeliveryAt) : "never"}
        </p>
      )}

      {result && (
        <p
          className={cx(
            "mt-3 flex items-center gap-2 text-[11.5px]",
            result.ok ? "text-success" : "text-danger",
          )}
          role="status"
        >
          {result.ok ? (
            <>
              <CheckIcon size={13} strokeWidth={2.4} />
              Test delivered in {result.ms}ms
            </>
          ) : (
            <>
              <SendIcon size={13} />
              Test did not arrive — the endpoint returned 503
            </>
          )}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button size="sm" variant={failing ? "primary" : "secondary"} onClick={onConfigure}>
          {failing ? "Fix connection" : "Configure"}
        </Button>
        <Button size="sm" variant="tertiary" loading={testing} onClick={sendTest}>
          Send a test
        </Button>
      </div>
    </Card>
  );
}

/* ---- History ------------------------------------------------------------- */

function DeliveryHistory({ destinations }: { destinations: Destination[] }) {
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
        className="p-6 pb-4"
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
          const dest = destinations.find((d) => d.id === rec.destinationId);
          const tone: Tone =
            rec.state === "delivered" ? "approved" : rec.state === "failed" ? "restricted" : "review";
          return (
            <li
              key={rec.id}
              className="grid grid-cols-1 gap-x-4 gap-y-1.5 px-6 py-3.5 lg:grid-cols-[1fr_1.2fr_0.8fr_auto] lg:items-center"
            >
              <span className="truncate text-[12.5px] font-medium">
                {dest?.name ?? "Removed destination"}
              </span>
              <span className="truncate text-[12px] text-text-secondary">{MOMENT_LABEL[rec.moment]}</span>
              <span>
                <Badge tone={tone}>{rec.state}</Badge>
                {rec.error && <span className="ml-2 text-[11.5px] text-text-tertiary">{rec.error}</span>}
              </span>
              <span className="text-[11.5px] tabular-nums text-text-muted lg:text-right">
                {relativeTime(rec.at)}
              </span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
