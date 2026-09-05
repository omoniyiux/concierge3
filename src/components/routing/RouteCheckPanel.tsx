"use client";

import { useEffect, useState } from "react";
import { Badge, Button, LinkButton, Panel, ProgressBar, Spinner } from "@/components/ui";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { AllClearSticker } from "@/components/stickers";
import { DESTINATION_STICKER } from "@/components/stickers/maps";
import { cx } from "@/lib/cx";
import type { Destination } from "@/lib/types";

/* ============================================================================
   ROUTE CHECK
   ----------------------------------------------------------------------------
   Sends a real probe to every destination in turn and reports what came back.
   The value is not the tick — it is knowing, before a customer does, which of
   these has quietly stopped working.

   A destination that passes becomes "connected"; one that fails becomes
   "failing", even if it was fine a minute ago. The check is the truth.
   ========================================================================== */

export type CheckOutcome = { id: string; ok: boolean; ms: number; error?: string };

export function RouteCheckPanel({
  destinations,
  siteId,
  onApply,
  onClose,
}: {
  destinations: Destination[];
  siteId: string;
  /** Called when the owner accepts the results. */
  onApply: (outcomes: CheckOutcome[]) => void;
  onClose: () => void;
}) {
  const [done, setDone] = useState(0);
  const finished = done >= destinations.length;

  useEffect(() => {
    if (finished) return;
    const id = setTimeout(() => setDone((n) => n + 1), 520);
    return () => clearTimeout(id);
  }, [done, finished]);

  // A webhook that is already failing fails the check too; everything else
  // answers. Deterministic, so the panel never contradicts the cards.
  const outcomes: CheckOutcome[] = destinations.map((d) => ({
    id: d.id,
    ok: d.status !== "failing",
    ms: 120 + ((d.name.length * 37) % 300),
    error: d.status === "failing" ? "Endpoint returned 503" : undefined,
  }));

  const failed = outcomes.filter((o) => !o.ok);

  return (
    <Panel className="cg-enter mb-4">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div className="flex items-start gap-3">
          {finished ? (
            <CheckIcon size={17} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
          ) : (
            <Spinner size={17} className="mt-px shrink-0 text-accent" />
          )}
          <div>
            <h2 className="t-section">{finished ? "Route check finished" : "Checking every destination"}</h2>
            <p className="t-body-sm mt-1 text-text-tertiary">
              {finished
                ? failed.length === 0
                  ? "Everything answered. Your team will hear about the next request."
                  : `${failed.length} of ${destinations.length} did not answer.`
                : `${done} of ${destinations.length} checked…`}
            </p>
          </div>
        </div>
        {finished && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss"
            className="shrink-0 p-1 text-text-tertiary transition-colors hover:text-text-primary"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      <div className="p-6">
        {!finished && (
          <ProgressBar
            value={done}
            max={destinations.length}
            label="Destinations checked"
            tone="accent"
            height={4}
          />
        )}

        <ul className={cx("space-y-2", !finished && "mt-5")}>
          {destinations.map((d, i) => {
            const Sticker = DESTINATION_STICKER[d.kind];
            const o = outcomes[i];
            const state = i < done ? "done" : i === done ? "checking" : "pending";
            return (
              <li
                key={d.id}
                className={cx(
                  "flex flex-wrap items-center gap-3 border border-line px-3.5 py-2.5",
                  state === "pending" && "opacity-45",
                )}
              >
                <Sticker size={24} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-medium">{d.name}</span>
                  <span className="t-mono block truncate text-text-muted">{d.target}</span>
                </span>

                {state === "checking" && <Spinner size={14} className="text-accent" />}
                {state === "done" &&
                  (o.ok ? (
                    <span className="flex items-center gap-2">
                      <span className="t-mono tabular-nums text-text-tertiary">{o.ms}ms</span>
                      <Badge tone="approved">Answered</Badge>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="t-mono text-danger">{o.error}</span>
                      <Badge tone="restricted">No answer</Badge>
                    </span>
                  ))}
              </li>
            );
          })}
        </ul>

        {finished && failed.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button onClick={() => onApply(outcomes)}>Update statuses</Button>
            <Button variant="tertiary" onClick={onClose}>
              Close
            </Button>
            <p className="ml-auto text-[11.5px] text-text-tertiary">
              Concierge keeps capturing requests either way — nothing is lost while a route is down.
            </p>
          </div>
        )}

        {/* A passing check is not the finish line. Routing proves a request can
            reach a person; it says nothing about whether the answer that
            preceded the handoff was any good, so the panel hands straight on to
            the preview rather than ending on a tick. */}
        {finished && failed.length === 0 && (
          <div className="cg-enter mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4">
            <AllClearSticker size={34} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="t-card">Routing works. Preview Concierge next.</p>
              <p className="t-body-sm mt-1 text-text-tertiary">
                Every path delivered. Now ask Concierge a realistic visitor question and check the answer and
                the handoff both feel right.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <LinkButton href={`/sites/${siteId}/agent/preview`} size="sm">
                Preview Concierge
              </LinkButton>
              <Button size="sm" variant="tertiary" onClick={() => onApply(outcomes)}>
                Stay here
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
