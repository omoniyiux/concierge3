"use client";

import { useEffect, useState } from "react";
import { Button, Checkbox, Field, Input, Panel, Select } from "@/components/ui";
import { CloseIcon } from "@/components/icons";
import { DESTINATION_STICKER } from "@/components/stickers/maps";
import { ALL_MOMENTS, KIND_LABEL, KIND_TARGET, MOMENT_LABEL } from "@/components/routing/MomentLabels";
import type { Destination, DestinationKind, RoutingMoment } from "@/lib/types";

/* ============================================================================
   DESTINATION EDITOR
   ----------------------------------------------------------------------------
   Adding a place for requests to land, or repairing one that stopped working.

   The moments are checkboxes rather than a rules language: an owner is
   deciding "tell the front desk when someone asks for a person", and that is
   a sentence, not a condition tree.
   ========================================================================== */

const KINDS: DestinationKind[] = [
  "email",
  "slack",
  "sms",
  "webhook",
  "ticket",
  "telegram",
  "inbox",
  "taskologic",
];

export function DestinationEditor({
  destination,
  onSave,
  onClose,
}: {
  /** Absent when adding a new one. */
  destination?: Destination;
  onSave: (d: Destination) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(destination?.name ?? "");
  const [kind, setKind] = useState<DestinationKind>(destination?.kind ?? "email");
  const [target, setTarget] = useState(destination?.target ?? "");
  const [moments, setMoments] = useState<RoutingMoment[]>(destination?.moments ?? ["high-intent"]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Sticker = DESTINATION_STICKER[kind];
  const copy = KIND_TARGET[kind];
  const ready = name.trim() && target.trim() && moments.length > 0;
  const repairing = destination?.status === "failing";

  function save() {
    if (!ready) return;
    onSave({
      id: destination?.id ?? `dest_${Date.now()}`,
      siteId: destination?.siteId ?? "site_northlane",
      kind,
      name: name.trim(),
      target: target.trim(),
      // A repaired or newly added destination has not proved itself yet.
      status: "untested",
      moments,
      lastDeliveryAt: destination?.lastDeliveryAt,
      lastTestedAt: destination?.lastTestedAt,
    });
  }

  return (
    <Panel className="cg-enter mb-4">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div className="flex items-start gap-3">
          <Sticker size={32} className="shrink-0" />
          <div>
            <h2 className="t-section">
              {repairing
                ? `Fix ${destination.name}`
                : destination
                  ? `Configure ${destination.name}`
                  : "Add a destination"}
            </h2>
            <p className="t-body-sm mt-1 max-w-[62ch] text-text-tertiary">
              {repairing
                ? "The endpoint stopped accepting deliveries. Correct it here, then send a test to confirm it is back."
                : "Somewhere a request can land the moment Concierge cannot finish the job itself."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close without saving"
          className="shrink-0 p-1 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
          <Field label="What should we call it?" htmlFor="d-name">
            <Input
              id="d-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Front desk"
            />
          </Field>
          <Field label="How does it reach you?" htmlFor="d-kind">
            <Select
              id="d-kind"
              value={kind}
              onChange={(e) => setKind(e.target.value as DestinationKind)}
              disabled={Boolean(destination)}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label={copy.label}
          htmlFor="d-target"
          hint={
            repairing ? "The last delivery to this address returned a 503." : "You can change this later."
          }
        >
          <Input
            id="d-target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={copy.placeholder}
          />
        </Field>

        <div>
          <p className="mb-2 block text-[13px] font-medium">Tell this destination when</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ALL_MOMENTS.map((m) => (
              <Checkbox
                key={m}
                checked={moments.includes(m)}
                onChange={(on) => setMoments((prev) => (on ? [...prev, m] : prev.filter((x) => x !== m)))}
                label={MOMENT_LABEL[m]}
              />
            ))}
          </div>
          {moments.length === 0 && (
            <p className="mt-2 text-[11.5px] text-danger">
              Pick at least one, or this destination would never hear anything.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface-subtle px-6 py-4">
        <Button onClick={save} disabled={!ready}>
          {destination ? "Save changes" : "Add destination"}
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <p className="ml-auto text-[11px] text-text-tertiary">
          Saving marks it untested. Send a test to confirm it delivers.
        </p>
      </div>
    </Panel>
  );
}
