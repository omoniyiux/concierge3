import { HOUR, MINUTE } from "@/lib/sim/clock";
import { brainOf, isOpen, siteOf, type World, type WorldEvent } from "@/lib/sim/world";
import type { Conversation, Lead, Message, Outcome, VisitorIntent } from "@/lib/types";

/* ============================================================================
   THE ENGINE
   ----------------------------------------------------------------------------
   What a website actually does to a business, made to happen in front of you:
   visitors arrive, ask something, are answered or not, become a lead or not,
   produce an outcome or not — and occasionally a webhook falls over at the
   worst possible moment.

   Two rules keep it honest:

   1. It only produces things the real product would produce, in the same
      shapes, obeying the same constraints — an action that is not ready
      never fires, an estimate is never quietly promoted to confirmed.
   2. Arrivals follow the business's own opening hours, because "38 of these
      came in while you were closed" is the product's whole argument and it
      would be worthless if the simulation ignored the clock.
   ========================================================================== */

const VISITOR_NAMES = [
  "Maya Robinson", "Daniel Osei", "Priya Raman", "Ellis Moore", "Nadia Haddad",
  "Tom Whitfield", "Grace Oyelaran", "Marcus Bell", "Lena Fischer", "Omar Haddad",
  "Ruth Kimani", "Felix Dubois", "Sana Iqbal", "Peter Novak", "Amara Eze",
];

const OPENERS: { intent: VisitorIntent; ask: string; answer: string; gap?: string }[] = [
  {
    intent: "booking",
    ask: "Do you have anything this week?",
    answer:
      "We do — consultations run Monday to Thursday. Would a morning or an afternoon suit you better?",
  },
  {
    intent: "pricing",
    ask: "How much is a check-up?",
    answer:
      "A New Patient Exam is $89 and includes X-rays and a cleaning. Anything cosmetic is quoted after a short consultation.",
  },
  {
    intent: "quote",
    ask: "What would veneers cost for my top six?",
    answer:
      "That one needs a consultation before anyone quotes a real figure. I can put a request in and have the cosmetic team come back to you.",
  },
  {
    intent: "hours",
    ask: "Are you open on Saturdays?",
    answer: "We are open Monday to Thursday 8am–5pm, and Friday 8am–1pm. Closed at the weekend.",
  },
  {
    intent: "human",
    ask: "Can someone call me back?",
    answer: "Of course — what number should the front desk use?",
  },
  {
    intent: "product",
    ask: "Do you offer sedation for anxious patients?",
    answer: "",
    gap: "Do you offer sedation for anxious patients?",
  },
  {
    intent: "pricing",
    ask: "Can I pay for a crown in instalments?",
    answer: "",
    gap: "Can I pay in instalments for a crown?",
  },
  {
    intent: "support",
    ask: "I chipped a tooth last night and it really hurts.",
    answer:
      "I am sorry — that needs a person rather than me. I am passing this to the practice now so they can get you seen.",
  },
];

let counter = 0;
const uid = (p: string) => `${p}_${Date.now().toString(36)}_${(counter++).toString(36)}`;

function pick<T>(list: T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length)];
}

/** Deterministic enough to be repeatable, random enough to feel alive. */
function rngFrom(seed: number) {
  let x = seed % 2147483647;
  if (x <= 0) x += 2147483646;
  return () => {
    x = (x * 16807) % 2147483647;
    return (x - 1) / 2147483646;
  };
}

/* ---- Arrivals --------------------------------------------------------------- */

/**
 * How likely a visitor is to arrive in a given simulated minute. Daytime
 * traffic is heavier, but the evening never goes to zero — that is the point
 * of the product.
 */
function arrivalChance(open: boolean, hour: number): number {
  if (open) return 0.055;
  if (hour >= 18 && hour <= 23) return 0.03;
  if (hour >= 0 && hour < 6) return 0.004;
  return 0.012;
}

export type TickResult = { world: World; events: WorldEvent[] };

/**
 * Advances the world by `elapsedMs` of simulated time, in one-minute steps so
 * arrivals land on believable minutes rather than all at once.
 */
export function tick(world: World, elapsedMs: number, siteId: string): TickResult {
  const site = siteOf(world, siteId);
  const brain = brainOf(world, siteId);
  const events: WorldEvent[] = [];

  // Nothing happens on a site that is not answering.
  const answering = site.product === "pages" || site.installState === "detected";

  let next: World = { ...world, now: world.now + elapsedMs };
  const steps = Math.max(1, Math.min(180, Math.round(elapsedMs / MINUTE)));
  const rng = rngFrom(Math.floor(world.now / MINUTE) + steps);

  for (let i = 0; i < steps; i++) {
    const at = new Date(world.now + ((i + 1) * elapsedMs) / steps);
    if (!answering) continue;

    const open = isOpen(site, at);
    if (rng() > arrivalChance(open, at.getHours())) continue;

    const result = startConversation(next, site.id, at, open, brain.coverage, rng);
    next = result.world;
    events.push(...result.events);
  }

  // Threads that are already running move along on their own.
  const progressed = progressConversations(next, siteId, rng);
  next = progressed.world;
  events.push(...progressed.events);

  return { world: { ...next, feed: [...events, ...next.feed].slice(0, 200) }, events };
}

/** A visitor arrives and asks something. */
function startConversation(
  world: World,
  siteId: string,
  at: Date,
  open: boolean,
  coverage: number,
  rng: () => number,
): TickResult {
  const opener = pick(OPENERS, rng);
  // A gap is only a gap when the knowledge genuinely is not there. Better
  // coverage means fewer of them, which is what closing one should feel like.
  const known = !opener.gap || rng() * 100 < coverage - 40;
  const name = rng() > 0.45 ? pick(VISITOR_NAMES, rng) : "Website visitor";
  const id = uid("c");
  const iso = at.toISOString();

  const messages: Message[] = [
    { id: uid("m"), author: "visitor", body: opener.ask, at: iso, channel: "web" },
  ];

  if (known) {
    messages.push({
      id: uid("m"),
      author: "agent",
      body: opener.answer || "Here is what I have on that.",
      at: new Date(at.getTime() + 12_000).toISOString(),
      channel: "web",
      confidence: 0.8 + rng() * 0.18,
      citations: [{ itemId: "k_1", title: "Approved knowledge" }],
    });
  } else {
    messages.push({
      id: uid("m"),
      author: "agent",
      body:
        "I do not have that in my approved knowledge yet, so I would rather not guess. Let me put you through to the practice.",
      at: new Date(at.getTime() + 12_000).toISOString(),
      channel: "web",
      confidence: 0.34 + rng() * 0.12,
    });
  }

  const conversation: Conversation = {
    id,
    siteId,
    visitorName: name,
    visitorLocation: pick(["Austin, TX", "Round Rock, TX", "Cedar Park, TX", "Pflugerville, TX"], rng),
    intent: opener.intent,
    status: "new",
    pageUrl: pick(["/", "/pricing", "/services", "/invisalign", "/contact"], rng),
    startedAt: iso,
    lastMessageAt: messages[messages.length - 1].at,
    messageCount: messages.length,
    preview: opener.ask,
    messages,
    actionsTaken: [],
    afterHours: !open,
    outcomeIds: [],
    channel: "web",
    consent: [],
    unanswered: known ? undefined : opener.gap,
  };

  const events: WorldEvent[] = [
    {
      id: uid("e"),
      at: at.getTime(),
      siteId,
      kind: "conversation-started",
      title: `${name} started a conversation`,
      detail: opener.ask,
      conversationId: id,
    },
  ];

  let gaps = world.gaps;
  if (!known && opener.gap) {
    const existing = gaps.find((g) => g.question === opener.gap);
    gaps = existing
      ? gaps.map((g) => (g === existing ? { ...g, askCount: g.askCount + 1, lastAskedAt: iso } : g))
      : [
          {
            id: uid("u"),
            question: opener.gap,
            askCount: 1,
            lastAskedAt: iso,
            suggestedCategory: "services",
            status: "open" as const,
          },
          ...gaps,
        ];
    events.push({
      id: uid("e"),
      at: at.getTime(),
      siteId,
      kind: "gap",
      title: "A question your site could not answer",
      detail: opener.gap,
      conversationId: id,
    });
  }

  return { world: { ...world, conversations: [conversation, ...world.conversations], gaps }, events };
}

/**
 * Live threads move on: a visitor answers, qualifies, and sometimes produces
 * something worth money. Only actions that are ready can fire.
 */
function progressConversations(world: World, siteId: string, rng: () => number): TickResult {
  const events: WorldEvent[] = [];
  const leads: Lead[] = [...world.leads];
  const outcomes: Outcome[] = [...world.outcomes];
  const site = siteOf(world, siteId);

  const conversations = world.conversations.map((c) => {
    if (c.siteId !== siteId) return c;
    const age = world.now - new Date(c.lastMessageAt).getTime();
    if (c.status !== "new" || age < 4 * MINUTE || age > 6 * HOUR) return c;
    if (rng() > 0.5) return c;

    const at = new Date(world.now);
    const iso = at.toISOString();

    // Anything that could not be answered goes to a person rather than going
    // round again.
    if (c.unanswered) {
      const destination = world.destinations.find((d) => d.status === "connected");
      events.push({
        id: uid("e"),
        at: at.getTime(),
        siteId,
        kind: destination ? "handoff" : "delivery-failed",
        title: destination
          ? `${c.visitorName} was passed to ${destination.name}`
          : `${c.visitorName} needed a person and there was nowhere to send them`,
        conversationId: c.id,
      });
      return { ...c, status: "handed-off" as const, lastMessageAt: iso, routedTo: destination?.name };
    }

    // Otherwise: they leave a way to reach them, and become a lead.
    const phone = `+1 512 555 0${Math.floor(100 + rng() * 800)}`;
    const score = Math.round(52 + rng() * 46);
    const qualification = score >= 80 ? "hot" : score >= 60 ? "warm" : "cool";
    const leadId = uid("l");

    leads.unshift({
      id: leadId,
      siteId,
      name: c.visitorName === "Website visitor" ? "Unnamed visitor" : c.visitorName,
      phone,
      intent: c.intent,
      service: c.intent === "quote" ? "Cosmetic consultation" : "Appointment",
      urgency: rng() > 0.6 ? "this-week" : "exploring",
      qualification,
      score,
      conversationId: c.id,
      capturedAt: iso,
    });

    events.push({
      id: uid("e"),
      at: at.getTime(),
      siteId,
      kind: "lead-qualified",
      title: `${c.visitorName} qualified as a ${qualification} lead`,
      detail: `Scored ${score}, left a number.`,
      conversationId: c.id,
    });

    // A ready action can finish the job. An unready one never fires.
    const bookable = world.actions.find((a) => a.readiness === "ready" && a.triggers.includes(c.intent));
    const outcomeIds: string[] = [];
    if (bookable && rng() > 0.45) {
      const outcomeId = uid("o");
      outcomeIds.push(outcomeId);
      outcomes.unshift({
        id: outcomeId,
        siteId,
        conversationId: c.id,
        kind: bookable.kind === "booking" ? "booking" : "lead-routed",
        summary: `${bookable.name} completed for ${c.visitorName}`,
        at: iso,
        value: bookable.unitValue ?? 0,
        basis: bookable.unitValue ? "estimated" : "none",
        valueNote: bookable.unitValueNote,
        afterHours: c.afterHours,
        actionId: bookable.id,
        leadId,
      });
      events.push({
        id: uid("e"),
        at: at.getTime(),
        siteId,
        kind: "outcome",
        title: `${bookable.name} completed`,
        detail: bookable.unitValue
          ? `Estimated at ${(bookable.unitValue / 100).toLocaleString("en-US", { style: "currency", currency: site.currency })}`
          : undefined,
        conversationId: c.id,
      });
    }

    return {
      ...c,
      status: outcomeIds.length ? ("converted" as const) : ("qualified" as const),
      lastMessageAt: iso,
      leadId,
      consent: [
        {
          channel: "sms" as const,
          address: phone,
          grantedAt: iso,
          basis: "Gave a number when asked how to confirm the appointment.",
        },
      ],
      outcomeIds,
      actionsTaken: bookable ? [bookable.id] : [],
    };
  });

  return { world: { ...world, conversations, leads, outcomes }, events };
}

/* ---- Things you can make happen on purpose --------------------------------- */

export type Injection =
  | "hot-lead"
  | "after-hours"
  | "gap"
  | "webhook-down"
  | "webhook-up"
  | "install-lost"
  | "install-found";

export const INJECTIONS: { key: Injection; label: string; detail: string }[] = [
  { key: "hot-lead", label: "A hot lead arrives", detail: "Someone with budget, urgency and a number." },
  { key: "after-hours", label: "Someone arrives at 11pm", detail: "The argument for the whole product." },
  { key: "gap", label: "A question it cannot answer", detail: "Lands in Insights as a gap to close." },
  { key: "webhook-down", label: "A destination starts failing", detail: "Requests queue rather than deliver." },
  { key: "webhook-up", label: "Fix the failing destination", detail: "Replays everything that queued." },
  { key: "install-lost", label: "The script comes off the site", detail: "The quiet way this product dies." },
  { key: "install-found", label: "The script is back", detail: "Detected again on the next check." },
];

export function inject(world: World, what: Injection, siteId: string): TickResult {
  const at = new Date(world.now);
  const iso = at.toISOString();
  const site = siteOf(world, siteId);
  const rng = rngFrom(world.now);

  switch (what) {
    case "hot-lead":
    case "after-hours": {
      const evening = what === "after-hours";
      const when = evening ? new Date(new Date(world.now).setHours(23, 10, 0, 0)) : at;
      const started = startConversation(world, siteId, when, !evening, 100, rng);
      let next = started.world;
      const created = next.conversations[0];
      const leadId = uid("l");
      const score = 88 + Math.round(rng() * 10);

      next = {
        ...next,
        conversations: next.conversations.map((c) =>
          c.id === created.id
            ? {
                ...c,
                status: "qualified",
                leadId,
                consent: [
                  {
                    channel: "sms",
                    address: "+1 512 555 0142",
                    grantedAt: iso,
                    basis: "Gave a number and asked to be called.",
                  },
                ],
              }
            : c,
        ),
        leads: [
          {
            id: leadId,
            siteId,
            name: created.visitorName === "Website visitor" ? "Evening visitor" : created.visitorName,
            phone: "+1 512 555 0142",
            intent: created.intent,
            service: "Invisalign consultation",
            budget: "$3,900–5,000",
            urgency: "this-week",
            qualification: "hot",
            score,
            conversationId: created.id,
            capturedAt: iso,
          },
          ...next.leads,
        ],
      };

      const events: WorldEvent[] = [
        ...started.events,
        {
          id: uid("e"),
          at: at.getTime(),
          siteId,
          kind: "lead-qualified",
          title: `${created.visitorName} qualified as a hot lead`,
          detail: evening ? "Arrived at 11:10pm, while you were closed." : `Scored ${score}.`,
          conversationId: created.id,
        },
      ];
      return { world: { ...next, feed: [...events, ...next.feed].slice(0, 200) }, events };
    }

    case "gap": {
      const question = "Do you take walk-ins on a Friday afternoon?";
      const existing = world.gaps.find((g) => g.question === question);
      const gaps = existing
        ? world.gaps.map((g) => (g === existing ? { ...g, askCount: g.askCount + 1, lastAskedAt: iso } : g))
        : [
            {
              id: uid("u"),
              question,
              askCount: 1,
              lastAskedAt: iso,
              suggestedCategory: "faqs" as const,
              status: "open" as const,
            },
            ...world.gaps,
          ];
      const events: WorldEvent[] = [
        {
          id: uid("e"),
          at: at.getTime(),
          siteId,
          kind: "gap",
          title: "A question your site could not answer",
          detail: question,
        },
      ];
      return { world: { ...world, gaps, feed: [...events, ...world.feed] }, events };
    }

    case "webhook-down":
    case "webhook-up": {
      const down = what === "webhook-down";
      const destinations = world.destinations.map((d) =>
        d.kind === "webhook" || d.name.toLowerCase().includes("webhook")
          ? { ...d, status: down ? ("failing" as const) : ("connected" as const), lastDeliveryAt: iso }
          : d,
      );
      const integrations = world.integrations.map((i) =>
        i.id === "i_webhook"
          ? { ...i, status: down ? ("error" as const) : ("connected" as const), lastSyncAt: iso }
          : i,
      );
      const events: WorldEvent[] = [
        {
          id: uid("e"),
          at: at.getTime(),
          siteId,
          kind: down ? "delivery-failed" : "delivery",
          title: down ? "Webhooks stopped responding" : "Webhooks are delivering again",
          detail: down
            ? "Anything that depends on it is queued rather than lost."
            : "The queue was replayed in the order it arrived.",
        },
      ];
      return { world: { ...world, destinations, integrations, feed: [...events, ...world.feed] }, events };
    }

    case "install-lost":
    case "install-found": {
      const lost = what === "install-lost";
      const sites = world.sites.map((s) =>
        s.id === siteId
          ? { ...s, installState: lost ? ("stale" as const) : ("detected" as const), updatedAt: iso }
          : s,
      );
      const events: WorldEvent[] = [
        {
          id: uid("e"),
          at: at.getTime(),
          siteId,
          kind: lost ? "install-lost" : "install-detected",
          title: lost
            ? `The script is no longer answering on ${site.url}`
            : `Concierge is answering on ${site.url} again`,
          detail: lost ? "Usually a redesign or a caching change. Nothing is being captured." : undefined,
        },
      ];
      return { world: { ...world, sites, feed: [...events, ...world.feed] }, events };
    }
  }
}
