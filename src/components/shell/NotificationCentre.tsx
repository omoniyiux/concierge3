"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { Badge, Button, IconButton } from "@/components/ui";
import { BellIcon, CheckIcon, CloseIcon, PhoneIcon, SettingsIcon } from "@/components/icons";
import { ChatSticker, LeadSticker, TaskSticker } from "@/components/stickers";
import { BrokenLinkSticker, ReviewSticker } from "@/components/stickers/attention";
import { cx } from "@/lib/cx";
import { relativeTime } from "@/lib/format";
import { useBrain, useConversations, useDestinations, useLeads } from "@/lib/sim/store";
import type { Conversation, Destination, Lead, SiteBrain } from "@/lib/types";

/* ============================================================================
   THE BELL, KEPT
   ----------------------------------------------------------------------------
   There was a bell with a dot on it and nothing behind it. The dot is the
   product's central promise — a good lead arrived while you were closed and
   somebody told you — so it needs somewhere to land.

   Notifications are derived from the same records as everything else rather
   than stored separately: a new conversation, a hot lead, a destination that
   stopped delivering, knowledge waiting on approval. Read state is local to
   the person, which is the only part that is genuinely per-user.
   ========================================================================== */

type Kind = "lead" | "conversation" | "routing" | "knowledge" | "action";

type Note = {
  id: string;
  kind: Kind;
  title: string;
  detail: string;
  at: string;
  href: string;
  /** Urgent ones survive "mark all read" as a badge on the row. */
  urgent?: boolean;
};

/**
 * A sticker per kind. Every row used to be the same 28px tinted square with a
 * line icon in it, so a hot lead and a dead webhook were told apart only by
 * the colour of the box behind them — which is the one cue that does not
 * survive a glance at a list this dense.
 *
 * The tint goes with them: a sticker carries its own colour, and a wash behind
 * it fights rather than reinforces.
 */
const KIND_STICKER: Record<Kind, ComponentType<{ size?: number; className?: string }>> = {
  lead: LeadSticker,
  conversation: ChatSticker,
  routing: BrokenLinkSticker,
  knowledge: ReviewSticker,
  action: TaskSticker,
};

/** Built from the site's own records, newest first. */
function buildNotifications(
  siteId: string,
  { leads, conversations, destinations, brain }: {
    leads: Lead[];
    conversations: Conversation[];
    destinations: Destination[];
    brain: SiteBrain;
  },
): Note[] {
  const base = `/sites/${siteId}`;
  const notes: Note[] = [];

  for (const lead of leads.filter((l) => l.qualification === "hot").slice(0, 3)) {
    notes.push({
      id: `n_lead_${lead.id}`,
      kind: "lead",
      title: `${lead.name} qualified as a hot lead`,
      detail: `${lead.service ?? "Enquiry"}${lead.budget ? ` · ${lead.budget}` : ""} · scored ${lead.score}`,
      at: lead.capturedAt,
      href: `${base}/leads`,
      urgent: true,
    });
  }

  for (const c of conversations.filter((c) => c.status === "new" || c.afterHours).slice(0, 4)) {
    notes.push({
      id: `n_conv_${c.id}`,
      kind: "conversation",
      title: c.afterHours
        ? `${c.visitorName} arrived after hours`
        : `${c.visitorName} started a conversation`,
      detail: c.preview,
      at: c.lastMessageAt,
      href: `${base}/conversations?c=${c.id}`,
    });
  }

  for (const d of destinations.filter((d) => d.status === "failing")) {
    notes.push({
      id: `n_dest_${d.id}`,
      kind: "routing",
      title: `${d.name} stopped delivering`,
      detail: "Requests are being queued rather than lost. Reconnect to replay them.",
      at: d.lastDeliveryAt ?? new Date().toISOString(),
      href: `${base}/agent/routing`,
      urgent: true,
    });
  }

  if (brain.needsReviewCount > 0) {
    notes.push({
      id: "n_brain",
      kind: "knowledge",
      title: `${brain.needsReviewCount} knowledge items need your approval`,
      detail: "Concierge will not use any of them until someone decides.",
      at: brain.lastLearnedAt,
      href: `${base}/agent/brain`,
    });
  }

  return notes.sort((a, b) => b.at.localeCompare(a.at));
}

export function NotificationBell({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<string[]>([]);
  const wrap = useRef<HTMLDivElement>(null);

  const leads = useLeads(siteId);
  const conversations = useConversations(siteId);
  const destinations = useDestinations(siteId);
  const brain = useBrain(siteId);
  const notes = buildNotifications(siteId, { leads, conversations, destinations, brain });
  const unread = notes.filter((n) => !read.includes(n.id));

  // Clicking anywhere else closes it, the way a menu should behave.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className="relative flex h-8 w-8 items-center justify-center text-text-primary transition-colors hover:bg-surface-hover"
      >
        <BellIcon size={19} />
        {unread.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-surface bg-accent" />
        )}
      </button>

      {open && (
        <div className="cg-enter absolute bottom-0 left-full z-50 ml-3 w-[340px] border border-line-strong bg-surface shadow-xl">
          <header className="flex items-center gap-3 border-b border-divider px-4 py-3">
            <h2 className="t-section flex-1">Notifications</h2>
            {unread.length > 0 && (
              <Button size="sm" variant="tertiary" onClick={() => setRead(notes.map((n) => n.id))}>
                Mark all read
              </Button>
            )}
            <IconButton label="Close notifications" size={28} onClick={() => setOpen(false)}>
              <CloseIcon size={15} />
            </IconButton>
          </header>

          {notes.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckIcon size={18} className="mx-auto text-success" strokeWidth={2.4} />
              <p className="mt-3 text-[12.5px] font-medium">Nothing needs you</p>
              <p className="mt-1.5 text-[12px] leading-[1.5] text-text-tertiary">
                New conversations, qualified leads and anything that stops working will appear here.
              </p>
            </div>
          ) : (
            <ul className="cg-scroll max-h-[380px] divide-y divide-divider overflow-y-auto">
              {notes.map((n) => {
                const Sticker = KIND_STICKER[n.kind];
                const isRead = read.includes(n.id);
                return (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        setRead((r) => (r.includes(n.id) ? r : [...r, n.id]));
                        setOpen(false);
                      }}
                      className={cx(
                        "flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface-subtle",
                        !isRead && "bg-surface",
                      )}
                    >
                      <Sticker size={30} className="mt-0.5 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start gap-2">
                          <span
                            className={cx(
                              "min-w-0 flex-1 text-[12.5px] leading-[1.45]",
                              isRead ? "text-text-secondary" : "font-medium",
                            )}
                          >
                            {n.title}
                          </span>
                          {!isRead && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          )}
                        </span>
                        <span className="mt-1 block truncate text-[12px] text-text-tertiary">
                          {n.detail}
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className="text-[11px] tabular-nums text-text-muted">
                            {relativeTime(n.at)}
                          </span>
                          {n.urgent && <Badge tone="accent">Worth seeing now</Badge>}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* The bell is only half the promise: the other half arrives on a
              phone, which is a setting rather than a page. */}
          <footer className="flex items-center gap-2.5 border-t border-divider bg-surface-subtle px-4 py-3">
            <PhoneIcon size={14} className="shrink-0 text-text-tertiary" />
            <p className="min-w-0 flex-1 text-[11.5px] leading-[1.45] text-text-secondary">
              Get the urgent ones by text or email when you are away from the desk.
            </p>
            <Link
              href={`/sites/${siteId}/settings?section=notifications`}
              onClick={() => setOpen(false)}
              aria-label="Notification settings"
              className="shrink-0 text-text-tertiary transition-colors hover:text-text-primary"
            >
              <SettingsIcon size={15} />
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}
