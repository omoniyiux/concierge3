import type { DestinationKind, RoutingMoment, RuleOperator } from "@/lib/types";

/* ============================================================================
   The words routing uses, in one place. Every surface — a rule sentence, a
   destination card, the editors — reads a moment the same way, so an owner
   never has to learn that two phrasings mean the same trigger.
   ========================================================================== */

/** Written from the owner's side: what happened, not what fired. */
export const MOMENT_LABEL: Record<RoutingMoment, string> = {
  "specialist-requested": "A visitor asks for a person",
  "call-requested": "A visitor asks for a call",
  "team-replied": "Someone on your team replies",
  "ticket-created": "A ticket is opened",
  "conversation-started": "Any conversation starts",
  "high-intent": "Concierge spots a strong lead",
  "brain-approved": "Site Brain is approved",
  "agent-launched": "The Agent goes live",
};

export const ALL_MOMENTS = Object.keys(MOMENT_LABEL) as RoutingMoment[];

export const KIND_LABEL: Record<DestinationKind, string> = {
  email: "Email",
  slack: "Slack",
  sms: "Text message",
  webhook: "Webhook",
  ticket: "Support ticket",
  taskologic: "Taskologic",
  telegram: "Telegram",
  inbox: "Concierge inbox",
};

/** What to ask for, per kind, so the field never says "target". */
export const KIND_TARGET: Record<DestinationKind, { label: string; placeholder: string }> = {
  email: { label: "Send to which address?", placeholder: "frontdesk@yourbusiness.com" },
  slack: { label: "Which channel?", placeholder: "#leads" },
  sms: { label: "Which number?", placeholder: "+1 512 555 0100" },
  webhook: { label: "Which endpoint?", placeholder: "https://crm.yourbusiness.com/hooks/concierge" },
  taskologic: { label: "Which workspace?", placeholder: "your-workspace" },
  telegram: { label: "Which chat?", placeholder: "@yourteam" },
  ticket: { label: "Which queue?", placeholder: "Support" },
  inbox: { label: "Which inbox?", placeholder: "Shared inbox" },
};

export const FIELD_LABEL: Record<string, string> = {
  intent: "Intent",
  location: "Location",
  "lead-value": "Lead value",
  service: "Service",
  urgency: "Urgency",
  page: "Page",
};

export const OP_LABEL: Record<RuleOperator, string> = {
  is: "is",
  "is-not": "is not",
  contains: "contains",
  "greater-than": "is over",
  "less-than": "is under",
};

/**
 * Coverage is measured against the moments a visitor can cause, because one of
 * those with nowhere to go is a request that silently disappears. The two
 * lifecycle moments below are routable but they happen once, so counting them
 * would hold the coverage figure down forever and teach owners to ignore it.
 */
export const VISITOR_MOMENTS: RoutingMoment[] = [
  "specialist-requested",
  "call-requested",
  "team-replied",
  "ticket-created",
  "high-intent",
  "conversation-started",
];

export const LIFECYCLE_MOMENTS: RoutingMoment[] = ["brain-approved", "agent-launched"];

/** The shorter phrasing, for chips where the full sentence will not fit. */
export const MOMENT_CHIP: Record<RoutingMoment, string> = {
  "specialist-requested": "Asks for a person",
  "call-requested": "Asks for a call",
  "team-replied": "Team replies",
  "ticket-created": "Ticket is created",
  "conversation-started": "Starts chatting",
  "high-intent": "Strong lead",
  "brain-approved": "Site Brain approved",
  "agent-launched": "Agent goes live",
};
