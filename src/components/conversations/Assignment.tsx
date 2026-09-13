"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, Textarea } from "@/components/ui";
import { CheckIcon, ChevronDown, LeadsIcon, SparkIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { relativeTime } from "@/lib/format";
import { TEAM } from "@/lib/demo-data";

/* ============================================================================
   MORE THAN ONE PERSON
   ----------------------------------------------------------------------------
   Seats existed; a reason for a second person to open the product did not.
   A front desk does not work like an owner: threads get picked up, put down,
   handed over at the end of a shift, and argued about internally without the
   visitor ever seeing it.

   Two things make that possible, and they are both here: this thread is
   mine, and here is a note for whoever takes it next.
   ========================================================================== */

export type Assignee = { id: string; name: string; email: string } | null;

export function AssignMenu({
  assignee,
  onAssign,
}: {
  assignee: Assignee;
  onAssign: (next: Assignee) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const people = TEAM.filter((m) => m.status === "active");

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cx(
          "inline-flex h-7 items-center gap-1.5 border px-2.5 text-[11px] font-medium transition-colors",
          assignee
            ? "border-ink bg-surface text-text-primary"
            : "border-line-strong bg-surface text-text-secondary hover:border-ink",
        )}
      >
        <LeadsIcon size={12} />
        {assignee ? assignee.name.split(" ")[0] : "Unassigned"}
        <ChevronDown size={12} className="text-text-muted" />
      </button>

      {open && (
        <div
          role="listbox"
          className="cg-enter absolute right-0 top-[calc(100%+6px)] z-50 w-[230px] border border-line-strong bg-surface shadow-lg"
        >
          <p className="t-eyebrow border-b border-divider px-3 py-2 text-text-muted">Who has this</p>
          <ul className="p-1.5">
            {people.map((m) => {
              const active = assignee?.id === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onAssign(active ? null : { id: m.id, name: m.name, email: m.email });
                      setOpen(false);
                    }}
                    className={cx(
                      "flex w-full items-center gap-2.5 px-2 py-2 text-left transition-colors",
                      active ? "bg-surface-hover" : "hover:bg-surface-subtle",
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-surface-subtle text-[9.5px] font-semibold text-text-secondary">
                      {m.name
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">{m.name}</span>
                      <span className="block truncate text-[11px] capitalize text-text-tertiary">
                        {m.role}
                      </span>
                    </span>
                    {active && <CheckIcon size={13} className="shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {assignee && (
            <button
              type="button"
              onClick={() => {
                onAssign(null);
                setOpen(false);
              }}
              className="w-full border-t border-divider px-3 py-2.5 text-left text-[12px] text-text-tertiary transition-colors hover:bg-surface-subtle hover:text-text-primary"
            >
              Put it back in the queue
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---- Internal notes -------------------------------------------------------- */

export type InternalNote = {
  id: string;
  author: string;
  body: string;
  at: string;
  /** Teammates named with @, who get told. */
  mentions: string[];
};

/** A note in the thread, marked so nobody can mistake it for a reply. */
export function NoteBubble({ note }: { note: InternalNote }) {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[86%] border-l-2 border-warning bg-warning-soft px-4 py-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-warning">
          <SparkIcon size={12} />
          Internal note · {note.author}
          <span className="font-normal text-text-tertiary">{relativeTime(note.at)}</span>
          <Badge tone="neutral" className="ml-auto">
            The visitor never sees this
          </Badge>
        </p>
        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-text-primary">{note.body}</p>
        {note.mentions.length > 0 && (
          <p className="mt-2 text-[11px] text-text-tertiary">
            {note.mentions.join(", ")} {note.mentions.length === 1 ? "was" : "were"} told.
          </p>
        )}
      </div>
    </div>
  );
}

/** Writing one. Mentions are parsed out of the text, not picked from a menu. */
export function NoteComposer({ onAdd }: { onAdd: (note: InternalNote) => void }) {
  const [body, setBody] = useState("");
  const names = TEAM.filter((m) => m.status === "active").map((m) => m.name.split(" ")[0]);
  const mentioned = names.filter((n) => body.toLowerCase().includes(`@${n.toLowerCase()}`));

  return (
    <div className="border border-warning-line bg-warning-soft/50 p-3.5">
      <p className="t-eyebrow mb-2 text-warning">Internal note</p>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="min-h-[58px] bg-surface"
        placeholder="Left a voicemail — @Dana can you try her again after 4?"
        aria-label="Internal note"
      />
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-text-tertiary">
          {mentioned.length > 0
            ? `${mentioned.join(", ")} will be told.`
            : "Type @ and a teammate's name to tell them."}
        </p>
        <Button
          size="sm"
          variant="secondary"
          disabled={body.trim().length < 2}
          onClick={() => {
            onAdd({
              id: `note_${Date.now()}`,
              author: "Olaifa",
              body: body.trim(),
              at: new Date().toISOString(),
              mentions: mentioned,
            });
            setBody("");
          }}
        >
          Add note
        </Button>
      </div>
    </div>
  );
}
