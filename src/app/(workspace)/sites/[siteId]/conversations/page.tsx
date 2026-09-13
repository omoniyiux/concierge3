"use client";

import { Suspense, use, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/shell/AppShell";
import { Composer } from "@/components/conversations/Composer";
import { FollowUpCard } from "@/components/conversations/FollowUpCard";
import { FlagAnswerButton } from "@/components/quality/AnswerQuality";
import {
  AssignMenu,
  NoteBubble,
  NoteComposer,
  type Assignee,
  type InternalNote,
} from "@/components/conversations/Assignment";
import { Badge, Button, EmptyState, IconButton, LinkButton, SearchInput, Select } from "@/components/ui";
import {
  ActionsIcon,
  ChevronLeft,
  ClockIcon,
  CloseIcon,
  ConversationsIcon,
  ExternalIcon,
  GlobeIcon,
  InfoIcon,
  LeadsIcon,
  MailIcon,
  PhoneIcon,
  ReturnIcon,
  RoutingIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import {
  ACTIONS,
  AGENT,
  LEADS,
  brainFor,
  conversationsFor,
  destinationsFor,
  getFollowUps,
  getOutcomes,
  getSite,
} from "@/lib/demo-data";
import { launchChecklist } from "@/lib/health";
import { NothingYet } from "@/components/shell/NothingYet";
import {
  BASIS_LABEL,
  CHANNEL_LABEL,
  CHANNEL_VERB,
  INTENT_LABEL,
  OUTCOME_LABEL,
  STATUS_LABEL,
  clockTime,
  money,
  relativeTime,
} from "@/lib/format";
import type { Conversation, ConversationStatus, FollowUp, Message, MessageChannel } from "@/lib/types";
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
  return (
    <Suspense fallback={<InboxFallback />}>
      <Inbox siteId={siteId} />
    </Suspense>
  );
}

/** The queue renders before the deep link resolves, so the shell never jumps. */
function InboxFallback() {
  return (
    <PageContainer flush>
      <div className="flex h-full">
        <div className="w-full border-r border-divider bg-surface lg:w-[336px] lg:shrink-0" />
      </div>
    </PageContainer>
  );
}

function Inbox({ siteId }: { siteId: string }) {
  // The ledger links straight at a conversation, so a figure an owner is
  // querying opens the evidence rather than the top of the list.
  const deepLinked = useSearchParams().get("c");
  // Only this site's inbox. A new workspace opens empty rather than onto
  // somebody else's visitors.
  const all = conversationsFor(siteId);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    deepLinked && all.some((c) => c.id === deepLinked) ? deepLinked : (all[0]?.id ?? null),
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      if (filter === "needs-reply" && !["new", "active"].includes(c.status)) return false;
      if (filter === "qualified" && !["qualified", "converted"].includes(c.status)) return false;
      if (filter === "handed-off" && c.status !== "handed-off") return false;
      if (q && !`${c.visitorName} ${c.preview}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, filter, query]);

  const selected = all.find((c) => c.id === selectedId) ?? null;

  // A site with no conversations at all is a different page to a filter that
  // matched nothing.
  if (all.length === 0) {
    const site = getSite(siteId);
    const setupComplete = launchChecklist(site, brainFor(siteId), destinationsFor(siteId), siteId).every(
      (s) => s.done,
    );
    return (
      <PageContainer>
        <div className="pt-14">
          <NothingYet
            siteId={siteId}
            setupComplete={setupComplete}
            noun="conversations"
            body="Every conversation a visitor starts will appear here, with what Concierge answered from and where it routed."
          />
        </div>
      </PageContainer>
    );
  }

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
          <div className="border-b border-divider px-5 pb-5">
            <div className="flex h-16 items-center justify-between gap-3">
              <h1 className="t-section">Conversations</h1>
              <span className="text-[11.5px] tabular-nums text-text-tertiary">{list.length} shown</span>
            </div>
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search visitors and messages"
              aria-label="Search conversations"
            />
            <div className="mt-2.5">
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
              <li className="p-6">
                <p className="text-[12.5px] text-text-tertiary">
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
                        "relative w-full border-b border-divider px-5 py-4 text-left transition-colors",
                        active ? "bg-surface-hover" : "hover:bg-surface-subtle",
                      )}
                    >
                      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-accent" />}
                      <div className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                          {c.visitorName}
                        </span>
                        <span className="shrink-0 text-[11.5px] tabular-nums text-text-muted">
                          {relativeTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-[1.45] text-text-tertiary">
                        {c.preview}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
                        <Badge tone={STATUS_TONE[c.status]} dot={c.status === "new" || c.status === "active"}>
                          {STATUS_LABEL[c.status]}
                        </Badge>
                        <Badge tone="neutral">{INTENT_LABEL[c.intent]}</Badge>
                        {c.afterHours && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-accent-ink"
                            title="Arrived outside opening hours"
                          >
                            <ClockIcon size={10} />
                            After hours
                          </span>
                        )}
                        {c.unanswered && (
                          <span className="text-[10px] font-medium text-warning">Unanswered</span>
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
            key={selected.id}
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

  // A person taking the thread, and anything they send, lives here until
  // there is an API behind it. Remounting on conversation change keeps one
  // thread's takeover from leaking into the next.
  const [takenOverBy, setTakenOverBy] = useState(c.takenOverBy);
  const [sent, setSent] = useState<Message[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>(getFollowUps(c.id));
  // Below xl the visitor panel is a sheet rather than a column.
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Who has picked this thread up, and what the team has said about it
  // without the visitor seeing.
  const [assignee, setAssignee] = useState<Assignee>(null);
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [noting, setNoting] = useState(false);

  const messages = [...c.messages, ...sent];
  // A thread is only reachable on the page while the visitor is still there.
  const live = c.status === "new" || c.status === "active";

  function takeOver() {
    const at = new Date().toISOString();
    setTakenOverBy({ name: "Olaifa", at });
    setSent((prev) => [
      ...prev,
      {
        id: `sys_${prev.length}`,
        author: "system",
        body: "Olaifa took over. Concierge has stopped replying on this thread.",
        at,
        channel: c.channel,
      },
    ]);
  }

  function send(channel: MessageChannel, text: string) {
    setSent((prev) => [
      ...prev,
      {
        id: `h_${prev.length}`,
        author: "human",
        authorName: "Olaifa",
        body: text,
        at: new Date().toISOString(),
        channel,
      },
    ]);
  }

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 border-b border-divider bg-surface px-4 py-3 sm:px-6">
          <IconButton label="Back to list" size={30} className="lg:hidden" onClick={onBack}>
            <ChevronLeft size={17} />
          </IconButton>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[12.5px] font-semibold">{c.visitorName}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] text-text-tertiary">
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
              {c.afterHours && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 text-accent-ink">
                    <ClockIcon size={11} />
                    Arrived after hours
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <AssignMenu assignee={assignee} onAssign={setAssignee} />
            <Button
              variant="tertiary"
              size="sm"
              leading={<InfoIcon size={13} />}
              className="xl:hidden"
              onClick={() => setDetailsOpen(true)}
            >
              Details
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              leading={<LeadsIcon size={13} />}
              className="hidden sm:inline-flex"
            >
              {lead ? "Open lead" : "Create lead"}
            </Button>
            <Badge tone={STATUS_TONE[c.status]} dot>
              {STATUS_LABEL[c.status]}
            </Badge>
          </div>
        </header>

        <div className="cg-scroll min-h-0 flex-1 space-y-5 overflow-y-auto bg-canvas px-4 py-6 sm:px-6">
          {messages.map((m, i) => {
            // The thread moved channel here. Say so once, where it happened,
            // rather than tagging every message with where it travelled.
            const moved = i > 0 && m.channel !== messages[i - 1].channel;

            if (m.author === "system") {
              return (
                <div key={m.id} className="space-y-4">
                  {moved && <ChannelBreak channel={m.channel} />}
                  <div className="flex items-center gap-2.5">
                    <span className="h-px flex-1 bg-line" />
                    <p className="flex items-center gap-1.5 text-center text-[11.5px] text-text-tertiary">
                      <RoutingIcon size={12} />
                      {m.body}
                    </p>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                </div>
              );
            }

            const isVisitor = m.author === "visitor";
            const isHuman = m.author === "human";
            return (
              <div key={m.id} className="space-y-4">
                {moved && <ChannelBreak channel={m.channel} />}
                <div className={cx("flex flex-col", isVisitor ? "items-start" : "items-end")}>
                  <div
                    className={cx(
                      "max-w-[86%] px-4 py-3 sm:max-w-[76%]",
                      isVisitor
                        ? "bg-surface"
                        : isHuman
                          ? "border border-ink bg-surface text-text-primary"
                          : "bg-ink text-text-inverse",
                    )}
                  >
                    {isHuman && (
                      <p className="mb-1 text-[10px] font-semibold text-text-tertiary">
                        {m.authorName ?? "You"} · sent by hand
                      </p>
                    )}
                    <p className="text-[12.5px] leading-[1.55]">{m.body}</p>
                  </div>

                  <div
                    className={cx(
                      "mt-1.5 flex max-w-[86%] flex-wrap items-center gap-x-2.5 gap-y-1 sm:max-w-[76%]",
                      isVisitor ? "" : "justify-end",
                    )}
                  >
                    <span className="text-[10px] tabular-nums text-text-muted">{clockTime(m.at)}</span>
                    {m.confidence !== undefined && (
                      <span
                        className={cx(
                          "text-[10px] tabular-nums",
                          m.confidence < 0.6 ? "text-warning" : "text-text-muted",
                        )}
                      >
                        {Math.round(m.confidence * 100)}% confidence
                      </span>
                    )}
                    {/* Anyone can say "that was wrong", from the answer itself. */}
                    {m.author === "agent" && <FlagAnswerButton said={m.body} />}
                    {m.citations?.map((cit) => (
                      <span
                        key={cit.itemId}
                        className="inline-flex items-center gap-1 text-[10px] text-text-tertiary"
                      >
                        <ShieldIcon size={10} className="text-success" />
                        {cit.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {notes.map((n) => (
            <NoteBubble key={n.id} note={n} />
          ))}

          {noting && (
            <NoteComposer
              onAdd={(n) => {
                setNotes((list) => [...list, n]);
                setNoting(false);
              }}
            />
          )}

          {followUps.map((f) => (
            <FollowUpCard
              key={f.id}
              followUp={f}
              onApprove={(body) =>
                setFollowUps((prev) =>
                  prev.map((x) => (x.id === f.id ? { ...x, state: "approved", body } : x)),
                )
              }
              onDecline={() =>
                setFollowUps((prev) => prev.map((x) => (x.id === f.id ? { ...x, state: "declined" } : x)))
              }
            />
          ))}

          {c.unanswered && (
            <div className="border border-warning-line bg-warning-soft p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium text-warning">
                <SparkIcon size={14} />
                Concierge could not answer this
              </p>
              <p className="mt-1.5 text-[11.5px] leading-[1.5] text-text-secondary">
                &ldquo;{c.unanswered}&rdquo; is not in your approved knowledge. Adding it means the next
                visitor gets an answer instead of a handoff.
              </p>
              <LinkButton
                href={`/sites/${siteId}/agent/brain`}
                size="sm"
                variant="secondary"
                className="mt-3"
              >
                Add to Site Brain
              </LinkButton>
            </div>
          )}
        </div>

        <Composer
          live={live}
          consent={c.consent}
          allowed={AGENT.followUpChannels}
          takenOverBy={takenOverBy}
          onTakeOver={takeOver}
          onSend={send}
          onNote={() => setNoting(true)}
        />
      </div>

      {/* Pane 3 — what Concierge worked out ---------------------------
          A fixed column where there is room for one, and a sheet where there
          is not. Below 1280px this used to be unreachable: the qualification,
          the consent and the outcome simply did not exist on a laptop or a
          phone. */}
      <aside className="hidden w-[316px] shrink-0 border-l border-divider bg-surface xl:block">
        <div className="cg-scroll h-full overflow-y-auto p-6">
          <VisitorPanel conversation={c} messageCount={messages.length} siteId={siteId} />
        </div>
      </aside>

      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <button
            type="button"
            aria-label="Close details"
            onClick={() => setDetailsOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div className="cg-enter relative flex h-full w-full max-w-[380px] flex-col border-l border-divider bg-surface">
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-divider px-5">
              <h2 className="min-w-0 flex-1 truncate text-[12.5px] font-semibold">
                What Concierge worked out
              </h2>
              <IconButton label="Close details" size={32} onClick={() => setDetailsOpen(false)}>
                <CloseIcon size={16} />
              </IconButton>
            </header>
            <div className="cg-scroll min-h-0 flex-1 overflow-y-auto p-5">
              <VisitorPanel conversation={c} messageCount={messages.length} siteId={siteId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Everything Concierge worked out about a visitor: who they are, where you
 * may reach them, how they qualified, what it produced and where it went.
 */
function VisitorPanel({
  conversation: c,
  messageCount,
  siteId,
}: {
  conversation: Conversation;
  messageCount: number;
  siteId: string;
}) {
  const lead = LEADS.find((l) => l.id === c.leadId);
  const outcomes = getOutcomes(c.id);
  const site = getSite(siteId);

  return (
    <>
      <h3 className="t-eyebrow text-text-muted">Visitor</h3>
      <dl className="mt-3 space-y-3">
        <Row label="Name" value={c.visitorName} />
        {c.visitorLocation && <Row label="Location" value={c.visitorLocation} />}
        <Row label="Intent" value={INTENT_LABEL[c.intent]} />
        <Row label="Landing page" value={c.pageUrl} />
        <Row label="Messages" value={String(messageCount)} />
      </dl>

      {/* Reachability, stated as permission rather than as data we hold. */}
      <h3 className="t-eyebrow mt-7 text-text-muted">You may reach them</h3>
      {c.consent.length === 0 ? (
        <p className="mt-2.5 text-[11.5px] leading-[1.5] text-text-tertiary">
          Nowhere yet. They have not left an address or a number in this conversation, so nothing can follow
          them off the page.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {c.consent.map((k) => (
            <li key={k.channel} className="border border-line bg-surface-subtle p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-semibold">{CHANNEL_LABEL[k.channel]}</span>
                <span className="text-[10px] text-text-tertiary">{relativeTime(k.grantedAt)}</span>
              </div>
              <p className="mt-1 truncate text-[11.5px] text-text-secondary">{k.address}</p>
              <p className="mt-1.5 text-[10px] leading-[1.45] text-text-tertiary">{k.basis}</p>
            </li>
          ))}
        </ul>
      )}

      {lead && (
        <>
          <h3 className="t-eyebrow mt-7 text-text-muted">Qualification</h3>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-medium capitalize">{lead.qualification} lead</span>
              <span className="t-num text-[15px]">{lead.score}</span>
            </div>
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div
                className={cx(
                  "h-full",
                  lead.score >= 80 ? "bg-success" : lead.score >= 50 ? "bg-accent" : "bg-text-muted",
                )}
                style={{ width: `${lead.score}%` }}
              />
            </div>
            <dl className="mt-4 space-y-3">
              {lead.service && <Row label="Service" value={lead.service} />}
              {lead.budget && <Row label="Budget" value={lead.budget} />}
              {lead.urgency && <Row label="Urgency" value={lead.urgency.replace("-", " ")} caps />}
              {lead.email && <Row label="Email" value={lead.email} />}
              {lead.phone && <Row label="Phone" value={lead.phone} />}
            </dl>
          </div>
        </>
      )}

      {outcomes.length > 0 && (
        <>
          <h3 className="t-eyebrow mt-7 text-text-muted">What it produced</h3>
          <ul className="mt-3 space-y-2">
            {outcomes.map((o) => (
              <li key={o.id} className="border border-line bg-surface-subtle p-3">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[11px] font-semibold">{OUTCOME_LABEL[o.kind]}</span>
                  <span className="t-num shrink-0 text-[12.5px]">
                    {o.value > 0 ? money(o.value, site.currency) : "—"}
                  </span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-[1.45] text-text-secondary">{o.summary}</p>
                <p className="mt-1.5 text-[10px] text-text-tertiary">
                  {BASIS_LABEL[o.basis]}
                  {o.valueNote ? ` · ${o.valueNote}` : ""}
                </p>
              </li>
            ))}
          </ul>
          <Link
            href={`/sites/${siteId}/ledger`}
            className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary"
          >
            <ReturnIcon size={12} />
            See this in the ledger
          </Link>
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
                <li key={id} className="flex items-center gap-2.5 bg-surface-subtle px-3 py-2.5">
                  <ActionsIcon size={14} className="shrink-0 text-text-tertiary" />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">{a.name}</span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {c.routedTo && (
        <>
          <h3 className="t-eyebrow mt-7 text-text-muted">Routed to</h3>
          <p className="mt-2.5 flex items-center gap-2 bg-surface-subtle px-3 py-2.5 text-[12px]">
            <RoutingIcon size={14} className="shrink-0 text-text-tertiary" />
            {c.routedTo}
          </p>
        </>
      )}

      <a
        href={`https://northlanedental.com${c.pageUrl}`}
        target="_blank"
        rel="noreferrer"
        className="mt-7 inline-flex items-center gap-1.5 text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary"
      >
        Open the page they were on
        <ExternalIcon size={12} />
      </a>
    </>
  );
}

/** Marks the point in a thread where the conversation changed channel. */
function ChannelBreak({ channel }: { channel: MessageChannel }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-px flex-1 bg-line-strong" />
      <p className="flex items-center gap-1.5 text-[10.5px] font-medium text-accent-ink">
        {channel === "email" ? <MailIcon size={11} /> : <PhoneIcon size={11} />}
        Continued {CHANNEL_VERB[channel]}
      </p>
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  );
}

function Row({ label, value, caps }: { label: string; value: string; caps?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-[12.5px] text-text-tertiary">{label}</dt>
      {/* Only the enum-ish fields get title-casing; URLs and emails must not. */}
      <dd className={cx("min-w-0 truncate text-right text-[13px] font-medium", caps && "capitalize")}>
        {value}
      </dd>
    </div>
  );
}
