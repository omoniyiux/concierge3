"use client";

import { useMemo, useState } from "react";
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
import { ActionsIcon, ArrowRight, CheckIcon, PlusIcon } from "@/components/icons";
import { StickerStats } from "@/components/ui/StickerStats";
import { ACTION_STICKER } from "@/components/stickers/maps";
import { ApprovedSticker, PendingSticker, SparkSticker, TargetSticker } from "@/components/stickers";
import { AddActionModal, ConfigureActionModal, SetUpActionModal } from "@/components/actions/ActionFlows";
import { ConnectModal } from "@/components/integrations/ConnectFlows";
import { cx } from "@/lib/cx";
import { ACTIONS, INTEGRATIONS } from "@/lib/demo-data";
import { INTENT_LABEL, money } from "@/lib/format";
import type { ActionDef, ActionReadiness, Integration } from "@/lib/types";
import type { Tone } from "@/components/ui";

const READINESS: Record<ActionReadiness, { tone: Tone; label: string }> = {
  ready: { tone: "approved", label: "Ready" },
  "needs-setup": { tone: "review", label: "Needs setup" },
  "needs-connection": { tone: "review", label: "Needs a connection" },
  disabled: { tone: "neutral", label: "Off" },
};

type Filter = "all" | "ready" | "needs-work" | "off";

/** The provider an action runs through, as an integration we can connect. */
function providerIntegration(action: ActionDef): Integration | null {
  if (!action.provider) return null;
  const known = INTEGRATIONS.find((i) => i.name.toLowerCase() === action.provider!.toLowerCase());
  return (
    known ?? {
      id: `i_${action.provider.toLowerCase()}`,
      name: action.provider,
      description: `Concierge runs “${action.name}” through ${action.provider}.`,
      category: "automation",
      status: "available",
    }
  );
}

/**
 * Actions are what separates Concierge from a chatbot, so each card answers
 * the four questions plainly: what it does, when it fires, what it needs from
 * the visitor, and what happens after — and every control on it finishes
 * somewhere: added, configured, set up, or connected.
 *
 * Rendered by both /actions and /agent/actions, which were two copies of the
 * same page until this became one component.
 */
export function ActionsWorkbench({ siteId, eyebrow }: { siteId: string; eyebrow: string }) {
  const [actions, setActions] = useState<ActionDef[]>(ACTIONS);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [configuring, setConfiguring] = useState<ActionDef | null>(null);
  const [settingUp, setSettingUp] = useState<ActionDef | null>(null);
  const [connecting, setConnecting] = useState<ActionDef | null>(null);
  const [flash, setFlash] = useState<Record<string, string>>({});

  function note(id: string, message: string) {
    setFlash((f) => ({ ...f, [id]: message }));
    setTimeout(() => setFlash((f) => ({ ...f, [id]: "" })), 4000);
  }

  function patch(id: string, next: Partial<ActionDef>) {
    setActions((list) => list.map((a) => (a.id === id ? { ...a, ...next } : a)));
  }

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actions.filter((a) => {
      if (filter === "ready" && a.readiness !== "ready") return false;
      if (filter === "needs-work" && !["needs-setup", "needs-connection"].includes(a.readiness)) return false;
      if (filter === "off" && a.readiness !== "disabled") return false;
      if (q && !`${a.name} ${a.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [actions, filter, query]);

  const ready = actions.filter((a) => a.readiness === "ready").length;
  const completions = actions.reduce((n, a) => n + a.completions30d, 0);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={eyebrow}
        title="What Concierge can do for a visitor"
        description="Answering is the floor. These are the jobs Concierge can finish on its own — booking a time, taking a number, starting a quote."
        actions={
          <Button leading={<PlusIcon size={15} />} onClick={() => setAdding(true)}>
            Add an action
          </Button>
        }
        meta={
          <StickerStats
            items={[
              {
                Sticker: ApprovedSticker,
                value: ready,
                label: "Ready",
                detail: "Offered to visitors now",
                tone: "text-success",
              },
              {
                Sticker: PendingSticker,
                value: actions.filter((a) => a.readiness !== "ready" && a.readiness !== "disabled").length,
                label: "Needs work",
                detail: "Waiting on setup or a connection",
                tone: "text-warning",
              },
              {
                Sticker: SparkSticker,
                value: completions,
                label: "Completed",
                detail: "Jobs finished in the last 30 days",
              },
              {
                Sticker: TargetSticker,
                value: actions.reduce((n, a) => n + a.placements.length, 0),
                label: "Placements",
                detail: "Across Agent, Pages and routing",
              },
            ]}
          />
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions"
          className="min-w-[200px] flex-1 sm:max-w-[300px]"
          aria-label="Search actions"
        />
        <SegmentedControl
          label="Filter actions"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "ready", label: "Ready" },
            { value: "needs-work", label: "Needs work" },
            { value: "off", label: "Off" },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<ActionsIcon size={19} />}
            title={query || filter !== "all" ? "No actions match" : "No actions yet"}
            body="Actions are how Concierge finishes a job instead of just describing it. Add one and it becomes available to your Agent immediately."
            action={
              <Button leading={<PlusIcon size={15} />} onClick={() => setAdding(true)}>
                Add an action
              </Button>
            }
            secondaryAction={
              query || filter !== "all" ? (
                <Button
                  variant="tertiary"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              open={openId === action.id}
              flash={flash[action.id]}
              onToggle={() => setOpenId(openId === action.id ? null : action.id)}
              onConfigure={() => setConfiguring(action)}
              onSetUp={() => setSettingUp(action)}
              onConnect={() => setConnecting(action)}
              siteId={siteId}
            />
          ))}
        </div>
      )}

      {/* ---- Flows -------------------------------------------------------- */}
      <AddActionModal
        open={adding}
        siteId={siteId}
        onClose={() => setAdding(false)}
        onCreate={(action) => {
          setActions((list) => [action, ...list]);
          setAdding(false);
          setOpenId(action.id);
          note(
            action.id,
            action.readiness === "ready"
              ? "Added · live now"
              : `Added · connect ${action.provider} to finish`,
          );
        }}
      />

      <ConfigureActionModal
        action={configuring}
        onClose={() => setConfiguring(null)}
        onSave={(id, next) => {
          patch(id, next);
          setConfiguring(null);
          note(id, next.readiness === "disabled" ? "Turned off" : "Changes saved");
        }}
      />

      <SetUpActionModal
        action={settingUp}
        onClose={() => setSettingUp(null)}
        onComplete={(id, next) => {
          patch(id, next);
          setSettingUp(null);
          note(id, "Set up · offered to visitors now");
        }}
      />

      {/* Connecting a provider is the same three steps as on Integrations —
          the same dialog, so it cannot drift into a second flow. */}
      <ConnectModal
        integration={connecting ? providerIntegration(connecting) : null}
        onClose={() => setConnecting(null)}
        onConnected={() => {
          if (!connecting) return;
          patch(connecting.id, { readiness: "ready", placements: ["agent"] });
          note(connecting.id, `${connecting.provider} connected · action is live`);
          setConnecting(null);
        }}
      />
    </PageContainer>
  );
}

function ActionCard({
  action,
  open,
  flash,
  onToggle,
  onConfigure,
  onSetUp,
  onConnect,
  siteId,
}: {
  action: ActionDef;
  open: boolean;
  flash?: string;
  onToggle: () => void;
  onConfigure: () => void;
  onSetUp: () => void;
  onConnect: () => void;
  siteId: string;
}) {
  const r = READINESS[action.readiness];
  const Sticker = ACTION_STICKER[action.kind];
  const live = action.readiness === "ready";
  const off = action.readiness === "disabled";

  return (
    <Card
      className={cx(
        "flex flex-col p-5 transition-colors",
        open && "border-line-strong",
        !live && "bg-surface-subtle/60",
      )}
    >
      <div className="flex items-start gap-3">
        {/* The sticker carries its own palette, so a card that is not yet live
            is dimmed rather than recoloured. */}
        <Sticker size={36} className={cx("shrink-0", !live && "opacity-45 saturate-0")} />
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{action.name}</h3>
          <p className="mt-1 text-[12px] leading-[1.5] text-text-tertiary">{action.description}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={r.tone} dot={live}>
          {r.label}
        </Badge>
        {action.provider && <Badge tone="neutral">{action.provider}</Badge>}
        {live && action.completions30d > 0 && (
          <span className="text-[11.5px] tabular-nums text-text-tertiary">
            {action.completions30d} completed this month
          </span>
        )}
      </div>

      {flash && (
        <p className="cg-enter mt-3 flex items-center gap-1.5 text-[11.5px] font-medium text-success">
          <CheckIcon size={12} strokeWidth={2.4} />
          {flash}
        </p>
      )}

      {open && (
        <dl className="cg-enter mt-4 space-y-3.5 border-t border-divider pt-4">
          <div>
            <dt className="t-eyebrow text-text-muted">Fires when a visitor wants</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {action.triggers.map((t) => (
                <Badge key={t} tone="neutral">
                  {INTENT_LABEL[t]}
                </Badge>
              ))}
            </dd>
          </div>

          <div>
            <dt className="t-eyebrow text-text-muted">It asks for</dt>
            <dd className="mt-1.5">
              {action.collects.length === 0 ? (
                <p className="text-[12px] text-text-tertiary">Nothing — it runs on its own.</p>
              ) : (
                <ul className="space-y-1">
                  {action.collects.map((f) => (
                    <li key={f.key} className="flex items-center gap-2 text-[12px]">
                      <CheckIcon size={12} className="shrink-0 text-text-muted" />
                      {f.label}
                      {f.required && <span className="text-[10px] text-text-muted">required</span>}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>

          <div>
            <dt className="t-eyebrow text-text-muted">Then</dt>
            <dd className="mt-1.5 text-[12px] leading-[1.5] text-text-secondary">{action.outcome}</dd>
          </div>

          {action.unitValue && (
            <div>
              <dt className="t-eyebrow text-text-muted">One completion is worth</dt>
              <dd className="mt-1.5 text-[12px] text-text-secondary">
                <span className="t-num text-[13px]">{money(action.unitValue, "USD")}</span>
                {action.unitValueNote && (
                  <span className="mt-1 block text-[11.5px] leading-[1.45] text-text-tertiary">
                    {action.unitValueNote}
                  </span>
                )}
              </dd>
            </div>
          )}

          {action.placements.length > 0 && (
            <div>
              <dt className="t-eyebrow text-text-muted">Placed in</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {action.placements.map((p) => (
                  <Badge key={p} tone="neutral">
                    {p === "agent"
                      ? "Agent"
                      : p === "pages"
                        ? "Pages"
                        : p === "website"
                          ? "Website"
                          : "Routing"}
                  </Badge>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        <Button
          size="sm"
          variant={live || off ? "secondary" : "primary"}
          onClick={
            action.readiness === "needs-connection"
              ? onConnect
              : action.readiness === "needs-setup"
                ? onSetUp
                : onConfigure
          }
        >
          {live
            ? "Configure"
            : off
              ? "Turn it on"
              : action.readiness === "needs-connection"
                ? "Connect provider"
                : "Set it up"}
        </Button>
        <Button size="sm" variant="tertiary" onClick={onToggle}>
          {open ? "Less" : "How it works"}
        </Button>
        {action.readiness === "needs-connection" && (
          <LinkButton
            href={`/sites/${siteId}/integrations`}
            variant="tertiary"
            size="sm"
            className="ml-auto"
            trailing={<ArrowRight size={13} />}
          >
            Integrations
          </LinkButton>
        )}
      </div>
    </Card>
  );
}
