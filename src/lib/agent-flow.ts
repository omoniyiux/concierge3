import { money } from "@/lib/format";
import type {
  ActionDef,
  ActionField,
  AgentConfig,
  ConversationStatus,
  Destination,
  LeadQualification,
  MessageChannel,
  RoutingMoment,
  VisitorIntent,
} from "@/lib/types";

/* ============================================================================
   THE AGENT FLOW
   ----------------------------------------------------------------------------
   One conversation, all the way through. Not a lookup table of answers.

   The preview used to reply once and stop, which taught an owner nothing about
   the part they are actually nervous about: what happens after Concierge says
   "shall I put you through?". So this models the whole run — the answer, the
   details it collects, the confirmation, the routing, the person who picks it
   up, the follow-up, and the close — and every status a conversation can hold
   on the way (new → active → qualified → converted → handed-off → closed).

   Two rules, the same ones the engine follows:

   1. Nothing happens here that the product would not do. An action that is not
      ready never fires, a value is never promoted from estimated to confirmed
      without something confirming it, and no message is sent on a channel the
      visitor has not given permission for.
   2. Every step says where it landed. A step an owner cannot trace is a step
      they will not trust.
   ========================================================================== */

export type TurnAuthor = "visitor" | "agent" | "system" | "person";

export type VerdictKind = "answer" | "action" | "handoff" | "refusal" | "gap";

export interface Verdict {
  kind: VerdictKind;
  /** Owner-facing: how the reply was arrived at. */
  note: string;
}

export interface FlowTurn {
  id: string;
  author: TurnAuthor;
  authorName?: string;
  body: string;
  verdict?: Verdict;
  cites?: string[];
  confidence?: number;
  /** Seconds since the visitor's first message. Shown where latency matters. */
  offset: number;
}

export type EffectTone = "neutral" | "approved" | "review" | "restricted" | "info" | "accent";

/**
 * Something that landed somewhere else in the product. The preview is a
 * simulation, so none of these are real — but each one names the surface it
 * would appear on, because "where did that go?" is the question owners ask.
 */
export interface FlowEffect {
  id: string;
  /** The surface an owner would go and look at. */
  where: string;
  title: string;
  detail?: string;
  tone: EffectTone;
}

export type FlowStage =
  | "open" // greeting is up, nothing asked yet
  | "answering" // answered, and waiting on an answer to its offer
  | "collecting" // filling in what the action needs, one field at a time
  | "confirming" // reading it back before anything leaves
  | "routing" // in flight to a person
  | "waiting" // delivered, nobody has picked it up yet
  | "with-person" // a person is on the thread and Concierge has stepped back
  | "closed";

/** The path shown beside the transcript, so the owner can see the shape. */
export const FLOW_PATH: { key: string; label: string; stages: FlowStage[] }[] = [
  { key: "asked", label: "Asked", stages: ["open"] },
  { key: "answered", label: "Answered", stages: ["answering"] },
  { key: "details", label: "Details taken", stages: ["collecting"] },
  { key: "confirmed", label: "Confirmed", stages: ["confirming"] },
  { key: "routed", label: "Routed", stages: ["routing"] },
  { key: "person", label: "With a person", stages: ["waiting", "with-person"] },
  { key: "closed", label: "Closed", stages: ["closed"] },
];

export const ALL_STATUSES: ConversationStatus[] = [
  "new",
  "active",
  "qualified",
  "converted",
  "handed-off",
  "closed",
];

/** What the owner just approved, so a new answer can be watched taking effect. */
export interface ExtraAnswer {
  a: string;
  verdict: { kind: VerdictKind; note: string };
  cites?: string[];
  confidence: number;
}

export interface FlowConfig {
  agent: AgentConfig;
  actions: ActionDef[];
  destinations: Destination[];
  siteName: string;
  currency: string;
  /** Stamped when the run starts, against the hours in force at that moment. */
  afterHours: boolean;
  /** "8am Monday". Used when Concierge has to say when someone will be there. */
  opensAgain: string;
  extraAnswers?: Record<string, ExtraAnswer>;
}

export interface FlowState {
  stage: FlowStage;
  status: ConversationStatus;
  intent: VisitorIntent;
  turns: FlowTurn[];
  /** Every stage this run has actually been through. */
  trail: FlowStage[];
  /** What Concierge is waiting to hear, so the next reply reads in context. */
  awaiting?: {
    kind: "offer" | "field" | "confirm" | "gap-choice";
    actionId?: string;
    fieldKey?: string;
    /** Set once a field has been asked again, so it is never asked a third time. */
    retried?: boolean;
  };
  slots: Record<string, string>;
  actionId?: string;
  /** Why a person is needed, in the owner's words. */
  handoffReason?: string;
  moment?: RoutingMoment;
  routedTo: string[];
  score?: number;
  qualification?: LeadQualification;
  consent: { channel: MessageChannel; address: string; basis: string }[];
  effects: FlowEffect[];
  /** Where the thread stands right now, in one line. */
  standing: string;
  /** What happens next with nobody doing anything. The answer to "and then?" */
  nextStep?: string;
  followUp?: { state: "drafted" | "sent"; channel: MessageChannel; body: string; note: string };
  takenOverBy?: string;
  gapLogged?: string;
  /** Set when the ledger figure stopped being an estimate. */
  valueConfirmed?: boolean;
  seconds: number;
  /** Things a visitor plausibly says next. Replaces a fixed test list. */
  prompts: string[];
  n: number;
}

/* ---- Reading the question ------------------------------------------------- */

/**
 * The knowledge this practice has approved, plus the two rules that outrank
 * it. Ordered: a never-promise rule and an escalation trigger are checked
 * before anything is answered, because that is the order the runtime uses.
 */
interface Topic {
  id: string;
  intent: VisitorIntent;
  match: RegExp;
  /** Straight to a person, no question asked. */
  escalate?: string;
  /** A never-promise rule bites instead of an answer. */
  refuse?: { body: string; rule: string };
  /** Nothing approved covers it. */
  gap?: string;
  answer?: string;
  cites?: string[];
  confidence?: number;
  /** Where this answer naturally goes next. */
  next?: { actionId: string; offer: string };
  /** Replies a visitor plausibly gives to this answer. */
  prompts?: string[];
}

const TOPICS: Topic[] = [
  {
    id: "emergency",
    intent: "support",
    match: /pain|hurts?|hurting|ache|swell|bleed|abscess|broke|broken|chipped|knocked|emergency|urgent/i,
    escalate:
      "That needs a person rather than me — I am not allowed to advise on symptoms. I am passing this to the practice now. We hold same-day emergency slots between 8 and 10 each weekday.",
  },
  {
    id: "human",
    intent: "human",
    match: /speak to|talk to|someone|a person|human|real person|call me|ring me|phone me|receptionist|manager/i,
    escalate: "Of course. I can have the front desk call you back rather than keep you typing.",
  },
  {
    id: "existing-plan",
    intent: "human",
    match: /my (treatment )?plan|existing plan|already (have|had)|my appointment|reschedul|cancel/i,
    escalate:
      "Anything on a plan you already have is for the practice rather than me — I cannot see your records. Let me put you through.",
  },
  {
    id: "insurance",
    intent: "pricing",
    match: /insurance|insured|covered|coverage|cover (it|this|that)|claim|delta|aetna|cigna/i,
    refuse: {
      body: "I am not able to confirm what your plan covers — the front desk checks that against your specific policy. We are in-network with Delta Dental and Cigna, and we file the claim for you either way. I can have someone look your plan up properly.",
      rule: "Never confirm insurance coverage",
    },
  },
  {
    id: "diagnose",
    intent: "support",
    match: /is it (infected|serious|bad)|do i need|what.s wrong|should i (be )?worried|diagnos|symptom|is this normal/i,
    refuse: {
      body: "I cannot tell you what is going on with a tooth — that takes a dentist looking at it, and guessing would be worse than useless. What I can do is get you in front of one.",
      rule: "Never diagnose a condition or symptom",
    },
  },
  {
    id: "pricing",
    intent: "pricing",
    match: /price|pricing|cost|how much|fee|charge|expensive|cheap/i,
    answer:
      "A New Patient Exam is $89 and includes X-rays and a cleaning. Cleanings on their own are $120, and whitening starts at $349. Anything cosmetic is quoted after a short consultation, so you get a real number rather than a range.",
    cites: ["Treatment pricing", "Recommended next step"],
    confidence: 0.91,
    next: { actionId: "act_booking", offer: "Shall I put a New Patient Exam request in for you?" },
    prompts: ["Yes please", "No thanks, just looking", "Is that covered by insurance?"],
  },
  {
    id: "invisalign",
    intent: "quote",
    match: /invisalign|aligner|brace|straighten|payment plan|financ|instal(l)?ment|monthly/i,
    answer:
      "Invisalign starts at $3,900 and financing is available from $149 a month. The free consultation includes a 3D scan, so you would have an exact figure before committing to anything.",
    cites: ["Invisalign programme", "Treatment pricing"],
    confidence: 0.89,
    next: { actionId: "act_consult", offer: "Would you like me to request the free consultation?" },
    prompts: ["Yes, book the consultation", "How soon could I come in?", "No thanks"],
  },
  {
    id: "cosmetic",
    intent: "quote",
    match: /veneer|crown|cosmetic|whiten|smile makeover|bonding|implant/i,
    answer:
      "Veneers and crowns are quoted after a consultation rather than off a list — the number depends on how many teeth and the condition underneath. Whitening is the exception: $349 for the full in-practice course.",
    cites: ["Treatment pricing", "Recommended next step"],
    confidence: 0.86,
    next: { actionId: "act_quote", offer: "I can have the cosmetic team put a written quote together. Shall I?" },
    prompts: ["Yes, send me a quote", "What does the consultation involve?", "Not yet"],
  },
  {
    id: "booking",
    intent: "booking",
    match: /book|booking|appointment|slot|availab|come in|see (someone|a dentist)|this week|register/i,
    answer:
      "I can put a request in. Consultations run Monday to Thursday, and we keep early slots for people who work.",
    cites: ["Opening hours", "Recommended next step"],
    confidence: 0.9,
    next: { actionId: "act_booking", offer: "Would you like me to request a time?" },
    prompts: ["Yes please", "What does it cost?", "Are you open Saturdays?"],
  },
  {
    id: "hours",
    intent: "hours",
    match: /open|hours|saturday|sunday|weekend|close|closing|what time|where are you|address|direction/i,
    answer:
      "We are open Monday to Thursday, 8am to 5pm, and Friday 8am to 1pm. Closed at the weekend. We are on Northlane Road, with parking behind the building.",
    cites: ["Opening hours", "Parking and access"],
    confidence: 0.94,
    next: { actionId: "act_booking", offer: "Would you like me to put a time in the diary?" },
    prompts: ["Yes please", "No, that was all I needed", "Do you have parking?"],
  },
  {
    id: "newpatient",
    intent: "product",
    match: /new patient|first visit|first time|paperwork|forms|what happens/i,
    answer:
      "A first visit takes about 45 minutes: X-rays, a cleaning and a look at anything you are worried about. The forms go out by email beforehand, so you are not filling them in at the desk.",
    cites: ["New patient paperwork", "Recommended next step"],
    confidence: 0.88,
    next: { actionId: "act_booking", offer: "Shall I request a first appointment for you?" },
    prompts: ["Yes please", "How much is it?", "No thanks"],
  },
  {
    id: "children",
    intent: "product",
    match: /child|children|kid|toddler|under \d|my son|my daughter|family/i,
    gap: "Do you treat children under 5?",
  },
  {
    id: "sedation",
    intent: "product",
    match: /sedat|nervous|anxious|anxiety|afraid|scared|gas|numb/i,
    gap: "Do you offer sedation for anxious patients?",
  },
];

const AFFIRMATIVE = /^(y|ye|yes|yeah|yep|yup|sure|ok|okay|please|go ahead|do it|sounds good|that works|great|perfect|book it|send it|put it in)\b/i;
const NEGATIVE = /^(n|no|nope|not (now|yet|today)|no thanks|nah|i.?m fine|just (looking|browsing)|maybe later|leave it|that.s all|that was all)\b/i;
const URGENT = /today|asap|as soon as|right away|this week|tomorrow|urgent|soon/i;

function readTopic(utterance: string): Topic | undefined {
  return TOPICS.find((t) => t.match.test(utterance));
}

/* ---- Starting a run ------------------------------------------------------- */

const OPENING_PROMPTS = [
  "How much does a check-up cost?",
  "Can I book an appointment?",
  "Will my insurance cover a crown?",
  "I chipped a tooth last night and it really hurts",
  "Do you treat children under 5?",
];

export function initialFlow(): FlowState {
  return {
    stage: "open",
    status: "new",
    intent: "unknown",
    turns: [],
    trail: ["open"],
    slots: {},
    routedTo: [],
    consent: [],
    effects: [],
    standing: "Nothing has been asked yet. The greeting is up and the thread is open.",
    nextStep: "A visitor arrives, asks something, and Concierge reads it against your approved knowledge.",
    seconds: 0,
    prompts: OPENING_PROMPTS,
    n: 0,
  };
}

/* ---- Internals ------------------------------------------------------------ */

function clone(s: FlowState): FlowState {
  return {
    ...s,
    turns: [...s.turns],
    trail: [...s.trail],
    slots: { ...s.slots },
    routedTo: [...s.routedTo],
    consent: [...s.consent],
    effects: [...s.effects],
    prompts: [...s.prompts],
  };
}

function turn(s: FlowState, t: Omit<FlowTurn, "id" | "offset"> & { after?: number }): void {
  const { after = 0, ...rest } = t;
  s.seconds += after;
  s.turns.push({ id: `t${s.n++}`, offset: s.seconds, ...rest });
}

function effect(s: FlowState, e: Omit<FlowEffect, "id">): void {
  s.effects.push({ id: `e${s.n++}`, ...e });
}

function reach(s: FlowState, stage: FlowStage): void {
  s.stage = stage;
  if (!s.trail.includes(stage)) s.trail.push(stage);
}

function actionOf(config: FlowConfig, id?: string): ActionDef | undefined {
  return config.actions.find((a) => a.id === id);
}

/* ---- The turn a visitor takes --------------------------------------------- */

export function ask(config: FlowConfig, state: FlowState, raw: string): FlowState {
  const utterance = raw.trim();
  if (!utterance) return state;
  let s = clone(state);

  // A visitor who comes back is the same thread reopened, not a new one.
  if (s.stage === "closed") s = reopen(config, s);

  turn(s, { author: "visitor", body: utterance, after: s.turns.length ? 38 : 0 });

  // A person has the thread. Concierge does not talk over them.
  if (s.stage === "waiting" || s.stage === "with-person") {
    turn(s, {
      author: "system",
      body: s.takenOverBy
        ? `Passed straight to ${s.takenOverBy}. Concierge is not answering while a person is on this thread.`
        : `Held for ${s.routedTo[0] ?? "your team"}. Concierge will not answer over the top of a handoff.`,
      after: 2,
    });
    s.standing = "The visitor is still typing, and everything they say now goes to the person holding the thread.";
    return s;
  }

  switch (s.awaiting?.kind) {
    case "field":
      return fillField(config, s, utterance);
    case "offer":
      return answerOffer(config, s, utterance);
    case "confirm":
      return answerConfirm(config, s, utterance);
    case "gap-choice":
      return answerGapChoice(config, s, utterance);
    default:
      return freshAsk(config, s, utterance);
  }
}

function freshAsk(config: FlowConfig, s: FlowState, utterance: string): FlowState {
  const key = utterance.toLowerCase();
  const approved = config.extraAnswers?.[key];
  reach(s, "answering");
  s.status = "active";

  // Something the owner approved a moment ago, taking effect.
  if (approved) {
    turn(s, {
      author: "agent",
      body: approved.a,
      verdict: approved.verdict,
      cites: approved.cites,
      confidence: approved.confidence,
      after: 3,
    });
    effect(s, {
      where: "Insights",
      title: "A gap closed, and answered on the next ask",
      detail: "The question that produced this answer drops off your open list.",
      tone: "approved",
    });
    return offerNext(config, s, "act_booking", "Shall I put a request in while you are here?");
  }

  const topic = readTopic(utterance);
  s.intent = topic?.intent ?? "unknown";

  if (topic?.escalate) return escalate(config, s, topic);
  if (topic?.refuse) return refuse(config, s, topic);
  if (!topic || topic.gap) return gap(config, s, topic?.gap ?? utterance);

  turn(s, {
    author: "agent",
    body: topic.answer!,
    verdict: { kind: "answer", note: "Answered from approved knowledge" },
    cites: topic.cites,
    confidence: topic.confidence,
    after: 3,
  });

  if (!topic.next) {
    s.prompts = topic.prompts ?? ["That's all I needed", "Can I book?"];
    s.standing = "Answered from your knowledge. Nothing routed, because nothing needed a person.";
    s.nextStep = "If the visitor leaves it there, this closes as resolved without a person.";
    return s;
  }
  return offerNext(config, s, topic.next.actionId, topic.next.offer, topic.prompts);
}

/**
 * The offer is where a conversation becomes a piece of work. An action that is
 * not ready is never offered — Concierge says what it cannot do instead of
 * collecting details it has nowhere to send.
 */
function offerNext(
  config: FlowConfig,
  s: FlowState,
  actionId: string,
  offer: string,
  prompts?: string[],
): FlowState {
  const action = actionOf(config, actionId);
  if (!action || action.readiness !== "ready") {
    turn(s, {
      author: "agent",
      body: "I can take your details and have someone come back to you — I am not set up to complete that one myself yet.",
      verdict: { kind: "handoff", note: action ? `${action.name} is not ready` : "No action available" },
      after: 2,
    });
    effect(s, {
      where: "Actions",
      title: `${action?.name ?? "That action"} is not ready`,
      detail: "It was not offered. Concierge fell back to taking contact details.",
      tone: "review",
    });
    return startCollecting(config, s, "act_lead", "handoff");
  }

  turn(s, { author: "agent", body: offer, verdict: { kind: "answer", note: `Offered ${action.name}` }, after: 2 });
  s.awaiting = { kind: "offer", actionId };
  s.prompts = prompts ?? ["Yes please", "No thanks"];
  s.standing = `Answered, and offered ${action.name}. Nothing has been collected yet.`;
  s.nextStep = "If they say yes, Concierge collects only the fields this action needs — nothing else.";
  return s;
}

function answerOffer(config: FlowConfig, s: FlowState, utterance: string): FlowState {
  const actionId = s.awaiting?.actionId;
  if (AFFIRMATIVE.test(utterance) || /book|quote|consult|call/i.test(utterance)) {
    return startCollecting(config, s, actionId ?? "act_lead", "action");
  }
  if (NEGATIVE.test(utterance)) {
    turn(s, {
      author: "agent",
      body: "No problem. I am here if you change your mind — and everything I told you holds whenever you come back.",
      verdict: { kind: "answer", note: "Offer declined, nothing collected" },
      after: 2,
    });
    return resolveWithoutHuman(config, s);
  }

  // Not a yes and not a no: it is a new question. Read it as one.
  s.awaiting = undefined;
  return freshAsk(config, s, utterance);
}

/* ---- Collecting what the action needs ------------------------------------- */

const FIELD_PROMPT: Record<string, string> = {
  name: "Who should I put this down for?",
  phone: "What is the best number for them to reach you on?",
  email: "What email should it go to?",
  preferred: "Which day suits you? Consultations run Monday to Thursday.",
  reason: "Anything you want them to know before you come in? You can skip this.",
  treatment: "Which treatment are you interested in?",
  window: "Any particular time that suits for the call? You can skip this.",
  amount: "How much would you like to pay today?",
};

function fieldPrompt(f: ActionField): string {
  return FIELD_PROMPT[f.key] ?? `${f.label}?`;
}

function startCollecting(
  config: FlowConfig,
  s: FlowState,
  actionId: string,
  why: "action" | "handoff",
): FlowState {
  const action = actionOf(config, actionId);
  if (!action) return resolveWithoutHuman(config, s);
  s.actionId = action.id;
  reach(s, "collecting");
  s.status = "active";
  if (why === "action") {
    turn(s, {
      author: "agent",
      body: "Good — two or three quick things and I will send it across.",
      verdict: { kind: "action", note: `Started ${action.name}` },
      after: 2,
    });
  }
  return askNextField(config, s);
}

function askNextField(config: FlowConfig, s: FlowState): FlowState {
  const action = actionOf(config, s.actionId);
  if (!action) return resolveWithoutHuman(config, s);
  const missing = action.collects.find((f) => !(f.key in s.slots));

  if (!missing) return confirmBack(config, s);

  turn(s, {
    author: "agent",
    body: fieldPrompt(missing),
    verdict: { kind: "action", note: `Collecting ${missing.label.toLowerCase()}` },
    after: 2,
  });
  s.awaiting = { kind: "field", actionId: action.id, fieldKey: missing.key };
  s.prompts = promptsForField(missing);
  const done = action.collects.filter((f) => f.key in s.slots).length;
  s.standing = `Collecting for ${action.name} — ${done} of ${action.collects.length} fields in.`;
  s.nextStep = "Nothing leaves until every required field is in and the visitor has confirmed it.";
  return s;
}

function promptsForField(f: ActionField): string[] {
  switch (f.key) {
    case "name":
      return ["Maya Robinson", "Rather not say"];
    case "phone":
      return ["512-555-0142", "I would rather email"];
    case "email":
      return ["maya.robinson@gmail.com", "not an email"];
    case "preferred":
      return ["Thursday morning", "Any day next week"];
    case "treatment":
      return ["Veneers, top six", "Whitening"];
    default:
      return f.required ? ["Yes"] : ["Skip"];
  }
}

function validField(f: ActionField, value: string): boolean {
  switch (f.type) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case "phone":
      return (value.match(/\d/g) ?? []).length >= 7;
    case "number":
      return /\d/.test(value);
    default:
      return value.length > 1;
  }
}

function fillField(config: FlowConfig, s: FlowState, utterance: string): FlowState {
  const action = actionOf(config, s.actionId);
  const field = action?.collects.find((f) => f.key === s.awaiting?.fieldKey);
  if (!action || !field) return freshAsk(config, s, utterance);

  // A question in the middle of a form is still a question.
  const topic = readTopic(utterance);
  if (topic && (topic.escalate || topic.refuse) && !validField(field, utterance)) {
    s.awaiting = undefined;
    return topic.escalate ? escalate(config, s, topic) : refuse(config, s, topic);
  }

  if (!field.required && /^(skip|no|none|nothing|n\/a)\b/i.test(utterance)) {
    s.slots[field.key] = "—";
    s.awaiting = undefined;
    return askNextField(config, s);
  }

  if (!validField(field, utterance)) {
    if (s.awaiting?.retried) {
      // Asked twice is enough. It goes to a person rather than nagging.
      turn(s, {
        author: "agent",
        body: `I am not getting that ${field.label.toLowerCase()} right, and I would rather not hold you up. Let me pass this to the practice with what we have.`,
        verdict: { kind: "handoff", note: "Gave up on a field rather than loop" },
        after: 2,
      });
      s.handoffReason = `Could not collect a valid ${field.label.toLowerCase()}`;
      s.awaiting = undefined;
      return route(config, s, "specialist-requested");
    }
    turn(s, {
      author: "agent",
      body:
        field.type === "email"
          ? "That does not look like an email address — could you check it? Nothing sends until it is right."
          : field.type === "phone"
            ? "That number looks short. Could you give it to me again with the area code?"
            : `Sorry — could you give me the ${field.label.toLowerCase()} again?`,
      verdict: { kind: "action", note: `${field.label} failed validation` },
      after: 2,
    });
    s.awaiting = { ...s.awaiting!, retried: true };
    s.standing = `Waiting on a valid ${field.label.toLowerCase()}. Concierge asks twice, then hands over.`;
    return s;
  }

  s.slots[field.key] = utterance;
  if (field.type === "phone") {
    s.consent.push({
      channel: "sms",
      address: utterance,
      basis: `Gave a number when asked, for ${action.name.toLowerCase()}.`,
    });
  }
  if (field.type === "email") {
    s.consent.push({
      channel: "email",
      address: utterance,
      basis: `Gave an email when asked, for ${action.name.toLowerCase()}.`,
    });
  }
  s.awaiting = undefined;
  return askNextField(config, s);
}

/* ---- Reading it back ------------------------------------------------------ */

function confirmBack(config: FlowConfig, s: FlowState): FlowState {
  const action = actionOf(config, s.actionId)!;
  reach(s, "confirming");
  s.status = "qualified";
  const lines = action.collects
    .filter((f) => s.slots[f.key] && s.slots[f.key] !== "—")
    .map((f) => `${f.label}: ${s.slots[f.key]}`)
    .join(" · ");

  turn(s, {
    author: "agent",
    body: `Before I send it: ${lines}. Have I got that right?`,
    verdict: { kind: "action", note: "Reading it back before anything is sent" },
    after: 2,
  });
  s.awaiting = { kind: "confirm", actionId: action.id };
  s.prompts = ["Yes, that's right", "No, change the day"];
  s.standing = "Everything is collected and nothing has been sent. The visitor has the last word.";
  s.nextStep = `On a yes: ${action.outcome}`;
  return s;
}

function answerConfirm(config: FlowConfig, s: FlowState, utterance: string): FlowState {
  const action = actionOf(config, s.actionId)!;
  if (NEGATIVE.test(utterance) || /change|wrong|different|actually/i.test(utterance)) {
    // Clear the things people usually want to change, and ask again.
    const editable = action.collects.find((f) => f.type === "date") ?? action.collects[0];
    delete s.slots[editable.key];
    turn(s, {
      author: "agent",
      body: `No problem — nothing has gone anywhere. ${fieldPrompt(editable)}`,
      verdict: { kind: "action", note: `Corrected ${editable.label.toLowerCase()} before sending` },
      after: 2,
    });
    reach(s, "collecting");
    s.awaiting = { kind: "field", actionId: action.id, fieldKey: editable.key };
    s.prompts = promptsForField(editable);
    s.standing = "The visitor corrected something. Still nothing sent.";
    return s;
  }
  if (!AFFIRMATIVE.test(utterance)) {
    turn(s, {
      author: "agent",
      body: "Sorry — was that a yes? I will not send anything until you say so.",
      verdict: { kind: "action", note: "Would not assume consent" },
      after: 2,
    });
    return s;
  }
  return complete(config, s);
}

/* ---- Completing the work -------------------------------------------------- */

function scoreOf(config: FlowConfig, s: FlowState): number {
  const base: Partial<Record<VisitorIntent, number>> = {
    quote: 60,
    booking: 56,
    human: 50,
    pricing: 46,
    support: 48,
    product: 34,
    hours: 26,
    unknown: 20,
  };
  let score = base[s.intent] ?? 30;
  if (s.consent.some((c) => c.channel === "sms")) score += 18;
  if (s.consent.some((c) => c.channel === "email")) score += 12;
  if (Object.values(s.slots).some((v) => URGENT.test(v))) score += 10;
  if (config.afterHours) score += 8;
  const action = actionOf(config, s.actionId);
  if (action?.unitValue) score += 6;
  return Math.max(5, Math.min(99, score));
}

function qualify(score: number): LeadQualification {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "cool";
  return "unqualified";
}

function complete(config: FlowConfig, s: FlowState): FlowState {
  const action = actionOf(config, s.actionId)!;
  const score = scoreOf(config, s);
  s.score = score;
  s.qualification = qualify(score);

  turn(s, {
    author: "agent",
    body:
      action.kind === "booking" || action.kind === "consultation"
        ? `Done — I have put the request in for ${s.slots.preferred ?? "the day you asked for"} and passed it to the front desk. They confirm the exact time, usually the same working day.`
        : action.kind === "quote"
          ? "Sent. The cosmetic team writes these by hand, so expect it within a working day rather than instantly."
          : "Thank you — that is with the practice now.",
    verdict: { kind: "action", note: `${action.name} completed` },
    confidence: 0.93,
    after: 3,
  });

  // Consent is recorded as the moment it was given, not as a setting.
  for (const c of s.consent) {
    effect(s, {
      where: "Conversations",
      title: `Permission to reach them ${c.channel === "sms" ? "by text" : "by email"}`,
      detail: c.basis,
      tone: "neutral",
    });
  }

  effect(s, {
    where: "Leads",
    title: `Lead captured — ${s.qualification}, scored ${score}`,
    detail: `${s.slots.name ?? "Unnamed visitor"} · ${
      s.slots.phone ?? s.slots.email ?? "no contact given"
    } · ${action.name}`,
    tone: score >= 80 ? "approved" : "info",
  });

  if (action.unitValue) {
    effect(s, {
      where: "Ledger",
      title: `${money(action.unitValue, config.currency)} recorded as an estimate`,
      detail: action.unitValueNote ?? "From the figure you entered during setup.",
      tone: "accent",
    });
  } else {
    effect(s, {
      where: "Ledger",
      title: "No value claimed",
      detail: `You have not told us what a ${action.name.toLowerCase()} is worth, so Concierge does not invent one.`,
      tone: "neutral",
    });
  }

  s.status = action.unitValue ? "converted" : "qualified";
  return route(config, s, score >= 70 ? "high-intent" : "specialist-requested");
}

/* ---- Routing: the part owners actually worry about ------------------------ */

const SLA: Record<string, string> = {
  sms: "read within a minute, day or night",
  email: "the front desk works to a 15-minute reply during opening hours",
  slack: "seen by whoever is in the channel",
  inbox: "in Concierge, and pushed to the phone app",
  webhook: "written into your CRM",
  telegram: "pushed to the owners group",
};

function personFor(destinationName?: string): string {
  if (!destinationName) return "the front desk";
  if (/emergency/i.test(destinationName)) return "Dr Iyer, on call";
  if (/cosmetic/i.test(destinationName)) return "Rae from the cosmetic team";
  return "Sam at the front desk";
}

function route(config: FlowConfig, s: FlowState, moment: RoutingMoment): FlowState {
  reach(s, "routing");
  s.moment = moment;

  const matched = config.destinations.filter(
    (d) => d.status !== "paused" && d.moments.includes(moment),
  );
  const inbox = config.destinations.find((d) => d.kind === "inbox");
  const targets = [...matched];
  // The Inbox is always in the list. It is the record every other copy is of.
  if (inbox && !targets.some((d) => d.id === inbox.id)) targets.push(inbox);

  const delivered: Destination[] = [];
  const failed: Destination[] = [];

  for (const d of targets) {
    if (d.status === "failing") {
      failed.push(d);
      effect(s, {
        where: "Routing",
        title: `${d.name} did not accept it`,
        detail: `${d.target} is failing. Concierge is retrying, and the Inbox copy means nothing is lost.`,
        tone: "restricted",
      });
      continue;
    }
    delivered.push(d);
    effect(s, {
      where: "Routing",
      title: `Delivered to ${d.name}`,
      detail: `${d.target} — ${SLA[d.kind] ?? "delivered"}${
        d.status === "untested" ? ". First thing it has ever been asked to deliver." : ""
      }`,
      tone: d.status === "untested" ? "review" : "approved",
    });
  }

  s.routedTo = delivered.map((d) => d.name);
  const seconds = 2 + ((s.score ?? 40) % 5);
  s.seconds += seconds;

  turn(s, {
    author: "system",
    body: `${momentLabel(moment)} routed to ${
      delivered.map((d) => `${d.name} · ${kindLabel(d.kind)}`).join(", ") || "nowhere"
    } in ${seconds} seconds.${failed.length ? ` ${failed[0].name} failed and is queued for retry.` : ""}`,
    after: 0,
  });

  effect(s, {
    where: "Inbox",
    title: "Handoff waiting to be picked up",
    detail: `${s.slots.name ?? "Website visitor"} · ${
      s.handoffReason ?? actionOf(config, s.actionId)?.name ?? "wants a person"
    }`,
    tone: "info",
  });

  const primary = delivered[0];
  if (s.status !== "converted") s.status = "handed-off";
  reach(s, "waiting");

  if (config.afterHours) {
    turn(s, {
      author: "agent",
      body: `One thing to set your expectations: the practice is closed right now, so nobody will pick this up until ${config.opensAgain}. It is first in the queue when they open.`,
      verdict: { kind: "handoff", note: "After hours — said so rather than implying a reply" },
      after: 2,
    });
    draftFollowUp(config, s, `first thing ${config.opensAgain}`);
    s.standing = `Delivered while you were closed. Waiting on ${personFor(primary?.name)} from ${config.opensAgain}.`;
    s.nextStep = `Nobody is there yet. The request is sitting in ${
      primary?.name ?? "the Inbox"
    }, and the follow-up below is what keeps the visitor warm until someone opens it.`;
  } else {
    s.standing = `Delivered to ${s.routedTo.join(", ") || "the Inbox"}. Waiting on a person.`;
    s.nextStep = `Next: ${personFor(primary?.name)} opens it and replies. Until they do, this sits at handed-off — it is the one status that depends on you, not on Concierge.`;
  }

  s.awaiting = undefined;
  s.prompts = ["How long will that take?", "Thanks"];
  return s;
}

function momentLabel(m: RoutingMoment): string {
  switch (m) {
    case "call-requested":
      return "Call request";
    case "high-intent":
      return "High-intent lead";
    case "specialist-requested":
      return "Specialist request";
    case "team-replied":
      return "Team reply";
    default:
      return "Request";
  }
}

function kindLabel(k: Destination["kind"]): string {
  switch (k) {
    case "sms":
      return "SMS";
    case "inbox":
      return "Inbox";
    case "webhook":
      return "Webhook";
    default:
      return k.charAt(0).toUpperCase() + k.slice(1);
  }
}

/* ---- The three ways Concierge refuses to guess ---------------------------- */

/** Asked for a person, or triggered an escalation rule. Straight through. */
function escalate(config: FlowConfig, s: FlowState, topic: Topic): FlowState {
  s.intent = topic.intent;
  s.handoffReason =
    topic.id === "emergency"
      ? "Reported pain — escalation trigger"
      : topic.id === "existing-plan"
        ? "Asked about an existing treatment plan"
        : "Asked to speak to a person";
  turn(s, {
    author: "agent",
    body: topic.escalate!,
    verdict: { kind: "handoff", note: `Escalation trigger: ${s.handoffReason.toLowerCase()}` },
    cites: ["Human escalation rules"],
    confidence: 0.95,
    after: 3,
  });
  effect(s, {
    where: "Agent",
    title: "An escalation trigger fired",
    detail: `"${s.handoffReason}" is one of the triggers you set. Concierge stopped answering and went for a person.`,
    tone: "info",
  });
  return startCollecting(config, s, "act_call", "handoff");
}

/** A never-promise rule outranks anything in the Brain. */
function refuse(config: FlowConfig, s: FlowState, topic: Topic): FlowState {
  reach(s, "answering");
  s.status = "active";
  turn(s, {
    author: "agent",
    body: topic.refuse!.body,
    verdict: { kind: "refusal", note: `Never-promise rule: ${topic.refuse!.rule}` },
    cites: ["Things Concierge should never promise"],
    confidence: 0.97,
    after: 3,
  });
  effect(s, {
    where: "Agent",
    title: "A never-promise rule held",
    detail: `${topic.refuse!.rule}. It answered around the rule instead of going quiet.`,
    tone: "approved",
  });
  s.handoffReason = topic.refuse!.rule;
  return offerNext(config, s, "act_call", "Shall I have someone call you and check it properly?", [
    "Yes, have them call",
    "No, I will call you",
  ]);
}

/** Nothing approved covers it. The gap is worth more than the answer. */
function gap(config: FlowConfig, s: FlowState, question: string): FlowState {
  reach(s, "answering");
  s.status = "active";
  s.gapLogged = question;
  turn(s, {
    author: "agent",
    body: "I do not have that in my approved knowledge, so I would rather not guess at it. I can put you through to the practice, or take an email and have them come back to you — whichever is easier.",
    verdict: { kind: "gap", note: "Knowledge gap · logged to Insights" },
    confidence: 0.38,
    after: 3,
  });
  effect(s, {
    where: "Insights",
    title: "Logged as an unanswered question",
    detail: `"${question}" — answer it once in Site Brain and the next visitor gets a real answer instead of this.`,
    tone: "review",
  });
  s.awaiting = { kind: "gap-choice" };
  s.prompts = ["Put me through", "Email me instead", "Never mind"];
  s.standing = "It refused to guess. The gap is logged, and the visitor has two ways out.";
  s.nextStep = "This is the loop that matters: close the gap in Site Brain, and this conversation never happens again.";
  return s;
}

function answerGapChoice(config: FlowConfig, s: FlowState, utterance: string): FlowState {
  if (/call|phone|through|speak|talk|ring/i.test(utterance)) {
    s.handoffReason = `Could not answer: "${s.gapLogged}"`;
    return startCollecting(config, s, "act_call", "handoff");
  }
  if (/email|write|message|contact/i.test(utterance)) {
    s.handoffReason = `Could not answer: "${s.gapLogged}"`;
    return startCollecting(config, s, "act_lead", "handoff");
  }
  if (NEGATIVE.test(utterance)) {
    turn(s, {
      author: "agent",
      body: "Understood. Sorry I could not help with that one.",
      verdict: { kind: "gap", note: "Left without a handoff" },
      after: 2,
    });
    reach(s, "closed");
    s.status = "closed";
    s.standing = "Closed with the question unanswered and no contact taken.";
    s.nextStep = `This is the honest cost of the gap: a visitor left. "${s.gapLogged}" is on your Insights list, and answering it is a two-minute job.`;
    effect(s, {
      where: "Insights",
      title: "A visitor left because of this gap",
      detail: "Counted against the question, so you can see which gaps are expensive.",
      tone: "restricted",
    });
    s.prompts = [];
    return s;
  }
  s.awaiting = undefined;
  return freshAsk(config, s, utterance);
}

/* ---- Ending without a person --------------------------------------------- */

function resolveWithoutHuman(config: FlowConfig, s: FlowState): FlowState {
  reach(s, "closed");
  s.status = "closed";
  effect(s, {
    where: "Ledger",
    title: "Resolved without a person",
    detail: "Counted in the 83% that never reach you, and in the front-desk minutes it saved.",
    tone: "approved",
  });
  if (s.consent.length) draftFollowUp(config, s, "tomorrow morning");
  s.standing = "Closed. Answered, nothing routed, nobody interrupted.";
  s.nextStep = s.followUp
    ? "The follow-up below is the only thing still open."
    : "Nothing is pending. No contact was taken, so there is nothing to follow up on — which is the trade-off of never pushing.";
  s.prompts = [];
  s.awaiting = undefined;
  return s;
}

/* ---- Follow-up: the thread outliving the visit ---------------------------- */

function draftFollowUp(config: FlowConfig, s: FlowState, when: string): void {
  const c = s.consent[0];
  if (!c) return;
  const body =
    s.stage === "waiting"
      ? `Hi${s.slots.name ? ` ${s.slots.name.split(" ")[0]}` : ""} — just so you know your request is in and the practice will be in touch ${when}. Nothing needed from you.`
      : `Hi${s.slots.name ? ` ${s.slots.name.split(" ")[0]}` : ""} — you were looking at treatment with us. If it is still on your mind I can hold a consultation slot ${when}.`;

  const note =
    config.agent.autonomy === "suggest"
      ? "Drafted and left in the Inbox. Nothing sends until you send it."
      : config.agent.autonomy === "approve"
        ? `Drafted and held until ${when}. One tap sends it.`
        : `It will send itself ${when} — inside your rules, and once only.`;

  s.followUp = { state: "drafted", channel: c.channel, body, note };
  effect(s, {
    where: "Conversations",
    title: `Follow-up drafted ${c.channel === "sms" ? "by text" : "by email"}`,
    detail: note,
    tone: config.agent.autonomy === "send" ? "accent" : "info",
  });
}

/* ---- What happens on your side ------------------------------------------- */

export type FlowEvent =
  | "person-replies"
  | "person-resolves"
  | "visitor-leaves"
  | "send-follow-up"
  | "visitor-returns";

export const EVENT_LABEL: Record<FlowEvent, { label: string; detail: string }> = {
  "person-replies": {
    label: "Your team picks it up",
    detail: "A person replies. Concierge steps back and stops answering.",
  },
  "person-resolves": {
    label: "Your team closes it",
    detail: "The work is done. The estimate becomes a confirmed figure.",
  },
  "visitor-leaves": {
    label: "The visitor closes the tab",
    detail: "What Concierge does with a thread nobody finished.",
  },
  "send-follow-up": {
    label: "Send the follow-up",
    detail: "The draft goes out on the channel they gave permission for.",
  },
  "visitor-returns": {
    label: "They come back from it",
    detail: "A recovered visitor — the outcome most sites never see.",
  },
};

export function nextEvents(state: FlowState): FlowEvent[] {
  const events: FlowEvent[] = [];
  if (state.stage === "waiting") events.push("person-replies");
  if (state.stage === "waiting" || state.stage === "with-person") events.push("person-resolves");
  if (state.stage !== "closed" && state.turns.length > 1) events.push("visitor-leaves");
  if (state.followUp?.state === "drafted") events.push("send-follow-up");
  if (state.followUp?.state === "sent" && state.stage === "closed") events.push("visitor-returns");
  return events;
}

export function advance(config: FlowConfig, state: FlowState, event: FlowEvent): FlowState {
  const s = clone(state);
  switch (event) {
    case "person-replies":
      return personReplies(config, s);
    case "person-resolves":
      return personResolves(config, s);
    case "visitor-leaves":
      return visitorLeaves(config, s);
    case "send-follow-up":
      return sendFollowUp(config, s);
    case "visitor-returns":
      return s.stage === "closed" ? reopen(config, s) : s;
  }
}

function personReplies(config: FlowConfig, s: FlowState): FlowState {
  const who = personFor(s.routedTo[0]);
  const name = who.split(/[ ,]/)[0];
  s.takenOverBy = who;
  reach(s, "with-person");
  if (s.status !== "converted") s.status = "handed-off";

  turn(s, {
    author: "system",
    body: `${who} opened the handoff${s.routedTo[0] ? ` from ${s.routedTo[0]}` : ""} and took the thread. Concierge has stepped back.`,
    after: 240,
  });
  turn(s, {
    author: "person",
    authorName: name,
    body:
      s.intent === "support"
        ? "Hi — I can see you in at 9:20 tomorrow, or I can get you seen today at 4 if the pain is bad. Which would you rather?"
        : s.actionId === "act_quote"
          ? "Hi — I have your quote in front of me. Sending it over now with the case photos."
          : `Hi — got your request${s.slots.preferred ? ` for ${s.slots.preferred}` : ""}. I can do 9:20 that morning. Does that work?`,
    after: 30,
  });

  effect(s, {
    where: "Conversations",
    title: `${who} took over the thread`,
    detail: "Stamped on the conversation. Concierge will not answer over a person, on any channel.",
    tone: "info",
  });
  effect(s, {
    where: "Routing",
    title: "team-replied fired",
    detail: "The moment a person answers is routable too — this is how the Inbox knows it is handled.",
    tone: "neutral",
  });

  s.standing = `${who} is on the thread. Concierge is listening, not answering.`;
  s.nextStep =
    "From here it is a normal conversation between two people. Concierge keeps the transcript, the lead and the value against it, and comes back only when they close it.";
  s.prompts = ["9:20 works", "Can you do later?"];
  return s;
}

function personResolves(config: FlowConfig, s: FlowState): FlowState {
  const action = actionOf(config, s.actionId);
  reach(s, "closed");
  s.status = "closed";

  turn(s, {
    author: "system",
    body: `${s.takenOverBy ?? personFor(s.routedTo[0])} marked this handled. The thread is closed.`,
    after: 420,
  });

  if (action?.unitValue) {
    s.valueConfirmed = true;
    effect(s, {
      where: "Ledger",
      title: `${money(action.unitValue, config.currency)} moved from estimated to confirmed`,
      detail: `${action.provider ?? "Your team"} confirmed it. Estimates and confirmed figures are never added together until this happens.`,
      tone: "approved",
    });
  } else {
    effect(s, {
      where: "Ledger",
      title: "Closed with no value claimed",
      detail: "A handoff that produced no priced outcome. The ledger says so rather than guessing.",
      tone: "neutral",
    });
  }

  effect(s, {
    where: "Insights",
    title: "Counted as a lead your site produced",
    detail: "It lands in the weekly report to you, with the conversation attached.",
    tone: "info",
  });

  s.standing = "Closed by a person, with the figure confirmed rather than estimated.";
  s.nextStep =
    "Nothing is pending. This conversation is now a row in Conversations, a lead in Leads, and a confirmed line on the Ledger — all pointing at the same transcript.";
  s.prompts = [];
  return s;
}

function visitorLeaves(config: FlowConfig, s: FlowState): FlowState {
  turn(s, { author: "system", body: "The visitor closed the tab without saying goodbye.", after: 600 });
  const was = s.stage;
  reach(s, "closed");
  s.status = "closed";

  if (s.consent.length) {
    draftFollowUp(config, s, "tomorrow morning");
    s.standing = "Closed mid-conversation, but they left a way to reach them.";
    s.nextStep = `This is what the follow-up is for. ${s.followUp?.note ?? ""}`;
  } else {
    effect(s, {
      where: "Conversations",
      title: "Nothing to follow up on",
      detail:
        "They never gave a number or an email, so Concierge has no permission to reach them. It will not guess at a contact.",
      tone: "restricted",
    });
    effect(s, {
      where: "Insights",
      title: "Abandoned before contact",
      detail:
        was === "collecting"
          ? "Left during the form. If this happens often, the action is asking for too much."
          : "Left after an answer. Worth checking whether the answer was the right one.",
      tone: "review",
    });
    s.standing = "Closed with nothing captured. Concierge will not invent a way to reach them.";
    s.nextStep =
      "Nothing happens. That is the honest answer — and the reason the offer comes early rather than late.";
  }
  s.prompts = [];
  s.awaiting = undefined;
  return s;
}

function sendFollowUp(config: FlowConfig, s: FlowState): FlowState {
  if (!s.followUp) return s;
  s.followUp = { ...s.followUp, state: "sent" };
  turn(s, {
    author: "agent",
    body: s.followUp.body,
    verdict: { kind: "action", note: `Follow-up sent ${s.followUp.channel === "sms" ? "by text" : "by email"}` },
    after: 900,
  });
  turn(s, {
    author: "system",
    body: `Sent to ${s.consent[0]?.address ?? "the address they gave"} on the permission recorded above. One follow-up per visitor, per your rules.`,
    after: 1,
  });
  effect(s, {
    where: "Conversations",
    title: "Follow-up sent",
    detail: `On ${s.consent[0]?.address ?? "the channel they consented to"}. Concierge will not send a second one.`,
    tone: "approved",
  });
  s.standing = "Follow-up sent. The thread is open again on a different channel.";
  s.nextStep = "If they reply, this reopens as the same conversation — not a new one.";
  return s;
}

/** A visitor who comes back is the same thread, and worth its own outcome. */
function reopen(config: FlowConfig, s: FlowState): FlowState {
  const recovered = s.followUp?.state === "sent";
  turn(s, {
    author: "system",
    body: recovered
      ? "The visitor came back from the follow-up. Same thread, reopened."
      : "The visitor came back. Same thread, reopened.",
    after: 3600,
  });
  if (recovered) {
    effect(s, {
      where: "Ledger",
      title: "Recovered visitor",
      detail: "Someone who had gone, back because of a message you approved. The clearest thing Concierge is worth.",
      tone: "accent",
    });
  }
  reach(s, "answering");
  s.status = "active";
  s.awaiting = undefined;
  s.takenOverBy = undefined;
  s.standing = "Reopened. Everything it knows about them is still attached.";
  return s;
}
