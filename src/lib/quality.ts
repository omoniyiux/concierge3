import type { Conversation, ID, Message } from "@/lib/types";

/* ============================================================================
   WHEN IT GETS SOMETHING WRONG
   ----------------------------------------------------------------------------
   An agent that answers customers on a business's behalf will eventually say
   something the owner would not have said. The product's credibility does not
   rest on that never happening — it rests on what happens next.

   So: anyone can flag an answer, a flag is a record rather than a feeling,
   and the owner can always ask the only question that matters afterwards —
   "what exactly have we been telling people about this?"
   ========================================================================== */

export type FlagReason = "wrong" | "outdated" | "tone" | "should-not-have" | "missed";

export const FLAG_REASON: Record<FlagReason, { label: string; detail: string }> = {
  wrong: { label: "Factually wrong", detail: "It stated something untrue about the business." },
  outdated: { label: "Out of date", detail: "It was true once. It is not any more." },
  tone: { label: "Wrong tone", detail: "Accurate, but not how we would have said it." },
  "should-not-have": {
    label: "Should not have answered",
    detail: "This one needed a person, and it went ahead anyway.",
  },
  missed: { label: "Refused unnecessarily", detail: "It had the answer and did not use it." },
};

/**
 * Whether this kind of complaint is the knowledge's fault.
 *
 * A wrong or stale fact came from an item in the brain, and the fix is to
 * un-approve it. A bad tone, an answer that should have been a handoff, or a
 * refusal it did not need to make are all the Agent's configuration — the
 * knowledge behind them may be perfectly correct, and retracting it would
 * punish the owner for a problem somewhere else.
 */
export const RETRACTS_KNOWLEDGE: Record<FlagReason, boolean> = {
  wrong: true,
  outdated: true,
  tone: false,
  "should-not-have": false,
  missed: false,
};

export type FlagState = "open" | "investigating" | "fixed" | "dismissed";

export type AnswerFlag = {
  id: ID;
  siteId: ID;
  conversationId: ID;
  messageId: ID;
  /** What the agent actually said, kept verbatim on the flag. */
  said: string;
  /**
   * The knowledge the answer was built from, copied off the message's
   * citations at the moment it was flagged. This is the link that turns a
   * complaint into a correction: without it a flag is a note somebody wrote,
   * and the item that produced the bad answer keeps producing it.
   */
  cites: { itemId: ID; title: string }[];
  reason: FlagReason;
  note?: string;
  flaggedBy: string;
  at: string;
  state: FlagState;
  /** How many other visitors were told the same thing this period. */
  alsoTold: number;
  /** What fixed it, once something did. */
  resolution?: string;
};

export const FLAGS: AnswerFlag[] = [
  {
    id: "fl_1",
    siteId: "site_northlane",
    conversationId: "c_3",
    messageId: "m_c3_2",
    said: "Whitening starts at $349 and takes about an hour.",
    cites: [{ itemId: "k_pricing", title: "Treatment pricing" }],
    reason: "outdated",
    note: "We put whitening up to $389 in August. It has been quoting the old price.",
    flaggedBy: "Dana Whitmore",
    at: "2026-09-06T10:20:00Z",
    state: "fixed",
    alsoTold: 9,
    resolution:
      "Treatment pricing re-approved at $389. Nine visitors were told the old figure — all nine were emailed a correction.",
  },
  {
    id: "fl_2",
    siteId: "site_northlane",
    conversationId: "c_5",
    messageId: "m_c5_4",
    said: "That sounds like it could be an infection — you should be seen urgently.",
    cites: [{ itemId: "k_escalation", title: "Human escalation rules" }],
    reason: "should-not-have",
    note: "It is not allowed to say anything that reads as a diagnosis, even a cautious one.",
    flaggedBy: "Olaifa Promise",
    at: "2026-09-07T08:12:00Z",
    state: "investigating",
    alsoTold: 2,
  },
];

export function flagsFor(flags: AnswerFlag[], siteId: string): AnswerFlag[] {
  return flags.filter((f) => f.siteId === siteId).sort((a, b) => b.at.localeCompare(a.at));
}

/** The open complaints against one knowledge item, newest first. */
export function flagsAgainst(flags: AnswerFlag[], itemId: ID): AnswerFlag[] {
  return flags
    .filter((f) => f.cites.some((c) => c.itemId === itemId))
    .filter((f) => f.state === "open" || f.state === "investigating")
    .sort((a, b) => b.at.localeCompare(a.at));
}

export const FLAG_STATE_LABEL: Record<FlagState, string> = {
  open: "Open",
  investigating: "Looking into it",
  fixed: "Fixed",
  dismissed: "Not a problem",
};

/* ---- "What have we been telling people?" ---------------------------------- */

export type SaidHit = {
  conversationId: ID;
  visitorName: string;
  at: string;
  body: string;
  author: Message["author"];
};

/**
 * Searches what the agent actually said, not what it was supposed to say.
 * This is the question an owner asks the moment they find one bad answer,
 * and until now the product could not answer it.
 */
export function whatWeSaid(conversations: Conversation[], siteId: string, query: string): SaidHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: SaidHit[] = [];
  for (const c of conversations) {
    if (c.siteId !== siteId) continue;
    for (const m of c.messages) {
      if (m.author !== "agent" && m.author !== "human") continue;
      if (!m.body.toLowerCase().includes(q)) continue;
      hits.push({
        conversationId: c.id,
        visitorName: c.visitorName,
        at: m.at,
        body: m.body,
        author: m.author,
      });
    }
  }
  return hits.sort((a, b) => b.at.localeCompare(a.at));
}
