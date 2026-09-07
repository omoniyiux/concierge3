"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Panel, Select } from "@/components/ui";
import { CloseIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { FIELD_LABEL, OP_LABEL } from "@/components/routing/MomentLabels";
import { INTENT_LABEL } from "@/lib/format";
import type { Destination, RoutingRule, RuleCondition, RuleOperator } from "@/lib/types";

/* ============================================================================
   RULE EDITOR
   ----------------------------------------------------------------------------
   The page reads rules as sentences, so the editor builds one: IF this, and
   this, THEN that. Conditions are rows rather than a nested expression — an
   owner who needs boolean grouping needs a different product, and pretending
   otherwise would make the simple case worse for everyone.
   ========================================================================== */

const FIELDS = Object.keys(FIELD_LABEL) as RuleCondition["field"][];
const OPS = Object.keys(OP_LABEL) as RuleOperator[];
const INTENTS = Object.keys(INTENT_LABEL);

export function RuleEditor({
  rule,
  destinations,
  onSave,
  onClose,
}: {
  /** Absent when adding a new rule. */
  rule?: RoutingRule;
  destinations: Destination[];
  onSave: (r: RoutingRule) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(rule?.name ?? "");
  const [conditions, setConditions] = useState<RuleCondition[]>(
    rule?.conditions ?? [{ field: "intent", operator: "is", value: "booking" }],
  );
  const [destinationId, setDestinationId] = useState(rule?.destinationId ?? destinations[0]?.id ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const ready = name.trim() && destinationId && conditions.every((c) => c.value.trim());

  function set(i: number, patch: Partial<RuleCondition>) {
    setConditions((prev) => prev.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  }

  function save() {
    if (!ready) return;
    onSave({
      id: rule?.id ?? `rule_${Date.now()}`,
      siteId: rule?.siteId ?? "site_northlane",
      name: name.trim(),
      enabled: rule?.enabled ?? true,
      conditions,
      destinationId,
      priority: rule?.priority ?? 99,
      matches30d: rule?.matches30d ?? 0,
    });
  }

  return (
    <Panel className="cg-enter mb-4">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <h2 className="t-section">{rule ? `Edit “${rule.name}”` : "New rule"}</h2>
          <p className="t-body-sm mt-1 max-w-[62ch] text-text-tertiary">
            Rules run top to bottom and the first match wins, so put the most specific ones highest.
          </p>
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
        <Field
          label="What does this rule do?"
          htmlFor="r-name"
          hint="Written for whoever reads it next, not for you today."
        >
          <Input
            id="r-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Emergencies go straight to the phone line"
          />
        </Field>

        <div>
          <p className="mb-2 block text-[13px] font-medium">If</p>
          <div className="space-y-2">
            {conditions.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                {i > 0 && <span className="t-eyebrow w-8 shrink-0 text-text-muted">and</span>}
                {i === 0 && <span className="w-8 shrink-0" aria-hidden />}

                <Select
                  value={c.field}
                  onChange={(e) => set(i, { field: e.target.value as RuleCondition["field"] })}
                  aria-label="Which detail to test"
                  className="w-[140px]"
                >
                  {FIELDS.map((f) => (
                    <option key={f} value={f}>
                      {FIELD_LABEL[f]}
                    </option>
                  ))}
                </Select>

                <Select
                  value={c.operator}
                  onChange={(e) => set(i, { operator: e.target.value as RuleOperator })}
                  aria-label="How to compare it"
                  className="w-[120px]"
                >
                  {OPS.map((o) => (
                    <option key={o} value={o}>
                      {OP_LABEL[o]}
                    </option>
                  ))}
                </Select>

                {c.field === "intent" ? (
                  <Select
                    value={c.value}
                    onChange={(e) => set(i, { value: e.target.value })}
                    aria-label="Which value"
                    className="w-[180px]"
                  >
                    {INTENTS.map((v) => (
                      <option key={v} value={v}>
                        {INTENT_LABEL[v]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    value={c.value}
                    onChange={(e) => set(i, { value: e.target.value })}
                    aria-label="Which value"
                    placeholder="Austin"
                    className="w-[180px]"
                  />
                )}

                {conditions.length > 1 && (
                  <button
                    type="button"
                    aria-label="Remove this condition"
                    onClick={() => setConditions((prev) => prev.filter((_, j) => j !== i))}
                    className="p-1.5 text-text-tertiary transition-colors hover:text-danger"
                  >
                    <TrashIcon size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="tertiary"
            className="mt-2 -ml-2.5"
            leading={<PlusIcon size={13} />}
            onClick={() =>
              setConditions((prev) => [...prev, { field: "location", operator: "is", value: "" }])
            }
          >
            Add a condition
          </Button>
        </div>

        <Field label="Then tell" htmlFor="r-dest">
          <Select
            id="r-dest"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="sm:w-[320px]"
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.target}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface-subtle px-6 py-4">
        <Button onClick={save} disabled={!ready}>
          {rule ? "Save rule" : "Create rule"}
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Panel>
  );
}
