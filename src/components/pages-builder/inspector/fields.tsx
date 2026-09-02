"use client";

import { useId, type ReactNode } from "react";
import { Field, IconButton, Input, Select, Textarea } from "@/components/ui";
import { CloseIcon, PlusIcon } from "@/components/icons";
import { ACTIONS } from "@/lib/demo-data";
import type { ID, PageCta } from "@/lib/types";

/* ============================================================================
   INSPECTOR FIELDS
   ----------------------------------------------------------------------------
   Thin wrappers over the Concierge form controls. They exist so the eight
   section forms read as declarations of what a section contains rather than as
   eight re-implementations of the same label-and-input plumbing.
   ========================================================================== */

/* ---- Immutable list helpers ---------------------------------------------- */

export const replaceAt = <T,>(items: T[], index: number, next: T): T[] =>
  items.map((item, i) => (i === index ? next : item));

export const removeAt = <T,>(items: T[], index: number): T[] =>
  items.filter((_, i) => i !== index);

export const moveItem = <T,>(items: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const newItemId = (prefix: string): ID => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/* ---- Single controls ------------------------------------------------------ */

export function TextRow({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      {multiline ? (
        <Textarea
          id={id}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

/**
 * A button on the page. Pointing it at an Action is the whole reason a
 * Concierge page converts — the same booking or quote flow the Agent runs — so
 * that is the primary choice and a plain link is the fallback.
 */
export function CtaRow({
  label,
  cta,
  onChange,
  removable,
}: {
  label: string;
  cta?: PageCta;
  onChange: (cta: PageCta | undefined) => void;
  removable?: boolean;
}) {
  const id = useId();

  if (cta === undefined) {
    return (
      <button
        type="button"
        onClick={() => onChange({ label: "Get in touch" })}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-line-strong py-2.5 text-[11.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
      >
        <PlusIcon size={13} />
        Add {label.toLowerCase()}
      </button>
    );
  }

  return (
    <div className="border border-line p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="t-eyebrow text-text-muted">{label}</span>
        {removable && (
          <IconButton label={`Remove ${label}`} size={24} onClick={() => onChange(undefined)}>
            <CloseIcon size={13} />
          </IconButton>
        )}
      </div>
      <div className="space-y-3">
        <Field label="Button text" htmlFor={`${id}-label`}>
          <Input
            id={`${id}-label`}
            value={cta.label}
            onChange={(e) => onChange({ ...cta, label: e.target.value })}
          />
        </Field>
        <Field label="Opens" htmlFor={`${id}-action`} hint="Actions run the same flow as the Agent.">
          <Select
            id={`${id}-action`}
            value={cta.actionId ?? ""}
            onChange={(e) =>
              onChange({ ...cta, actionId: e.target.value === "" ? undefined : e.target.value })
            }
          >
            <option value="">A link</option>
            {ACTIONS.map((action) => (
              <option key={action.id} value={action.id}>
                {action.name}
              </option>
            ))}
          </Select>
        </Field>
        {cta.actionId === undefined && (
          <Field label="Link" htmlFor={`${id}-href`}>
            <Input
              id={`${id}-href`}
              value={cta.href ?? ""}
              placeholder="https://"
              onChange={(e) => onChange({ ...cta, href: e.target.value })}
            />
          </Field>
        )}
      </div>
    </div>
  );
}

/* ---- Repeating content ---------------------------------------------------- */

/**
 * The shape every list in a section shares: reorder, remove, add. Order is
 * editable because it is meaningful — the first service and the first question
 * are the ones most visitors read.
 */
export function Repeater({
  label,
  count,
  addLabel,
  onAdd,
  onRemove,
  onMove,
  children,
  empty,
}: {
  label: string;
  count: number;
  addLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  /** One node per item, in order. */
  children: ReactNode[];
  empty: string;
}) {
  return (
    <div>
      <p className="t-eyebrow mb-2.5 text-text-muted">{label}</p>

      {count === 0 ? (
        <p className="border border-dashed border-line-strong px-3 py-4 text-center text-[12.5px] text-text-tertiary">
          {empty}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {children.map((child, index) => {
            /* Named per item: a panel with four services otherwise offers four
               buttons all called "Remove", which is no use to anyone reading
               the page with a screen reader. */
            const name = `${label.replace(/s$/, "")} ${index + 1}`;
            return (
              <li key={index} className="border border-line p-3">
                <div className="mb-2.5 flex items-center gap-1">
                  <span className="t-eyebrow text-text-muted">{name}</span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <IconButton
                      label={`Move ${name} up`}
                      size={24}
                      disabled={index === 0}
                      onClick={() => onMove(index, index - 1)}
                    >
                      <span aria-hidden className="text-[11px]">
                        &uarr;
                      </span>
                    </IconButton>
                    <IconButton
                      label={`Move ${name} down`}
                      size={24}
                      disabled={index === count - 1}
                      onClick={() => onMove(index, index + 1)}
                    >
                      <span aria-hidden className="text-[11px]">
                        &darr;
                      </span>
                    </IconButton>
                    <IconButton label={`Remove ${name}`} size={24} onClick={() => onRemove(index)}>
                      <CloseIcon size={13} />
                    </IconButton>
                  </div>
                </div>
                <div className="space-y-3">{child}</div>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={onAdd}
        className="mt-2.5 flex w-full items-center justify-center gap-2 border border-dashed border-line-strong py-2.5 text-[11.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
      >
        <PlusIcon size={13} />
        {addLabel}
      </button>
    </div>
  );
}

/** A list of plain strings — feature bullets, proof points. */
export function StringList({
  label,
  items,
  onChange,
  addLabel,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p className="t-eyebrow mb-2.5 text-text-muted">{label}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Input
              value={item}
              placeholder={placeholder}
              aria-label={`${label} ${index + 1}`}
              onChange={(e) => onChange(replaceAt(items, index, e.target.value))}
            />
            <IconButton
              label={`Remove ${label.replace(/s$/, "")} ${index + 1}`}
              size={28}
              onClick={() => onChange(removeAt(items, index))}
            >
              <CloseIcon size={13} />
            </IconButton>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 flex w-full items-center justify-center gap-2 border border-dashed border-line-strong py-2 text-[11.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
      >
        <PlusIcon size={13} />
        {addLabel}
      </button>
    </div>
  );
}
