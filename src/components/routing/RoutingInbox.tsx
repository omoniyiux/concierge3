"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, LinkButton, Panel, SegmentedControl, cx } from "@/components/ui";
import { CheckIcon, MailIcon, PhoneIcon, SendIcon } from "@/components/icons";
import { AllClearSticker, InboxSticker } from "@/components/stickers";
import { DESTINATION_STICKER } from "@/components/stickers/maps";
import { MOMENT_CHIP } from "@/components/routing/MomentLabels";
import { relativeTime } from "@/lib/format";
import type { Destination, InboxItem, InboxState } from "@/lib/types";

/* ============================================================================
   THE ROUTING INBOX
   ----------------------------------------------------------------------------
   Concierge's own destination, and the reason routing works on day one.

   Before this existed, a handoff could only be useful if the owner had already
   connected an outside tool — so the product was worthless until an OAuth
   screen had been survived. Now every routed request lands here first and the
   external destinations are copies. Connecting Slack becomes a convenience
   rather than a gate.
   ========================================================================== */

const STATE_TONE: Record<InboxState, { label: string; tone: "restricted" | "review" | "approved" | "neutral" }> =
  {
    unread: { label: "New", tone: "restricted" },
    open: { label: "Open", tone: "review" },
    answered: { label: "Answered", tone: "approved" },
    closed: { label: "Closed", tone: "neutral" },
  };

type Filter = "needs-you" | "all" | "closed";

export function RoutingInbox({
  items,
  destinations,
  siteId,
}: {
  items: InboxItem[];
  destinations: Destination[];
  siteId: string;
}) {
  const [filter, setFilter] = useState<Filter>("needs-you");
  const [state, setState] = useState<Record<string, InboxState>>({});
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const stateOf = (i: InboxItem) => state[i.id] ?? i.state;

  const rows = useMemo(() => {
    return items.filter((i) => {
      const s = stateOf(i);
      if (filter === "needs-you") return s === "unread" || s === "open";
      if (filter === "closed") return s === "closed";
      return true;
    });
    // stateOf reads `state`, which is in the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, filter, state]);

  const waiting = items.filter((i) => ["unread", "open"].includes(stateOf(i))).length;

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <InboxSticker size={30} />
          <div>
            <p className="t-card">
              {waiting === 0 ? "Nothing waiting on you" : `${waiting} waiting on you`}
            </p>
            <p className="t-body-sm mt-0.5 text-text-tertiary">
              Every handoff lands here first, whether or not anything else is connected.
            </p>
          </div>
        </div>
        <SegmentedControl
          label="Filter the inbox"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "needs-you", label: "Needs you" },
            { value: "all", label: "All" },
            { value: "closed", label: "Closed" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<AllClearSticker size={30} />}
            title={filter === "needs-you" ? "You are caught up" : "Nothing here"}
            body="When a visitor asks for a person, asks for a call, or Concierge spots a strong lead, the request lands here with the full conversation attached."
            action={
              <LinkButton href={`/sites/${siteId}/conversations`} variant="secondary">
                Read the conversations
              </LinkButton>
            }
          />
        </Panel>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((item) => {
            const s = stateOf(item);
            const st = STATE_TONE[s];
            const open = openId === item.id;
            const copies = destinations.filter((d) => item.alsoSentTo.includes(d.id));

            return (
              <li key={item.id}>
                <Card className={cx("p-5", s === "unread" && "border-ink")}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge tone={st.tone} dot={s === "unread"}>
                          {st.label}
                        </Badge>
                        <span className="text-[11px] font-medium text-text-tertiary">
                          {MOMENT_CHIP[item.moment]}
                        </span>
                        <span className="text-[11px] text-text-muted">· {item.page}</span>
                      </span>
                      <span className="mt-2 block text-[13px] font-semibold leading-[1.35]">
                        {item.visitor} — {item.summary}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11.5px] tabular-nums text-text-muted">
                      {relativeTime(item.at)}
                    </span>
                  </button>

                  {open && (
                    <div className="cg-enter mt-4 border-t border-divider pt-4">
                      <p className="t-serif max-w-[70ch] text-[13.5px] leading-[1.6] text-text-secondary">
                        {item.detail}
                      </p>

                      {(item.email || item.phone) && (
                        <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2">
                          {item.email && (
                            <span className="flex items-center gap-1.5 text-[12px]">
                              <MailIcon size={13} className="text-text-muted" />
                              {item.email}
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1.5 text-[12px] tabular-nums">
                              <PhoneIcon size={13} className="text-text-muted" />
                              {item.phone}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {item.conversationId && (
                          <LinkButton
                            href={`/sites/${siteId}/conversations?c=${item.conversationId}`}
                            size="sm"
                            leading={<SendIcon size={13} />}
                          >
                            Open and reply
                          </LinkButton>
                        )}
                        {s !== "answered" && s !== "closed" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            leading={<CheckIcon size={13} />}
                            onClick={() => setState((p) => ({ ...p, [item.id]: "answered" }))}
                          >
                            Mark answered
                          </Button>
                        )}
                        {s !== "closed" && (
                          <Button
                            size="sm"
                            variant="tertiary"
                            onClick={() => setState((p) => ({ ...p, [item.id]: "closed" }))}
                          >
                            Close it
                          </Button>
                        )}

                        {copies.length > 0 && (
                          <span className="ml-auto flex items-center gap-2 text-[11px] text-text-tertiary">
                            Also sent to
                            {copies.map((d) => {
                              const Sticker = DESTINATION_STICKER[d.kind];
                              return (
                                <span key={d.id} className="flex items-center gap-1" title={d.name}>
                                  <Sticker size={16} />
                                  {d.name}
                                </span>
                              );
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
