"use client";

import { Button, Card, Panel, SectionHead } from "@/components/ui";
import { CheckIcon, CloseIcon, PlusIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { proveAnswerable } from "@/lib/proof";
import type { KnowledgeItem } from "@/lib/types";

/* ============================================================================
   WHAT IT CAN ANSWER TODAY
   The proof an owner needs before they will paste a script onto their live
   website, built from the read that has already happened. See lib/proof.ts.
   ========================================================================== */

export function ProofPanel({
  items,
  onApproveAll,
  onWrite,
  onTry,
}: {
  items: KnowledgeItem[];
  onApproveAll?: () => void;
  onWrite?: (question: string) => void;
  onTry?: (question: string) => void;
}) {
  const proof = proveAnswerable(items);
  if (items.length === 0) return null;

  const { answerable, unlockable, total } = proof;

  return (
    <Panel className="overflow-hidden">
      <SectionHead
        title="What Concierge can answer today"
        hint="The questions customers actually ask, against what you have approved. Judged only on approved knowledge — nothing here is a promise it cannot keep."
        className="p-5 sm:p-6"
      />

      <Card className="mx-5 mb-1 border-0 bg-surface-subtle p-4 sm:mx-6">
        <p className="text-[12.5px] leading-[1.55]">
          <span className="font-medium">
            {answerable} of {total} answered
          </span>
          {unlockable > 0 && (
            <span className="text-text-secondary">
              {" "}
              · {unlockable} more the moment you approve what it has already read
            </span>
          )}
          {answerable === total && (
            <span className="text-text-secondary"> — everything a visitor usually asks.</span>
          )}
        </p>
        {unlockable > 0 && onApproveAll && (
          <Button size="sm" className="mt-3" onClick={onApproveAll}>
            Approve the {unlockable === 1 ? "one" : unlockable} waiting
          </Button>
        )}
      </Card>

      <ul className="divide-y divide-divider border-t border-divider">
        {proof.results.map(({ question, answeredBy, pendingOn }) => {
          const state = answeredBy ? "yes" : pendingOn ? "pending" : "no";
          return (
            <li
              key={question.ask}
              className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-5 py-3 sm:px-6"
            >
              <span
                className={cx(
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  state === "yes" && "bg-success text-white",
                  state === "pending" && "bg-warning-soft text-warning",
                  state === "no" && "bg-surface-sunken text-text-muted",
                )}
              >
                {state === "yes" ? (
                  <CheckIcon size={12} strokeWidth={2.6} />
                ) : state === "no" ? (
                  <CloseIcon size={11} />
                ) : (
                  <span className="text-[10px] font-semibold">?</span>
                )}
              </span>

              <span className="min-w-[180px] flex-1">
                <span className="block text-[12.5px] font-medium">“{question.ask}”</span>
                <span className="mt-0.5 block text-[11.5px] text-text-tertiary">
                  {answeredBy
                    ? `Answers from ${answeredBy.title}`
                    : pendingOn
                      ? `${pendingOn.title} would answer this — it is waiting on you`
                      : "Nothing read covers this. A visitor asking gets a person instead."}
                </span>
              </span>

              {state === "yes" && onTry && (
                <Button size="sm" variant="tertiary" onClick={() => onTry(question.ask)}>
                  Try it
                </Button>
              )}
              {state === "no" && onWrite && (
                <Button
                  size="sm"
                  variant="secondary"
                  leading={<PlusIcon size={13} />}
                  onClick={() => onWrite(question.ask)}
                >
                  Answer it
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
