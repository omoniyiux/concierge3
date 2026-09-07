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
  ActionsIcon,
  ArrowRight,
  CalendarIcon,
  CheckIcon,
  ConversationsIcon,
  LeadsIcon,
  PhoneIcon,
  PlusIcon,
  SparkIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { ACTIONS } from "@/lib/demo-data";
import { INTENT_LABEL } from "@/lib/format";
import type { ActionDef, ActionReadiness } from "@/lib/types";
import type { Tone } from "@/components/ui";

const READINESS: Record<ActionReadiness, { tone: Tone; label: string }> = {
  ready: { tone: "approved", label: "Ready" },
  "needs-setup": { tone: "review", label: "Needs setup" },
  "needs-connection": { tone: "review", label: "Needs a connection" },
  disabled: { tone: "neutral", label: "Off" },
};

const KIND_ICON: Record<string, typeof ActionsIcon> = {
  booking: CalendarIcon,
  consultation: CalendarIcon,
  call: PhoneIcon,
  message: ConversationsIcon,
  "lead-capture": LeadsIcon,
};

type Filter = "all" | "ready" | "needs-work" | "off";

/**
 * Actions are what separates Concierge from a chatbot, so each card answers
 * the four questions plainly: what it does, when it fires, what it needs from
 * the visitor, and what happens after.
 */
export default function ActionsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ACTIONS.filter((a) => {
      if (filter === "ready" && a.readiness !== "ready") return false;
      if (filter === "needs-work" && !["needs-setup", "needs-connection"].includes(a.readiness)) return false;
      if (filter === "off" && a.readiness !== "disabled") return false;
      if (q && !`${a.name} ${a.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  const ready = ACTIONS.filter((a) => a.readiness === "ready").length;
  const completions = ACTIONS.reduce((n, a) => n + a.completions30d, 0);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Agent"
        title="What Concierge can do for a visitor"
        description="Answering is the floor. These are the jobs Concierge can finish on its own — booking a time, taking a number, starting a quote."
        actions={<Button leading={<PlusIcon size={15} />}>Add an action</Button>}
        meta={
          <div className="grid grid-cols-2 gap-3 overflow-hidden rounded-none bg-transparent sm:grid-cols-4">
            {[
              { label: "Ready", value: ready, hint: "Offered to visitors now" },
              { label: "Needs work", value: ACTIONS.filter((a) => a.readiness !== "ready" && a.readiness !== "disabled").length, hint: "Setup or a connection" },
              { label: "Completed", value: completions, hint: "Last 30 days" },
              { label: "Placements", value: ACTIONS.reduce((n, a) => n + a.placements.length, 0), hint: "Across Agent, Pages and routing" },
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
            title="No actions match"
            body="Actions are how Concierge finishes a job instead of just describing it. Add one and it becomes available to your Agent immediately."
            action={<Button leading={<PlusIcon size={15} />}>Add an action</Button>}
          />
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              open={openId === action.id}
              onToggle={() => setOpenId(openId === action.id ? null : action.id)}
              siteId={siteId}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function ActionCard({
  action,
  open,
  onToggle,
  siteId,
}: {
  action: ActionDef;
  open: boolean;
  onToggle: () => void;
  siteId: string;
}) {
  const r = READINESS[action.readiness];
  const Icon = KIND_ICON[action.kind] ?? ActionsIcon;
  const live = action.readiness === "ready";

  return (
    <Card
      className={cx(
        "flex flex-col p-5 transition-colors",
        open && "border-line-strong",
        !live && "bg-surface-subtle/60",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            live ? "bg-accent-soft text-accent-ink" : "bg-surface-sunken text-text-tertiary",
          )}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{action.name}</h3>
          <p className="mt-1 text-[13px] leading-[1.5] text-text-tertiary">{action.description}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={r.tone} dot={live}>
          {r.label}
        </Badge>
        {action.provider && <Badge tone="neutral">{action.provider}</Badge>}
        {live && action.completions30d > 0 && (
          <span className="text-[12.5px] tabular-nums text-text-tertiary">
            {action.completions30d} completed this month
          </span>
        )}
      </div>

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
                <p className="text-[13px] text-text-tertiary">Nothing — it runs on its own.</p>
              ) : (
                <ul className="space-y-1">
                  {action.collects.map((f) => (
                    <li key={f.key} className="flex items-center gap-2 text-[13.5px]">
                      <CheckIcon size={12} className="shrink-0 text-text-muted" />
                      {f.label}
                      {f.required && <span className="text-[11px] text-text-muted">required</span>}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>

          <div>
            <dt className="t-eyebrow text-text-muted">Then</dt>
            <dd className="mt-1.5 text-[13px] leading-[1.5] text-text-secondary">{action.outcome}</dd>
          </div>

          {action.placements.length > 0 && (
            <div>
              <dt className="t-eyebrow text-text-muted">Placed in</dt>
              <dd className="mt-1.5 flex flex-wrap gap-1.5">
                {action.placements.map((p) => (
                  <Badge key={p} tone="neutral">
                    {p === "agent" ? "Agent" : p === "pages" ? "Pages" : p === "website" ? "Website" : "Routing"}
                  </Badge>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-4 flex items-center gap-2 pt-1">
        <Button size="sm" variant={live ? "secondary" : "primary"}>
          {live ? "Configure" : action.readiness === "needs-connection" ? "Connect provider" : "Set it up"}
        </Button>
        <Button size="sm" variant="tertiary" onClick={onToggle}>
          {open ? "Less" : "How it works"}
        </Button>
        {!live && action.readiness === "needs-connection" && (
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

export { SparkIcon };
