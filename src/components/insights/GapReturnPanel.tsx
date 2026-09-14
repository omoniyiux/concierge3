"use client";

import Link from "next/link";
import { Card, Panel, SectionHead } from "@/components/ui";
import { GapSticker } from "@/components/stickers";
import { gapReturn } from "@/lib/health";
import { money, relativeTime } from "@/lib/format";
import type { Conversation, Outcome, UnansweredQuestion } from "@/lib/types";

/* ============================================================================
   WHAT ANSWERING WAS WORTH
   ----------------------------------------------------------------------------
   Every other analytics surface in this category reports traffic. This one
   reports the return on a decision the owner actually made: they answered a
   question their site could not, and here is the business that came back
   through it.

   Nothing is credited that happened before the answer was written, and an
   estimate is never quietly promoted to a fact — the same rule the ledger
   holds itself to, because a number an owner cannot trust is worse than no
   number at all.
   ========================================================================== */

export function GapReturnPanel({
  gaps,
  conversations,
  outcomes,
  currency,
  siteId,
}: {
  gaps: UnansweredQuestion[];
  conversations: Conversation[];
  outcomes: Outcome[];
  currency: string;
  siteId: string;
}) {
  const rows = gaps
    .map((gap) => ({ gap, ret: gapReturn(gap, conversations, outcomes) }))
    .filter((r): r is { gap: UnansweredQuestion; ret: NonNullable<ReturnType<typeof gapReturn>> } =>
      r.ret !== null,
    )
    .sort((a, b) => b.ret.value - a.ret.value || b.ret.conversations - a.ret.conversations);

  if (rows.length === 0) return null;

  const total = rows.reduce((n, r) => n + r.ret.value, 0);
  const asked = rows.reduce((n, r) => n + r.ret.conversations, 0);

  return (
    <Panel className="overflow-hidden">
      <SectionHead
        title="What answering was worth"
        hint="Business that came back through a question your site could not answer before you answered it."
        className="p-5 sm:p-6"
      />

      {total > 0 && (
        <Card className="mx-5 mb-1 border-0 bg-surface-subtle p-4 sm:mx-6">
          <p className="text-[12.5px] leading-[1.55]">
            <span className="font-medium">
              {money(total, currency)} from {asked} {asked === 1 ? "conversation" : "conversations"}
            </span>{" "}
            <span className="text-text-secondary">
              that Concierge could only hold because you had written the answer.
            </span>
          </p>
        </Card>
      )}

      <ul className="divide-y divide-divider border-t border-divider">
        {rows.map(({ gap, ret }) => (
          <li key={gap.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
            <GapSticker size={26} className="mt-0.5 shrink-0" />
            <div className="min-w-[200px] flex-1">
              <p className="text-[12.5px] font-medium leading-[1.5]">{gap.question}</p>
              <p className="mt-1 text-[11.5px] text-text-tertiary">
                Answered {relativeTime(ret.since)}
                {" · "}
                {ret.conversations === 0
                  ? "not asked again yet"
                  : `asked ${ret.conversations} ${ret.conversations === 1 ? "time" : "times"} since`}
                {ret.outcomes > 0 &&
                  ` · ${ret.outcomes} ${ret.outcomes === 1 ? "outcome" : "outcomes"}`}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="t-num text-[15px] leading-none">
                {ret.value > 0 ? money(ret.value, currency) : "—"}
              </p>
              <p className="mt-1 text-[11px] text-text-tertiary">
                {ret.value === 0 ? "no value yet" : ret.estimated ? "part estimated" : "confirmed"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-divider bg-surface-subtle px-5 py-3.5 sm:px-6">
        <p className="text-[11.5px] leading-[1.5] text-text-secondary">
          Only conversations after the answer was written are counted, and an estimate stays an
          estimate until you settle it in{" "}
          <Link href={`/sites/${siteId}/ledger`} className="underline underline-offset-2">
            Return
          </Link>
          .
        </p>
      </div>
    </Panel>
  );
}
