"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, Button, Field, Panel, SearchInput, SectionHead, Textarea } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { AlertIcon, CheckIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { relativeTime } from "@/lib/format";
import {
  FLAG_REASON,
  FLAG_STATE_LABEL,
  RETRACTS_KNOWLEDGE,
  flagsFor,
  whatWeSaid,
  type AnswerFlag,
  type FlagReason,
} from "@/lib/quality";
import { useConversations, useFlags } from "@/lib/sim/store";

/* ============================================================================
   ANSWER QUALITY
   Three things, in the order an owner needs them: flag the bad answer, see
   every flag and what came of it, and — the one that actually calms people
   down — find out how many other visitors were told the same thing.
   ========================================================================== */

/** The control that lives on a message in the thread. */
export function FlagAnswerButton({
  said,
  cites = [],
  onFlagged,
}: {
  said: string;
  /** What the answer was built from, so the flag can reach the knowledge. */
  cites?: { itemId: string; title: string }[];
  onFlagged?: (reason: FlagReason, note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<FlagReason>("wrong");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDone(false);
          setOpen(true);
        }}
        className="text-[10px] text-text-muted underline-offset-2 transition-colors hover:text-danger hover:underline"
      >
        Flag this answer
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Answer quality"
        title={done ? "Flagged" : "What was wrong with this answer?"}
        description={
          done
            ? "It is on the review queue with the exact wording kept. Nothing about the thread changes for the visitor."
            : "The wording is kept exactly as it was said, so this can be traced later even if the knowledge behind it changes."
        }
        footer={
          done ? (
            <Button onClick={() => setOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="tertiary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                leading={<AlertIcon size={13} />}
                onClick={() => {
                  onFlagged?.(reason, note.trim());
                  setDone(true);
                }}
              >
                Flag it
              </Button>
            </>
          )
        }
      >
        <ModalSection title="What it said">
          <div className="border-l-2 border-ink bg-surface-subtle py-3 pl-4 pr-3">
            <p className="text-[12.5px] leading-[1.55]">{said}</p>
          </div>
        </ModalSection>

        {!done && (
          <>
            <ModalSection title="The problem">
              <div className="space-y-2">
                {(Object.keys(FLAG_REASON) as FlagReason[]).map((key) => {
                  const active = reason === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setReason(key)}
                      aria-pressed={active}
                      className={cx(
                        "flex w-full items-start gap-3 border p-3 text-left transition-colors",
                        active ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-strong",
                      )}
                    >
                      <span
                        className={cx(
                          "mt-px flex h-[17px] w-[17px] shrink-0 items-center justify-center border",
                          active ? "border-ink bg-ink text-white" : "border-line-strong",
                        )}
                      >
                        {active && <CheckIcon size={11} strokeWidth={2.6} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-medium">{FLAG_REASON[key].label}</span>
                        <span className="mt-0.5 block text-[12px] leading-[1.45] text-text-tertiary">
                          {FLAG_REASON[key].detail}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </ModalSection>

            {/* The consequence, before they commit to it. Retracting an
                approval takes knowledge off the site, so it is said plainly
                rather than discovered afterwards. */}
            {cites.length > 0 && (
              <ModalSection title="What this will do">
                {RETRACTS_KNOWLEDGE[reason] ? (
                  <div className="border border-warning-line bg-warning-soft p-3.5">
                    <p className="text-[12.5px] leading-[1.55]">
                      <span className="font-medium">
                        {cites.map((c) => c.title).join(" and ")} will stop being used
                      </span>{" "}
                      <span className="text-text-secondary">
                        the moment you flag this, and go back on your review queue. Concierge will not
                        answer from {cites.length === 1 ? "it" : "them"} again until you approve{" "}
                        {cites.length === 1 ? "it" : "them"}.
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="border border-line-strong p-3.5">
                    <p className="text-[12.5px] leading-[1.55] text-text-secondary">
                      This one is about how the Agent behaved, not what it knows, so{" "}
                      <span className="font-medium text-text-primary">
                        {cites.map((c) => c.title).join(" and ")}
                      </span>{" "}
                      stays approved. The flag goes on the queue for you to look at.
                    </p>
                  </div>
                )}
              </ModalSection>
            )}

            <ModalSection>
              <Field
                label="What should it have said?"
                htmlFor="flag-note"
                hint="Optional, but it is usually the fastest route to the fix."
              >
                <Textarea
                  id="flag-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[72px]"
                />
              </Field>
            </ModalSection>
          </>
        )}
      </Modal>
    </>
  );
}

/* ---- The queue, and the search ------------------------------------------- */

export function AnswerQualityPanel({ siteId }: { siteId: string }) {
  // Live: a flag raised in a thread has to show up here without a reload.
  const flags = flagsFor(useFlags(siteId), siteId);
  const conversations = useConversations(siteId);
  const [query, setQuery] = useState("");
  const hits = whatWeSaid(conversations, siteId, query);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <Panel className="overflow-hidden">
        <SectionHead
          title="Answers your team flagged"
          hint="Every one keeps the exact wording, so it can be traced after the knowledge behind it changes."
          className="p-5 sm:p-6"
        />
        {flags.length === 0 ? (
          <p className="border-t border-divider px-6 py-10 text-center text-[12.5px] text-text-tertiary">
            Nothing has been flagged. Anyone on your team can flag an answer from the conversation it appeared
            in.
          </p>
        ) : (
          <ul className="divide-y divide-divider border-t border-divider">
            {flags.map((f) => (
              <FlagRow key={f.id} flag={f} siteId={siteId} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="p-5 sm:p-6">
        <SectionHead
          title="What have we been telling people?"
          hint="Search what the agent actually said, not what it was meant to say."
          className="mb-4"
        />
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="whitening, insurance, $89…"
          aria-label="Search what the agent said"
        />

        {query.trim().length < 2 ? (
          <p className="mt-4 text-[12px] leading-[1.5] text-text-tertiary">
            The question every owner asks after finding one bad answer: how many other people heard it. This
            searches every word the agent has said on this site.
          </p>
        ) : hits.length === 0 ? (
          <p className="mt-4 text-[12px] text-text-tertiary">
            Concierge has never said that to anyone on this site.
          </p>
        ) : (
          <>
            <p className="mt-4 text-[12px] font-medium">
              Said to {hits.length} {hits.length === 1 ? "visitor" : "visitors"}
            </p>
            <ul className="cg-scroll mt-2.5 max-h-[320px] space-y-2 overflow-y-auto">
              {hits.map((h, i) => (
                <li key={`${h.conversationId}-${i}`}>
                  <Link
                    href={`/sites/${siteId}/conversations?c=${h.conversationId}`}
                    className="block border border-line bg-surface p-3 transition-colors hover:border-ink"
                  >
                    <p className="flex items-center justify-between gap-2 text-[11px] text-text-tertiary">
                      <span className="truncate font-medium text-text-secondary">{h.visitorName}</span>
                      <span className="shrink-0">{relativeTime(h.at)}</span>
                    </p>
                    <p className="mt-1.5 line-clamp-3 text-[12px] leading-[1.5]">{h.body}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}

function FlagRow({ flag: f, siteId }: { flag: AnswerFlag; siteId: string }) {
  const [state, setState] = useState(f.state);

  return (
    <li className="px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={state === "fixed" ? "approved" : state === "dismissed" ? "neutral" : "review"}>
              {FLAG_STATE_LABEL[state]}
            </Badge>
            <Badge tone="neutral">{FLAG_REASON[f.reason].label}</Badge>
            {f.alsoTold > 0 && (
              <span className="text-[11.5px] text-text-tertiary">
                {f.alsoTold} other {f.alsoTold === 1 ? "visitor was" : "visitors were"} told the same
              </span>
            )}
          </div>

          <blockquote className="mt-2.5 border-l-2 border-line-strong pl-3 text-[12.5px] leading-[1.55]">
            {f.said}
          </blockquote>

          {f.note && (
            <p className="mt-2 text-[12px] leading-[1.5] text-text-secondary">
              <span className="font-medium">{f.flaggedBy}:</span> {f.note}
            </p>
          )}

          <p className="mt-2 text-[11.5px] text-text-tertiary">
            Flagged {relativeTime(f.at)} ·{" "}
            <Link
              href={`/sites/${siteId}/conversations?c=${f.conversationId}`}
              className="underline-offset-2 hover:underline"
            >
              open the conversation
            </Link>
          </p>

          {f.resolution && state === "fixed" && (
            <p className="mt-2.5 flex items-start gap-2 bg-success-soft p-3 text-[12px] leading-[1.5] text-text-secondary">
              <CheckIcon size={13} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
              {f.resolution}
            </p>
          )}
        </div>

        {state !== "fixed" && state !== "dismissed" && (
          <div className="flex shrink-0 items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setState("fixed")}>
              Mark fixed
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setState("dismissed")}>
              Not a problem
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
