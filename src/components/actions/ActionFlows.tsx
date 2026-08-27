"use client";

import { useState } from "react";
import { Badge, Button, Checkbox, Field, Input, Select, Textarea, Toggle } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { ACTION_STICKER } from "@/components/stickers/maps";
import { CheckIcon, CloseIcon, PlusIcon, SparkIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { INTENT_LABEL } from "@/lib/format";
import type { ActionDef, ActionField, ActionKind, ActionPlacement, VisitorIntent } from "@/lib/types";

/* ============================================================================
   ACTION FLOWS
   An action has three states and each needs its own dialog: one that does not
   exist yet (add), one that is live (configure), and one that is waiting on
   something (set it up, or connect the provider it runs through).

   Every field here is one an owner can answer without a developer. That is
   the whole test for this surface.
   ========================================================================== */

const PLACEMENTS: { key: ActionPlacement; label: string; detail: string }[] = [
  { key: "agent", label: "Agent", detail: "Offered inside a conversation when the intent matches." },
  { key: "website", label: "Website", detail: "Available from the launcher on any page." },
  { key: "pages", label: "Pages", detail: "Placed on your Concierge-hosted pages." },
  { key: "routing", label: "Routing", detail: "Can be the destination of a routing rule." },
];

const INTENTS: VisitorIntent[] = [
  "booking",
  "pricing",
  "quote",
  "human",
  "product",
  "support",
  "hours",
  "unknown",
];

const FIELD_TYPES: ActionField["type"][] = ["text", "email", "phone", "date", "select", "number"];

/** The actions an owner can start from, and what each one needs to work. */
type Template = {
  kind: ActionKind;
  name: string;
  description: string;
  provider?: string;
  triggers: VisitorIntent[];
  collects: ActionField[];
  outcome: string;
};

const TEMPLATES: Template[] = [
  {
    kind: "booking",
    name: "Book an appointment",
    description: "Lets a visitor ask for a time. Concierge collects the details and sends the request on.",
    triggers: ["booking", "hours"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "phone", label: "Phone number", required: true, type: "phone" },
      { key: "preferred", label: "Preferred day", required: true, type: "date" },
    ],
    outcome: "A booking request lands with your team and the visitor gets a confirmation message.",
  },
  {
    kind: "quote",
    name: "Request a quote",
    description: "For work that needs a conversation before a price. Captures scope and routes it on.",
    triggers: ["quote", "pricing"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
      { key: "scope", label: "What they need", required: true, type: "text" },
    ],
    outcome: "A quote request is routed to your team with the conversation attached.",
  },
  {
    kind: "call",
    name: "Request a call",
    description: "The fastest handoff. Concierge takes a number and the page they were on.",
    triggers: ["human", "support"],
    collects: [
      { key: "phone", label: "Phone number", required: true, type: "phone" },
      { key: "window", label: "Best time to call", required: false, type: "select" },
    ],
    outcome: "Your team gets the number, the page the visitor was on, and the full transcript.",
  },
  {
    kind: "lead-capture",
    name: "Capture contact details",
    description: "A light-touch fallback when someone is not ready to book but is worth following up.",
    triggers: ["product", "unknown"],
    collects: [
      { key: "name", label: "Name", required: false, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
    ],
    outcome: "The contact is added to Leads and routed by your rules.",
  },
  {
    kind: "payment",
    name: "Take a payment",
    description: "Send a visitor into a connected checkout for deposits or booking fees.",
    provider: "Stripe",
    triggers: ["booking"],
    collects: [{ key: "amount", label: "Amount", required: true, type: "number" }],
    outcome: "The visitor completes checkout and the payment is recorded against the conversation.",
  },
  {
    kind: "offer",
    name: "Show an offer",
    description: "Surface an approved promotion at the right moment in a conversation.",
    triggers: ["pricing"],
    collects: [],
    outcome: "The visitor sees the offer and can claim it without leaving the conversation.",
  },
  {
    kind: "consultation",
    name: "Book a free consultation",
    description: "A short introductory call or visit, offered before any price is quoted.",
    triggers: ["quote"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
      { key: "preferred", label: "Preferred day", required: true, type: "date" },
    ],
    outcome: "A consultation request is created and your team is notified.",
  },
  {
    kind: "message",
    name: "Take a message",
    description: "When nobody is available, Concierge takes the message rather than losing the visitor.",
    triggers: ["human", "support"],
    collects: [
      { key: "name", label: "Name", required: true, type: "text" },
      { key: "message", label: "Message", required: true, type: "text" },
    ],
    outcome: "The message is delivered to your inbox with the conversation attached.",
  },
  {
    kind: "video",
    name: "Start a video call",
    description: "For remote consultations. Sends the visitor a room link once your team accepts.",
    provider: "Whereby",
    triggers: ["human"],
    collects: [],
    outcome: "A video room opens for the visitor and the assigned team member.",
  },
];

/* ---- Add ------------------------------------------------------------------ */

/** Two steps: pick the job, then say how it should behave. */
export function AddActionModal({
  open,
  siteId,
  onClose,
  onCreate,
}: {
  open: boolean;
  siteId: string;
  onClose: () => void;
  onCreate: (action: ActionDef) => void;
}) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggers, setTriggers] = useState<VisitorIntent[]>([]);
  const [placements, setPlacements] = useState<ActionPlacement[]>(["agent"]);
  const [saving, setSaving] = useState(false);

  function reset() {
    setTemplate(null);
    setName("");
    setDescription("");
    setTriggers([]);
    setPlacements(["agent"]);
    setSaving(false);
  }

  function close() {
    reset();
    onClose();
  }

  function choose(t: Template) {
    setTemplate(t);
    setName(t.name);
    setDescription(t.description);
    setTriggers(t.triggers);
  }

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      eyebrow="Actions"
      title={template ? `Add “${template.name}”` : "What should Concierge be able to finish?"}
      description={
        template
          ? "Everything here can be changed later. Nothing is offered to a visitor until you save it."
          : "Start from a job Concierge already knows how to do. You decide what it asks for and where it appears."
      }
      footer={
        template ? (
          <>
            <Button variant="tertiary" onClick={() => setTemplate(null)}>
              Back
            </Button>
            <Button
              loading={saving}
              disabled={name.trim().length < 3 || triggers.length === 0 || placements.length === 0}
              leading={<CheckIcon size={13} />}
              onClick={() => {
                setSaving(true);
                setTimeout(() => {
                  onCreate({
                    id: `act_${Date.now()}`,
                    siteId,
                    kind: template.kind,
                    name: name.trim(),
                    description: description.trim() || template.description,
                    provider: template.provider,
                    // A template that runs through someone else's service is
                    // not ready until that service is connected.
                    readiness: template.provider ? "needs-connection" : "ready",
                    triggers,
                    collects: template.collects,
                    outcome: template.outcome,
                    placements,
                    completions30d: 0,
                  });
                  reset();
                }, 500);
              }}
            >
              Create action
            </Button>
          </>
        ) : (
          <Button variant="tertiary" onClick={close}>
            Cancel
          </Button>
        )
      }
    >
      {!template ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((t) => {
            const Sticker = ACTION_STICKER[t.kind];
            return (
              <button
                key={t.kind + t.name}
                type="button"
                onClick={() => choose(t)}
                className="flex items-start gap-3 border border-line-strong bg-surface p-4 text-left transition-colors hover:border-ink"
              >
                <Sticker size={30} className="shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[12.5px] font-semibold">{t.name}</span>
                  <span className="mt-1 block text-[11.5px] leading-[1.5] text-text-tertiary">
                    {t.description}
                  </span>
                  {t.provider && (
                    <span className="mt-2 inline-flex">
                      <Badge tone="review">Needs {t.provider}</Badge>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <ModalSection>
            <div className="grid gap-4">
              <Field
                label="Name"
                htmlFor="action-name"
                hint="What your team calls it. Visitors never see it."
              >
                <Input id="action-name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field
                label="What it does"
                htmlFor="action-desc"
                hint="One sentence, in your own words. It appears on the card."
              >
                <Textarea
                  id="action-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[72px]"
                />
              </Field>
            </div>
          </ModalSection>

          <ModalSection title="Offer it when a visitor wants" hint="Pick at least one.">
            <IntentPicker value={triggers} onChange={setTriggers} />
          </ModalSection>

          <ModalSection title="It will ask for">
            {template.collects.length === 0 ? (
              <p className="text-[12.5px] text-text-tertiary">
                Nothing — this one runs on its own. You can add fields once it exists.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {template.collects.map((f) => (
                  <li key={f.key} className="flex items-center gap-2 text-[12.5px]">
                    <CheckIcon size={12} className="shrink-0 text-text-muted" />
                    {f.label}
                    {f.required && <span className="text-[10px] text-text-muted">required</span>}
                  </li>
                ))}
              </ul>
            )}
          </ModalSection>

          <ModalSection title="Where it appears">
            <PlacementPicker value={placements} onChange={setPlacements} />
          </ModalSection>
        </>
      )}
    </Modal>
  );
}

/* ---- Configure ------------------------------------------------------------ */

/** Everything about a live action, on one sheet. */
export function ConfigureActionModal({
  action,
  onClose,
  onSave,
}: {
  action: ActionDef | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<ActionDef>) => void;
}) {
  const [live, setLive] = useState(true);
  const [collects, setCollects] = useState<ActionField[]>([]);
  const [placements, setPlacements] = useState<ActionPlacement[]>([]);
  const [triggers, setTriggers] = useState<VisitorIntent[]>([]);
  const [outcome, setOutcome] = useState("");
  const [value, setValue] = useState("");
  const [newField, setNewField] = useState("");
  const [newType, setNewType] = useState<ActionField["type"]>("text");
  const [saving, setSaving] = useState(false);

  // Each action opens on its own settings rather than the last one's.
  const key = action?.id ?? "";
  const [seen, setSeen] = useState("");
  if (action && seen !== key) {
    setSeen(key);
    setLive(action.readiness !== "disabled");
    setCollects(action.collects);
    setPlacements(action.placements);
    setTriggers(action.triggers);
    setOutcome(action.outcome);
    setValue(action.unitValue ? String(action.unitValue / 100) : "");
    setNewField("");
    setSaving(false);
  }

  if (!action) return null;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      eyebrow="Actions"
      title={action.name}
      description="Changes take effect on the next conversation. Nothing already in flight is disturbed."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            disabled={triggers.length === 0 || (live && placements.length === 0)}
            onClick={() => {
              setSaving(true);
              const parsed = Number(value.replace(/[^0-9.]/g, ""));
              setTimeout(
                () =>
                  onSave(action.id, {
                    readiness: live ? "ready" : "disabled",
                    collects,
                    placements,
                    triggers,
                    outcome: outcome.trim() || action.outcome,
                    unitValue: Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : undefined,
                  }),
                450,
              );
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      <ModalSection>
        <div className="flex items-center gap-4 border border-line-strong bg-surface-subtle px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium">Offered to visitors</p>
            <p className="mt-0.5 text-[12px] leading-[1.45] text-text-tertiary">
              Turn this off and Concierge stops offering it, without losing the setup.
            </p>
          </div>
          <Toggle checked={live} onChange={setLive} label="Offered to visitors" />
        </div>
      </ModalSection>

      <ModalSection title="Fires when a visitor wants">
        <IntentPicker value={triggers} onChange={setTriggers} />
      </ModalSection>

      <ModalSection title="What it asks for" hint="Only ask for what you will actually use.">
        {collects.length === 0 ? (
          <p className="text-[12.5px] text-text-tertiary">Nothing yet — it runs on its own.</p>
        ) : (
          <ul className="space-y-1.5">
            {collects.map((f) => (
              <li
                key={f.key}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 border border-line bg-surface px-3.5 py-2.5"
              >
                <span className="min-w-0 flex-1 text-[12.5px] font-medium">{f.label}</span>
                <span className="text-[11.5px] text-text-tertiary">{f.type}</span>
                <label className="flex items-center gap-2 text-[11.5px] text-text-secondary">
                  Required
                  <Toggle
                    size="sm"
                    checked={f.required}
                    label={`${f.label} required`}
                    onChange={(next) =>
                      setCollects((list) => list.map((x) => (x.key === f.key ? { ...x, required: next } : x)))
                    }
                  />
                </label>
                <button
                  type="button"
                  aria-label={`Remove ${f.label}`}
                  onClick={() => setCollects((list) => list.filter((x) => x.key !== f.key))}
                  className="text-text-muted transition-colors hover:text-danger"
                >
                  <CloseIcon size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <Field label="Add a field" htmlFor="new-field" className="min-w-[160px] flex-1">
            <Input
              id="new-field"
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              placeholder="Postcode"
            />
          </Field>
          <Select
            value={newType}
            onChange={(e) => setNewType(e.target.value as ActionField["type"])}
            aria-label="Field type"
            className="w-[130px]"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            disabled={newField.trim().length < 2}
            leading={<PlusIcon size={13} />}
            onClick={() => {
              setCollects((list) => [
                ...list,
                {
                  key: `f_${Date.now()}`,
                  label: newField.trim(),
                  required: false,
                  type: newType,
                },
              ]);
              setNewField("");
            }}
          >
            Add
          </Button>
        </div>
      </ModalSection>

      <ModalSection title="Where it appears">
        <PlacementPicker value={placements} onChange={setPlacements} />
      </ModalSection>

      <ModalSection title="What happens after">
        <Textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} className="min-h-[64px]" />
      </ModalSection>

      <ModalSection
        title="What one completion is worth"
        hint="Used in the Return ledger. Concierge never invents this figure — leave it blank if you would rather it did not value this action."
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          placeholder="420"
          aria-label="Value of one completion"
          className="max-w-[180px]"
        />
        {action.unitValueNote && (
          <p className="mt-2 text-[11.5px] leading-[1.5] text-text-tertiary">{action.unitValueNote}</p>
        )}
      </ModalSection>
    </Modal>
  );
}

/* ---- Set it up ------------------------------------------------------------ */

/**
 * An action that is waiting on the owner rather than on a provider. It needs
 * the one thing only they can supply — the offer's wording, the amount, the
 * room — and then it is live.
 */
export function SetUpActionModal({
  action,
  onClose,
  onComplete,
}: {
  action: ActionDef | null;
  onClose: () => void;
  onComplete: (id: string, patch: Partial<ActionDef>) => void;
}) {
  const [detail, setDetail] = useState("");
  const [terms, setTerms] = useState("");
  const [placements, setPlacements] = useState<ActionPlacement[]>(["agent"]);
  const [saving, setSaving] = useState(false);

  const key = action?.id ?? "";
  const [seen, setSeen] = useState("");
  if (action && seen !== key) {
    setSeen(key);
    setDetail("");
    setTerms("");
    setPlacements(action.placements.length ? action.placements : ["agent"]);
    setSaving(false);
  }

  if (!action) return null;

  const isOffer = action.kind === "offer";

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow="Set up"
      title={`Finish setting up “${action.name}”`}
      description={
        isOffer
          ? "Concierge will only ever repeat what you write here, word for word. It does not invent a discount."
          : "One or two details from you and this goes live on the next conversation."
      }
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            disabled={detail.trim().length < 3 || placements.length === 0}
            leading={<CheckIcon size={13} />}
            onClick={() => {
              setSaving(true);
              setTimeout(
                () =>
                  onComplete(action.id, {
                    readiness: "ready",
                    placements,
                    outcome: isOffer
                      ? `The visitor is shown “${detail.trim()}” and can claim it without leaving the conversation.`
                      : action.outcome,
                  }),
                600,
              );
            }}
          >
            Turn it on
          </Button>
        </>
      }
    >
      <ModalSection>
        <div className="grid gap-4">
          <Field
            label={isOffer ? "The offer, exactly as it should be said" : "What Concierge should say"}
            htmlFor="setup-detail"
            hint={isOffer ? "For example: 20% off whitening for new patients this month." : undefined}
          >
            <Textarea
              id="setup-detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="min-h-[72px]"
            />
          </Field>
          <Field
            label={isOffer ? "Conditions and expiry" : "Anything it must not do"}
            htmlFor="setup-terms"
            hint="Optional. Concierge states this whenever it uses the action."
          >
            <Input
              id="setup-terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder={isOffer ? "New patients only · ends 30 September" : "Never quote a firm price"}
            />
          </Field>
        </div>
      </ModalSection>

      <ModalSection title="Where it appears">
        <PlacementPicker value={placements} onChange={setPlacements} />
      </ModalSection>

      <p className="mt-5 flex items-start gap-2.5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
        <SparkIcon size={14} className="mt-px shrink-0 text-accent-ink" />
        This is saved as approved knowledge, so the Agent can cite it. Turning the action off later leaves the
        wording intact.
      </p>
    </Modal>
  );
}

/* ---- Shared pickers -------------------------------------------------------- */

function IntentPicker({
  value,
  onChange,
}: {
  value: VisitorIntent[];
  onChange: (next: VisitorIntent[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {INTENTS.map((i) => {
        const on = value.includes(i);
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== i) : [...value, i])}
            className={cx(
              "inline-flex h-8 items-center gap-1.5 border px-3 text-[12px] font-medium transition-colors",
              on
                ? "border-ink bg-ink text-text-inverse"
                : "border-line-strong bg-surface text-text-secondary hover:border-ink hover:text-text-primary",
            )}
          >
            {on && <CheckIcon size={12} strokeWidth={2.6} />}
            {INTENT_LABEL[i]}
          </button>
        );
      })}
    </div>
  );
}

function PlacementPicker({
  value,
  onChange,
}: {
  value: ActionPlacement[];
  onChange: (next: ActionPlacement[]) => void;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {PLACEMENTS.map((p) => (
        <Checkbox
          key={p.key}
          checked={value.includes(p.key)}
          onChange={(on) => onChange(on ? [...value, p.key] : value.filter((x) => x !== p.key))}
          label={p.label}
          description={p.detail}
        />
      ))}
    </div>
  );
}
