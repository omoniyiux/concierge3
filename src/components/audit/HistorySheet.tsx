"use client";

import { useState } from "react";
import { Badge, Button, Panel, SearchInput, SegmentedControl } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { AgentIcon, ClockIcon, RefreshIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { relativeTime } from "@/lib/format";
import {
  ACTION_LABEL,
  AREA_LABEL,
  auditFor,
  revisionsFor,
  type AuditEvent,
  type Revision,
} from "@/lib/audit";

/* ============================================================================
   HISTORY
   Two readings of the same record: everything that ever happened to one item,
   and everything that ever happened in the workspace. The first is opened
   from the thing itself; the second lives in Settings, where an owner goes
   when they want to know who did that.
   ========================================================================== */

/** The history of one knowledge item, rule or action — with a way back. */
export function HistorySheet({
  open,
  onClose,
  subjectId,
  subjectTitle,
  currentBody,
  onRestore,
}: {
  open: boolean;
  onClose: () => void;
  subjectId: string;
  subjectTitle: string;
  currentBody?: string;
  onRestore?: (body: string) => void;
}) {
  const revisions = revisionsFor(subjectId);

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="History"
      title={subjectTitle}
      description={
        revisions.length
          ? "Every version this has had, who put it there, and what it replaced."
          : "Nothing has changed since this was created."
      }
      footer={
        <Button variant="tertiary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {currentBody && (
        <ModalSection title="Now">
          <div className="border border-line-strong bg-surface p-4">
            <p className="text-[12.5px] leading-[1.55]">{currentBody}</p>
          </div>
        </ModalSection>
      )}

      <ModalSection title={revisions.length ? `${revisions.length} changes` : undefined}>
        {revisions.length === 0 ? (
          <p className="text-[12.5px] text-text-tertiary">
            This is the original version, exactly as Concierge first read it.
          </p>
        ) : (
          <ol className="space-y-3">
            {revisions.map((r) => (
              <RevisionRow key={r.id} revision={r} onRestore={onRestore} />
            ))}
          </ol>
        )}
      </ModalSection>
    </Modal>
  );
}

function RevisionRow({ revision: r, onRestore }: { revision: Revision; onRestore?: (b: string) => void }) {
  const [open, setOpen] = useState(false);
  const byAgent = r.actor.kind === "concierge";

  return (
    <li className="border border-line-strong bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
        <span
          className={cx(
            "flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-semibold",
            byAgent ? "bg-accent-soft text-accent-ink" : "bg-surface-subtle text-text-secondary",
          )}
        >
          {byAgent ? (
            <AgentIcon size={14} />
          ) : (
            r.actor.name
              .split(" ")
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
          )}
        </span>
        <div className="min-w-[180px] flex-1">
          <p className="text-[12.5px] font-medium">{r.summary}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px] text-text-tertiary">
            <span>{r.actor.name}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={11} />
              {relativeTime(r.at)}
            </span>
          </p>
        </div>
        <Badge tone={r.action === "approved" ? "approved" : "neutral"}>{ACTION_LABEL[r.action]}</Badge>
        {r.previousBody && (
          <Button size="sm" variant="tertiary" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide" : "What changed"}
          </Button>
        )}
      </div>

      {open && r.previousBody && (
        <div className="cg-enter space-y-2.5 border-t border-divider p-4">
          <div className="border-l-2 border-danger-line bg-danger-soft/40 py-2 pl-3">
            <p className="t-eyebrow text-text-muted">Before</p>
            <p className="mt-1.5 text-[12px] leading-[1.55] text-text-secondary line-through">
              {r.previousBody}
            </p>
          </div>
          <div className="border-l-2 border-success-line bg-success-soft/50 py-2 pl-3">
            <p className="t-eyebrow text-text-muted">After</p>
            <p className="mt-1.5 text-[12px] leading-[1.55]">{r.body}</p>
          </div>
          {onRestore && r.previousBody && (
            <Button
              size="sm"
              variant="secondary"
              leading={<RefreshIcon size={13} />}
              onClick={() => onRestore(r.previousBody!)}
            >
              Restore the earlier version
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

/* ---- The workspace log ----------------------------------------------------- */

type AreaFilter = "all" | AuditEvent["area"];

/** Never edited, never deleted: what the workspace did, and who did it. */
export function AuditLog({ siteId }: { siteId: string }) {
  const [area, setArea] = useState<AreaFilter>("all");
  const [query, setQuery] = useState("");

  const events = auditFor(siteId).filter((e) => {
    if (area !== "all" && e.area !== area) return false;
    const q = query.trim().toLowerCase();
    if (q && !`${e.subject} ${e.detail ?? ""} ${e.actor.name}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-divider p-5 sm:p-6">
        <h2 className="t-section">Activity log</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">
          Everything anyone — or Concierge itself — has changed on this site. Kept for the life of the
          account and never edited.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the log"
            aria-label="Search the activity log"
            className="min-w-[180px] flex-1 sm:max-w-[280px]"
          />
          <SegmentedControl
            label="Filter the log"
            value={area}
            onChange={setArea}
            options={[
              { value: "all", label: "All" },
              { value: "knowledge", label: "Site Brain" },
              { value: "agent", label: "Agent" },
              { value: "team", label: "Team" },
            ]}
          />
        </div>
      </div>

      {events.length === 0 ? (
        <p className="px-6 py-10 text-center text-[12.5px] text-text-tertiary">
          Nothing matches. The log only holds changes, not conversations.
        </p>
      ) : (
        <ul className="divide-y divide-divider">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 px-5 py-4 sm:px-6">
              <span
                className={cx(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-semibold",
                  e.actor.kind === "concierge"
                    ? "bg-accent-soft text-accent-ink"
                    : "bg-surface-subtle text-text-secondary",
                )}
              >
                {e.actor.kind === "concierge" ? (
                  <AgentIcon size={14} />
                ) : (
                  e.actor.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                )}
              </span>
              <div className="min-w-[200px] flex-1">
                <p className="text-[12.5px]">
                  <span className="font-medium">{e.actor.name}</span>{" "}
                  <span className="text-text-secondary">{ACTION_LABEL[e.action].toLowerCase()}</span>{" "}
                  <span className="font-medium">{e.subject}</span>
                </p>
                {e.detail && (
                  <p className="mt-1 text-[12px] leading-[1.5] text-text-tertiary">{e.detail}</p>
                )}
              </div>
              <Badge tone="neutral">{AREA_LABEL[e.area]}</Badge>
              <span className="shrink-0 text-[11.5px] tabular-nums text-text-tertiary">
                {relativeTime(e.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
