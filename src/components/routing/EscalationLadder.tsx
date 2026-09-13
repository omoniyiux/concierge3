"use client";

import { useState } from "react";
import { Badge, Button, Field, Panel, SectionHead, Select, Toggle } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { AlertIcon, CheckIcon, ClockIcon, PhoneIcon, RoutingIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import type { Destination } from "@/lib/types";

/* ============================================================================
   WHEN NOBODY ANSWERS
   ----------------------------------------------------------------------------
   Routing delivered a request and called the job done. But delivery is not
   the promise — somebody actually dealing with it is, and a request sitting
   unread in an inbox at 2am is indistinguishable from one that was never
   sent.

   So a route now has a floor: a window in which someone has to acknowledge
   it, and a named person it goes to next when nobody does. The last rung is
   never another queue — it is a phone.
   ========================================================================== */

type Rung = {
  id: string;
  /** Minutes after the previous rung with no acknowledgement. */
  after: number;
  destinationId: string;
  label: string;
};

const WINDOWS = [5, 10, 15, 30, 60];

export function EscalationLadder({ destinations }: { destinations: Destination[] }) {
  const connected = destinations.filter((d) => d.status !== "paused");
  const [enabled, setEnabled] = useState(true);
  const [window, setWindow] = useState(15);
  const [rungs, setRungs] = useState<Rung[]>([
    { id: "r1", after: 15, destinationId: connected[1]?.id ?? "", label: "Nobody acknowledged" },
    { id: "r2", after: 30, destinationId: connected[2]?.id ?? "", label: "Still nobody" },
  ]);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [urgent, setUrgent] = useState(true);

  const nameOf = (id: string) => connected.find((d) => d.id === id)?.name ?? "a destination";

  return (
    <>
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
          <SectionHead
            title="If nobody answers"
            hint="Delivering a request is not the same as somebody dealing with it. This is what happens when a request goes unacknowledged."
          />
          <Toggle checked={enabled} onChange={setEnabled} label="Escalate unacknowledged requests" />
        </div>

        {enabled && (
          <>
            <div className="border-t border-divider px-5 py-4 sm:px-6">
              <Field
                label="Acknowledgement window"
                htmlFor="ack-window"
                hint="How long a request may sit before Concierge decides nobody has picked it up. Opening a routed conversation counts as acknowledging it."
              >
                <Select
                  id="ack-window"
                  value={String(window)}
                  onChange={(e) => setWindow(Number(e.target.value))}
                  className="max-w-[200px]"
                >
                  {WINDOWS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* The ladder itself ------------------------------------------ */}
            <ol className="divide-y divide-divider border-t border-divider">
              <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-ink text-[10px] font-semibold text-text-inverse">
                  1
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="text-[12.5px] font-medium">
                    The request goes to {nameOf(connected[0]?.id ?? "")}
                  </p>
                  <p className="mt-0.5 text-[12px] text-text-tertiary">Immediately, as it always has.</p>
                </div>
                <Badge tone="neutral">Now</Badge>
              </li>

              {rungs.map((r, i) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 sm:px-6">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-surface-sunken text-[10px] font-semibold text-text-secondary">
                    {i + 2}
                  </span>
                  <div className="min-w-[200px] flex-1">
                    <p className="text-[12.5px] font-medium">{r.label}, so it goes to</p>
                    <div className="mt-2 max-w-[280px]">
                      <Select
                        value={r.destinationId}
                        aria-label={`Destination after ${r.after} minutes`}
                        onChange={(e) =>
                          setRungs((list) =>
                            list.map((x) => (x.id === r.id ? { ...x, destinationId: e.target.value } : x)),
                          )
                        }
                      >
                        {connected.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <Badge tone="review">
                    <ClockIcon size={11} />
                    After {r.after} min
                  </Badge>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => setRungs((list) => list.filter((x) => x.id !== r.id))}
                  >
                    Remove
                  </Button>
                </li>
              ))}

              {/* The last rung is a person, not a queue. */}
              <li className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-accent-subtle px-5 py-4 sm:px-6">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-accent-solid text-white">
                  <PhoneIcon size={14} />
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="text-[12.5px] font-medium">Still nothing, so somebody gets a phone call</p>
                  <p className="mt-0.5 text-[12px] leading-[1.45] text-text-tertiary">
                    An inbox cannot be the end of the chain. This rung rings the on-call number until it is
                    answered.
                  </p>
                </div>
                <Badge tone="accent">Last resort</Badge>
              </li>
            </ol>

            <div className="border-t border-divider px-5 py-4 sm:px-6">
              <Button
                size="sm"
                variant="secondary"
                disabled={rungs.length >= 3}
                onClick={() =>
                  setRungs((list) => [
                    ...list,
                    {
                      id: `r${Date.now()}`,
                      after: (list.at(-1)?.after ?? window) + 15,
                      destinationId: connected[0]?.id ?? "",
                      label: "Still nobody",
                    },
                  ])
                }
              >
                Add another step
              </Button>
            </div>
          </>
        )}
      </Panel>

      {/* ---- The 2am problem ------------------------------------------- */}
      <Panel className={cx("p-5 sm:p-6", urgent ? "border-danger-line" : "")}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHead
            title="Out of hours, and urgent"
            hint="Some things cannot wait until you open. Concierge can recognise them and treat them differently from everything else in the queue."
          />
          <Toggle checked={urgent} onChange={setUrgent} label="Handle urgent out-of-hours requests" />
        </div>

        {urgent && (
          <>
            <div className="mt-5 flex items-start gap-3 border border-danger-line bg-danger-soft p-4">
              <AlertIcon size={16} className="mt-px shrink-0 text-danger" />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-danger">
                  Three triggers are treated as urgent on this site
                </p>
                <p className="mt-1 text-[12px] leading-[1.5] text-text-secondary">
                  Pain, swelling or bleeding · an existing treatment plan · an explicit request for a person.
                  Concierge never diagnoses, and never decides how serious something is — it recognises the
                  words and gets out of the way.
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5">
              {[
                "The visitor is told, in the same breath, how to reach someone now.",
                "The on-call number is called rather than emailed.",
                "The acknowledgement window drops to 5 minutes, whatever it is set to above.",
                "If nobody answers at all, the visitor gets the out-of-hours instruction you wrote — not silence.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[12.5px] leading-[1.5]">
                  <CheckIcon size={13} className="mt-0.5 shrink-0 text-success" strokeWidth={2.4} />
                  {line}
                </li>
              ))}
            </ul>

            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              leading={<RoutingIcon size={13} />}
              onClick={() => setUrgentOpen(true)}
            >
              Set the out-of-hours instruction
            </Button>
          </>
        )}
      </Panel>

      <Modal
        open={urgentOpen}
        onClose={() => setUrgentOpen(false)}
        eyebrow="Out of hours"
        title="What a visitor is told when nobody can be reached"
        description="This is the floor of the whole system: the words a person sees at two in the morning when every rung of the ladder has been tried."
        footer={<Button onClick={() => setUrgentOpen(false)}>Save</Button>}
      >
        <ModalSection>
          <div className="border border-line-strong bg-surface-subtle p-4">
            <p className="text-[12.5px] leading-[1.6]">
              &ldquo;I cannot reach anyone at the practice right now. If this is a dental emergency, please
              call 512 555 0199 — that line is answered out of hours. Otherwise the front desk will call you
              back from 8am, and I have already passed your number on.&rdquo;
            </p>
          </div>
          <p className="mt-3 text-[12px] leading-[1.5] text-text-tertiary">
            Concierge says this word for word. It will not improvise an emergency instruction, and it will not
            tell anyone how urgent their own situation is.
          </p>
        </ModalSection>
      </Modal>
    </>
  );
}
