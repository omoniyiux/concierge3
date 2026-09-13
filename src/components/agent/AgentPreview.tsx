"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertIcon,
  ArrowRight,
  CheckIcon,
  ChevronDown,
  RefreshIcon,
  SendIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { Badge, Button, Input, SegmentedControl, Spinner, type Tone } from "@/components/ui";
import { cx } from "@/lib/cx";
import { AGENT, DEFAULT_SITE_ID, actionsFor, destinationsFor, getSite } from "@/lib/demo-data";
import { STATUS_LABEL, openingEnvelope } from "@/lib/format";
import {
  EVENT_LABEL,
  FLOW_PATH,
  advance,
  ask,
  initialFlow,
  nextEvents,
  type ExtraAnswer,
  type FlowConfig,
  type FlowEffect,
  type FlowEvent,
  type FlowState,
  type FlowTurn,
  type VerdictKind,
} from "@/lib/agent-flow";

/* ============================================================================
   THE PREVIEW
   ----------------------------------------------------------------------------
   A whole conversation, not a reply. The owner drives the visitor's half, and
   the pane beside it shows the half they never get to see: where the thread
   stands, what it produced, and what happens next if nobody touches it.

   TWO PANES, ONE FACT EACH
   ----------------------------------------------------------------------------
   This used to stack the whole rail underneath the transcript inside a dialog,
   which put the outcome four screens below the composer and said the same
   thing up to five times — a status badge, a standing sentence, a row of every
   status that exists, a seven-step tick list, and an effect card, all for the
   single fact that a handoff is waiting.

   So: the transcript and its composer are pinned on the left and never move,
   the outcome sits on the right and scrolls on its own, and every fact has
   exactly one home. The path an owner has already watched happen is folded
   away, the taxonomy of statuses is gone, and coverage — which is progress,
   not outcome — sits in a strip at the foot where chrome belongs.
   ========================================================================== */

const VERDICT_STYLE: Record<VerdictKind, { tone: Tone; label: string }> = {
  answer: { tone: "approved", label: "Answered" },
  action: { tone: "accent", label: "Action" },
  handoff: { tone: "info", label: "Handoff" },
  refusal: { tone: "review", label: "Refused safely" },
  gap: { tone: "review", label: "Would not guess" },
};

const EFFECT_TONE: Record<FlowEffect["tone"], Tone> = {
  neutral: "neutral",
  approved: "approved",
  review: "review",
  restricted: "restricted",
  info: "info",
  accent: "accent",
};

/** The five behaviours worth seeing before launch. Seen, not listed. */
const BEHAVIOURS: { kind: VerdictKind; label: string }[] = [
  { kind: "answer", label: "Answers from knowledge" },
  { kind: "action", label: "Completes an action" },
  { kind: "handoff", label: "Puts someone through" },
  { kind: "refusal", label: "Holds a never-promise rule" },
  { kind: "gap", label: "Refuses to guess" },
];

const STATUS_TONE: Record<string, Tone> = {
  new: "neutral",
  active: "info",
  qualified: "accent",
  converted: "approved",
  "handed-off": "info",
  closed: "neutral",
};

export function AgentPreview({
  greeting,
  /** Answers this run knows that the standing knowledge does not — what the
      owner just approved, so they can watch it take effect. */
  extraAnswers,
  /** Asked automatically on open. */
  seedQuestion,
  /** Inside a dialog: fixed height, two panes, each scrolling on its own. */
  compact,
  siteId = DEFAULT_SITE_ID,
}: {
  greeting: string;
  extraAnswers?: Record<string, ExtraAnswer>;
  seedQuestion?: string;
  compact?: boolean;
  siteId?: string;
}) {
  const site = getSite(siteId);
  const [afterHours, setAfterHours] = useState(false);
  const [flow, setFlow] = useState<FlowState>(initialFlow);
  const [shown, setShown] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState("");
  const [seen, setSeen] = useState<VerdictKind[]>([]);
  const timers = useRef<number[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  const config: FlowConfig = useMemo(() => {
    const envelope = openingEnvelope(site.openingHours.days);
    const opens = envelope ? `${envelope.opens / 60}am on the next working day` : "the next working day";
    return {
      agent: AGENT,
      actions: actionsFor(site.id),
      destinations: destinationsFor(site.id),
      siteName: site.name,
      currency: site.currency,
      afterHours,
      opensAgain: opens,
      extraAnswers,
    };
  }, [site, afterHours, extraAnswers]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  /** New turns arrive one at a time, because a wall of them reads as fiction. */
  function play(next: FlowState, from: number) {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setFlow(next);
    setSeen((s) => {
      const kinds = next.turns.slice(from).flatMap((t) => (t.verdict ? [t.verdict.kind] : []));
      return Array.from(new Set([...s, ...kinds]));
    });

    let i = from;
    // What the visitor said is on screen before Concierge has thought about it.
    if (next.turns[i]?.author === "visitor") i += 1;
    setShown(i);
    if (i >= next.turns.length) return;

    setThinking(true);
    let delay = 760;
    for (let k = i; k < next.turns.length; k++) {
      const at = k;
      timers.current.push(
        window.setTimeout(() => {
          setShown(at + 1);
          if (at + 1 >= next.turns.length) setThinking(false);
        }, delay),
      );
      delay += next.turns[k].author === "system" ? 420 : 640;
    }
  }

  function say(utterance: string) {
    setDraft("");
    play(ask(config, flow, utterance), flow.turns.length);
  }

  function happen(event: FlowEvent) {
    play(advance(config, flow, event), flow.turns.length);
  }

  function restart() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setThinking(false);
    setShown(0);
    setFlow(initialFlow());
  }

  // The seeded question is asked once, on open.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seedQuestion || seeded.current) return;
    seeded.current = true;
    const t = window.setTimeout(() => play(ask(config, initialFlow(), seedQuestion), 0), 260);
    timers.current.push(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedQuestion]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [shown, thinking]);

  const settled = shown >= flow.turns.length && !thinking;
  const turns = flow.turns.slice(0, shown);
  const events = settled ? nextEvents(flow) : [];
  const started = flow.turns.length > 0;

  const conversation = (
    <Conversation
      greeting={greeting}
      turns={turns}
      started={started}
      thinking={thinking}
      stage={flow.stage}
      draft={draft}
      onDraft={setDraft}
      onSay={say}
      scrollerRef={scroller}
      compact={compact}
    />
  );

  const standing = <Standing flow={flow} settled={settled} started={started} bare={compact} />;

  const outcome = (
    <>
      {!started && (
        <Rail title="Before you start" flat={compact}>
          <SegmentedControl
            label="When this run happens"
            value={afterHours ? "closed" : "open"}
            onChange={(v) => setAfterHours(v === "closed")}
            options={[
              { value: "open", label: "During hours" },
              { value: "closed", label: "After hours" },
            ]}
          />
          <p className="mt-2 text-[11.5px] leading-snug text-text-tertiary">
            After hours changes the ending, not the answer: nobody is at the desk, so the handoff
            queues and a follow-up is drafted instead.
          </p>
        </Rail>
      )}

      {settled && (flow.prompts.length > 0 || events.length > 0) && (
        <Rail title={started ? "What happens next" : "Start a run"} flat={compact}>
          {/* Both halves of "what happens next" are one click that continues the
              run, so they are one section — labelled by whose move it is. */}
          {flow.prompts.length > 0 && (
            <Moves label={started ? "Visitor says" : undefined}>
              {flow.prompts.map((p) => (
                <Move key={p} title={p} onClick={() => say(p)} />
              ))}
            </Moves>
          )}
          {events.length > 0 && (
            <Moves label="You do" className={flow.prompts.length > 0 ? "mt-2.5" : undefined}>
              {events.map((e) => (
                <Move
                  key={e}
                  title={EVENT_LABEL[e].label}
                  detail={EVENT_LABEL[e].detail}
                  onClick={() => happen(e)}
                />
              ))}
            </Moves>
          )}
        </Rail>
      )}

      {flow.followUp && (
        <Rail
          title={flow.followUp.state === "sent" ? "Follow-up, sent" : "Follow-up, drafted"}
          flat={compact}
        >
          <p className="border-l-2 border-line-strong bg-surface-subtle p-2.5 text-[12px] leading-[1.55] text-text-secondary">
            {flow.followUp.body}
          </p>
          <p className="mt-2 text-[11.5px] text-text-tertiary">{flow.followUp.note}</p>
        </Rail>
      )}

      {flow.effects.length > 0 && settled && (
        <Rail title="What this produced" flat={compact}>
          <Produced effects={flow.effects} />
        </Rail>
      )}
    </>
  );

  const strip = (
    <BehaviourStrip seen={seen} started={started} onRestart={restart} bare={compact} />
  );

  /* ---- Inside a dialog: two panes, fixed, each scrolling on its own ------ */
  if (compact) {
    return (
      <div className="cg-scroll flex h-full flex-col overflow-y-auto sm:h-[min(560px,68dvh)] sm:overflow-hidden">
        <div className="min-h-0 flex-1 border-y border-divider sm:grid sm:grid-cols-[minmax(0,1fr)_308px]">
          {conversation}
          <div className="flex min-h-0 flex-col border-t border-divider bg-surface-subtle sm:border-l sm:border-t-0">
            {standing}
            <div className="cg-scroll min-h-0 flex-1 space-y-3 p-3.5 sm:overflow-y-auto">{outcome}</div>
          </div>
        </div>
        {strip}
      </div>
    );
  }

  /* ---- On its own page: the same parts, room to breathe ----------------- */
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[1fr_330px]">
      <div className="overflow-hidden bg-surface">{conversation}</div>
      <div className="space-y-4">
        <div className="border border-line bg-surface">{standing}</div>
        {outcome}
        {strip}
      </div>
    </div>
  );
}

/* ---- The conversation ------------------------------------------------------ */

function Conversation({
  greeting,
  turns,
  started,
  thinking,
  stage,
  draft,
  onDraft,
  onSay,
  scrollerRef,
  compact,
}: {
  greeting: string;
  turns: FlowTurn[];
  started: boolean;
  thinking: boolean;
  stage: FlowState["stage"];
  draft: string;
  onDraft: (v: string) => void;
  onSay: (v: string) => void;
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  compact?: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 items-center gap-2.5 border-b border-divider px-4 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center bg-ink text-[9.5px] font-semibold text-text-inverse">
          C+
        </span>
        <p className="text-[12.5px] font-medium">{AGENT.name}</p>
        <Badge tone="neutral" className="ml-auto">
          Simulation · nothing is sent
        </Badge>
      </div>

      <div
        ref={scrollerRef}
        className={cx(
          "cg-scroll space-y-4 overflow-y-auto p-4",
          compact ? "max-h-[46dvh] sm:max-h-none sm:min-h-0 sm:flex-1" : "max-h-[560px] min-h-[420px]",
        )}
      >
        <Bubble side="agent">{greeting}</Bubble>

        {!started && (
          <p className="pt-8 text-center text-[12.5px] text-text-tertiary">
            Ask something a real visitor would ask, then keep going. You are playing the visitor —
            everything that happens on your side of it shows up beside this.
          </p>
        )}

        {turns.map((t) => (
          <Turn key={t.id} turn={t} />
        ))}

        {thinking && (
          <div className="flex items-center gap-2.5 text-[11.5px] text-text-tertiary">
            <Spinner size={13} className="text-accent" />
            {stage === "routing" || stage === "waiting"
              ? "Routing to your team…"
              : "Checking approved knowledge…"}
          </div>
        )}
      </div>

      {/* Pinned. Carrying on is the primary move, so it never scrolls away. */}
      <form
        className="flex shrink-0 items-center gap-2 border-t border-divider p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) onSay(draft);
        }}
      >
        <Input
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder={
            stage === "with-person" ? "You are talking to a person now" : "Type what a visitor would say"
          }
          aria-label="What the visitor says"
          className="flex-1"
        />
        <Button type="submit" disabled={!draft.trim()} leading={<SendIcon size={14} />}>
          Send
        </Button>
      </form>
    </div>
  );
}

/* ---- Where it stands ------------------------------------------------------- */

/**
 * The status, the one sentence that says where the thread is, and the one that
 * says what happens next without anybody doing anything.
 *
 * The path the run has already taken is folded away: the owner watched it
 * happen in the transcript a second ago, so it is a receipt, not news. The old
 * row of every status that exists has gone entirely — it taught vocabulary at
 * the moment somebody wanted an outcome.
 */
function Standing({
  flow,
  settled,
  started,
  /** In the outcome pane, where the rule below it divides two panes rather
      than closing off a card of its own. */
  bare,
}: {
  flow: FlowState;
  settled: boolean;
  started: boolean;
  bare?: boolean;
}) {
  const [showPath, setShowPath] = useState(false);
  const reachedIndex = FLOW_PATH.reduce(
    (acc, step, i) => (step.stages.some((s) => flow.trail.includes(s)) ? i : acc),
    0,
  );

  return (
    <div className={cx("shrink-0 p-3.5", bare && "border-b border-divider")}>
      <div className="flex items-center gap-2">
        <Badge tone={STATUS_TONE[flow.status]} dot pulse={flow.status === "handed-off"}>
          {STATUS_LABEL[flow.status]}
        </Badge>
        {!settled && <span className="text-[11px] text-text-tertiary">working…</span>}
        {flow.takenOverBy && (
          <span className="ml-auto truncate text-[11px] text-text-tertiary">{flow.takenOverBy}</span>
        )}
      </div>

      <p className="mt-2 text-[12px] leading-[1.55] text-text-secondary">{flow.standing}</p>

      {flow.nextStep && (
        <p className="mt-2 flex gap-1.5 text-[11.5px] leading-snug text-text-secondary">
          <AlertIcon size={12} className="mt-0.5 shrink-0 text-text-tertiary" />
          {flow.nextStep}
        </p>
      )}

      {started && (
        <>
          <button
            type="button"
            onClick={() => setShowPath((v) => !v)}
            aria-expanded={showPath}
            className="mt-2.5 flex items-center gap-1 text-[11.5px] text-text-tertiary hover:text-text-primary"
          >
            {showPath ? "Hide" : "Show"} the full path
            <ChevronDown size={11} className={cx("transition-transform", showPath && "rotate-180")} />
          </button>

          {showPath && (
            <>
              <ol className="mt-2 space-y-1">
                {FLOW_PATH.map((step, i) => {
                  const reached = step.stages.some((s) => flow.trail.includes(s));
                  const current = i === reachedIndex;
                  return (
                    <li
                      key={step.key}
                      className={cx(
                        "flex items-center gap-2 text-[11.5px]",
                        current
                          ? "text-text-primary"
                          : reached
                            ? "text-text-secondary"
                            : "text-text-tertiary",
                      )}
                    >
                      <span
                        className={cx(
                          "flex h-[14px] w-[14px] shrink-0 items-center justify-center",
                          reached ? "bg-ink text-text-inverse" : "border border-line-strong",
                        )}
                      >
                        {reached && <CheckIcon size={9} strokeWidth={3} />}
                      </span>
                      {step.label}
                      {current && <span className="text-text-tertiary">· now</span>}
                    </li>
                  );
                })}
              </ol>

              {flow.score !== undefined && (
                <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
                  <SparkIcon size={11} className="text-accent" />
                  Scored {flow.score} · {flow.qualification}
                  {flow.valueConfirmed && " · value confirmed"}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ---- What happens next ----------------------------------------------------- */

function Moves({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      {label && <p className="mb-1.5 text-[11px] font-medium text-text-tertiary">{label}</p>}
      <ul className="space-y-1.5">{children}</ul>
    </div>
  );
}

function Move({
  title,
  detail,
  onClick,
}: {
  title: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full items-start gap-2 border border-line bg-surface p-2.5 text-left transition-colors hover:border-line-strong"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-medium leading-snug">{title}</span>
          {detail && (
            <span className="mt-0.5 block text-[11.5px] leading-snug text-text-tertiary">{detail}</span>
          )}
        </span>
        <ArrowRight
          size={13}
          className="mt-0.5 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
        />
      </button>
    </li>
  );
}

/* ---- What this produced ---------------------------------------------------- */

/**
 * Grouped by the surface an owner would go and look at, so a run that routed
 * to two destinations reads as one "Routing" heading with two lines under it
 * rather than two identically-badged cards.
 */
function Produced({ effects }: { effects: FlowEffect[] }) {
  const groups: { where: string; tone: FlowEffect["tone"]; items: FlowEffect[] }[] = [];
  for (const e of effects) {
    const last = groups.at(-1);
    if (last && last.where === e.where) last.items.push(e);
    else groups.push({ where: e.where, tone: e.tone, items: [e] });
  }

  return (
    <ul className="space-y-2">
      {groups.map((g) => (
        <li key={g.where + g.items[0].id} className="border border-line bg-surface p-2.5">
          <Badge tone={EFFECT_TONE[g.tone]} dot>
            {g.where}
          </Badge>
          <div className="mt-1.5 space-y-2">
            {g.items.map((e) => (
              <div key={e.id}>
                <p className="text-[12px] font-medium leading-snug">{e.title}</p>
                {e.detail && (
                  <p className="mt-0.5 text-[11.5px] leading-snug text-text-tertiary">{e.detail}</p>
                )}
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ---- Coverage -------------------------------------------------------------- */

/**
 * Progress, not outcome — so it sits in a strip at the foot rather than in the
 * pane where the run's result lives. Collapsed it is one line; open it names
 * the five behaviours worth seeing before launch.
 */
function BehaviourStrip({
  seen,
  started,
  onRestart,
  bare,
}: {
  seen: VerdictKind[];
  started: boolean;
  onRestart: () => void;
  bare?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const count = BEHAVIOURS.filter((b) => seen.includes(b.kind)).length;

  return (
    <div
      className={cx(
        "shrink-0 bg-surface px-3.5 py-2.5",
        bare ? "" : "border border-line",
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <span className="flex shrink-0 gap-1" aria-hidden>
            {BEHAVIOURS.map((b) => (
              <span
                key={b.kind}
                className={cx(
                  "h-[7px] w-[7px] rounded-full",
                  seen.includes(b.kind) ? "bg-success" : "bg-surface-sunken ring-1 ring-line-strong",
                )}
              />
            ))}
          </span>
          <span className="truncate text-[11.5px] text-text-tertiary">
            {count} of {BEHAVIOURS.length} behaviours seen
          </span>
          <ChevronDown
            size={11}
            className={cx("shrink-0 text-text-tertiary transition-transform", open && "rotate-180")}
          />
        </button>

        {started && (
          <Button
            variant="tertiary"
            size="sm"
            leading={<RefreshIcon size={13} />}
            onClick={onRestart}
            className="ml-auto shrink-0"
          >
            Start a new run
          </Button>
        )}
      </div>

      {open && (
        <ul className="mt-2.5 grid gap-1 sm:grid-cols-2">
          {BEHAVIOURS.map((b) => {
            const done = seen.includes(b.kind);
            return (
              <li
                key={b.kind}
                className={cx(
                  "flex items-center gap-2 text-[11.5px]",
                  done ? "text-text-secondary" : "text-text-tertiary",
                )}
              >
                {done ? (
                  <CheckIcon size={11} className="shrink-0 text-success" strokeWidth={2.6} />
                ) : (
                  <span className="h-[11px] w-[11px] shrink-0 border border-line-strong" />
                )}
                {b.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---- Shared ---------------------------------------------------------------- */

function Rail({
  title,
  flat,
  children,
}: {
  title: string;
  /** Inside the outcome pane, which already has its own ground and border. */
  flat?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={flat ? "" : "border border-line bg-surface-subtle p-3"}>
      <p className="t-eyebrow mb-2 text-text-muted">{title}</p>
      {children}
    </section>
  );
}

/* ---- Turns ---------------------------------------------------------------- */

function Turn({ turn }: { turn: FlowTurn }) {
  if (turn.author === "system") {
    return (
      <p className="flex items-center gap-2 py-0.5 text-[11px] text-text-tertiary">
        <span className="h-px flex-1 bg-divider" />
        <span className="max-w-[86%] text-center">{turn.body}</span>
        <span className="h-px flex-1 bg-divider" />
      </p>
    );
  }

  if (turn.author === "visitor") {
    return <Bubble side="visitor">{turn.body}</Bubble>;
  }

  if (turn.author === "person") {
    return (
      <div className="max-w-[88%]">
        <p className="mb-1 text-[11px] font-medium text-text-secondary">
          {turn.authorName} · your team
        </p>
        <div className="w-fit max-w-full border-l-2 border-accent bg-accent-soft px-3.5 py-2.5 text-[12.5px] leading-[1.55]">
          {turn.body}
        </div>
      </div>
    );
  }

  const v = turn.verdict ? VERDICT_STYLE[turn.verdict.kind] : undefined;
  return (
    <div className="max-w-[88%]">
      <Bubble side="agent">{turn.body}</Bubble>
      {(v || turn.confidence !== undefined) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {v && (
            <Badge tone={v.tone} dot>
              {v.label}
            </Badge>
          )}
          {turn.verdict && <span className="text-[11.5px] text-text-tertiary">{turn.verdict.note}</span>}
          {turn.confidence !== undefined && (
            <span
              className={cx(
                "text-[11px] tabular-nums",
                turn.confidence < 0.6 ? "text-warning" : "text-text-muted",
              )}
            >
              {Math.round(turn.confidence * 100)}% confidence
            </span>
          )}
        </div>
      )}
      {turn.cites && (
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-text-tertiary">
          <ShieldIcon size={11} className="text-success" />
          From {turn.cites.join(" · ")}
        </p>
      )}
    </div>
  );
}

function Bubble({ side, children }: { side: "visitor" | "agent"; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "w-fit max-w-[88%] px-3.5 py-2.5 text-[12.5px] leading-[1.55]",
        side === "agent" ? "bg-surface-subtle" : "ml-auto bg-ink text-text-inverse",
      )}
    >
      {children}
    </div>
  );
}
