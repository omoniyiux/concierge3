"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BillingIcon,
  CalendarIcon,
  CheckIcon,
  ConversationsIcon,
  LeadsIcon,
  PhoneIcon,
  PlayIcon,
  SearchIcon,
  SendIcon,
  SparkIcon,
  TeamIcon,
} from "@/components/icons";
import { Badge, Button, Field, IconButton, Input, Select, Textarea, Toggle, type Tone } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { cx } from "@/lib/cx";
import { dispatch } from "@/lib/pages-editor";
import {
  CAPABILITIES,
  agentOf,
  answerVisitor,
  capabilityState,
  greetingFor,
  hasCapability,
  quickActions,
  withCapability,
  type AgentReply,
  type CapabilityState,
} from "@/lib/page-agent";
import type { AgentCapability, PageAgent, PageAgentTone, PageDocument } from "@/lib/types";

/* ============================================================================
   AGENT CONTROLS
   ----------------------------------------------------------------------------
   What the embedded agent does, as switches with their consequences written
   next to them. Used in the create flow and in the editor, so an owner meets
   the same controls in both places and the agent they configured on day one
   is recognisably the one they are editing later.
   ========================================================================== */

export const CAPABILITY_ICON: Record<AgentCapability, (p: { size?: number; className?: string }) => ReactNode> = {
  answer: ConversationsIcon,
  guide: SearchIcon,
  leads: LeadsIcon,
  booking: CalendarIcon,
  handoff: TeamIcon,
  promotions: SparkIcon,
  contact: PhoneIcon,
  payment: BillingIcon,
};

const STATE_BADGE: Record<CapabilityState, { tone: Tone; label: string }> = {
  ready: { tone: "approved", label: "Ready" },
  "in-use": { tone: "info", label: "In use" },
  "needs-setup": { tone: "review", label: "Needs setup" },
  off: { tone: "neutral", label: "Off" },
};

/** The capability switches, as cards (create flow) or rows (editor sidebar). */
export function CapabilityList({
  document,
  onChange,
  layout = "grid",
}: {
  document: PageDocument;
  onChange: (agent: PageAgent) => void;
  layout?: "grid" | "list";
}) {
  const agent = agentOf(document);

  return (
    <ul className={cx(layout === "grid" ? "grid gap-2.5 sm:grid-cols-2" : "border-t border-divider")}>
      {CAPABILITIES.map((def) => {
        const Icon = CAPABILITY_ICON[def.id];
        const on = hasCapability(agent, def.id);
        const { state, note } = capabilityState(document, def.id);
        const badge = STATE_BADGE[state];

        if (layout === "list") {
          return (
            <li key={def.id} className="flex items-start gap-3 border-b border-divider py-3">
              <Icon size={16} className={cx("mt-0.5 shrink-0", on ? "text-text-primary" : "text-text-disabled")} />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium">{def.label}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
                  {on && <Badge tone={badge.tone}>{badge.label}</Badge>}
                  <span className="truncate">{on ? note : def.description}</span>
                </span>
              </span>
              <Toggle size="sm" checked={on} label={def.label} onChange={(v) => onChange(withCapability(agent, def.id, v))} />
            </li>
          );
        }

        return (
          <li
            key={def.id}
            className={cx(
              "flex min-h-[132px] flex-col border bg-surface p-4 transition-colors",
              on ? "border-line-hover" : "border-line",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cx(
                  "flex h-8 w-8 shrink-0 items-center justify-center",
                  on ? "bg-ink text-text-inverse" : "bg-surface-subtle text-text-tertiary",
                )}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium">{def.label}</span>
                <span className="mt-1 block text-[11.5px] leading-[1.5] text-text-tertiary">{def.description}</span>
              </span>
              <Toggle size="sm" checked={on} label={def.label} onChange={(v) => onChange(withCapability(agent, def.id, v))} />
            </div>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3">
              <Badge tone={badge.tone}>{badge.label}</Badge>
              <span className="truncate text-[11.5px] text-text-tertiary">{on ? note : "Switched off"}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The pieces a capability cannot work without — the offer itself, the payment
 * link — and how the agent sounds. Only what is switched on is asked for.
 */
export function AgentSettings({
  document,
  siteName,
  onChange,
}: {
  document: PageDocument;
  siteName: string;
  onChange: (agent: PageAgent) => void;
}) {
  const agent = agentOf(document);
  const promotion = agent.promotion ?? {
    headline: "",
    detail: "",
    collects: "email" as const,
    cta: "Get my offer",
  };

  return (
    <div className="space-y-4">
      {hasCapability(agent, "promotions") && (
        <div className="space-y-3 border border-line bg-surface p-4">
          <p className="t-eyebrow text-text-muted">Your promotion</p>
          <Field label="Headline" htmlFor="promo-headline">
            <Input
              id="promo-headline"
              value={promotion.headline}
              placeholder="Summer offer: 20% off"
              onChange={(e) =>
                onChange({
                  ...agent,
                  promotion: e.target.value || promotion.detail ? { ...promotion, headline: e.target.value } : undefined,
                })
              }
            />
          </Field>
          <Field label="Details" htmlFor="promo-detail">
            <Input
              id="promo-detail"
              value={promotion.detail}
              placeholder="Take 20% off your first booking."
              onChange={(e) => onChange({ ...agent, promotion: { ...promotion, detail: e.target.value } })}
            />
          </Field>
          <Field label="Collect" htmlFor="promo-collects">
            <Select
              id="promo-collects"
              value={promotion.collects}
              onChange={(e) =>
                onChange({ ...agent, promotion: { ...promotion, collects: e.target.value as "phone" | "email" } })
              }
            >
              <option value="email">Email addresses</option>
              <option value="phone">Phone numbers</option>
            </Select>
          </Field>
        </div>
      )}

      {hasCapability(agent, "payment") && (
        <Field label="Payment link" htmlFor="payment-url" hint="Stripe, Square, PayPal — any checkout link works.">
          <Input
            id="payment-url"
            value={agent.paymentUrl ?? ""}
            placeholder="https://buy.stripe.com/…"
            onChange={(e) => onChange({ ...agent, paymentUrl: e.target.value || undefined })}
          />
        </Field>
      )}

      <Field label="How it sounds" htmlFor="agent-tone">
        <Select
          id="agent-tone"
          value={agent.tone}
          onChange={(e) => onChange({ ...agent, tone: e.target.value as PageAgentTone })}
        >
          <option value="friendly">Friendly — warm and helpful</option>
          <option value="professional">Professional — clear and direct</option>
          <option value="premium">Premium — calm and considered</option>
        </Select>
      </Field>

      <Field label="Greeting" htmlFor="agent-greeting" hint="Leave it empty and Concierge writes one from what the agent can do.">
        <Textarea
          id="agent-greeting"
          rows={3}
          value={agent.greeting ?? ""}
          placeholder={greetingFor({ ...agent, greeting: undefined }, siteName)}
          onChange={(e) => onChange({ ...agent, greeting: e.target.value || undefined })}
        />
      </Field>
    </div>
  );
}

/* ============================================================================
   TEST MODE
   ========================================================================== */

type Turn = { from: "visitor" | "agent"; text: string; reply?: AgentReply };

/**
 * Talk to the agent before a visitor does. It answers from the page alone, so
 * a question it cannot answer here is a gap on the page — which is the most
 * useful thing a test can show before launch.
 */
export function AgentTest({ document, siteName, className }: { document: PageDocument; siteName: string; className?: string }) {
  const agent = agentOf(document);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [turns]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q) return;
    const reply = answerVisitor(document, siteName, q);
    setTurns((t) => [...t, { from: "visitor", text: q }, { from: "agent", text: reply.text, reply }]);
    setDraft("");
  };

  const starters = [...quickActions(agent), "Where are you based?", "How much does it cost?"].slice(0, 5);

  return (
    <div className={cx("flex min-h-0 flex-col border border-line-strong bg-surface", className)}>
      <div className="flex items-center gap-2 border-b border-divider px-4 py-3">
        <span className="h-1.5 w-1.5 bg-success cg-live-dot" aria-hidden />
        <p className="text-[12.5px] font-medium">Test mode</p>
        <p className="ml-auto text-[11.5px] text-text-tertiary">Nothing here reaches your inbox</p>
      </div>

      <div className="cg-scroll min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface-subtle p-4">
        <Bubble from="agent">{greetingFor(agent, siteName)}</Bubble>
        {turns.map((turn, i) => (
          <Bubble key={i} from={turn.from}>
            {turn.text}
            {turn.reply && (turn.reply.action || turn.reply.source) && (
              <span className="mt-2 flex flex-wrap items-center gap-1.5">
                {turn.reply.action && <Badge tone="accent">Opens: {turn.reply.action}</Badge>}
                {turn.reply.source && <Badge tone="neutral">{turn.reply.source}</Badge>}
              </span>
            )}
          </Bubble>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-divider p-3">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {starters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => ask(s)}
              className="border border-line-strong bg-surface px-2.5 py-1 text-[11.5px] text-text-secondary transition-colors hover:border-ink hover:text-text-primary"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(draft);
          }}
        >
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask what a visitor would ask…" />
          <IconButton label="Send" size={40} tone="default" type="submit" className="border border-line-strong">
            <SendIcon size={15} />
          </IconButton>
        </form>
      </div>
    </div>
  );
}

function Bubble({ from, children }: { from: "visitor" | "agent"; children: ReactNode }) {
  return (
    <div className={cx("flex", from === "visitor" && "justify-end")}>
      <p
        className={cx(
          "max-w-[85%] px-3 py-2.5 text-[12.5px] leading-[1.5]",
          from === "visitor" ? "bg-ink text-text-inverse" : "border border-line bg-surface",
        )}
      >
        {children}
      </p>
    </div>
  );
}

/* ============================================================================
   THE AGENT, INSIDE THE EDITOR
   ========================================================================== */

/**
 * The same switches the create flow offered, writing through the editor so
 * every change is undoable and lands in the same save as the page.
 */
export function EditorAgentPanel({ document, siteName }: { document: PageDocument; siteName: string }) {
  const [testing, setTesting] = useState(false);
  const apply = (agent: PageAgent, mergeKey?: string) =>
    dispatch({ type: "apply", doc: { ...document, agent, updatedAt: new Date().toISOString() }, mergeKey });

  return (
    <div className="cg-scroll h-full overflow-y-auto">
      <div className="border-b border-divider px-4 py-3.5">
        <p className="t-eyebrow text-text-muted">Agent actions</p>
        <p className="mt-1.5 text-[12.5px] leading-[1.5] text-text-tertiary">
          What your agent can do on this site. Switching one changes the widget, the buttons, and the Actions it
          creates.
        </p>
      </div>
      <div className="px-4">
        <CapabilityList document={document} layout="list" onChange={(agent) => apply(agent)} />
      </div>
      <div className="px-4 py-4">
        <AgentSettings document={document} siteName={siteName} onChange={(agent) => apply(agent, "agent-settings")} />
      </div>
      <div className="sticky bottom-0 space-y-2 border-t border-divider bg-surface p-4">
        <Button block variant="secondary" leading={<PlayIcon size={13} />} onClick={() => setTesting(true)}>
          Test agent
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-success">
          <CheckIcon size={12} strokeWidth={2.4} />
          Site and agent are in sync
        </p>
      </div>

      <Modal
        open={testing}
        onClose={() => setTesting(false)}
        eyebrow="Agent"
        title="Test your agent"
        description="Ask what a visitor would. It answers from this page only — anything it can't answer is a gap worth filling."
        size="lg"
      >
        <AgentTest document={document} siteName={siteName} className="h-[480px]" />
      </Modal>
    </div>
  );
}
