"use client";

import { useState } from "react";
import {
  CheckIcon,
  ChevronDown,
  CloseIcon,
  EditIcon,
  ExternalIcon,
  LockIcon,
  SourceIcon,
} from "@/components/icons";
import { Badge, Button, IconButton, Textarea } from "@/components/ui";
import { cx } from "@/lib/cx";
import { CATEGORY_LABEL, KNOWLEDGE_STATUS_LABEL, relativeTime } from "@/lib/format";
import type { KnowledgeItem, KnowledgeStatus } from "@/lib/types";
import type { Tone } from "@/components/ui";

const STATUS_TONE: Record<KnowledgeStatus, Tone> = {
  approved: "approved",
  "needs-review": "review",
  suggested: "neutral",
  imported: "neutral",
  restricted: "restricted",
  missing: "neutral",
};

/** Confidence is shown as words first, a number second. */
function confidenceLabel(c: number) {
  if (c >= 0.85) return "High confidence";
  if (c >= 0.65) return "Medium confidence";
  if (c > 0) return "Low confidence";
  return "No source yet";
}

/**
 * A single thing Concierge knows. Every card answers four questions at a
 * glance: what is it, where did it come from, how sure are we, and has the
 * owner approved it. Nothing here is answerable by the runtime until it is.
 */
export function KnowledgeCard({
  item,
  onStatusChange,
  onBodyChange,
  defaultOpen = false,
}: {
  item: KnowledgeItem;
  onStatusChange?: (id: string, status: KnowledgeStatus) => void;
  onBodyChange?: (id: string, body: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.body);

  const missing = item.status === "missing";
  const restricted = item.status === "restricted";

  return (
    <article
      className={cx(
        "overflow-hidden rounded-xl border bg-surface transition-colors duration-[var(--dur-micro)]",
        item.status === "needs-review" ? "border-warning-line" : "border-line",
        missing && "border-dashed",
      )}
    >
      {/* Head ----------------------------------------------------------- */}
      <div className="flex items-start gap-3 px-7 py-5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-0.5 shrink-0 text-text-muted transition-transform duration-[var(--dur-micro)]"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown size={16} className={cx("transition-transform", !open && "-rotate-90")} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="t-card">{item.title}</h3>
            {item.required && <Badge tone="neutral">Required</Badge>}
            <Badge tone={STATUS_TONE[item.status]} dot={item.status !== "missing"}>
              {KNOWLEDGE_STATUS_LABEL[item.status]}
            </Badge>
          </div>

          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-text-tertiary">
            <span>{CATEGORY_LABEL[item.category]}</span>
            <span aria-hidden>·</span>
            <span className={cx(item.confidence > 0 && item.confidence < 0.65 && "text-warning")}>
              {confidenceLabel(item.confidence)}
              {item.confidence > 0 && ` · ${Math.round(item.confidence * 100)}%`}
            </span>
            <span aria-hidden>·</span>
            <span>Updated {relativeTime(item.updatedAt)}</span>
          </p>

          {!open && item.body && (
            <p className="mt-2 line-clamp-2 text-[14px] leading-[1.6] text-text-secondary">{item.body}</p>
          )}
          {!open && missing && (
            <p className="mt-2 text-[14px] text-text-tertiary">
              Concierge found nothing about this. Visitors asking will get a handoff instead of an answer.
            </p>
          )}
        </div>

        {onStatusChange && !restricted && (
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {item.status !== "approved" && !missing && (
              <Button size="sm" leading={<CheckIcon size={13} />} onClick={() => onStatusChange(item.id, "approved")}>
                Approve
              </Button>
            )}
            {missing && (
              <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
                Add it
              </Button>
            )}
            {item.status === "approved" && (
              <IconButton label="Edit this item" size={28} onClick={() => { setOpen(true); setEditing(true); }}>
                <EditIcon size={14} />
              </IconButton>
            )}
          </div>
        )}
        {restricted && <LockIcon size={15} className="mt-1.5 shrink-0 text-danger" />}
      </div>

      {/* Body ----------------------------------------------------------- */}
      {open && (
        <div className="border-t border-divider bg-surface-subtle/50 px-7 py-5">
          {editing ? (
            <>
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-[120px] bg-surface text-[13px]"
                aria-label={`Edit ${item.title}`}
              />
              <p className="mt-2 text-[14px] text-text-tertiary">
                Edited items count as owner-approved. Concierge will answer from exactly this wording.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onBodyChange?.(item.id, draft);
                    onStatusChange?.(item.id, "approved");
                    setEditing(false);
                  }}
                >
                  Save and approve
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => {
                    setDraft(item.body);
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              {item.body ? (
                <p className="text-[15px] leading-[1.6] text-text-primary">{item.body}</p>
              ) : (
                <p className="text-[15px] leading-[1.6] text-text-tertiary">
                  Nothing found. Add it yourself, or point Concierge at a page that covers it.
                </p>
              )}

              {/* Evidence ------------------------------------------------ */}
              {item.sources.length > 0 && (
                <div className="mt-4">
                  <p className="t-eyebrow mb-2 text-text-muted">Where this came from</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {item.sources.map((s) => (
                      <li key={s.id}>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-[14px] text-text-secondary">
                          <SourceIcon size={12} className="text-text-muted" />
                          {s.label}
                          {s.url && <ExternalIcon size={11} className="text-text-muted" />}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {onStatusChange && !restricted && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-divider pt-4">
                  {item.status !== "approved" && item.body && (
                    <Button size="sm" leading={<CheckIcon size={13} />} onClick={() => onStatusChange(item.id, "approved")}>
                      Approve
                    </Button>
                  )}
                  <Button size="sm" variant="secondary" leading={<EditIcon size={13} />} onClick={() => setEditing(true)}>
                    {item.body ? "Edit" : "Write it"}
                  </Button>
                  {item.status !== "restricted" && (
                    <Button
                      size="sm"
                      variant="tertiary"
                      leading={<CloseIcon size={13} />}
                      onClick={() => onStatusChange(item.id, "restricted")}
                    >
                      Never use this
                    </Button>
                  )}
                </div>
              )}
              {restricted && (
                <p className="mt-4 flex items-center gap-2 border-t border-divider pt-4 text-[13.5px] text-text-secondary">
                  <LockIcon size={13} className="text-danger" />
                  Concierge will refuse to discuss this, and will offer a handoff instead.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
