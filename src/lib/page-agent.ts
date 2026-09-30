import type {
  ActionDef,
  ActionKind,
  AgentCapability,
  ID,
  PageAgent,
  PageDocument,
  PageSection,
  VisitorIntent,
} from "./types";

/* ============================================================================
   THE AGENT ON A PAGES SITE
   ----------------------------------------------------------------------------
   Every Pages site ships with Concierge already on it. This file is what that
   agent is made of: a closed set of capabilities, and everything the rest of
   the product derives from them — the quick actions in the widget, whether
   each one is ready, the Actions it needs in the workspace, and how it answers
   a visitor in test mode.

   Nothing here is stored twice. A quick action is read off a capability every
   time, so turning "Book appointments" off cannot leave a "Book" button
   behind in the widget; readiness is read off the promotion and payment link,
   so "Needs setup" clears the moment the owner supplies the missing piece.
   ========================================================================== */

export interface CapabilityDef {
  id: AgentCapability;
  label: string;
  /** Written for the owner. */
  description: string;
  /** What the visitor taps in the widget. */
  quickAction: string;
  /** Where the work lands once the visitor has done it. */
  lands: string;
}

export const CAPABILITIES: CapabilityDef[] = [
  {
    id: "answer",
    label: "Answer questions",
    description: "Answers common questions about your business, services and policies.",
    quickAction: "Ask a question",
    lands: "Uses your page content",
  },
  {
    id: "guide",
    label: "Help visitors choose",
    description: "Guides a visitor to the right service based on what they need.",
    quickAction: "Help me decide",
    lands: "Uses your services",
  },
  {
    id: "leads",
    label: "Capture leads",
    description: "Collects a name and contact details, then adds them to Leads.",
    quickAction: "Get a quote",
    lands: "Saves to Leads",
  },
  {
    id: "booking",
    label: "Book appointments",
    description: "Lets visitors ask for a time, and sends the request to your team.",
    quickAction: "Book an appointment",
    lands: "Sends a booking request",
  },
  {
    id: "handoff",
    label: "Route to a human",
    description: "Hands anything complex to your team, with the conversation attached.",
    quickAction: "Talk to a person",
    lands: "Uses your routing",
  },
  {
    id: "promotions",
    label: "Show promotions",
    description: "Shares your current offer and collects details from anyone who wants it.",
    quickAction: "See the offer",
    lands: "Saves to Leads",
  },
  {
    id: "contact",
    label: "Collect contact requests",
    description: "Takes a message or a callback request when a visitor is not ready to book.",
    quickAction: "Request a callback",
    lands: "Saves to your inbox",
  },
  {
    id: "payment",
    label: "Send to a payment link",
    description: "Points a visitor at your checkout or deposit link when they are ready to pay.",
    quickAction: "Pay a deposit",
    lands: "Opens your payment link",
  },
];

export const capabilityDef = (id: AgentCapability): CapabilityDef =>
  CAPABILITIES.find((c) => c.id === id) ?? CAPABILITIES[0];

export const DEFAULT_AGENT: PageAgent = {
  capabilities: ["answer", "leads", "handoff"],
  tone: "friendly",
  focus: [],
};

/**
 * A document made before the agent moved onto the page still has an agent —
 * the promise is Concierge on every page — so it gets the default one.
 */
export const agentOf = (doc: PageDocument): PageAgent => doc.agent ?? DEFAULT_AGENT;

export const hasCapability = (agent: PageAgent, id: AgentCapability): boolean =>
  agent.capabilities.includes(id);

/** Canonical order, so toggling one on never shuffles the widget. */
export function withCapability(agent: PageAgent, id: AgentCapability, on: boolean): PageAgent {
  const set = new Set(agent.capabilities);
  if (on) set.add(id);
  else set.delete(id);
  const capabilities = CAPABILITIES.map((c) => c.id).filter((c) => set.has(c));
  return capabilities.length === agent.capabilities.length &&
    capabilities.every((c, i) => c === agent.capabilities[i])
    ? agent
    : { ...agent, capabilities };
}

/* ---- Readiness ------------------------------------------------------------ */

export type CapabilityState = "ready" | "in-use" | "needs-setup" | "off";

/**
 * "In use" means the page is already sending visitors to it — the main button
 * opens it — which is the thing an owner most wants to know before launch.
 */
export function capabilityState(doc: PageDocument, id: AgentCapability): { state: CapabilityState; note: string } {
  const agent = agentOf(doc);
  const def = capabilityDef(id);
  if (!hasCapability(agent, id)) return { state: "off", note: "Off" };

  if (id === "promotions" && agent.promotion === undefined) {
    return { state: "needs-setup", note: "Add your promotion" };
  }
  if (id === "payment" && !agent.paymentUrl) {
    return { state: "needs-setup", note: "Add a payment link" };
  }
  if (primaryCapability(doc) === id) return { state: "in-use", note: "Opened by your main button" };
  if (id === "promotions") return { state: "ready", note: agent.promotion!.headline };
  return { state: "ready", note: def.lands };
}

/* ---- What the visitor sees ------------------------------------------------ */

/** The hero on the home page, which is where the main button lives. */
export function homeHero(doc: PageDocument): Extract<PageSection, { kind: "hero" }> | undefined {
  const home = doc.pages.find((p) => p.slug === "") ?? doc.pages[0];
  return home?.sections.find((s): s is Extract<PageSection, { kind: "hero" }> => s.kind === "hero");
}

/** The capability the main button opens, read from the action it points at. */
export function primaryCapability(doc: PageDocument): AgentCapability | undefined {
  const actionId = homeHero(doc)?.content.cta?.actionId;
  if (!actionId) return undefined;
  return CAPABILITIES.find((c) => actionId.endsWith(`_${c.id}`))?.id;
}

/**
 * Up to four, most specific first. "Ask a question" is dropped when there is
 * something more useful to offer, since typing a question is always possible.
 */
export function quickActions(agent: PageAgent): string[] {
  const order: AgentCapability[] = ["promotions", "booking", "leads", "guide", "contact", "payment", "handoff", "answer"];
  const actions = order
    .filter((id) => hasCapability(agent, id))
    .filter((id) => id !== "promotions" || agent.promotion !== undefined)
    .filter((id) => id !== "payment" || Boolean(agent.paymentUrl))
    .map((id) => capabilityDef(id).quickAction);
  if (agent.focus.includes("pricing")) actions.splice(1, 0, "How much does it cost?");
  return actions.slice(0, 4);
}

const TONE_OPENERS: Record<PageAgent["tone"], string> = {
  friendly: "Hi there!",
  professional: "Hello.",
  premium: "Welcome.",
};

export function greetingFor(agent: PageAgent, siteName: string): string {
  if (agent.greeting) return agent.greeting;
  const can: string[] = [];
  if (hasCapability(agent, "answer")) can.push("answer questions");
  if (hasCapability(agent, "guide")) can.push("help you choose");
  if (hasCapability(agent, "booking")) can.push("book an appointment");
  if (hasCapability(agent, "leads") && !hasCapability(agent, "booking")) can.push("get you a quote");
  if (hasCapability(agent, "handoff")) can.push("put you through to the team");
  const list =
    can.length <= 1 ? (can[0] ?? "help") : `${can.slice(0, -1).join(", ")} or ${can[can.length - 1]}`;
  return `${TONE_OPENERS[agent.tone]} I'm the assistant for ${siteName}. I can ${list}. What would you like to do?`;
}

/* ---- The Actions a capability needs in the workspace ---------------------- */

const ACTION_SPECS: Partial<
  Record<
    AgentCapability,
    { kind: ActionKind; name: string; triggers: VisitorIntent[]; collects: ActionDef["collects"]; outcome: string }
  >
> = {
  booking: {
    kind: "booking",
    name: "Book an appointment",
    triggers: ["booking", "hours"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "phone", label: "Phone number", required: true, type: "phone" },
      { key: "preferred", label: "Preferred day", required: true, type: "date" },
    ],
    outcome: "A booking request lands with your team and the visitor gets a confirmation message.",
  },
  leads: {
    kind: "quote",
    name: "Request a quote",
    triggers: ["quote", "pricing"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
      { key: "need", label: "What they need", required: false, type: "text" },
    ],
    outcome: "The request is added to Leads with the conversation attached.",
  },
  contact: {
    kind: "call",
    name: "Request a callback",
    triggers: ["human", "support"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "phone", label: "Phone number", required: true, type: "phone" },
    ],
    outcome: "Your team is alerted with the number and what the visitor was reading.",
  },
  promotions: {
    kind: "offer",
    name: "Claim the offer",
    triggers: ["pricing"],
    collects: [{ key: "contact", label: "Phone or email", required: true, type: "text" }],
    outcome: "The visitor is added to Leads, tagged with the offer they claimed.",
  },
  payment: {
    kind: "payment",
    name: "Pay a deposit",
    triggers: ["pricing", "booking"],
    collects: [],
    outcome: "The visitor is sent to your payment link.",
  },
};

/** Stable, so a CTA can point at the action before the action exists. */
export const actionIdFor = (siteId: ID, id: AgentCapability): ID => `act_${siteId}_${id}`;

/**
 * The Actions a site's agent implies. Existing actions keep their history and
 * whatever the owner configured; only their readiness follows the agent, so
 * switching a capability off disables its action rather than deleting it.
 */
export function reconcileActions(siteId: ID, doc: PageDocument, existing: ActionDef[]): ActionDef[] {
  const mine = existing.filter((a) => a.siteId === siteId);
  const others = existing.filter((a) => a.siteId !== siteId);
  const next = [...mine];

  for (const [capability, spec] of Object.entries(ACTION_SPECS) as [AgentCapability, NonNullable<(typeof ACTION_SPECS)[AgentCapability]>][]) {
    const id = actionIdFor(siteId, capability);
    const { state } = capabilityState(doc, capability);
    const readiness: ActionDef["readiness"] =
      state === "off"
        ? "disabled"
        : state === "needs-setup"
          ? "needs-setup"
          : capability === "booking"
            ? "needs-connection"
            : "ready";
    const index = next.findIndex((a) => a.id === id);

    if (index >= 0) {
      if (next[index].readiness !== readiness) next[index] = { ...next[index], readiness };
    } else if (state !== "off") {
      next.push({
        id,
        siteId,
        kind: spec.kind,
        name: spec.name,
        description: capabilityDef(capability).description,
        readiness,
        triggers: spec.triggers,
        collects: spec.collects,
        outcome: spec.outcome,
        placements: ["agent", "pages"],
        completions30d: 0,
      });
    }
  }

  const changed = next.length !== mine.length || next.some((a, i) => a !== mine[i]);
  return changed ? [...others, ...next] : existing;
}

/* ---- Test mode ------------------------------------------------------------ */

export interface AgentReply {
  text: string;
  /** Set when the reply hands the visitor to an action. */
  action?: string;
  /** Where the answer came from, so the owner can see it was not invented. */
  source?: string;
}

/** Words that say nothing about which service is meant. */
const GENERIC_WORDS = new Set(["service", "services", "offer", "offers", "help", "with", "choose", "decide", "what", "which", "does", "have", "your", "provide", "could", "would", "about"]);

const allSections = (doc: PageDocument) => doc.pages.flatMap((p) => p.sections.filter((s) => s.enabled));

const words = (text: string) =>
  new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );

/**
 * How the agent would answer, worked out from the page alone. It is the same
 * rule the real agent follows — answer from what the owner published, never
 * invent a price or a promise — so a gap in the page shows up here as a gap,
 * which is the most useful thing a test can tell an owner before launch.
 */
export function answerVisitor(doc: PageDocument, siteName: string, question: string): AgentReply {
  const agent = agentOf(doc);
  const q = question.toLowerCase();
  const sections = allSections(doc);
  const has = (id: AgentCapability) => hasCapability(agent, id);

  if (/offer|deal|promo|discount|sale/.test(q)) {
    if (has("promotions") && agent.promotion) {
      return {
        text: `${agent.promotion.headline}. ${agent.promotion.detail} Leave your ${agent.promotion.collects} and I'll make sure it's applied.`,
        action: agent.promotion.cta,
        source: "Your promotion",
      };
    }
    return { text: "There's no offer running right now, but I can tell you about our services.", source: "No promotion set" };
  }

  if (/book|appointment|schedule|availability|slot/.test(q)) {
    if (has("booking")) {
      return { text: "Happy to help you book. What day works best for you?", action: "Book an appointment" };
    }
    if (has("contact")) {
      return { text: "I can't book directly, but I can have the team call you to arrange a time.", action: "Request a callback" };
    }
  }

  if (/price|cost|how much|fee|rate|quote/.test(q)) {
    const pricing = sections.find((s): s is Extract<PageSection, { kind: "pricing" }> => s.kind === "pricing");
    if (pricing && pricing.content.tiers.length > 0) {
      const tiers = pricing.content.tiers.map((t) => `${t.name} ${t.price}${t.cadence ? ` ${t.cadence}` : ""}`);
      return {
        text: `Here's what we list: ${tiers.join(", ")}.${pricing.content.note ? ` ${pricing.content.note}` : ""}`,
        action: has("leads") ? "Get a quote" : undefined,
        source: "Pricing section",
      };
    }
    const priced = sections
      .flatMap((s) => (s.kind === "services" ? s.content.items : []))
      .filter((i) => i.price);
    if (priced.length > 0) {
      return {
        text: priced.map((i) => `${i.name}: ${i.price}`).join(". ") + ".",
        action: has("leads") ? "Get a quote" : undefined,
        source: "Services section",
      };
    }
    if (has("leads")) {
      return {
        text: "Prices depend on the job, so I won't guess. Tell me a little about what you need and the team will send a quote.",
        action: "Get a quote",
        source: "No prices on the page",
      };
    }
  }

  if (/person|human|someone|call me|speak|talk/.test(q) && has("handoff")) {
    return { text: "Of course — I'll pass this to the team with our conversation so you don't have to repeat yourself.", action: "Talk to a person" };
  }

  if (/pay|deposit|checkout/.test(q) && has("payment")) {
    return agent.paymentUrl
      ? { text: "You can pay securely here.", action: "Pay a deposit", source: "Your payment link" }
      : { text: "Payments aren't set up yet, so I'll have the team get in touch.", source: "No payment link" };
  }

  if (/where|located|address|area|serve|hours|open/.test(q)) {
    const contact = sections.find((s): s is Extract<PageSection, { kind: "contact" }> => s.kind === "contact");
    const where = contact?.content.address;
    if (where) return { text: `We're based in ${where}.`, source: "Contact section" };
  }

  if (/service|offer|do you do|help with|choose|decide/.test(q)) {
    const items = sections.flatMap((s) => (s.kind === "services" ? s.content.items : []));
    if (items.length > 0) {
      const names = items.map((i) => i.name).join(", ");
      /* "Do you do tree removal?" names something specific. If the page does
         not mention it, say so rather than implying the list covers it. */
      const listed = words(items.map((i) => `${i.name} ${i.description}`).join(" "));
      const specific = [...words(q)].filter((w) => !GENERIC_WORDS.has(w));
      const mentioned = specific.length === 0 || specific.some((w) => listed.has(w));
      return {
        text: mentioned
          ? `${siteName} offers ${names}. Tell me what you're after and I'll point you to the right one.`
          : `I can't see that on this site, so I won't promise it. ${siteName} lists ${names}${has("handoff") ? " — want me to ask the team?" : "."}`,
        action: mentioned || !has("handoff") ? undefined : "Talk to a person",
        source: mentioned ? "Services section" : "Not on the page",
      };
    }
  }

  /* Fall back to the FAQ, matched on shared words — the answer the owner wrote,
     verbatim, rather than a paraphrase of it. */
  const asked = words(q);
  let best: { answer: string; score: number } | null = null;
  for (const s of sections) {
    if (s.kind !== "faq") continue;
    for (const item of s.content.items) {
      const score = [...words(item.question)].filter((w) => asked.has(w)).length;
      if (score > 0 && (best === null || score > best.score)) best = { answer: item.answer, score };
    }
  }
  if (best) return { text: best.answer, source: "FAQ" };

  if (has("handoff")) {
    return {
      text: "That's not something I can answer from this site, and I'd rather not guess. Want me to pass it to the team?",
      action: "Talk to a person",
      source: "Not on the page",
    };
  }
  return { text: "I'm not able to answer that from this site yet.", source: "Not on the page" };
}
