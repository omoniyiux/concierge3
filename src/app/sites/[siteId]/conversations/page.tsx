"use client";

import { use, useMemo, useState } from "react";
import { PageContainer } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  LinkButton,
  SearchInput,
  Select,
  Tabs,
} from "@/components/ui";
import {
  ActionsIcon,
  ChevronLeft,
  ConversationsIcon,
  ExternalIcon,
  GlobeIcon,
  LeadsIcon,
  MailIcon,
  PhoneIcon,
  RoutingIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { ACTIONS, CONVERSATIONS, LEADS } from "@/lib/demo-data";
import { INTENT_LABEL, STATUS_LABEL, clockTime, relativeTime } from "@/lib/format";
import type { Conversation, ConversationStatus } from "@/lib/types";
import type { Tone } from "@/components/ui";

const STATUS_TONE: Record<ConversationStatus, Tone> = {
  new: "accent",
  active: "info",
  qualified: "approved",
  converted: "approved",
  "handed-off": "info",
  closed: "neutral",
};

type Filter = "all" | "needs-reply" | "qualified" | "handed-off";

/**
 * A three-pane inbox: what came in, the conversation itself, and everything
 * Concierge worked out about the visitor. On mobile it collapses to one pane
 * at a time rather than shrinking all three.
 */
export default function ConversationsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(CONVERSATIONS[0].id);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CONVERSATIONS.filter((c) => {
      if (filter === "needs-reply" && !["new", "active"].includes(c.status)) return false;
      if (filter === "qualified" && !["qualified", "converted"].includes(c.status)) return false;
      if (filter === "handed-off" && c.status !== "handed-off") return false;
      if (q && !`${c.visitorName} ${c.preview}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  const selected = CONVERSATIONS.find((c) => c.id === selectedId) ?? null;

  return (
    <PageContainer flush>
      <div className="flex h-full">
        {/* Pane 1 — the queue ------------------------------------------- */}
        <div
          className={cx(
            "flex w-full flex-col border-r border-divider bg-surface lg:w-[336px] lg:shrink-0",
            selectedId && "hidden lg:flex",
          )}
        >
          <div className="border-b border-divider px-4 pb-3 pt-4">
            <div className="flex items-baseline justify-between">
              <h1 className="t-section">Conversations</h1>
              <span className="text-[13px] tabular-nums text-text-tertiary">{list.length} shown</span>
            </div>
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search visitors and messages"
              className="mt-3"
              aria-label="Search conversations"
            />
            <div className="mt-3">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                aria-label="Filter conversations"
              >
                <option value="all">All conversations</option>
                <option value="needs-reply">Needs a reply</option>
                <option value="qualified">Qualified & converted</option>
                <option value="handed-off">Handed off</option>
              </Select>
            </div>
          </div>

          <ul className="cg-scroll min-h-0 flex-1 overflow-y-auto">
            {list.length === 0 ? (
              <li className="p-7">
                <p className="text-[14px] text-text-tertiary">
                  Nothing matches that filter. Try widening it.
                </p>
              </li>
            ) : (
              list.map((c) => {
                const active = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      aria-current={active ? "true" : undefined}
                      className={cx(
                        "relative w-full border-b border-divider px-4 py-3.5 text-left transition-colors",
                        active ? "bg-surface-hover" : "hover:bg-surface-subtle",
                      )}
                    >
                      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-accent" />}
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{c.visitorName}</span>
                        <span className="shrink-0 text-[13.5px] tabular-nums text-text-muted">
                          {relativeTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[13.5px] leading-[1.45] text-text-tertiary">{c.preview}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge tone={STATUS_TONE[c.status]} dot={c.status === "new" || c.status === "active"}>
                          {STATUS_LABEL[c.status]}
                        </Badge>
                        <Badge tone="neutral">{INTENT_LABEL[c.intent]}</Badge>
                        {c.unanswered && (
                          <span className="text-[11px] font-medium text-warning">Unanswered</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Pane 2 + 3 ---------------------------------------------------- */}
        {selected ? (
          <ConversationDetail
            conversation={selected}
            siteId={siteId}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="hidden flex-1 items-center justify-center lg:flex">
            <EmptyState
              icon={<ConversationsIcon size={19} />}
              title="Pick a conversation"
              body="Every conversation shows what the visitor asked, what Concierge answered from, and where it routed."
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
}

/* ---- Detail -------------------------------------------------------------- */

function ConversationDetail({
  conversation: c,
  siteId,
  onBack,
}: {
  conversation: Conversation;
  siteId: string;
  onBack: () => void;
}) {
  const lead = LEADS.find((l) => l.id === c.leadId);

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-divider bg-surface px-4 py-3">
          <IconButton label="Back to list" size={30} className="lg:hidden" onClick={onBack}>
            <ChevronLeft size={17} />
          </IconButton>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[14px] font-semibold">{c.visitorName}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[14px] text-text-tertiary">
              <span className="inline-flex items-center gap-1">
                <GlobeIcon size={11} />
                {c.pageUrl}
              </span>
              {c.visitorLocation && (
                <>
                  <span aria-hidden>·</span>
                  <span>{c.visitorLocation}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{relativeTime(c.startedAt)}</span>
            </p>
          </div>
          <Badge tone={STATUS_TONE[c.status]} dot>
            {STATUS_LABEL[c.status]}
          </Badge>
        </header>

        <div className="cg-scroll min-h-0 flex-1 space-y-5 overflow-y-auto bg-canvas p-5">
          {c.messages.map((m) => {
            if (m.author === "system") {
              return (
                <div key={m.id} className="flex items-center gap-2.5">
                  <span className="h-px flex-1 bg-line" />
                  <p className="flex items-center gap-1.5 text-[13.5px] text-text-tertiary">
                    <RoutingIcon size={12} />
                    {m.body}
                  </p>
                  <span className="h-px flex-1 bg-line" />
                </div>
              );
            }
            const isVisitor = m.author === "visitor";
            return (
              <div key={m.id} className={cx("flex flex-col", isVisitor ? "items-start" : "items-end")}>
                <div
                  className={cx(
                    "max-w-[76%] rounded-xl px-3.5 py-2.5",
                    isVisitor
                      ? "rounded-tl-sm bg-surface"
                      : "rounded-tr-sm bg-ink text-text-inverse",
                  )}
                >
                  <p className="text-[15px] leading-[1.6]">{m.body}</p>
                </div>

                <div
                  className={cx(
                    "mt-1.5 flex max-w-[76%] flex-wrap items-center gap-x-2.5 gap-y-1",
                    isVisitor ? "" : "justify-end",
                  )}
                >
                  <span className="text-[11px] tabular-nums text-text-muted">{clockTime(m.at)}</span>
                  {m.confidence !== undefined && (
                    <span
                      className={cx(
                        "text-[11px] tabular-nums",
                        m.confidence < 0.6 ? "text-warning" : "text-text-muted",
                      )}
                    >
                      {Math.round(m.confidence * 100)}% confidence
                    </span>
                  )}
                  {m.citations?.map((cit) => (
                    <span key={cit.itemId} className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
                      <ShieldIcon size={10} className="text-success" />
                      {cit.title}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {c.unanswered && (
            <div className="rounded-xl border border-warning-line bg-warning-soft p-4">
              <p className="flex items-center gap-2 text-[15px] font-medium text-warning">
                <SparkIcon size={14} />
                Concierge could not answer this
              </p>
              <p className="mt-1.5 text-[13.5px] leading-[1.5] text-text-secondary">
                &ldquo;{c.unanswered}&rdquo; is not in your approved knowledge. Adding it means the next visitor gets
                an answer instead of a handoff.
              </p>
              <LinkButton href={`/sites/${siteId}/brain`} size="sm" variant="secondary" className="mt-3">
                Add to Site Brain
              </LinkButton>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-divider bg-surface p-3">
          <Button variant="secondary" size="sm" leading={<MailIcon size={13} />}>
            Reply by email
          </Button>
          <Button variant="secondary" size="sm" leading={<LeadsIcon size={13} />}>
            {lead ? "Open lead" : "Create lead"}
          </Button>
          <Button variant="tertiary" size="sm" className="ml-auto">
            Mark resolved
          </Button>
        </footer>
      </div>

      {/* Pane 3 — what Concierge worked out --------------------------- */}
      <aside className="hidden w-[300px] shrink-0 border-l border-divider bg-surface xl:block">
        <div className="cg-scroll h-full overflow-y-auto p-5">
          <h3 className="t-eyebrow text-text-muted">Visitor</h3>
          <dl className="mt-3 space-y-3">
            <Row label="Name" value={c.visitorName} />
            {c.visitorLocation && <Row label="Location" value={c.visitorLocation} />}
            <Row label="Intent" value={INTENT_LABEL[c.intent]} />
            <Row label="Landing page" value={c.pageUrl} />
            <Row label="Messages" value={String(c.messageCount)} />
          </dl>

          {lead && (
            <>
              <h3 className="t-eyebrow mt-7 text-text-muted">Qualification</h3>
              <div className="mt-3 rounded-xl p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[15px] font-medium capitalize">{lead.qualification} lead</span>
                  <span className="t-num text-[19px]">{lead.score}</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
                  <div
                    className={cx(
                      "h-full rounded-full",
                      lead.score >= 80 ? "bg-success" : lead.score >= 50 ? "bg-accent" : "bg-text-muted",
                    )}
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
                <dl className="mt-5 space-y-4">
                  {lead.service && <Row label="Service" value={lead.service} />}
                  {lead.budget && <Row label="Budget" value={lead.budget} />}
                  {lead.urgency && <Row label="Urgency" value={lead.urgency.replace("-", " ")} caps />}
                  {lead.email && <Row label="Email" value={lead.email} />}
                  {lead.phone && <Row label="Phone" value={lead.phone} />}
                </dl>
              </div>
            </>
          )}

          {c.actionsTaken.length > 0 && (
            <>
              <h3 className="t-eyebrow mt-7 text-text-muted">Actions taken</h3>
              <ul className="mt-3 space-y-3">
                {c.actionsTaken.map((id) => {
                  const a = ACTIONS.find((x) => x.id === id);
                  if (!a) return null;
                  return (
                    <li key={id} className="flex items-center gap-2.5 rounded-xl bg-surface-subtle px-3.5 py-3">
                      <ActionsIcon size={14} className="shrink-0 text-text-tertiary" />
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{a.name}</span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {c.routedTo && (
            <>
              <h3 className="t-eyebrow mt-7 text-text-muted">Routed to</h3>
              <p className="mt-2.5 flex items-center gap-2 rounded-xl bg-surface-subtle px-3.5 py-3 text-[13.5px]">
                <RoutingIcon size={14} className="shrink-0 text-text-tertiary" />
                {c.routedTo}
              </p>
            </>
          )}

          <a
            href={`https://northlanedental.com${c.pageUrl}`}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] text-text-tertiary transition-colors hover:text-text-primary"
          >
            Open the page they were on
            <ExternalIcon size={12} />
          </a>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, caps }: { label: string; value: string; caps?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[14px] text-text-tertiary">{label}</dt>
      {/* Only the enum-ish fields get title-casing; URLs and emails must not. */}
      <dd className={cx("min-w-0 truncate text-right text-[15px] font-medium", caps && "capitalize")}>{value}</dd>
    </div>
  );
}

export { Tabs, PhoneIcon };
