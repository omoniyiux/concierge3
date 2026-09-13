import type { ID } from "@/lib/types";

/* ============================================================================
   THE RECORD OF WHO CHANGED WHAT
   ----------------------------------------------------------------------------
   This product's promise is restraint: nothing reaches a visitor until a
   person approves it. A promise like that is only worth anything if you can
   later ask who approved it, when, and what it said before.

   Two shapes, one model. A *revision* is the history of a single thing — a
   knowledge item, a rule, an action — and can be restored. An *event* is the
   workspace-wide log, which is never edited and never deleted.
   ========================================================================== */

export type AuditActor = { name: string; email: string; kind: "person" | "concierge" };

export type AuditAction =
  | "created"
  | "edited"
  | "approved"
  | "restricted"
  | "unapproved"
  | "deleted"
  | "restored"
  | "connected"
  | "disconnected"
  | "invited"
  | "setting-changed"
  | "exported";

export type Revision = {
  id: ID;
  /** The thing this is a revision of: a knowledge item, rule or action id. */
  subjectId: ID;
  at: string;
  actor: AuditActor;
  action: AuditAction;
  /** One line, in the owner's terms: "Changed the price from $79 to $89". */
  summary: string;
  /** The body as it stood after this revision, so it can be restored. */
  body?: string;
  /** The body it replaced, so the change can be read rather than guessed. */
  previousBody?: string;
};

export type AuditEvent = {
  id: ID;
  siteId: ID;
  at: string;
  actor: AuditActor;
  action: AuditAction;
  /** What was acted on, named the way the owner would name it. */
  subject: string;
  area: "knowledge" | "agent" | "routing" | "actions" | "team" | "billing" | "integrations" | "data";
  detail?: string;
};

const OWNER: AuditActor = { name: "Olaifa Promise", email: "olaifapromise1@gmail.com", kind: "person" };
const DANA: AuditActor = { name: "Dana Whitmore", email: "dana@northlanedental.com", kind: "person" };
const SAM: AuditActor = { name: "Sam Okafor", email: "sam@collabauto.co", kind: "person" };
const AGENT_ACTOR: AuditActor = { name: "Concierge", email: "system", kind: "concierge" };

/**
 * Revisions for the knowledge items an owner is most likely to interrogate —
 * the ones carrying a price, an hour or a promise.
 */
export const REVISIONS: Revision[] = [
  {
    id: "rev_1",
    subjectId: "k_pricing_exam",
    at: "2026-09-06T22:14:00Z",
    actor: AGENT_ACTOR,
    action: "edited",
    summary: "Re-read the site and found a different price on /new-patients",
    body: "A New Patient Exam is $89 and includes X-rays and a cleaning.",
    previousBody: "A New Patient Exam is $79 and includes X-rays and a cleaning.",
  },
  {
    id: "rev_2",
    subjectId: "k_pricing_exam",
    at: "2026-09-07T07:40:00Z",
    actor: OWNER,
    action: "approved",
    summary: "Approved the new price",
    body: "A New Patient Exam is $89 and includes X-rays and a cleaning.",
  },
  {
    id: "rev_3",
    subjectId: "k_hours",
    at: "2026-08-19T09:12:00Z",
    actor: DANA,
    action: "edited",
    summary: "Corrected Friday closing from 5pm to 1pm",
    body: "We are open Monday to Thursday 8am–5pm, and Friday 8am–1pm.",
    previousBody: "We are open Monday to Friday, 8am–5pm.",
  },
  {
    id: "rev_4",
    subjectId: "k_hours",
    at: "2026-08-19T09:15:00Z",
    actor: OWNER,
    action: "approved",
    summary: "Approved",
    body: "We are open Monday to Thursday 8am–5pm, and Friday 8am–1pm.",
  },
];

export function revisionsFor(subjectId: string): Revision[] {
  return REVISIONS.filter((r) => r.subjectId === subjectId).sort((a, b) => b.at.localeCompare(a.at));
}

/** The workspace log. Ordered newest first, and never edited in place. */
export const AUDIT: AuditEvent[] = [
  {
    id: "au_1",
    siteId: "site_northlane",
    at: "2026-09-07T07:40:00Z",
    actor: OWNER,
    action: "approved",
    subject: "Treatment pricing",
    area: "knowledge",
    detail: "Exam price changed from $79 to $89 after a re-read.",
  },
  {
    id: "au_2",
    siteId: "site_northlane",
    at: "2026-09-07T06:15:00Z",
    actor: AGENT_ACTOR,
    action: "edited",
    subject: "Site Brain",
    area: "knowledge",
    detail: "Weekly re-read: 3 items changed, 1 new item suggested.",
  },
  {
    id: "au_3",
    siteId: "site_northlane",
    at: "2026-09-06T14:34:00Z",
    actor: SAM,
    action: "setting-changed",
    subject: "Routing · after-hours rule",
    area: "routing",
    detail: "High-intent conversations now also text the on-call number.",
  },
  {
    id: "au_4",
    siteId: "site_northlane",
    at: "2026-09-05T14:00:00Z",
    actor: OWNER,
    action: "invited",
    subject: "reception@northlanedental.com",
    area: "team",
    detail: "Operator, this site only.",
  },
  {
    id: "au_5",
    siteId: "site_northlane",
    at: "2026-09-04T11:22:00Z",
    actor: DANA,
    action: "restricted",
    subject: "Insurance coverage",
    area: "knowledge",
    detail: "Marked restricted — Concierge must never confirm a plan.",
  },
  {
    id: "au_6",
    siteId: "site_northlane",
    at: "2026-09-02T08:05:00Z",
    actor: OWNER,
    action: "connected",
    subject: "Calendly",
    area: "integrations",
    detail: "Connected as northlane-dental.",
  },
  {
    id: "au_7",
    siteId: "site_northlane",
    at: "2026-09-01T08:00:00Z",
    actor: AGENT_ACTOR,
    action: "exported",
    subject: "August owner report",
    area: "billing",
    detail: "Sent to 2 recipients.",
  },
  {
    id: "au_8",
    siteId: "site_northlane",
    at: "2026-08-28T16:40:00Z",
    actor: SAM,
    action: "edited",
    subject: "Agent · never-promise rules",
    area: "agent",
    detail: "Added “Never confirm insurance coverage”.",
  },
];

export function auditFor(siteId: string): AuditEvent[] {
  return AUDIT.filter((e) => e.siteId === siteId).sort((a, b) => b.at.localeCompare(a.at));
}

export const ACTION_LABEL: Record<AuditAction, string> = {
  created: "Created",
  edited: "Edited",
  approved: "Approved",
  restricted: "Restricted",
  unapproved: "Unapproved",
  deleted: "Deleted",
  restored: "Restored",
  connected: "Connected",
  disconnected: "Disconnected",
  invited: "Invited",
  "setting-changed": "Changed",
  exported: "Exported",
};

export const AREA_LABEL: Record<AuditEvent["area"], string> = {
  knowledge: "Site Brain",
  agent: "Agent",
  routing: "Routing",
  actions: "Actions",
  team: "Team",
  billing: "Billing",
  integrations: "Integrations",
  data: "Data",
};
