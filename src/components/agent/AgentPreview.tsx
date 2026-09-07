"use client";

import { useState } from "react";
import { ArrowRight, CheckIcon, SendIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { Badge, Button, Input, Spinner } from "@/components/ui";
import { cx } from "@/lib/cx";

type Turn = {
  id: string;
  q: string;
  a: string;
  /** How the answer was reached, so the owner can audit it. */
  verdict: { kind: "answer" | "action" | "handoff" | "refusal"; note: string };
  cites?: string[];
  confidence: number;
};

const SCRIPTED: Record<string, Omit<Turn, "id" | "q">> = {
  "how much does your service cost?": {
    a: "A New Patient Exam is $89 and includes X-rays and a cleaning. Cleanings on their own are $120, and whitening starts at $349. Anything cosmetic is quoted after a short consultation so you get a real number rather than a range.",
    verdict: { kind: "answer", note: "Answered from approved knowledge" },
    cites: ["Treatment pricing", "Recommended next step"],
    confidence: 0.91,
  },
  "can i book?": {
    a: "I can put a request in. Consultations run Monday to Thursday — would a morning or an afternoon suit you better?",
    verdict: { kind: "action", note: "Triggered Book an appointment" },
    cites: ["Opening hours"],
    confidence: 0.88,
  },
  "i want to speak to someone.": {
    a: "Of course. I can have the front desk call you back — what number should they use?",
    verdict: { kind: "handoff", note: "Routed to Front desk · Email" },
    cites: ["Human escalation rules"],
    confidence: 0.95,
  },
  "will my insurance cover a crown?": {
    a: "I am not able to confirm insurance coverage — the front desk checks that against your specific plan. I can pass your details on so they can look it up for you.",
    verdict: { kind: "refusal", note: "Never-promise rule applied" },
    cites: ["Things Concierge should never promise"],
    confidence: 0.97,
  },
  "do you treat children under 5?": {
    a: "I do not have that in my approved knowledge yet, so I would rather not guess. Let me put you through to the practice — they can answer properly.",
    verdict: { kind: "handoff", note: "Knowledge gap · logged to Insights" },
    confidence: 0.42,
  },
};

const SUGGESTIONS = Object.keys(SCRIPTED).map((k) =>
  k.replace(/^./, (c) => c.toUpperCase()),
);

const VERDICT_STYLE = {
  answer: { tone: "approved" as const, label: "Answered" },
  action: { tone: "accent" as const, label: "Action" },
  handoff: { tone: "info" as const, label: "Handoff" },
  refusal: { tone: "review" as const, label: "Refused safely" },
};

/**
 * The preview is a simulation, and says so. Every reply carries its verdict,
 * its sources and its confidence, because the owner is auditing behaviour
 * here — not chatting.
 */
export function AgentPreview({ greeting }: { greeting: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  function ask(question: string) {
    const key = question.trim().toLowerCase();
    const scripted = SCRIPTED[key];
    setThinking(true);
    setDraft("");
    setTimeout(() => {
      setTurns((t) => [
        ...t,
        {
          id: `${Date.now()}`,
          q: question,
          ...(scripted ?? {
            a: "I do not have that in my approved knowledge, so I would rather not guess. Shall I put you through to the practice?",
            verdict: { kind: "handoff", note: "Knowledge gap · logged to Insights" },
            confidence: 0.38,
          }),
        },
      ]);
      setThinking(false);
    }, 850);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="t-eyebrow mb-2.5 text-text-muted">Suggested tests</p>
        <ul className="space-y-1.5">
          {SUGGESTIONS.map((s) => {
            const used = turns.some((t) => t.q.toLowerCase() === s.toLowerCase());
            return (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => ask(s)}
                  className={cx(
                    "flex w-full items-start gap-2 rounded-lg border p-2.5 text-left text-[12.5px] transition-colors",
                    used
                      ? "border-success-line bg-approved-soft text-text-secondary"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  {used && <CheckIcon size={12} className="mt-0.5 shrink-0 text-success" strokeWidth={2.4} />}
                  {s}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[12px] text-text-tertiary">
          {turns.length} of {SUGGESTIONS.length} launch checks run
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[10px] font-semibold text-text-inverse">
            C+
          </span>
          <p className="text-[12.5px] font-medium">Northlane Concierge</p>
          <Badge tone="neutral" className="ml-auto">
            Simulation · nothing is sent
          </Badge>
        </div>

        <div className="cg-scroll max-h-[520px] min-h-[380px] space-y-5 overflow-y-auto p-4">
          <Bubble side="agent">{greeting}</Bubble>

          {turns.length === 0 && !thinking && (
            <p className="pt-10 text-center text-[13px] text-text-tertiary">
              Ask something a real visitor would ask. You will see the answer, where it came from and where it
              would route.
            </p>
          )}

          {turns.map((t) => {
            const v = VERDICT_STYLE[t.verdict.kind];
            return (
              <div key={t.id} className="space-y-3">
                <Bubble side="visitor">{t.q}</Bubble>
                <div className="max-w-[88%]">
                  <Bubble side="agent">{t.a}</Bubble>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone={v.tone} dot>
                      {v.label}
                    </Badge>
                    <span className="text-[11.5px] text-text-tertiary">{t.verdict.note}</span>
                    <span
                      className={cx(
                        "text-[11.5px] tabular-nums",
                        t.confidence < 0.6 ? "text-warning" : "text-text-muted",
                      )}
                    >
                      {Math.round(t.confidence * 100)}% confidence
                    </span>
                  </div>
                  {t.cites && (
                    <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-text-tertiary">
                      <ShieldIcon size={11} className="text-success" />
                      From {t.cites.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {thinking && (
            <div className="flex items-center gap-2.5 text-[12.5px] text-text-tertiary">
              <Spinner size={13} className="text-accent" />
              Checking approved knowledge…
            </div>
          )}
        </div>

        <form
          className="flex items-center gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) ask(draft);
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type what a visitor would ask"
            aria-label="Test question"
            className="flex-1"
          />
          <Button type="submit" disabled={!draft.trim()} leading={<SendIcon size={14} />}>
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: "visitor" | "agent"; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "w-fit max-w-[88%] rounded-xl px-3.5 py-2.5 text-[13px] leading-[1.55]",
        side === "agent"
          ? "rounded-tl-sm border border-line bg-surface-subtle"
          : "ml-auto rounded-tr-sm bg-ink text-text-inverse",
      )}
    >
      {children}
    </div>
  );
}

export { ArrowRight, SparkIcon };
