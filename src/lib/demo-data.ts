/* ============================================================================
   DEMO FIXTURES
   ----------------------------------------------------------------------------
   Clearly-marked development data so the workspace looks alive while the UI is
   being built. Nothing here is a production claim. Every surface reads these
   through the same shapes a real API will return, so swapping the source is a
   data-layer change, not a component rewrite.
   ========================================================================== */

import type {
  ActionDef,
  ActivityEvent,
  AssistantAnswer,
  AgentConfig,
  ConciergePage,
  Conversation,
  Destination,
  InboxItem,
  DeliveryRecord,
  FollowUp,
  Integration,
  IntentBreakdown,
  LedgerPeriod,
  KnowledgeItem,
  Lead,
  Metric,
  Organization,
  Outcome,
  OwnerReport,
  PageDocument,
  PublishedSurface,
  RoutingRule,
  Site,
  SiteBrain,
  TeamMember,
  UnansweredQuestion,
} from "./types";
import { PAGE_DOCUMENT_VERSION } from "./pages-builder";

export const IS_DEMO_DATA = true;

/* ---- Organization -------------------------------------------------------- */

export const ORG: Organization = {
  id: "org_1",
  name: "Collab Auto",
  slug: "collab-auto",
  plan: "growth",
  isAgency: true,
  seatsUsed: 3,
  seatsIncluded: 5,
  siteLimit: 5,
};

/** Opening-hours shorthand: minutes from midnight, local to the site. */
const W = (opens: number, closes: number) => ({ opens, closes });

export const SITES: Site[] = [
  {
    id: "site_northlane",
    orgId: "org_1",
    name: "Northlane Dental",
    url: "northlanedental.com",
    product: "agent",
    status: "live",
    installState: "detected",
    accentColor: "#FF7A00",
    createdAt: "2026-07-02T09:00:00Z",
    updatedAt: "2026-09-07T06:40:00Z",
    launchProgress: 100,
    currency: "USD",
    // Mon–Thu 8–5, Fri 8–1, closed weekends.
    openingHours: {
      timezone: "America/Chicago",
      days: [null, W(480, 1020), W(480, 1020), W(480, 1020), W(480, 1020), W(480, 780), null],
    },
  },
  {
    id: "site_minishop",
    orgId: "org_1",
    name: "Mini Shop",
    url: "mini-shop.testamplify.com",
    product: "agent",
    status: "review",
    installState: "detected",
    accentColor: "#FF7A00",
    createdAt: "2026-08-19T11:20:00Z",
    updatedAt: "2026-09-06T18:05:00Z",
    launchProgress: 67,
    currency: "USD",
    // Mon–Fri 9–6, Sat 10–4.
    openingHours: {
      timezone: "America/Chicago",
      days: [null, W(540, 1080), W(540, 1080), W(540, 1080), W(540, 1080), W(540, 1080), W(600, 960)],
    },
  },
  {
    id: "site_brightwater",
    orgId: "org_1",
    name: "Brightwater Physio",
    url: "brightwaterphysio.co.uk",
    product: "agent",
    status: "ready",
    installState: "not-installed",
    accentColor: "#FF7A00",
    createdAt: "2026-09-09T10:15:00Z",
    updatedAt: "2026-09-11T14:30:00Z",
    launchProgress: 82,
    currency: "GBP",
    // Approved and waiting on the one paste that switches it on.
    openingHours: {
      timezone: "Europe/London",
      days: [null, W(480, 1140), W(480, 1140), W(480, 1140), W(480, 1140), W(480, 1020), W(540, 780)],
    },
  },
  {
    id: "site_atlasmoving",
    orgId: "org_1",
    name: "Atlas Moving Co.",
    url: "atlasmoving.concierge.site",
    product: "pages",
    status: "learning",
    installState: "not-installed",
    accentColor: "#FF7A00",
    createdAt: "2026-09-05T15:00:00Z",
    updatedAt: "2026-09-07T07:55:00Z",
    launchProgress: 34,
    currency: "USD",
    // Mon–Sat, early starts — a moving crew's day.
    openingHours: {
      timezone: "America/Chicago",
      days: [null, W(420, 1140), W(420, 1140), W(420, 1140), W(420, 1140), W(420, 1140), W(480, 900)],
    },
  },
];

export const DEFAULT_SITE_ID = "site_northlane";

export function getSite(siteId: string): Site {
  return SITES.find((s) => s.id === siteId) ?? SITES[0];
}

/* ---- Scoping -------------------------------------------------------------
   Northlane is the site with a history; the other two are a workspace that
   has only just started. Every list is therefore read through the site it
   belongs to rather than straight off the constant — otherwise a brand new
   site opens onto somebody else's conversations, and the first thing the
   product does is lie.                                                     */

export function conversationsFor(siteId: string): Conversation[] {
  return CONVERSATIONS.filter((c) => c.siteId === siteId);
}

export function leadsFor(siteId: string): Lead[] {
  return LEADS.filter((l) => l.siteId === siteId);
}

export function actionsFor(siteId: string): ActionDef[] {
  return ACTIONS.filter((a) => a.siteId === siteId);
}

export function destinationsFor(siteId: string): Destination[] {
  return DESTINATIONS.filter((d) => d.siteId === siteId);
}

export function gapsFor(siteId: string): UnansweredQuestion[] {
  // The gap list is derived from conversations, so it scopes with them.
  return siteId === "site_northlane" ? UNANSWERED : [];
}

export function followUpsFor(siteId: string): FollowUp[] {
  return FOLLOW_UPS.filter((f) => f.siteId === siteId);
}

export function outcomesFor(siteId: string): Outcome[] {
  return OUTCOMES.filter((o) => o.siteId === siteId);
}

export function activityFor(siteId: string): ActivityEvent[] {
  return siteId === "site_northlane" ? ACTIVITY : [];
}

export function reportsFor(siteId: string): OwnerReport[] {
  return OWNER_REPORTS.filter((r) => r.siteId === siteId);
}

/** Zeroed rather than absent: the shape of the page must not change. */
export function metricsFor(siteId: string): Metric[] {
  if (siteId === "site_northlane") return METRICS;
  return METRICS.map((m) => ({
    ...m,
    value: 0,
    delta: 0,
    series: m.series.map((p) => ({ ...p, value: 0 })),
  }));
}

export function ledgerFor(siteId: string): LedgerPeriod {
  if (siteId === LEDGER.siteId) return LEDGER;
  return {
    ...LEDGER,
    siteId,
    conversations: 0,
    afterHoursConversations: 0,
    confirmedValue: 0,
    estimatedValue: 0,
    previousConfirmedValue: 0,
    previousEstimatedValue: 0,
    hourHistogram: LEDGER.hourHistogram.map(() => 0),
    resolvedWithoutHuman: 0,
    hoursSaved: 0,
  };
}

/** A site that has never been read has an empty brain, not Northlane's. */
export function brainFor(siteId: string): SiteBrain {
  if (siteId === BRAIN.siteId) return BRAIN;
  const site = getSite(siteId);
  const started = site.launchProgress >= 50;
  return {
    siteId,
    ready: false,
    itemCount: started ? 18 : 0,
    approvedCount: started ? 6 : 0,
    needsReviewCount: started ? 12 : 0,
    missingCount: started ? 2 : 0,
    coverage: started ? 41 : 0,
    lastLearnedAt: site.updatedAt,
  };
}

/* ---- Site Brain ---------------------------------------------------------- */

export const BRAIN: SiteBrain = {
  siteId: "site_northlane",
  ready: true,
  itemCount: 42,
  approvedCount: 38,
  needsReviewCount: 3,
  missingCount: 1,
  coverage: 86,
  lastLearnedAt: "2026-09-06T22:14:00Z",
};

const src = (label: string, url?: string) => ({
  id: `src_${label.replace(/\W+/g, "_").toLowerCase()}`,
  kind: (url ? "crawl" : "manual") as "crawl" | "manual",
  label,
  url,
  fetchedAt: "2026-09-06T22:10:00Z",
});

export const KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "k_business",
    siteId: "site_northlane",
    category: "business",
    title: "Business summary",
    body: "Northlane Dental is a family and cosmetic dental practice in Austin, Texas, open since 2011. Three dentists and two hygienists see patients across general dentistry, cosmetic work and emergency appointments. Same-day emergency slots are held every weekday morning.",
    status: "approved",
    confidence: 0.94,
    required: true,
    sources: [src("About page", "/about"), src("Homepage", "/")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_customer",
    siteId: "site_northlane",
    category: "business",
    title: "Ideal customer",
    body: "Families within 15 miles of North Austin, and adults 25–55 researching cosmetic treatments such as veneers, whitening and Invisalign. A meaningful share arrive through emergency searches and convert to ongoing patients.",
    status: "approved",
    confidence: 0.88,
    required: true,
    sources: [src("Services page", "/services"), src("Owner interview")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_next_step",
    siteId: "site_northlane",
    category: "services",
    title: "Recommended next step",
    body: "For new patients, recommend the New Patient Exam ($89, includes X-rays and cleaning). For cosmetic enquiries, recommend a free 15-minute consultation before quoting any price.",
    status: "approved",
    confidence: 0.91,
    required: true,
    sources: [src("Pricing page", "/pricing")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_goals",
    siteId: "site_northlane",
    category: "business",
    title: "Priority conversion goals",
    body: "1. Book a new patient exam. 2. Capture emergency callers with a phone handoff. 3. Collect consultation requests for Invisalign and veneers.",
    status: "approved",
    confidence: 0.9,
    required: true,
    sources: [src("Owner interview")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_escalation",
    siteId: "site_northlane",
    category: "rules",
    title: "Human escalation rules",
    body: "Hand off to a person immediately when a visitor reports pain, swelling, bleeding or a knocked-out tooth; when they ask about an existing treatment plan; or when they ask about insurance claims already filed.",
    status: "approved",
    confidence: 0.96,
    required: true,
    sources: [src("Owner interview")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_never",
    siteId: "site_northlane",
    category: "restrictions",
    title: "Things Concierge should never promise",
    body: "Never diagnose a condition. Never quote a final treatment price without a consultation. Never confirm insurance coverage. Never promise an appointment time that has not been checked against the calendar.",
    status: "approved",
    confidence: 0.97,
    required: true,
    sources: [src("Owner interview")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_tone",
    siteId: "site_northlane",
    category: "voice",
    title: "Brand tone",
    body: "Calm, plain-spoken and reassuring. Short sentences. No dental jargon unless the visitor uses it first. Never alarming, never salesy.",
    status: "approved",
    confidence: 0.85,
    required: true,
    sources: [src("Homepage", "/"), src("Blog", "/blog")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_hours",
    siteId: "site_northlane",
    category: "policies",
    title: "Opening hours",
    body: "Monday to Thursday 8:00–17:00, Friday 8:00–14:00. Closed weekends. Emergency line answered until 20:00 on weekdays.",
    status: "needs-review",
    confidence: 0.62,
    required: false,
    sources: [src("Contact page", "/contact")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_pricing",
    siteId: "site_northlane",
    category: "pricing",
    title: "Treatment pricing",
    body: "New Patient Exam $89. Standard cleaning $120. Whitening from $349. Invisalign from $3,900. Veneers quoted after consultation.",
    status: "needs-review",
    confidence: 0.58,
    required: false,
    sources: [src("Pricing page", "/pricing")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_insurance",
    siteId: "site_northlane",
    category: "policies",
    title: "Insurance and payment",
    body: "The practice accepts most PPO plans and offers in-house financing. Specific coverage is confirmed by the front desk, never by Concierge.",
    status: "needs-review",
    confidence: 0.54,
    required: false,
    sources: [src("FAQ page", "/faq")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_parking",
    siteId: "site_northlane",
    category: "faqs",
    title: "Parking and access",
    body: "",
    status: "missing",
    confidence: 0,
    required: false,
    sources: [],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_emergency",
    siteId: "site_northlane",
    category: "faqs",
    title: "Emergency appointments",
    body: "Same-day emergency slots are held 8:00–10:00 each weekday. Visitors reporting pain should be routed to the practice phone line rather than booked online.",
    status: "approved",
    confidence: 0.89,
    required: false,
    sources: [src("Emergency page", "/emergency")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_invisalign",
    siteId: "site_northlane",
    category: "services",
    title: "Invisalign programme",
    body: "12–18 month typical treatment, monthly check-ins, financing available from $149/month. Free consultation includes a 3D scan.",
    status: "approved",
    confidence: 0.87,
    required: false,
    sources: [src("Invisalign page", "/invisalign")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_competitor",
    siteId: "site_northlane",
    category: "restrictions",
    title: "Competitor comparisons",
    body: "Concierge must not compare the practice to named local competitors or comment on their pricing.",
    status: "restricted",
    confidence: 1,
    required: false,
    sources: [src("Owner interview")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
  {
    id: "k_newpatient_form",
    siteId: "site_northlane",
    category: "policies",
    title: "New patient paperwork",
    body: "New patients complete a medical history form online before the first visit. The link is sent by email after booking.",
    status: "suggested",
    confidence: 0.71,
    required: false,
    sources: [src("Booking confirmation email")],
    updatedAt: "2026-09-06T22:12:00Z",
  },
];

/* ---- Agent --------------------------------------------------------------- */

export const AGENT: AgentConfig = {
  siteId: "site_northlane",
  name: "Northlane Concierge",
  mode: "receptionist",
  greeting:
    "Hi — I can help with appointments, treatments and pricing at Northlane Dental. What brings you in?",
  role: "Front-desk assistant for a family and cosmetic dental practice.",
  tone: "warm",
  rules: [
    "Answer only from approved Site Brain knowledge.",
    "Offer the New Patient Exam when a visitor has not been seen before.",
    "Ask for a preferred day and time before creating a booking request.",
  ],
  neverPromise: [
    "Never diagnose a condition or symptom.",
    "Never quote a final treatment price without a consultation.",
    "Never confirm insurance coverage.",
  ],
  escalationTriggers: [
    "Visitor reports pain, swelling or bleeding",
    "Visitor asks about an existing treatment plan",
    "Visitor asks to speak to a person",
  ],
  quickActions: ["act_booking", "act_call", "act_quote"],
  confidence: 0.86,
  voiceEnabled: false,
  // Northlane started here and has not moved: they read every draft.
  autonomy: "approve",
  followUpChannels: ["email", "sms"],
  // Austin: a third of the practice's enquiries arrive in Spanish.
  languages: ["en", "es"],
  matchVisitorLanguage: true,
};

/* ---- Conversations ------------------------------------------------------- */

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c_1",
    siteId: "site_northlane",
    visitorName: "Maya Robinson",
    visitorLocation: "Austin, TX",
    intent: "booking",
    status: "qualified",
    pageUrl: "/invisalign",
    startedAt: "2026-09-07T07:42:00Z",
    lastMessageAt: "2026-09-07T07:51:00Z",
    messageCount: 8,
    preview: "Do you do payment plans for Invisalign?",
    leadId: "l_1",
    routedTo: "Front desk · Email",
    actionsTaken: ["act_booking"],
    afterHours: true,
    outcomeIds: ["o_1"],
    channel: "web",
    consent: [
      {
        channel: "sms",
        address: "+1 512 555 0142",
        grantedAt: "2026-09-07T07:50:00Z",
        basis: "Gave a number when asked how to confirm the appointment.",
      },
    ],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "Hi, do you do payment plans for Invisalign?",
        at: "2026-09-07T07:42:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "We do. Invisalign starts at $3,900 and financing is available from $149 a month. The free consultation includes a 3D scan, so you would get an exact figure before committing to anything.",
        at: "2026-09-07T07:43:00Z",
        channel: "web",
        confidence: 0.91,
        citations: [
          { itemId: "k_invisalign", title: "Invisalign programme" },
          { itemId: "k_pricing", title: "Treatment pricing" },
        ],
      },
      {
        id: "m3",
        author: "visitor",
        body: "That's helpful. How soon could I come in?",
        at: "2026-09-07T07:46:00Z",
        channel: "web",
      },
      {
        id: "m4",
        author: "agent",
        body: "Consultations run Monday to Thursday. Would a morning or an afternoon suit you better?",
        at: "2026-09-07T07:46:30Z",
        channel: "web",
        confidence: 0.88,
        citations: [{ itemId: "k_hours", title: "Opening hours" }],
      },
      {
        id: "m5",
        author: "visitor",
        body: "Mornings. Thursday if you have it.",
        at: "2026-09-07T07:48:00Z",
        channel: "web",
      },
      {
        id: "m6",
        author: "agent",
        body: "I have put in a consultation request for Thursday morning and passed it to the front desk. Could I take a number to confirm on?",
        at: "2026-09-07T07:49:00Z",
        channel: "web",
        confidence: 0.93,
        actionRef: "act_booking",
      },
      { id: "m7", author: "visitor", body: "512-555-0142", at: "2026-09-07T07:50:00Z", channel: "web" },
      {
        id: "m8",
        author: "system",
        body: "Booking request sent to Front desk · Email. Lead captured with a score of 92.",
        at: "2026-09-07T07:51:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_2",
    siteId: "site_northlane",
    visitorName: "Website visitor",
    visitorLocation: "Round Rock, TX",
    intent: "human",
    status: "handed-off",
    pageUrl: "/emergency",
    startedAt: "2026-09-07T06:12:00Z",
    lastMessageAt: "2026-09-07T06:15:00Z",
    messageCount: 4,
    preview: "I chipped a tooth last night and it really hurts",
    routedTo: "Emergency line · SMS",
    actionsTaken: ["act_call"],
    afterHours: true,
    outcomeIds: ["o_2"],
    channel: "web",
    consent: [
      {
        channel: "sms",
        address: "+1 512 555 0198",
        grantedAt: "2026-09-07T06:14:00Z",
        basis: "Left a number for the on-call dentist to ring back.",
      },
    ],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "I chipped a tooth last night and it really hurts",
        at: "2026-09-07T06:12:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "That sounds painful — I am not able to advise on symptoms, so let me get you to the practice directly. We hold same-day emergency slots between 8 and 10 each weekday.",
        at: "2026-09-07T06:13:00Z",
        channel: "web",
        confidence: 0.95,
        citations: [{ itemId: "k_escalation", title: "Human escalation rules" }],
      },
      {
        id: "m3",
        author: "visitor",
        body: "Yes please, can someone call me? 512-555-0198",
        at: "2026-09-07T06:14:00Z",
        channel: "web",
      },
      {
        id: "m4",
        author: "system",
        body: "Call request routed to Emergency line · SMS in 4 seconds.",
        at: "2026-09-07T06:15:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_3",
    siteId: "site_northlane",
    visitorName: "Daniel Osei",
    visitorLocation: "Austin, TX",
    intent: "pricing",
    status: "active",
    pageUrl: "/pricing",
    startedAt: "2026-09-07T08:02:00Z",
    lastMessageAt: "2026-09-07T08:05:00Z",
    messageCount: 3,
    preview: "Is the whitening price per session or the full course?",
    actionsTaken: [],
    afterHours: false,
    outcomeIds: [],
    channel: "web",
    consent: [],
    unanswered: "Is teeth whitening covered under a dental plan?",
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "Is the whitening price per session or the full course?",
        at: "2026-09-07T08:02:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "Whitening starts at $349 for the full in-practice course. I can put you in touch with the front desk if you would like it confirmed for your case.",
        at: "2026-09-07T08:03:00Z",
        channel: "web",
        confidence: 0.74,
        citations: [{ itemId: "k_pricing", title: "Treatment pricing" }],
      },
      {
        id: "m3",
        author: "visitor",
        body: "Is teeth whitening covered under a dental plan?",
        at: "2026-09-07T08:05:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_4",
    siteId: "site_northlane",
    visitorName: "Priya Raman",
    visitorLocation: "Cedar Park, TX",
    intent: "quote",
    status: "converted",
    pageUrl: "/veneers",
    startedAt: "2026-09-06T14:20:00Z",
    lastMessageAt: "2026-09-06T14:34:00Z",
    messageCount: 11,
    preview: "Looking at veneers for my top six teeth",
    leadId: "l_2",
    routedTo: "Cosmetic team · Slack",
    actionsTaken: ["act_quote", "act_booking"],
    afterHours: true,
    outcomeIds: ["o_3", "o_4"],
    channel: "email",
    consent: [
      {
        channel: "email",
        address: "p.raman@outlook.com",
        grantedAt: "2026-09-06T14:32:00Z",
        basis: "Asked for the written quote by email.",
      },
    ],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "Looking at veneers for my top six teeth",
        at: "2026-09-06T14:20:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "Veneers are quoted after a consultation so the dentist can see what you are starting from. The consultation is free and takes about 15 minutes. Shall I request one?",
        at: "2026-09-06T14:21:00Z",
        channel: "web",
        confidence: 0.92,
        citations: [{ itemId: "k_next_step", title: "Recommended next step" }],
      },
      { id: "m3", author: "visitor", body: "Yes please", at: "2026-09-06T14:23:00Z", channel: "web" },
      {
        id: "m4",
        author: "system",
        body: "Quote request created and routed to Cosmetic team · Slack.",
        at: "2026-09-06T14:34:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_5",
    siteId: "site_northlane",
    visitorName: "Website visitor",
    intent: "hours",
    status: "closed",
    pageUrl: "/contact",
    startedAt: "2026-09-06T11:05:00Z",
    lastMessageAt: "2026-09-06T11:06:00Z",
    messageCount: 2,
    preview: "Are you open on Saturdays?",
    actionsTaken: [],
    afterHours: true,
    outcomeIds: ["o_5"],
    channel: "web",
    consent: [],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "Are you open on Saturdays?",
        at: "2026-09-06T11:05:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "We are open Monday to Thursday 8:00–17:00 and Friday 8:00–14:00. Weekends are closed, though the emergency line is answered until 20:00 on weekdays.",
        at: "2026-09-06T11:06:00Z",
        channel: "web",
        confidence: 0.83,
        citations: [{ itemId: "k_hours", title: "Opening hours" }],
      },
    ],
  },
  {
    id: "c_6",
    siteId: "site_northlane",
    visitorName: "Website visitor",
    visitorLocation: "Austin, TX",
    intent: "product",
    status: "new",
    pageUrl: "/services",
    startedAt: "2026-09-07T08:20:00Z",
    lastMessageAt: "2026-09-07T08:20:00Z",
    messageCount: 1,
    preview: "Do you treat children?",
    actionsTaken: [],
    afterHours: false,
    outcomeIds: [],
    channel: "web",
    consent: [],
    unanswered: "Do you treat children under 5?",
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "Do you treat children under 5?",
        at: "2026-09-07T08:20:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_7",
    siteId: "site_northlane",
    visitorName: "Ellis Moore",
    visitorLocation: "Austin, TX",
    intent: "booking",
    status: "converted",
    pageUrl: "/whitening",
    startedAt: "2026-09-05T10:12:00Z",
    lastMessageAt: "2026-09-05T10:23:00Z",
    messageCount: 6,
    preview: "Can I book whitening for next Saturday?",
    routedTo: "Front desk · Email",
    actionsTaken: ["act_booking", "act_payment"],
    afterHours: true,
    outcomeIds: ["o_6", "o_7"],
    channel: "email",
    consent: [
      {
        channel: "email",
        address: "ellis.moore@gmail.com",
        grantedAt: "2026-09-05T10:22:00Z",
        basis: "Checkout receipt address, confirmed at payment.",
      },
    ],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "Can I book whitening for next Saturday?",
        at: "2026-09-05T10:12:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "We are closed on Saturdays, but I can put you in on Friday the 12th. Whitening is $480 and takes about ninety minutes.",
        at: "2026-09-05T10:13:00Z",
        channel: "web",
        confidence: 0.94,
        citations: [
          { itemId: "k_hours", title: "Opening hours" },
          { itemId: "k_pricing", title: "Treatment pricing" },
        ],
      },
      {
        id: "m3",
        author: "visitor",
        body: "Friday works. How do I hold the slot?",
        at: "2026-09-05T10:18:00Z",
        channel: "web",
      },
      {
        id: "m4",
        author: "agent",
        body: "A $150 deposit holds it and comes off the final price. I can send you a secure link now.",
        at: "2026-09-05T10:19:00Z",
        channel: "web",
        confidence: 0.9,
        actionRef: "act_payment",
      },
      { id: "m5", author: "visitor", body: "Sent it through.", at: "2026-09-05T10:22:00Z", channel: "web" },
      {
        id: "m6",
        author: "system",
        body: "Deposit of $150 confirmed by Stripe. Appointment held for Friday 12 September, 10:00.",
        at: "2026-09-05T10:23:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_8",
    siteId: "site_northlane",
    visitorName: "Nadia Haddad",
    visitorLocation: "Austin, TX",
    intent: "quote",
    status: "qualified",
    pageUrl: "/veneers",
    startedAt: "2026-09-04T18:40:00Z",
    lastMessageAt: "2026-09-04T18:47:00Z",
    messageCount: 5,
    preview: "What would a full upper arch of veneers cost?",
    leadId: "l_6",
    routedTo: "Cosmetic team · Slack",
    actionsTaken: ["act_quote"],
    afterHours: true,
    outcomeIds: ["o_8"],
    channel: "email",
    consent: [
      {
        channel: "email",
        address: "nadia.haddad@hey.com",
        grantedAt: "2026-09-04T18:47:00Z",
        basis: "Left an email so the written quote could be sent.",
      },
    ],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "What would a full upper arch of veneers cost?",
        at: "2026-09-04T18:40:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "A full upper arch is usually eight to ten veneers. Ours are $950 each, so most cases land between $7,600 and $9,500 once the consultation confirms the number.",
        at: "2026-09-04T18:41:00Z",
        channel: "web",
        confidence: 0.89,
        citations: [{ itemId: "k_pricing", title: "Treatment pricing" }],
      },
      {
        id: "m3",
        author: "visitor",
        body: "And how long does the whole thing take?",
        at: "2026-09-04T18:45:00Z",
        channel: "web",
      },
      {
        id: "m4",
        author: "agent",
        body: "Three visits over about four weeks. If you leave me an email I will send the written quote and the treatment plan.",
        at: "2026-09-04T18:46:00Z",
        channel: "web",
        confidence: 0.92,
        actionRef: "act_quote",
      },
      {
        id: "m5",
        author: "visitor",
        body: "nadia.haddad@hey.com",
        at: "2026-09-04T18:47:00Z",
        channel: "web",
      },
    ],
  },
  {
    id: "c_9",
    siteId: "site_northlane",
    visitorName: "Marcus Bell",
    visitorLocation: "Austin, TX",
    intent: "pricing",
    status: "converted",
    pageUrl: "/implants",
    startedAt: "2026-09-02T19:15:00Z",
    lastMessageAt: "2026-09-03T09:41:00Z",
    messageCount: 9,
    preview: "What does a single implant come to all in?",
    leadId: "l_7",
    routedTo: "Front desk · Email",
    actionsTaken: ["act_booking"],
    afterHours: true,
    outcomeIds: ["o_9"],
    channel: "email",
    consent: [
      {
        channel: "email",
        address: "m.bell@protonmail.com",
        grantedAt: "2026-09-02T19:22:00Z",
        basis: "Asked for the implant breakdown to be sent over.",
      },
    ],
    messages: [
      {
        id: "m1",
        author: "visitor",
        body: "What does a single implant come to all in?",
        at: "2026-09-02T19:15:00Z",
        channel: "web",
      },
      {
        id: "m2",
        author: "agent",
        body: "A single implant is $3,200 including the crown. That covers the placement, the abutment and the final fitting — there is no separate lab fee.",
        at: "2026-09-02T19:16:00Z",
        channel: "web",
        confidence: 0.93,
        citations: [{ itemId: "k_pricing", title: "Treatment pricing" }],
      },
      {
        id: "m3",
        author: "visitor",
        body: "Is that spread over the visits or paid up front?",
        at: "2026-09-02T19:20:00Z",
        channel: "web",
      },
      {
        id: "m4",
        author: "agent",
        body: "It is staged across the visits, and financing is available from $135 a month. Would you like the full breakdown sent over?",
        at: "2026-09-02T19:21:00Z",
        channel: "web",
        confidence: 0.9,
      },
      {
        id: "m5",
        author: "visitor",
        body: "m.bell@protonmail.com",
        at: "2026-09-02T19:22:00Z",
        channel: "web",
      },
      {
        id: "m6",
        author: "system",
        body: "Visitor left the page. Concierge drafted a follow-up; Olaifa approved it at 08:58.",
        at: "2026-09-03T08:58:00Z",
        channel: "web",
      },
      {
        id: "m7",
        author: "agent",
        body: "Morning Marcus — here is the implant breakdown we talked about last night, with the monthly figure at the bottom. If you want to see the site before deciding, consultations are free and take about twenty minutes.",
        at: "2026-09-03T09:10:00Z",
        channel: "email",
        confidence: 0.87,
      },
      {
        id: "m8",
        author: "visitor",
        body: "Thanks — that is clearer than the last place I asked. Can I come in Friday?",
        at: "2026-09-03T09:38:00Z",
        channel: "email",
      },
      {
        id: "m9",
        author: "system",
        body: "Consultation request sent to Front desk · Email for Friday 5 September.",
        at: "2026-09-03T09:41:00Z",
        channel: "email",
      },
    ],
  },
];

/* ---- Leads --------------------------------------------------------------- */

export const LEADS: Lead[] = [
  {
    id: "l_1",
    siteId: "site_northlane",
    name: "Maya Robinson",
    email: "maya.robinson@gmail.com",
    phone: "+1 512 555 0142",
    intent: "booking",
    service: "Invisalign consultation",
    budget: "$3,900–5,000",
    location: "Austin, TX",
    urgency: "this-week",
    qualification: "hot",
    score: 92,
    conversationId: "c_1",
    capturedAt: "2026-09-07T07:51:00Z",
    routedTo: "Front desk · Email",
    notes: "Asked specifically about financing. Prefers Thursday mornings.",
  },
  {
    id: "l_2",
    siteId: "site_northlane",
    name: "Priya Raman",
    email: "p.raman@outlook.com",
    intent: "quote",
    service: "Veneers — upper six",
    budget: "Not stated",
    location: "Cedar Park, TX",
    urgency: "this-month",
    qualification: "hot",
    score: 88,
    conversationId: "c_4",
    capturedAt: "2026-09-06T14:34:00Z",
    routedTo: "Cosmetic team · Slack",
  },
  {
    id: "l_3",
    siteId: "site_northlane",
    name: "Tomas Alvarez",
    phone: "+1 512 555 0198",
    intent: "human",
    service: "Emergency — chipped tooth",
    location: "Round Rock, TX",
    urgency: "immediate",
    qualification: "hot",
    score: 95,
    conversationId: "c_2",
    capturedAt: "2026-09-07T06:15:00Z",
    routedTo: "Emergency line · SMS",
  },
  {
    id: "l_4",
    siteId: "site_northlane",
    name: "Grace Whitfield",
    email: "gwhitfield@fastmail.com",
    intent: "pricing",
    service: "Whitening",
    location: "Austin, TX",
    urgency: "exploring",
    qualification: "warm",
    score: 61,
    conversationId: "c_3",
    capturedAt: "2026-09-07T08:05:00Z",
  },
  {
    id: "l_5",
    siteId: "site_northlane",
    name: "Website visitor",
    intent: "product",
    service: "General enquiry",
    urgency: "exploring",
    qualification: "cool",
    score: 34,
    conversationId: "c_6",
    capturedAt: "2026-09-07T08:20:00Z",
  },
  {
    id: "l_6",
    siteId: "site_northlane",
    name: "Nadia Haddad",
    email: "nadia.haddad@hey.com",
    intent: "quote",
    service: "Veneers — full upper arch",
    budget: "$7,600–9,500",
    location: "Austin, TX",
    urgency: "this-month",
    qualification: "hot",
    score: 84,
    conversationId: "c_8",
    capturedAt: "2026-09-04T18:47:00Z",
    routedTo: "Cosmetic team · Slack",
    notes: "Came in on a Friday evening, after the practice had closed.",
  },
  {
    id: "l_7",
    siteId: "site_northlane",
    name: "Marcus Bell",
    email: "m.bell@protonmail.com",
    intent: "pricing",
    service: "Single implant",
    budget: "$3,200",
    location: "Austin, TX",
    urgency: "this-week",
    qualification: "hot",
    score: 89,
    conversationId: "c_9",
    capturedAt: "2026-09-02T19:22:00Z",
    routedTo: "Front desk · Email",
    notes: "Went quiet on the site at 19:22. Came back the next morning off the follow-up.",
  },
];

/* ---- Actions ------------------------------------------------------------- */

export const ACTIONS: ActionDef[] = [
  {
    id: "act_booking",
    siteId: "site_northlane",
    kind: "booking",
    name: "Book an appointment",
    description:
      "Lets a visitor ask for a time. Concierge collects the details and sends a booking request to your team.",
    provider: "Calendly",
    readiness: "ready",
    triggers: ["booking", "hours"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "phone", label: "Phone number", required: true, type: "phone" },
      { key: "preferred", label: "Preferred day", required: true, type: "date" },
      { key: "reason", label: "Reason for visit", required: false, type: "text" },
    ],
    outcome: "A booking request lands with the front desk and the visitor gets a confirmation message.",
    placements: ["agent", "website"],
    completions30d: 34,
    unitValue: 42000,
    unitValueNote: "Your average appointment value, taken from the practice figures you entered.",
  },
  {
    id: "act_quote",
    siteId: "site_northlane",
    kind: "quote",
    name: "Request a quote",
    description:
      "For treatments that need a consultation before a price. Captures scope and routes to the right team.",
    readiness: "ready",
    triggers: ["quote", "pricing"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
      { key: "treatment", label: "Treatment of interest", required: true, type: "select" },
    ],
    outcome: "A quote request is routed to the cosmetic team with the conversation attached.",
    placements: ["agent", "pages"],
    completions30d: 18,
    unitValue: 118000,
    unitValueNote: "Your average accepted quote of $3,800, at the 31% acceptance rate you reported.",
  },
  {
    id: "act_call",
    siteId: "site_northlane",
    kind: "call",
    name: "Request a call",
    description: "The fastest handoff. Concierge takes a number and page context, then alerts your team.",
    readiness: "ready",
    triggers: ["human", "support"],
    collects: [
      { key: "phone", label: "Phone number", required: true, type: "phone" },
      { key: "window", label: "Best time to call", required: false, type: "select" },
    ],
    outcome: "Your team gets the number, the page the visitor was on, and the full transcript.",
    placements: ["agent", "website", "routing"],
    completions30d: 27,
  },
  {
    id: "act_lead",
    siteId: "site_northlane",
    kind: "lead-capture",
    name: "Capture contact details",
    description: "A light-touch fallback when a visitor is not ready to book but is worth following up.",
    readiness: "ready",
    triggers: ["product", "unknown"],
    collects: [
      { key: "name", label: "Name", required: false, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
    ],
    outcome: "The contact is added to Leads and routed by your rules.",
    placements: ["agent"],
    completions30d: 41,
    unitValue: 9500,
    unitValueNote: "A captured contact, at the 8% you told us convert.",
  },
  {
    id: "act_payment",
    siteId: "site_northlane",
    kind: "payment",
    name: "Take a payment",
    description: "Send a visitor into a connected checkout for deposits or booking fees.",
    provider: "Stripe",
    readiness: "needs-connection",
    triggers: ["booking"],
    collects: [{ key: "amount", label: "Amount", required: true, type: "number" }],
    outcome: "The visitor completes checkout and the payment is recorded against the conversation.",
    placements: [],
    completions30d: 0,
  },
  {
    id: "act_offer",
    siteId: "site_northlane",
    kind: "offer",
    name: "Show an offer",
    description: "Surface an approved promotion at the right moment in a conversation.",
    readiness: "needs-setup",
    triggers: ["pricing"],
    collects: [],
    outcome: "The visitor sees the offer and can claim it without leaving the conversation.",
    placements: [],
    completions30d: 0,
  },
  {
    id: "act_consult",
    siteId: "site_northlane",
    kind: "consultation",
    name: "Book a free consultation",
    description: "The 15-minute cosmetic consultation, offered before any price is quoted.",
    readiness: "ready",
    triggers: ["quote"],
    collects: [
      { key: "name", label: "Full name", required: true, type: "text" },
      { key: "email", label: "Email", required: true, type: "email" },
      { key: "preferred", label: "Preferred day", required: true, type: "date" },
    ],
    outcome: "A consultation request is created and the cosmetic team is notified.",
    placements: ["agent", "pages"],
    completions30d: 12,
    unitValue: 42000,
    unitValueNote: "A consultation is valued at the same $420 as an appointment until treatment is booked.",
  },
  {
    id: "act_video",
    siteId: "site_northlane",
    kind: "video",
    name: "Start a video call",
    description: "For remote consultations. Sends the visitor a room link once your team accepts.",
    readiness: "disabled",
    triggers: ["human"],
    collects: [],
    outcome: "A video room opens for the visitor and the assigned team member.",
    placements: [],
    completions30d: 0,
  },
];

/* ---- Routing ------------------------------------------------------------- */

/* ---- Follow-ups: what Concierge wants to send next ----------------------- */

/**
 * Northlane runs the agent at "approve", so drafts queue here rather than
 * going out. One has already been through the cycle — it is what brought
 * Marcus Bell back — and two are waiting on a person.
 */
export const FOLLOW_UPS: FollowUp[] = [
  {
    id: "f_1",
    siteId: "site_northlane",
    conversationId: "c_8",
    channel: "email",
    to: "nadia.haddad@hey.com",
    body: "Hi Nadia — here is the written quote for a full upper arch, with the three-visit plan and the timings we discussed on Friday. Nothing is booked and there is no hold on the price; if you would like to see the case photos before deciding, I can send those too.",
    reason:
      "She asked for a written quote on Friday evening and has not had one. Quotes sent within 48 hours are accepted about twice as often as those sent later.",
    state: "suggested",
    draftedAt: "2026-09-07T07:00:00Z",
    sendAfter: "2026-09-07T09:00:00Z",
  },
  {
    id: "f_2",
    siteId: "site_northlane",
    conversationId: "c_1",
    channel: "sms",
    to: "+1 512 555 0142",
    body: "Hi Maya — the front desk has Thursday 09:30 free for your Invisalign consultation. Reply YES and it is yours, or tell me a better time.",
    reason:
      "She gave a number and asked for Thursday mornings. The slot is still open and nobody has confirmed it with her.",
    state: "suggested",
    draftedAt: "2026-09-07T08:10:00Z",
    sendAfter: "2026-09-07T10:00:00Z",
  },
  {
    id: "f_3",
    siteId: "site_northlane",
    conversationId: "c_9",
    channel: "email",
    to: "m.bell@protonmail.com",
    body: "Morning Marcus — here is the implant breakdown we talked about last night, with the monthly figure at the bottom. If you want to see the site before deciding, consultations are free and take about twenty minutes.",
    reason: "He asked for the breakdown and left the page before it could be sent.",
    state: "sent",
    draftedAt: "2026-09-03T06:40:00Z",
    sendAfter: "2026-09-03T09:00:00Z",
    sentAt: "2026-09-03T09:10:00Z",
  },
];

export function getFollowUps(conversationId: string): FollowUp[] {
  return FOLLOW_UPS.filter((f) => f.conversationId === conversationId);
}

/* ---- Outcomes: the return, traceable to the conversation ----------------- */

/**
 * Deliberately mixed: two of these carry no value at all. A ledger that puts
 * a number on everything is a ledger nobody believes.
 */
export const OUTCOMES: Outcome[] = [
  {
    id: "o_1",
    siteId: "site_northlane",
    conversationId: "c_1",
    kind: "booking",
    summary: "Consultation booked for Thursday morning — Invisalign",
    at: "2026-09-07T07:51:00Z",
    value: 42000,
    basis: "estimated",
    valueNote: "Your average appointment value, $420.",
    afterHours: true,
    actionId: "act_booking",
    leadId: "l_1",
  },
  {
    id: "o_2",
    siteId: "site_northlane",
    conversationId: "c_2",
    kind: "lead-routed",
    summary: "Emergency call request reached the on-call phone in 41 seconds",
    at: "2026-09-07T06:15:00Z",
    value: 0,
    basis: "none",
    valueNote: "No value claimed — an emergency is not a sale.",
    afterHours: true,
    destinationId: "dest_emergency",
    leadId: "l_3",
  },
  {
    id: "o_3",
    siteId: "site_northlane",
    conversationId: "c_4",
    kind: "quote",
    summary: "Veneers quote issued — upper six",
    at: "2026-09-06T14:31:00Z",
    value: 118000,
    basis: "estimated",
    valueNote: "Your average accepted quote, $3,800, at your 31% acceptance rate.",
    afterHours: true,
    actionId: "act_quote",
    leadId: "l_2",
  },
  {
    id: "o_4",
    siteId: "site_northlane",
    conversationId: "c_4",
    kind: "booking",
    summary: "Fitting consultation booked for 11 September",
    at: "2026-09-06T14:34:00Z",
    value: 42000,
    basis: "estimated",
    valueNote: "Your average appointment value, $420.",
    afterHours: true,
    actionId: "act_booking",
    leadId: "l_2",
  },
  {
    id: "o_5",
    siteId: "site_northlane",
    conversationId: "c_5",
    kind: "answer",
    summary: "Answered opening hours and parking — nobody had to be called",
    at: "2026-09-06T11:06:00Z",
    value: 0,
    basis: "none",
    valueNote: "Counted in time saved rather than money.",
    afterHours: true,
  },
  {
    id: "o_6",
    siteId: "site_northlane",
    conversationId: "c_7",
    kind: "booking",
    summary: "Whitening appointment held for Friday 12 September",
    at: "2026-09-05T10:23:00Z",
    value: 42000,
    basis: "estimated",
    valueNote: "Your average appointment value, $420.",
    afterHours: true,
    actionId: "act_booking",
  },
  {
    id: "o_7",
    siteId: "site_northlane",
    conversationId: "c_7",
    kind: "payment",
    summary: "$150 whitening deposit taken",
    at: "2026-09-05T10:23:00Z",
    value: 15000,
    basis: "confirmed",
    valueNote: "Settled through Stripe.",
    afterHours: true,
    actionId: "act_payment",
  },
  {
    id: "o_8",
    siteId: "site_northlane",
    conversationId: "c_8",
    kind: "quote",
    summary: "Veneers quote issued — full upper arch",
    at: "2026-09-04T18:47:00Z",
    value: 118000,
    basis: "estimated",
    valueNote: "Your average accepted quote, $3,800, at your 31% acceptance rate.",
    afterHours: true,
    actionId: "act_quote",
    leadId: "l_6",
  },
  {
    id: "o_9",
    siteId: "site_northlane",
    conversationId: "c_9",
    kind: "recovered",
    summary: "Came back the next morning off a follow-up and booked a consultation",
    at: "2026-09-03T09:41:00Z",
    value: 42000,
    basis: "estimated",
    // Counted once, as a recovery rather than also as a booking. The same
    // appointment must never appear twice on the ledger.
    valueNote: "Your average appointment value, $420.",
    afterHours: false,
    actionId: "act_booking",
    leadId: "l_7",
  },
];

export function getOutcomes(conversationId: string): Outcome[] {
  return OUTCOMES.filter((o) => o.conversationId === conversationId);
}

/**
 * The thirty-day roll-up. The eight outcomes above are the most recent slice
 * of it, which is why the totals here are larger than their sum.
 */
export const LEDGER: LedgerPeriod = {
  siteId: "site_northlane",
  label: "Last 30 days",
  start: "2026-08-08T00:00:00Z",
  end: "2026-09-07T00:00:00Z",
  conversations: 214,
  afterHoursConversations: 78,
  confirmedValue: 486000,
  estimatedValue: 1424000,
  previousConfirmedValue: 312000,
  previousEstimatedValue: 1108000,
  // Hour of day, local to the site. Sums to the 214 conversations above.
  hourHistogram: [2, 1, 1, 0, 1, 3, 6, 9, 14, 19, 22, 20, 16, 18, 17, 15, 13, 11, 8, 6, 4, 4, 3, 1],
  resolvedWithoutHuman: 110,
  hoursSaved: 11,
};

/** The artefact that gets forwarded. Sent monthly, on the first. */
export const OWNER_REPORTS: OwnerReport[] = [
  {
    id: "rep_sep",
    siteId: "site_northlane",
    periodLabel: "September 2026",
    state: "scheduled",
    headline:
      "Concierge handled 214 conversations, 78 of them while you were closed, and booked 34 appointments.",
    recipients: ["olaifa@northlanedental.com", "practice.manager@northlanedental.com"],
    scheduledFor: "2026-10-01T08:00:00Z",
  },
  {
    id: "rep_aug",
    siteId: "site_northlane",
    periodLabel: "August 2026",
    state: "sent",
    headline:
      "Concierge handled 186 conversations, 61 of them while you were closed, and booked 29 appointments.",
    recipients: ["olaifa@northlanedental.com", "practice.manager@northlanedental.com"],
    sentAt: "2026-09-01T08:00:00Z",
  },
];

export const DESTINATIONS: Destination[] = [
  {
    id: "d_email",
    siteId: "site_northlane",
    kind: "email",
    name: "Front desk",
    target: "frontdesk@northlanedental.com",
    status: "connected",
    moments: ["specialist-requested", "high-intent", "call-requested"],
    lastDeliveryAt: "2026-09-07T07:51:00Z",
    lastTestedAt: "2026-09-05T10:00:00Z",
  },
  {
    id: "d_slack",
    siteId: "site_northlane",
    kind: "slack",
    name: "Cosmetic team",
    target: "#cosmetic-leads",
    status: "connected",
    moments: ["high-intent"],
    lastDeliveryAt: "2026-09-06T14:34:00Z",
    lastTestedAt: "2026-09-04T16:20:00Z",
  },
  {
    id: "d_sms",
    siteId: "site_northlane",
    kind: "sms",
    name: "Emergency line",
    target: "+1 512 555 0100",
    status: "connected",
    moments: ["call-requested"],
    lastDeliveryAt: "2026-09-07T06:15:00Z",
    lastTestedAt: "2026-09-06T09:00:00Z",
  },
  {
    id: "d_webhook",
    siteId: "site_northlane",
    kind: "webhook",
    name: "Practice CRM",
    target: "https://crm.northlanedental.com/hooks/concierge",
    status: "failing",
    moments: ["conversation-started", "high-intent"],
    lastDeliveryAt: "2026-09-07T05:02:00Z",
    lastTestedAt: "2026-09-01T12:00:00Z",
    signingSecret: "whsec_live_8f21…",
  },
  {
    // Always present. It is the reason routing works on day one, before an
    // owner has connected anything at all.
    id: "d_inbox",
    siteId: "site_northlane",
    kind: "inbox",
    name: "Concierge Inbox",
    target: "In Concierge, and on the mobile app",
    status: "connected",
    moments: ["specialist-requested", "call-requested", "high-intent", "team-replied"],
    lastDeliveryAt: "2026-09-07T08:12:00Z",
    lastTestedAt: "2026-09-07T08:12:00Z",
  },
  {
    id: "d_telegram",
    siteId: "site_northlane",
    kind: "telegram",
    name: "Owners group",
    target: "@northlane-owners",
    status: "untested",
    moments: ["high-intent"],
  },
];

/* ---- The routing inbox --------------------------------------------------- */

export const INBOX: InboxItem[] = [
  {
    id: "in_1",
    siteId: "site_northlane",
    moment: "call-requested",
    visitor: "Tomas Alvarez",
    summary: "Chipped a tooth, wants a call back today",
    detail: "“I chipped my front tooth this morning — can someone ring me? I can come in any time today.”",
    page: "/emergency",
    at: "2026-09-07T08:12:00Z",
    state: "unread",
    conversationId: "c_1",
    phone: "+1 512 555 0198",
    alsoSentTo: ["d_sms", "d_email"],
  },
  {
    id: "in_2",
    siteId: "site_northlane",
    moment: "high-intent",
    visitor: "Maya Robinson",
    summary: "Invisalign consultation, score 92",
    detail: "“What is the monthly cost for Invisalign, and how soon could I start?”",
    page: "/services/invisalign",
    at: "2026-09-07T07:51:00Z",
    state: "unread",
    conversationId: "c_2",
    email: "maya.robinson@gmail.com",
    phone: "+1 512 555 0142",
    alsoSentTo: ["d_email", "d_slack"],
  },
  {
    id: "in_3",
    siteId: "site_northlane",
    moment: "specialist-requested",
    visitor: "Anonymous visitor",
    summary: "Asked to speak to a person about an existing plan",
    detail: "“I already have a treatment plan with you — I need to talk to someone about changing it.”",
    page: "/patients",
    at: "2026-09-07T06:20:00Z",
    state: "open",
    conversationId: "c_3",
    alsoSentTo: ["d_email"],
  },
  {
    id: "in_4",
    siteId: "site_northlane",
    moment: "high-intent",
    visitor: "Priya Raman",
    summary: "Veneers quote request, routed to the cosmetic team",
    detail: "“Could I get a quote for six veneers? I am looking to book before December.”",
    page: "/services/veneers",
    at: "2026-09-06T14:34:00Z",
    state: "answered",
    conversationId: "c_4",
    email: "priya.raman@outlook.com",
    alsoSentTo: ["d_slack", "d_email"],
  },
  {
    id: "in_5",
    siteId: "site_northlane",
    moment: "team-replied",
    visitor: "Marcus Bell",
    summary: "Replied to your message about a single implant",
    detail: "“Thanks — Thursday afternoon would work well for me.”",
    page: "/services/implants",
    at: "2026-09-06T09:05:00Z",
    state: "answered",
    conversationId: "c_5",
    email: "m.bell@protonmail.com",
    alsoSentTo: [],
  },
  {
    id: "in_6",
    siteId: "site_northlane",
    moment: "specialist-requested",
    visitor: "Anonymous visitor",
    summary: "Asked whether you treat children under 5",
    detail: "“Do you see children under five? Concierge could not answer that one.”",
    page: "/services",
    at: "2026-09-05T16:40:00Z",
    state: "closed",
    alsoSentTo: ["d_email"],
  },
];

export const ROUTING_RULES: RoutingRule[] = [
  {
    id: "r_1",
    siteId: "site_northlane",
    name: "Emergencies go straight to the phone line",
    enabled: true,
    conditions: [{ field: "intent", operator: "is", value: "human" }],
    destinationId: "d_sms",
    priority: 1,
    matches30d: 27,
  },
  {
    id: "r_2",
    siteId: "site_northlane",
    name: "Cosmetic enquiries to the cosmetic team",
    enabled: true,
    conditions: [
      { field: "intent", operator: "is", value: "quote" },
      { field: "service", operator: "contains", value: "veneers" },
    ],
    destinationId: "d_slack",
    priority: 2,
    matches30d: 18,
  },
  {
    id: "r_3",
    siteId: "site_northlane",
    name: "High-value leads to the front desk",
    enabled: true,
    conditions: [{ field: "lead-value", operator: "greater-than", value: "3000" }],
    destinationId: "d_email",
    priority: 3,
    matches30d: 31,
  },
  {
    id: "r_4",
    siteId: "site_northlane",
    name: "Everything else to the front desk",
    enabled: true,
    conditions: [{ field: "intent", operator: "is-not", value: "unknown" }],
    destinationId: "d_email",
    priority: 4,
    matches30d: 64,
  },
];

export const DELIVERIES: DeliveryRecord[] = [
  {
    id: "dl_1",
    destinationId: "d_email",
    moment: "high-intent",
    at: "2026-09-07T07:51:00Z",
    state: "delivered",
    conversationId: "c_1",
  },
  {
    id: "dl_2",
    destinationId: "d_sms",
    moment: "call-requested",
    at: "2026-09-07T06:15:00Z",
    state: "delivered",
    conversationId: "c_2",
  },
  {
    id: "dl_3",
    destinationId: "d_webhook",
    moment: "conversation-started",
    at: "2026-09-07T05:02:00Z",
    state: "failed",
    conversationId: "c_5",
    error: "503 from crm.northlanedental.com",
  },
  {
    id: "dl_4",
    destinationId: "d_slack",
    moment: "high-intent",
    at: "2026-09-06T14:34:00Z",
    state: "delivered",
    conversationId: "c_4",
  },
  {
    id: "dl_5",
    destinationId: "d_email",
    moment: "specialist-requested",
    at: "2026-09-06T11:20:00Z",
    state: "delivered",
  },
  {
    id: "dl_6",
    destinationId: "d_webhook",
    moment: "high-intent",
    at: "2026-09-06T09:44:00Z",
    state: "retrying",
  },
];

/* ---- Integrations -------------------------------------------------------- */

/* ---- The answer layer ---------------------------------------------------- */

export const SURFACES: PublishedSurface[] = [
  {
    id: "srf_jsonld",
    siteId: "site_northlane",
    kind: "structured-data",
    url: "northlanedental.com — on every page",
    state: "live",
    itemsExposed: 11,
    lastPublishedAt: "2026-09-07T06:40:00Z",
    fetches30d: 2140,
  },
  {
    id: "srf_llms",
    siteId: "site_northlane",
    kind: "llms-txt",
    url: "northlanedental.com/llms.txt",
    state: "live",
    itemsExposed: 11,
    lastPublishedAt: "2026-09-07T06:40:00Z",
    fetches30d: 486,
  },
  {
    id: "srf_mirror",
    siteId: "site_northlane",
    kind: "answer-mirror",
    url: "northlanedental.com/answers/",
    state: "live",
    itemsExposed: 11,
    lastPublishedAt: "2026-09-07T06:40:00Z",
    fetches30d: 312,
  },
  {
    id: "srf_mcp",
    siteId: "site_northlane",
    kind: "mcp",
    url: "northlanedental.com/mcp",
    state: "ready",
    itemsExposed: 0,
    fetches30d: 0,
  },
  {
    id: "srf_card",
    siteId: "site_northlane",
    kind: "agent-card",
    url: "northlanedental.com/.well-known/agent.json",
    state: "blocked",
    itemsExposed: 0,
    fetches30d: 0,
    blocker: {
      reason:
        "An assistant could offer to book, but the booking would not complete — your calendar is not connected.",
      remedy: "Connect Calendly in Integrations, then this publishes itself.",
    },
  },
];

/**
 * Checked weekly by asking each assistant the questions your customers ask.
 * The gaps here are the same gaps Insights reports on the site — a question
 * your Site Brain cannot answer is one no assistant can answer either.
 */
export const ASSISTANT_ANSWERS: AssistantAnswer[] = [
  {
    id: "aa_1",
    siteId: "site_northlane",
    assistant: "chatgpt",
    question: "Does Northlane Dental offer payment plans for Invisalign?",
    verdict: "accurate",
    quote:
      "Yes — Northlane Dental offers Invisalign from $3,900 with financing available from $149 a month, and the consultation is free.",
    checkedAt: "2026-09-06T04:00:00Z",
    fixWithItemId: "k_invisalign",
  },
  {
    id: "aa_2",
    siteId: "site_northlane",
    assistant: "claude",
    question: "What are Northlane Dental's opening hours?",
    verdict: "accurate",
    quote:
      "Northlane Dental is open Monday to Thursday 8am–5pm and Friday 8am–1pm. They are closed at weekends.",
    checkedAt: "2026-09-06T04:00:00Z",
    fixWithItemId: "k_hours",
  },
  {
    id: "aa_3",
    siteId: "site_northlane",
    assistant: "perplexity",
    question: "How much are veneers at Northlane Dental?",
    verdict: "outdated",
    quote: "Veneers at Northlane Dental start at around $700 per tooth according to a 2024 listing.",
    checkedAt: "2026-09-06T04:00:00Z",
    fixWithItemId: "k_pricing",
  },
  {
    id: "aa_4",
    siteId: "site_northlane",
    assistant: "chatgpt",
    question: "Does Northlane Dental take emergency appointments?",
    verdict: "incomplete",
    quote:
      "Northlane Dental appears to handle dental emergencies, though I could not confirm their out-of-hours arrangements.",
    checkedAt: "2026-09-06T04:00:00Z",
    fixWithItemId: "k_emergency",
  },
  {
    id: "aa_5",
    siteId: "site_northlane",
    assistant: "gemini",
    question: "Does Northlane Dental treat young children?",
    verdict: "absent",
    quote:
      "I do not have information about whether Northlane Dental treats children. You may want to contact them directly.",
    checkedAt: "2026-09-06T04:00:00Z",
    suggestedCategory: "services",
  },
  {
    id: "aa_6",
    siteId: "site_northlane",
    assistant: "perplexity",
    question: "Is teeth whitening covered by insurance at Northlane Dental?",
    verdict: "absent",
    quote: "I could not find whitening coverage details for this practice.",
    checkedAt: "2026-09-06T04:00:00Z",
    suggestedCategory: "policies",
  },
];

export const INTEGRATIONS: Integration[] = [
  {
    id: "i_email",
    name: "Email",
    description: "Send visitor requests to any inbox your team already watches.",
    category: "routing",
    status: "connected",
    accountLabel: "frontdesk@northlanedental.com",
    connectedAt: "2026-07-02T09:20:00Z",
    lastSyncAt: "2026-09-07T07:51:00Z",
  },
  {
    id: "i_slack",
    name: "Slack",
    description: "Post high-intent conversations into a channel with full context.",
    category: "routing",
    status: "connected",
    accountLabel: "Northlane workspace · #cosmetic-leads",
    connectedAt: "2026-07-04T13:00:00Z",
    lastSyncAt: "2026-09-06T14:34:00Z",
  },
  {
    id: "i_webhook",
    name: "Webhooks",
    description: "Send structured events to any endpoint you control.",
    category: "developer",
    status: "error",
    accountLabel: "crm.northlanedental.com",
    connectedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "i_calendly",
    name: "Calendly",
    description: "Let Concierge offer real availability and create bookings.",
    category: "scheduling",
    status: "connected",
    accountLabel: "northlane-dental",
    connectedAt: "2026-07-15T10:30:00Z",
    lastSyncAt: "2026-09-07T06:00:00Z",
  },
  {
    id: "i_whatsapp",
    name: "WhatsApp",
    description: "Continue conversations on the channel your customers already use.",
    category: "messaging",
    status: "available",
  },
  {
    id: "i_sms",
    name: "SMS",
    description: "Text a team member the moment a visitor asks for a call.",
    category: "messaging",
    status: "connected",
    accountLabel: "+1 512 555 0100",
    connectedAt: "2026-07-20T11:00:00Z",
    lastSyncAt: "2026-09-07T06:15:00Z",
  },
  {
    id: "i_stripe",
    name: "Stripe",
    description: "Take deposits and booking fees inside a conversation.",
    category: "payments",
    status: "available",
  },
  {
    id: "i_paypal",
    name: "PayPal",
    description: "Offer PayPal checkout for deposits and fees.",
    category: "payments",
    status: "available",
  },
  {
    id: "i_hubspot",
    name: "HubSpot",
    description: "Sync qualified leads into your CRM with the transcript attached.",
    category: "crm",
    status: "available",
  },
  {
    id: "i_salesforce",
    name: "Salesforce",
    description: "Create leads and tasks from qualified conversations.",
    category: "crm",
    status: "coming-soon",
  },
  {
    id: "i_zapier",
    name: "Zapier",
    description: "Connect Concierge to thousands of apps without code.",
    category: "automation",
    status: "available",
  },
  {
    id: "i_make",
    name: "Make",
    description: "Build multi-step automations from Concierge events.",
    category: "automation",
    status: "coming-soon",
  },
  {
    id: "i_api",
    name: "Custom API",
    description: "Read conversations, leads and knowledge programmatically.",
    category: "developer",
    status: "available",
  },
];

/* ---- Pages --------------------------------------------------------------- */

/**
 * Atlas Moving Co. has no website, which is the whole reason Pages exists for
 * them. The content below is what an owner would plausibly have written after
 * an afternoon with the builder — unfinished in places, because that is the
 * honest state of a site three days old.
 *
 * `styleOverrides` carries a few real responsive rules so the cascade has
 * something to resolve: four service columns on desktop become two on a tablet
 * and one on a phone.
 */
export const PAGE_DOCUMENT: PageDocument = {
  version: PAGE_DOCUMENT_VERSION,
  siteId: "site_atlasmoving",
  updatedAt: "2026-09-07T07:55:00Z",
  theme: {
    brandColor: "#1F3A5F",
    mode: "light",
    fonts: "grotesk",
    radius: "soft",
    buttonShape: "rounded",
    density: "regular",
  },
  pages: [
    {
      id: "p_home",
      siteId: "site_atlasmoving",
      slug: "",
      title: "Home",
      navLabel: "Home",
      published: true,
      updatedAt: "2026-09-07T07:55:00Z",
      styleOverrides: {
        "s_services:tablet:columns": {
          sectionId: "s_services",
          breakpoint: "tablet",
          property: "columns",
          value: 2,
        },
        "s_services:mobile:columns": {
          sectionId: "s_services",
          breakpoint: "mobile",
          property: "columns",
          value: 1,
        },
        "s_testimonials:mobile:columns": {
          sectionId: "s_testimonials",
          breakpoint: "mobile",
          property: "columns",
          value: 1,
        },
        "s_hero:mobile:spacing": {
          sectionId: "s_hero",
          breakpoint: "mobile",
          property: "spacing",
          value: "normal",
        },
      },
      sections: [
        {
          id: "s_hero",
          kind: "hero",
          title: "Hero",
          enabled: true,
          style: { background: "inverse", spacing: "grand", align: "left", width: "normal", columns: 1 },
          content: {
            headline: "Moving across Texas, handled properly.",
            subheadline:
              "Family run out of Austin since 2009. Local moves, long hauls, packing and storage — done by the same crew, start to finish.",
            cta: { label: "Get a free quote", actionId: "act_quote" },
            secondaryCta: { label: "Talk to someone", actionId: "act_call" },
          },
        },
        {
          id: "s_services",
          kind: "services",
          title: "Services",
          enabled: true,
          style: { background: "default", spacing: "roomy", align: "left", width: "normal", columns: 4 },
          content: {
            heading: "What we do",
            intro: "Four things, all of them properly.",
            items: [
              {
                id: "sv_local",
                icon: "truck",
                name: "Local moves",
                description: "Anywhere inside the Austin metro, usually done in a day.",
                price: "from $400",
              },
              {
                id: "sv_long",
                icon: "car",
                name: "Long distance",
                description: "Across Texas and to the neighbouring states, with one crew the whole way.",
                price: "from $1,800",
              },
              {
                id: "sv_packing",
                icon: "box",
                name: "Packing",
                description: "Materials, labour and an unpack at the other end if you want it.",
                price: "from $250",
              },
              {
                id: "sv_storage",
                icon: "shield",
                name: "Storage",
                description: "Climate-controlled units by the week or the month.",
                price: "from $90/mo",
              },
            ],
          },
        },
        {
          id: "s_testimonials",
          kind: "testimonials",
          title: "Testimonials",
          enabled: true,
          style: { background: "subtle", spacing: "roomy", align: "left", width: "normal", columns: 2 },
          content: {
            heading: "What customers say",
            items: [
              {
                id: "tm_1",
                quote: "Turned up when they said they would, wrapped everything, and nothing was broken.",
                author: "Dana R.",
                detail: "Austin to Round Rock",
                rating: 5,
              },
              {
                id: "tm_2",
                quote: "They quoted a price and it was the price. That alone made it worth it.",
                author: "Miguel S.",
                detail: "Two-bedroom, local",
                rating: 5,
              },
              {
                id: "tm_3",
                quote: "Packed my mother's house with a lot more care than I expected.",
                author: "Priya N.",
                detail: "Austin to Dallas",
                rating: 5,
              },
              {
                id: "tm_4",
                quote: "Ran an hour late but called ahead twice. Fine by me.",
                author: "Tom W.",
                detail: "Studio, local",
                rating: 4,
              },
            ],
          },
        },
        {
          id: "s_contact",
          kind: "contact",
          title: "Contact",
          enabled: true,
          style: { background: "default", spacing: "roomy", align: "left", width: "narrow", columns: 1 },
          content: {
            heading: "Get in touch",
            body: "Tell us where you are moving from and to, and we will come back with a price.",
            phone: "(512) 555-0148",
            email: "hello@atlasmoving.co",
            address: "1400 E 6th St, Austin, TX",
            actionId: "act_quote",
            showHours: true,
          },
        },
      ],
    },
    {
      id: "p_services",
      siteId: "site_atlasmoving",
      slug: "services",
      title: "Services",
      navLabel: "Services",
      published: true,
      updatedAt: "2026-09-06T16:20:00Z",
      styleOverrides: {
        "s_services2:mobile:columns": {
          sectionId: "s_services2",
          breakpoint: "mobile",
          property: "columns",
          value: 1,
        },
      },
      sections: [
        {
          id: "s_services2",
          kind: "services",
          title: "Service list",
          enabled: true,
          style: { background: "default", spacing: "roomy", align: "left", width: "normal", columns: 2 },
          content: {
            heading: "Services and price bands",
            intro: "Every price here is a starting point. A survey settles the final figure.",
            items: [
              {
                id: "sv2_local",
                icon: "truck",
                name: "Local moves",
                description:
                  "Two movers and a truck, charged by the hour with a three-hour minimum. Most two-bedroom homes take five to six hours.",
                price: "$400–$900",
              },
              {
                id: "sv2_long",
                icon: "car",
                name: "Long distance",
                description:
                  "Priced on distance and volume, not weight. One crew loads and unloads, so nothing changes hands en route.",
                price: "$1,800–$4,500",
              },
              {
                id: "sv2_packing",
                icon: "box",
                name: "Packing",
                description:
                  "Full pack, part pack, or materials dropped off ahead of the day. Unpacking at the other end is charged separately.",
                price: "$250–$1,200",
              },
              {
                id: "sv2_storage",
                icon: "shield",
                name: "Storage",
                description:
                  "Climate-controlled and alarmed. First week free when it sits between a move out and a move in.",
                price: "$90–$260/mo",
              },
            ],
          },
        },
        {
          id: "s_faq",
          kind: "faq",
          title: "FAQ",
          enabled: true,
          style: { background: "subtle", spacing: "roomy", align: "left", width: "narrow", columns: 1 },
          content: {
            heading: "Questions we get asked",
            items: [
              {
                id: "q_notice",
                question: "How much notice do you need?",
                answer:
                  "Two weeks is comfortable. We can usually do a small local move at three or four days' notice, and we keep a slot open most Saturdays.",
              },
              {
                id: "q_insurance",
                question: "Are my things insured?",
                answer:
                  "Basic liability is included at 60 cents per pound per item. Full-value protection is an add-on and we will quote it with the move.",
              },
              {
                id: "q_deposit",
                question: "Do you take a deposit?",
                answer:
                  "A $100 deposit holds the date and comes off the final bill. It is refundable up to 48 hours before.",
              },
              {
                id: "q_stairs",
                question: "Is there a charge for stairs or a long carry?",
                answer:
                  "No stair fee. A carry over 75 feet from door to truck adds an hour of labour, and we will flag it at the survey rather than on the day.",
              },
              {
                id: "q_piano",
                question: "Will you move a piano or a gun safe?",
                answer:
                  "Uprights and safes under 600 pounds, yes. Grands and anything heavier we subcontract to a specialist and pass the cost through at what it costs us.",
              },
              {
                id: "q_cancel",
                question: "What happens if I need to move the date?",
                answer:
                  "One reschedule is free with 48 hours' notice. After that we ask for the deposit again, because the slot has usually gone.",
              },
            ],
          },
        },
      ],
    },
    {
      id: "p_pricing",
      siteId: "site_atlasmoving",
      slug: "pricing",
      title: "Pricing",
      navLabel: "Pricing",
      published: false,
      updatedAt: "2026-09-07T07:10:00Z",
      styleOverrides: {
        "s_pricing:mobile:columns": {
          sectionId: "s_pricing",
          breakpoint: "mobile",
          property: "columns",
          value: 1,
        },
      },
      sections: [
        {
          id: "s_pricing",
          kind: "pricing",
          title: "Pricing table",
          enabled: true,
          style: { background: "default", spacing: "roomy", align: "center", width: "normal", columns: 3 },
          content: {
            heading: "Three ways to book us",
            intro: "Draft — these bands still need checking against last quarter's jobs.",
            note: "Every figure is a starting point. The final price is confirmed after a survey.",
            tiers: [
              {
                id: "tr_hourly",
                name: "By the hour",
                price: "$140",
                cadence: "per hour",
                description: "Two movers and a truck. Three-hour minimum.",
                features: ["Two movers and a truck", "Blankets and straps included", "Three-hour minimum"],
                cta: { label: "Get a quote", actionId: "act_quote" },
                featured: false,
              },
              {
                id: "tr_flat",
                name: "Flat rate",
                price: "from $850",
                cadence: "per move",
                description: "A fixed price agreed after a walkthrough.",
                features: [
                  "Price fixed before the day",
                  "Free video or in-person survey",
                  "Packing materials at cost",
                ],
                cta: { label: "Book a survey", actionId: "act_quote" },
                featured: true,
              },
              {
                id: "tr_long",
                name: "Long distance",
                price: "from $1,800",
                cadence: "per move",
                description: "One crew from door to door, anywhere in Texas.",
                features: ["Same crew both ends", "Storage between dates", "Full-value protection available"],
                cta: { label: "Get a quote", actionId: "act_quote" },
                featured: false,
              },
            ],
          },
        },
        {
          id: "s_faq2",
          kind: "faq",
          title: "FAQ",
          enabled: false,
          style: { background: "subtle", spacing: "normal", align: "left", width: "narrow", columns: 1 },
          content: {
            heading: "Pricing questions",
            items: [
              {
                id: "q_hidden",
                question: "Are there any charges that are not in the quote?",
                answer: "Tolls and parking permits, where a building requires one. Nothing else.",
              },
            ],
          },
        },
      ],
    },
  ],
};

/** The pages themselves. Kept as a named export because every surface reads it. */
export const PAGES: ConciergePage[] = PAGE_DOCUMENT.pages;

/* ---- Insights ------------------------------------------------------------ */

const series = (base: number, spread: number): { date: string; value: number }[] =>
  Array.from({ length: 14 }, (_, i) => {
    const d = new Date(2026, 7, 25 + i);
    const wave = Math.sin(i / 2.1) * spread;
    const drift = (i / 13) * spread * 0.7;
    return {
      date: d.toISOString().slice(0, 10),
      value: Math.max(0, Math.round(base + wave + drift)),
    };
  });

export const METRICS: Metric[] = [
  { key: "visitors", label: "Visitors", value: 2841, delta: 12, format: "number", series: series(180, 46) },
  {
    key: "conversations",
    label: "Conversations",
    value: 386,
    delta: 18,
    format: "number",
    series: series(24, 9),
  },
  { key: "leads", label: "Qualified leads", value: 74, delta: 24, format: "number", series: series(5, 3) },
  {
    key: "actions",
    label: "Actions completed",
    value: 132,
    delta: 9,
    format: "number",
    series: series(9, 4),
  },
  { key: "handoffs", label: "Human handoffs", value: 41, delta: -6, format: "number", series: series(3, 2) },
  {
    key: "conversion",
    label: "Conversion rate",
    value: 19.2,
    delta: 4,
    format: "percent",
    series: series(17, 4),
  },
];

export const UNANSWERED: UnansweredQuestion[] = [
  {
    id: "u_1",
    question: "Is teeth whitening covered under a dental plan?",
    askCount: 14,
    lastAskedAt: "2026-09-07T08:05:00Z",
    suggestedCategory: "policies",
    status: "open",
  },
  {
    id: "u_2",
    question: "Do you treat children under 5?",
    askCount: 11,
    lastAskedAt: "2026-09-07T08:20:00Z",
    suggestedCategory: "services",
    status: "open",
  },
  {
    id: "u_3",
    question: "Where do I park?",
    askCount: 9,
    lastAskedAt: "2026-09-06T15:40:00Z",
    suggestedCategory: "faqs",
    status: "open",
  },
  {
    id: "u_4",
    question: "Do you offer sedation for anxious patients?",
    askCount: 7,
    lastAskedAt: "2026-09-06T12:10:00Z",
    suggestedCategory: "services",
    status: "open",
  },
  {
    id: "u_5",
    question: "Can I pay in instalments for a crown?",
    askCount: 6,
    lastAskedAt: "2026-09-05T17:30:00Z",
    suggestedCategory: "pricing",
    status: "open",
  },
  {
    id: "u_6",
    question: "Is there step-free access?",
    askCount: 4,
    lastAskedAt: "2026-09-05T09:15:00Z",
    suggestedCategory: "faqs",
    status: "resolved",
  },
];

export const INTENTS: IntentBreakdown[] = [
  { intent: "booking", count: 142, share: 36.8, conversionRate: 41 },
  { intent: "pricing", count: 88, share: 22.8, conversionRate: 22 },
  { intent: "human", count: 61, share: 15.8, conversionRate: 68 },
  { intent: "product", count: 44, share: 11.4, conversionRate: 12 },
  { intent: "quote", count: 31, share: 8.0, conversionRate: 55 },
  { intent: "hours", count: 20, share: 5.2, conversionRate: 4 },
];

/* ---- Activity ------------------------------------------------------------ */

export const ACTIVITY: ActivityEvent[] = [
  {
    id: "a_1",
    kind: "lead",
    title: "Maya Robinson qualified",
    detail: "Invisalign consultation · score 92 · routed to Front desk",
    at: "2026-09-07T07:51:00Z",
    siteId: "site_northlane",
    href: "/sites/site_northlane/leads",
  },
  {
    id: "a_2",
    kind: "conversation",
    title: "New conversation on /services",
    detail: "Asked about treating children under 5 — Concierge could not answer",
    at: "2026-09-07T08:20:00Z",
    siteId: "site_northlane",
    href: "/sites/site_northlane/conversations",
  },
  {
    id: "a_3",
    kind: "routing",
    title: "Webhook delivery failed",
    detail: "Practice CRM returned 503 · retrying",
    at: "2026-09-07T05:02:00Z",
    siteId: "site_northlane",
    href: "/sites/site_northlane/agent/routing",
  },
  {
    id: "a_4",
    kind: "action",
    title: "Call request completed",
    detail: "Routed to Emergency line in 4 seconds",
    at: "2026-09-07T06:15:00Z",
    siteId: "site_northlane",
    href: "/sites/site_northlane/agent/actions",
  },
  {
    id: "a_5",
    kind: "knowledge",
    title: "3 knowledge items need review",
    detail: "Opening hours, Treatment pricing, Insurance and payment",
    at: "2026-09-06T22:14:00Z",
    siteId: "site_northlane",
    href: "/sites/site_northlane/agent/brain",
  },
  {
    id: "a_6",
    kind: "conversation",
    title: "Priya Raman converted",
    detail: "Veneers quote request · routed to Cosmetic team",
    at: "2026-09-06T14:34:00Z",
    siteId: "site_northlane",
    href: "/sites/site_northlane/conversations",
  },
];

/* ---- Team ---------------------------------------------------------------- */

export const TEAM: TeamMember[] = [
  {
    id: "t_1",
    name: "Olaifa Promise",
    email: "olaifapromise1@gmail.com",
    role: "owner",
    scopes: ["messages", "routing", "preview", "insights", "settings", "pages", "billing", "team"],
    siteIds: null,
    status: "active",
  },
  {
    id: "t_2",
    name: "Dana Whitmore",
    email: "dana@northlanedental.com",
    role: "operator",
    scopes: ["messages", "insights"],
    siteIds: ["site_northlane"],
    status: "active",
  },
  {
    id: "t_3",
    name: "Sam Okafor",
    email: "sam@collabauto.co",
    role: "admin",
    scopes: ["messages", "routing", "preview", "insights", "settings"],
    siteIds: null,
    status: "active",
  },
  {
    id: "t_4",
    name: "",
    email: "reception@northlanedental.com",
    role: "operator",
    scopes: ["messages"],
    siteIds: ["site_northlane"],
    status: "invited",
    invitedAt: "2026-09-05T14:00:00Z",
  },
];
