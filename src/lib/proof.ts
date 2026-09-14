import type { KnowledgeCategory, KnowledgeItem } from "@/lib/types";

/* ============================================================================
   PROOF, BEFORE THE SCRIPT TAG
   ----------------------------------------------------------------------------
   The hardest ask in this product is the paste: an owner is asked to put a
   script on their live website before Concierge has answered a single thing
   for them. The Return surface is the proof, and it cannot say anything until
   traffic has arrived — which is weeks after the decision it needs to support.

   But the crawl has already happened by then. The moment a site has been read,
   the product knows something genuinely persuasive and does not say it: which
   of the questions customers actually ask this kind of business it can now
   answer, and which it still cannot.

   That is the demo. It is specific to their business, it is true, and the half
   it fails is the honest half — which is exactly why the half it passes is
   worth believing.
   ========================================================================== */

export type ProbeQuestion = {
  /** What a visitor would actually type. */
  ask: string;
  /** The knowledge that has to exist for this to be answerable. */
  needs: KnowledgeCategory;
};

/**
 * The questions nearly every small business is asked, in the order they get
 * asked. Deliberately not clever: these are the ones that lose a customer
 * when the site does not answer them.
 */
export const PROBES: ProbeQuestion[] = [
  { ask: "What do you charge?", needs: "pricing" },
  { ask: "Are you open right now?", needs: "policies" },
  { ask: "What exactly do you do?", needs: "services" },
  { ask: "Can I book an appointment?", needs: "services" },
  { ask: "Where are you, and can I park?", needs: "faqs" },
  { ask: "Do you take my insurance?", needs: "policies" },
  { ask: "How quickly can you see me?", needs: "faqs" },
  { ask: "Who are you, and how long have you been going?", needs: "business" },
];

export type ProbeResult = {
  question: ProbeQuestion;
  /** The approved item that would answer it, if there is one. */
  answeredBy: KnowledgeItem | null;
  /** Read but not approved: it could answer, once the owner says so. */
  pendingOn: KnowledgeItem | null;
};

export type Proof = {
  results: ProbeResult[];
  answerable: number;
  /** Answerable the moment the owner approves what is already read. */
  unlockable: number;
  total: number;
};

/**
 * What this site can answer today, judged only on what is actually approved.
 *
 * `pendingOn` is the persuasive column: "four more the moment you approve
 * them" is a reason to finish setting up, where a bare score is only a
 * verdict.
 */
export function proveAnswerable(items: KnowledgeItem[]): Proof {
  const results = PROBES.map((question) => {
    const inCategory = items.filter((i) => i.category === question.needs && i.body.trim().length > 0);
    const answeredBy = inCategory.find((i) => i.status === "approved") ?? null;
    const pendingOn = answeredBy
      ? null
      : (inCategory.find((i) => i.status === "needs-review" || i.status === "suggested") ?? null);
    return { question, answeredBy, pendingOn };
  });

  return {
    results,
    answerable: results.filter((r) => r.answeredBy).length,
    unlockable: results.filter((r) => !r.answeredBy && r.pendingOn).length,
    total: results.length,
  };
}
