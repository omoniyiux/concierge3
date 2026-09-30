import { createSection, sectionLabel } from "./pages-builder";
import { actionIdFor, agentOf, capabilityDef, hasCapability, quickActions, withCapability } from "./page-agent";
import {
  STYLES,
  blankDraft,
  buildSmartDocument,
  capabilityForCta,
  displayName,
  draftForTemplate,
  draftFromDocument,
  getGoal,
  getStyle,
  getTemplate,
  lookFor,
  type SmartDraft,
} from "./starters";
import type {
  AgentCapability,
  ConciergePage,
  GalleryLayout,
  HeroLayout,
  ID,
  PageAgent,
  PageAgentTone,
  PageDocument,
  PageGoal,
  PagePromotion,
  PageSection,
  PageSectionKind,
  PageStylePreset,
  SectionBackground,
  ServicesLayout,
} from "./types";

/* ============================================================================
   VIBE CHAT
   ----------------------------------------------------------------------------
   The owner types a sentence; the page and the agent change. The part that
   matters is the middle: every instruction is turned into a list of typed
   `PageChange`s *before* anything is touched. Free text never reaches the
   document.

   That seam is deliberate. Today the interpreter is a set of rules that runs
   in the browser and answers instantly; a model can replace `interpret` later
   and return the same union, and nothing downstream — the preview, the
   "3 changes applied" card, undo, the agent sync — has to know. It also means
   the owner is shown exactly what changed, in words, because each change can
   describe itself.

   Page and agent are one document, so one instruction updates both: "add a
   summer promotion and collect phone numbers" becomes a promotion the banner,
   the popup and the agent all read, plus the capabilities that capture it.
   ========================================================================== */

export type PageChange =
  | { kind: "style"; style: PageStylePreset }
  | { kind: "template"; templateId: string }
  | { kind: "shortenHero" }
  | { kind: "headline"; text: string }
  | { kind: "secondaryCta"; label: string; capability: AgentCapability }
  | { kind: "promotion"; promotion: PagePromotion }
  | { kind: "capability"; capability: AgentCapability; on: boolean }
  | { kind: "focus"; topic: string }
  | { kind: "brandColor"; color: string; name: string }
  | { kind: "section"; section: PageSectionKind; on: boolean }
  | { kind: "heroBackground"; background: SectionBackground }
  | { kind: "tone"; tone: PageAgentTone }
  | { kind: "paymentUrl"; url: string }
  | { kind: "heroLayout"; layout: HeroLayout }
  | { kind: "servicesLayout"; layout: ServicesLayout }
  | { kind: "galleryLayout"; layout: GalleryLayout };

/** Which changes the agent will notice, so the reply can say so. */
const TOUCHES_AGENT: PageChange["kind"][] = ["promotion", "capability", "focus", "tone", "paymentUrl", "secondaryCta", "template"];

export function describeChange(change: PageChange): string {
  switch (change.kind) {
    case "style":
      return `Style set to ${getStyle(change.style).label.toLowerCase()}`;
    case "template":
      return `Rebuilt as a ${getTemplate(change.templateId).name} page`;
    case "shortenHero":
      return "Hero shortened";
    case "headline":
      return `Headline changed to “${change.text}”`;
    case "secondaryCta":
      return `${change.label} button added`;
    case "promotion":
      return `Promotion added: ${change.promotion.headline}`;
    case "capability":
      return `Agent: ${capabilityDef(change.capability).label.toLowerCase()} ${change.on ? "on" : "off"}`;
    case "focus":
      return `Agent trained on ${change.topic} questions`;
    case "brandColor":
      return `Brand colour changed to ${change.name}`;
    case "section":
      return `${sectionLabel(change.section)} section ${change.on ? "added" : "hidden"}`;
    case "heroBackground":
      return change.background === "inverse" ? "Hero made darker" : "Hero made lighter";
    case "tone":
      return `Agent tone set to ${change.tone}`;
    case "paymentUrl":
      return "Payment link added to the agent";
    case "heroLayout":
      return `Hero changed to the ${HERO_LAYOUT_NAME[change.layout]} layout`;
    case "servicesLayout":
      return `Services shown as ${SERVICES_LAYOUT_NAME[change.layout]}`;
    case "galleryLayout":
      return `Gallery shown as a ${change.layout}`;
  }
}

export const HERO_LAYOUT_NAME: Record<HeroLayout, string> = {
  classic: "classic",
  cover: "full-screen photo",
  poster: "poster",
  editorial: "editorial",
  split: "split",
  arch: "arch",
  centered: "centred",
};

export const SERVICES_LAYOUT_NAME: Record<ServicesLayout, string> = {
  cards: "cards",
  photo: "photo cards",
  rows: "alternating rows",
  list: "a numbered list",
};

/* ============================================================================
   READING THE OWNER
   ========================================================================== */

const TEMPLATE_WORDS: [RegExp, string][] = [
  [/\bbbq\b|barbecue|barbeque|smokehouse|brisket/, "smokehouse"],
  [/make-?up|beauty (school|academy|course)|cosmetology/, "atelier"],
  [/skincare|skin care|cosmetic|serum|beauty brand/, "skincare"],
  [/florist|flower|bouquet/, "florist"],
  [/wedding|bridal/, "weddings"],
  [/photograph/, "photographer"],
  [/salon|hair|barber|nail/, "salon"],
  [/fitness|\bgym\b|personal train|trainer|crossfit|athlet/, "athletics"],
  [/therap|counsel|psycholog|mental health/, "therapy"],
  [/dog|\bpets?\b|groom|puppy|vet\b/, "grooming"],
  [/cabin|retreat|vacation rental|holiday home|airbnb|\bstays?\b|guesthouse|\binn\b/, "retreat"],
  [/construction|builder|roofing|roofer|contractor|renovat/, "builders"],
  [/restaurant|caf[eé]|bakery|bistro|\bbar\b|diner|food truck|pizzeria/, "restaurant"],
  [/coach|mentor|creator|online course/, "coach"],
  [/real estate|realtor|property|brokerage|estate agent|homes for sale/, "realestate"],
  [/wellness|\bspa\b|yoga|massage|clinic|pilates|physio|dental|dentist/, "wellness"],
  [/\bsaas\b|software|\bapp\b|platform|startup/, "saas"],
  [/\bevents?\b|conference|festival|concert|meetup|party/, "event"],
  [/agency|studio|consultanc|marketing firm|design firm/, "agency"],
  [
    /landscap|plumb|electric|cleaning|cleaners|moving|movers|handyman|hvac|local service|home service|pest|painting|painter|lawn|garden/,
    "local",
  ],
  [/product launch|pre-?order|waitlist|new product/, "launch"],
];

const detectTemplate = (t: string): string | undefined => TEMPLATE_WORDS.find(([re]) => re.test(t))?.[1];

const STYLE_WORDS: [RegExp, PageStylePreset][] = [
  [/premium|luxur|elegant|high[- ]end|upscale|sophisticat|refined|classy/, "premium"],
  [/sales|convert|conversion|high-converting/, "sales"],
  [/\bbold\b|modern|punch|striking|edgy/, "bold"],
  [/warm|friendly|personal|cozy|cosy|inviting/, "warm"],
  [/\bclean\b|professional|minimal|simple|simpler|corporate|calm/, "clean"],
];

const detectStyle = (t: string): PageStylePreset | undefined => STYLE_WORDS.find(([re]) => re.test(t))?.[1];

/* Quotes and leads before bookings: "quote requests and appointment bookings"
   is a lead business that also books, not the other way round. */
const GOAL_WORDS: [RegExp, PageGoal][] = [
  [/quote|lead|enquir|inquir|opportunit/, "opportunities"],
  [/book|appointment|consultation|schedul|reserv/, "appointments"],
  [/ticket|rsvp|\bevents?\b/, "event"],
  [/email|newsletter|waitlist|subscribe|mailing list/, "emails"],
  [/sell|checkout|buy|purchase|order/, "sell"],
  [/question|faq|answer/, "questions"],
  [/customer|client|grow|more business/, "customers"],
];

const detectGoal = (t: string): PageGoal | undefined => GOAL_WORDS.find(([re]) => re.test(t))?.[1];

const COLOURS: Record<string, string> = {
  black: "#111111",
  navy: "#1F3A5F",
  blue: "#1D4ED8",
  green: "#2F6B3B",
  sage: "#3F6F5A",
  teal: "#0F766E",
  purple: "#6D28D9",
  indigo: "#4F46E5",
  red: "#B91C1C",
  orange: "#C2410C",
  terracotta: "#B4532A",
  pink: "#BE185D",
  gold: "#A16207",
  brown: "#7C4A2D",
};

function detectColour(text: string): { color: string; name: string } | undefined {
  const hex = text.match(/#[0-9a-f]{6}\b/i)?.[0];
  if (hex) return { color: hex.toUpperCase(), name: hex.toUpperCase() };
  const name = Object.keys(COLOURS).find((c) => new RegExp(`\\b${c}\\b`).test(text.toLowerCase()));
  return name ? { color: COLOURS[name], name } : undefined;
}

function detectName(prompt: string): string | undefined {
  const called = prompt.match(/\b(?:called|named)\s+["“']?([A-Z0-9][\w&'.-]*(?:\s+(?:&|and|[A-Z0-9][\w&'.-]*)){0,4})/);
  if (called) return called[1].replace(/[.,]$/, "");
  const quoted = prompt.match(/["“]([^"”]{2,40})["”]/);
  return quoted?.[1];
}

function detectLocation(prompt: string): string | undefined {
  const m = prompt.match(/\b(?:in|based in|serving|around)\s+([A-Z][a-zA-Z]+(?:,?\s+[A-Z][a-zA-Z]+){0,2})/);
  return m?.[1];
}

/** Words that sit between "my" and the trade without being the trade. */
const FILLER = new Set(["my", "our", "a", "an", "the", "for", "page", "site", "website", "premium", "small", "local", "new", "little"]);

function detectOffer(prompt: string): string | undefined {
  const m = prompt.match(
    /\b([a-z][a-z-]+(?:\s+[a-z][a-z-]+){0,3})\s+(?:business|company|studio|practice|shop|agency|brand|clinic|salon|firm|services?|startup|store)\b/i,
  );
  if (!m) return undefined;
  /* "a premium page for my landscaping business" — the trade is what follows
     the last filler word, not the whole run. */
  const words = m[1].split(/\s+/);
  let start = 0;
  words.forEach((w, i) => {
    if (FILLER.has(w.toLowerCase())) start = i + 1;
  });
  const offer = words.slice(start).join(" ");
  return offer.length > 1 ? offer[0].toUpperCase() + offer.slice(1) : undefined;
}

function detectPromotion(text: string, siteName: string): PagePromotion | undefined {
  const t = text.toLowerCase();
  /* "Offer" alone is too common — "what services do you offer" is not a
     promotion — so it only counts with a word that makes it one. */
  const wantsOne =
    /\bpromo(tion)?s?\b|discount|% off|\bsale\b|\bdeals?\b|\bspecials?\b/.test(t) ||
    /\b(an?|the|summer|special|limited|launch|intro(ductory)?|seasonal|holiday)\s+offer\b/.test(t);
  if (!wantsOne) return undefined;
  const percent = t.match(/(\d{1,2})\s?%/)?.[1];
  const season = t.match(/summer|spring|autumn|fall|winter|holiday|christmas|black friday|new year|launch/)?.[0];
  const Season = season ? season[0].toUpperCase() + season.slice(1) : undefined;
  const collects = /phone|number|sms|text me|mobile/.test(t) ? "phone" : "email";
  /* A figure is only ever the owner's. With no percentage given, the offer
     says there is one without inventing how big it is. */
  return {
    headline: percent ? `${Season ? `${Season} offer: ` : ""}${percent}% off` : `${Season ?? "Limited-time"} special`,
    detail: percent
      ? `Take ${percent}% off your first booking with ${siteName}.`
      : `Leave your ${collects === "phone" ? "number" : "email"} and we'll send you the details.`,
    collects,
    cta: "Get my offer",
  };
}

const SECTION_WORDS: [RegExp, PageSectionKind][] = [
  [/faq|questions section/, "faq"],
  [/gallery|photos|portfolio/, "gallery"],
  [/reviews?|testimonials?|social proof/, "testimonials"],
  [/about/, "about"],
  [/contact/, "contact"],
  [/services/, "services"],
  [/pricing|prices section/, "pricing"],
  [/call to action|closing|cta band|final ask/, "cta"],
];

/* ============================================================================
   INTERPRETING AN INSTRUCTION
   ========================================================================== */

export interface Interpretation {
  changes: PageChange[];
  reply: string;
}

const bookingLabel = (doc: PageDocument) =>
  doc.brief?.templateId === "coach" || doc.brief?.templateId === "agency" ? "Book a consultation" : "Book an appointment";

export function interpret(text: string, doc: PageDocument, siteName: string): Interpretation {
  const t = text.toLowerCase();
  const agent = agentOf(doc);
  const changes: PageChange[] = [];
  const push = (change: PageChange) => {
    if (!changes.some((c) => JSON.stringify(c) === JSON.stringify(change))) changes.push(change);
  };

  /* "Turn this into a restaurant page" — a rebuild, so it goes first and
     everything after it applies to the new page. */
  const into = t.match(/\b(?:turn|change|make|switch|convert)\b.*?\b(?:into|to)\b(.*)/);
  const target = into ? detectTemplate(into[1]) : undefined;
  if (target && target !== doc.brief?.templateId) push({ kind: "template", templateId: target });

  const style = detectStyle(t);
  const aboutTone = /\b(tone|voice|sound)\b/.test(t);
  if (style && !aboutTone && (!target || /feel|look|style|more|make/.test(t))) push({ kind: "style", style });
  if (aboutTone) {
    const tone: PageAgentTone | undefined = /premium|formal|elegant/.test(t)
      ? "premium"
      : /professional|serious/.test(t)
        ? "professional"
        : /friendly|casual|warm/.test(t)
          ? "friendly"
          : undefined;
    if (tone) push({ kind: "tone", tone });
  }

  const headline = text.match(/headline\s+(?:to|:|says?)\s*["“']([^"”']+)["”']/i)?.[1];
  if (headline) push({ kind: "headline", text: headline.trim() });
  else if (
    /(short|shorter|shorten|trim|tighten|less text|concise|punchier)/.test(t) &&
    /(hero|headline|intro|copy|top)/.test(t)
  ) {
    push({ kind: "shortenHero" });
  }

  if (/(add|put|include|need|want|give).*(book|booking|appointment|consultation|schedul)/.test(t) && /button|cta|booking|book/.test(t)) {
    push({ kind: "secondaryCta", label: bookingLabel(doc), capability: "booking" });
  }

  const promotion = detectPromotion(text, siteName);
  if (promotion) {
    push({ kind: "promotion", promotion });
    push({ kind: "capability", capability: "promotions", on: true });
    push({ kind: "capability", capability: "leads", on: true });
  } else if (/collect.*(phone|number)/.test(t)) {
    push({ kind: "capability", capability: "contact", on: true });
  } else if (/collect.*email/.test(t)) {
    push({ kind: "capability", capability: "leads", on: true });
  }

  if (/(pric|cost|how much|\brates?\b|fees?)/.test(t) && /(train|teach|answer|agent|question|handle)/.test(t)) {
    push({ kind: "focus", topic: "pricing" });
    push({ kind: "capability", capability: "leads", on: true });
  }

  const off = /(no|stop|disable|remove|turn off|switch off|without|don't)\b/;
  if (/(human|real person|handoff|hand off|hand-off|team member|connect.*(team|someone|person)|talk to (a|someone))/.test(t)) {
    push({ kind: "capability", capability: "handoff", on: !off.test(t) });
  }
  if (/(payment|checkout|deposit|\bpay\b)/.test(t)) {
    push({ kind: "capability", capability: "payment", on: !off.test(t) });
    const url = text.match(/https?:\/\/\S+/)?.[0];
    if (url) push({ kind: "paymentUrl", url });
  }
  if (/(answer|handle).*questions/.test(t) && !hasCapability(agent, "answer")) {
    push({ kind: "capability", capability: "answer", on: true });
  }
  if (/help (them|visitors|people) (choose|decide|pick)/.test(t)) {
    push({ kind: "capability", capability: "guide", on: true });
  }

  /* Layouts, named the way an owner would describe them. */
  if (
    /hero|top|header|first screen|headline|poster|editorial|magazine|full[- ]?screen|\barch/.test(t) ||
    /(full|big|large|background) (photo|image|picture)/.test(t)
  ) {
    const heroLayout: HeroLayout | undefined = /full[- ]?(width|screen|bleed)|background (photo|image)|cover/.test(t)
      ? "cover"
      : /poster|giant|huge headline|massive/.test(t)
        ? "poster"
        : /editorial|magazine/.test(t)
          ? "editorial"
          : /\barch/.test(t)
            ? "arch"
            : /\bsplit|side by side/.test(t)
              ? "split"
              : /centr|center/.test(t)
                ? "centered"
                : undefined;
    if (heroLayout) push({ kind: "heroLayout", layout: heroLayout });
  }
  if (/services/.test(t)) {
    /* Read only what follows "services", so "a full-screen photo hero and
       services as rows" does not turn the services into photo cards. */
    const about = t.slice(t.indexOf("services"));
    const servicesLayout: ServicesLayout | undefined = /rows|zig-?zag|alternat/.test(about)
      ? "rows"
      : /\blist|numbered|index/.test(about)
        ? "list"
        : /photo|picture|image/.test(about)
          ? "photo"
          : /cards/.test(about)
            ? "cards"
            : undefined;
    if (servicesLayout) push({ kind: "servicesLayout", layout: servicesLayout });
  }
  if (/gallery|photos|portfolio/.test(t)) {
    const galleryLayout: GalleryLayout | undefined = /mosaic/.test(t)
      ? "mosaic"
      : /strip|row of/.test(t)
        ? "strip"
        : /\bgrid/.test(t)
          ? "grid"
          : undefined;
    if (galleryLayout) push({ kind: "galleryLayout", layout: galleryLayout });
  }

  if (/darker|moodier|more dramatic/.test(t)) push({ kind: "heroBackground", background: "inverse" });
  else if (/lighter|brighter|less dark/.test(t)) push({ kind: "heroBackground", background: "default" });

  if (/colou?r|brand|palette/.test(t)) {
    const colour = detectColour(text);
    if (colour) push({ kind: "brandColor", ...colour });
  }

  /* Each verb governs only its own clause: in "add a gallery and remove the
     faq", the FAQ belongs to "remove". */
  const clause = (match: RegExpMatchArray | null) => match?.[2].split(/\s+(?:and|then|but|plus)\s+|[,.;!?]/)[0] ?? "";
  const adding = clause(t.match(/\b(add|show|include|switch on|turn on|enable|put)\b\s+(?:an?\s+|the\s+|some\s+)?(.{0,40})/));
  const removing = clause(
    t.match(/\b(remove|hide|drop|delete|switch off|turn off|disable|get rid of)\b\s+(?:the\s+)?(.{0,40})/),
  );
  /* Only a change that changes something: "show services as rows" is about
     the layout of a section that is already there, not a request to add it. */
  const home = doc.pages.find((p) => p.slug === "") ?? doc.pages[0];
  const unchanged: string[] = [];
  for (const [fragment, on] of [
    [adding, true],
    [removing, false],
  ] as const) {
    const kind = SECTION_WORDS.find(([re]) => re.test(fragment))?.[1];
    const current = home?.sections.find((s) => s.kind === kind);
    const already = on ? current?.enabled === true : current === undefined || !current.enabled;
    if (kind && !already) push({ kind: "section", section: kind, on });
    if (kind && already) unchanged.push(`${sectionLabel(kind)} is already ${on ? "on" : "off"} the page`);
  }

  if (changes.length === 0 && unchanged.length > 0) {
    return { changes, reply: `${unchanged.join(", ")} — nothing to change there. Anything else?` };
  }
  if (changes.length === 0) {
    return {
      changes,
      reply:
        "I couldn't turn that into a change yet. Try something like “make it more premium”, “add a booking button”, or “train the agent to answer pricing questions”.",
    };
  }

  const agentToo = changes.some((c) => TOUCHES_AGENT.includes(c.kind));
  const reviews = changes.some((c) => c.kind === "section" && c.section === "testimonials" && c.on);
  return {
    changes,
    reply: [
      `Done. ${changes.length === 1 ? "One change" : `${changes.length} changes`} applied${agentToo ? " — your page and agent were updated together" : ""}.`,
      reviews ? "Paste a real review into the testimonials before you publish; I won't write one for you." : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
}

/* ============================================================================
   APPLYING CHANGES — pure, so the editor can put the result on its undo stack
   ========================================================================== */

const mapHome = (doc: PageDocument, fn: (page: ConciergePage) => ConciergePage): PageDocument => {
  const home = doc.pages.find((p) => p.slug === "") ?? doc.pages[0];
  return home ? { ...doc, pages: doc.pages.map((p) => (p === home ? fn(p) : p)) } : doc;
};

type Hero = Extract<PageSection, { kind: "hero" }>;

const mapHero = (doc: PageDocument, fn: (hero: Hero) => Hero): PageDocument =>
  mapHome(doc, (page) => {
    const index = page.sections.findIndex((s) => s.kind === "hero");
    if (index < 0) return page;
    return { ...page, sections: page.sections.map((s, i) => (i === index ? fn(s as Hero) : s)) };
  });

const withAgent = (doc: PageDocument, fn: (agent: PageAgent) => PageAgent): PageDocument => ({
  ...doc,
  agent: fn(agentOf(doc)),
});

/** The first clause of the first sentence: short without being cut mid-phrase. */
const shorten = (text: string): string => {
  const first = text.split(/(?<=[.!?])\s/)[0] ?? text;
  const clause = first.split(/\s[—–-]\s|,\s/)[0] ?? first;
  const trimmed = clause.trim().replace(/[.!?]$/, "");
  return `${trimmed}.`;
};

function applyOne(doc: PageDocument, change: PageChange, siteName: string): PageDocument {
  switch (change.kind) {
    case "style": {
      const look = lookFor(change.style, getTemplate(doc.brief?.templateId ?? "local"));
      const next = mapHero(doc, (hero) => ({
        ...hero,
        style: { ...hero.style, background: look.hero },
      }));
      return {
        ...next,
        theme: { ...next.theme, ...look.theme },
        brief: next.brief ? { ...next.brief, style: change.style } : next.brief,
        agent: { ...agentOf(next), tone: look.tone },
      };
    }

    case "heroLayout":
      return mapHero(doc, (hero) => ({ ...hero, content: { ...hero.content, layout: change.layout } }));

    case "servicesLayout":
    case "galleryLayout": {
      const kind = change.kind === "servicesLayout" ? "services" : "gallery";
      return mapHome(doc, (page) => ({
        ...page,
        sections: page.sections.map((s) =>
          s.kind === kind ? ({ ...s, content: { ...s.content, layout: change.layout } } as PageSection) : s,
        ),
      }));
    }

    case "template": {
      const previous = draftFromDocument(doc, siteName);
      const template = getTemplate(change.templateId);
      /* A different trade: keep who they are and how to reach them, drop the
         old offer so the new template's copy is not written around it. */
      const base: SmartDraft = {
        ...previous,
        brief: {
          ...previous.brief,
          business: { ...previous.brief.business, offer: "", industry: template.industry },
        },
      };
      const draft = draftForTemplate(change.templateId, base, false);
      const kept = previous.agent;
      const rebuilt = buildSmartDocument(
        {
          ...draft,
          logo: previous.logo,
          brief: { ...draft.brief, style: previous.brief.style },
          agent: {
            ...kept,
            tone: draft.agent.tone,
            capabilities: [...new Set([...draft.agent.capabilities, ...kept.capabilities])],
          },
        },
        doc.siteId,
        Object.fromEntries(doc.pages.map((p) => [p.slug, p.id])),
      );
      return rebuilt;
    }

    case "shortenHero":
      return mapHero(doc, (hero) => ({
        ...hero,
        content: {
          ...hero.content,
          headline: hero.content.headline.split(/\s+/).length > 7 ? shorten(hero.content.headline) : hero.content.headline,
          subheadline: shorten(hero.content.subheadline),
        },
      }));

    case "headline":
      return mapHero(doc, (hero) => ({ ...hero, content: { ...hero.content, headline: change.text } }));

    case "secondaryCta": {
      const next = mapHero(doc, (hero) => {
        /* If the main button already books, a second booking button is noise. */
        if (hero.content.cta?.actionId === actionIdFor(doc.siteId, change.capability)) return hero;
        return {
          ...hero,
          content: {
            ...hero.content,
            secondaryCta: { label: change.label, actionId: actionIdFor(doc.siteId, change.capability) },
          },
        };
      });
      return withAgent(next, (a) => withCapability(a, change.capability, true));
    }

    case "promotion":
      return withAgent(doc, (a) => ({ ...a, promotion: change.promotion }));

    case "capability":
      return withAgent(doc, (a) => withCapability(a, change.capability, change.on));

    case "focus": {
      const withFocus = withAgent(doc, (a) => (a.focus.includes(change.topic) ? a : { ...a, focus: [...a.focus, change.topic] }));
      if (change.topic !== "pricing") return withFocus;
      /* The agent answers from the page, so teaching it about pricing means
         putting an answer on the page — one that promises a quote, not a
         number nobody gave us. */
      const faq = {
        id: `q_${crypto.randomUUID().slice(0, 8)}`,
        question: "How much does it cost?",
        answer: "Prices depend on what you need. Ask the assistant for a quote and the team will come back with an exact price.",
      };
      return mapHome(withFocus, (page) => {
        const existing = page.sections.find((s) => s.kind === "faq");
        if (existing?.kind === "faq") {
          if (existing.content.items.some((i) => /cost|price/i.test(i.question))) return page;
          return {
            ...page,
            sections: page.sections.map((s) =>
              s === existing ? { ...existing, enabled: true, content: { ...existing.content, items: [faq, ...existing.content.items] } } : s,
            ),
          };
        }
        const section = createSection("faq");
        if (section.kind !== "faq") return page;
        return insertBeforeContact(page, { ...section, content: { heading: "Common questions", items: [faq] } });
      });
    }

    case "brandColor":
      return { ...doc, theme: { ...doc.theme, brandColor: change.color } };

    case "section":
      return mapHome(doc, (page) => {
        const existing = page.sections.find((s) => s.kind === change.section);
        if (existing) {
          return existing.enabled === change.on
            ? page
            : { ...page, sections: page.sections.map((s) => (s === existing ? { ...s, enabled: change.on } : s)) };
        }
        return change.on ? insertBeforeContact(page, createSection(change.section)) : page;
      });

    case "heroBackground":
      return mapHero(doc, (hero) => ({ ...hero, style: { ...hero.style, background: change.background } }));

    case "tone":
      return withAgent(doc, (a) => ({ ...a, tone: change.tone }));

    case "paymentUrl":
      return withAgent(doc, (a) => ({ ...withCapability(a, "payment", true), paymentUrl: change.url }));
  }
}

const insertBeforeContact = (page: ConciergePage, section: PageSection): ConciergePage => {
  const at = page.sections.findIndex((s) => s.kind === "contact");
  const sections = [...page.sections];
  sections.splice(at < 0 ? sections.length : at, 0, section);
  return { ...page, sections };
};

export function applyChanges(doc: PageDocument, changes: PageChange[], siteName: string): PageDocument {
  if (changes.length === 0) return doc;
  const next = changes.reduce((d, c) => applyOne(d, c, siteName), doc);
  return { ...next, updatedAt: new Date().toISOString() };
}

/* ============================================================================
   DRAFTING A WHOLE PAGE FROM ONE PROMPT
   ========================================================================== */

export interface Drafted {
  doc: PageDocument;
  draft: SmartDraft;
  reply: string;
}

/**
 * `variant` is "ask for another version": the same reading of the prompt,
 * shown in the next style and, where the prompt did not name a trade, the
 * next template that fits the goal.
 */
export function draftFromPrompt(prompt: string, siteId: ID, variant = 0, nameOverride?: string): Drafted {
  const t = prompt.toLowerCase();
  const explicitTemplate = detectTemplate(t);
  const goal = detectGoal(t) ?? (explicitTemplate ? getTemplate(explicitTemplate).goal : "opportunities");
  const goalTemplates = getGoal(goal).templates;
  const templateId = explicitTemplate ?? goalTemplates[variant % goalTemplates.length];
  const template = getTemplate(templateId);

  const base = blankDraft();
  let draft = draftForTemplate(templateId, { ...base, brief: { ...base.brief, goal } });

  const stated = detectStyle(t);
  const firstStyle = stated ?? "signature";
  const style = STYLES[(STYLES.findIndex((s) => s.id === firstStyle) + variant) % STYLES.length].id;

  const name = nameOverride ?? detectName(prompt) ?? "";
  draft = {
    ...draft,
    brief: {
      ...draft.brief,
      style,
      business: {
        name,
        offer: detectOffer(prompt) ?? "",
        industry: template.industry,
        contact: "",
        location: detectLocation(prompt) ?? "",
      },
    },
    agent: { ...draft.agent, tone: lookFor(style, template).tone },
  };

  const doc = buildSmartDocument(draft, siteId);
  /* Everything else the prompt asked for goes through the same interpreter
     the chat uses, so a prompt and a follow-up can never disagree about what
     "add booking" means. */
  const extras = interpret(prompt, doc, displayName(draft.brief.business)).changes.filter(
    (c) => c.kind !== "template" && c.kind !== "style",
  );
  const wantsBooking = /book|appointment|consultation/.test(t) && capabilityForCta(draft.brief.cta, goal) !== "booking";
  if (wantsBooking && !extras.some((c) => c.kind === "secondaryCta")) {
    extras.push({ kind: "secondaryCta", label: bookingLabel(doc), capability: "booking" });
  }
  if (/question|faq|answer/.test(t)) extras.push({ kind: "capability", capability: "answer", on: true });

  const finished = applyChanges(doc, extras, displayName(draft.brief.business));
  const features = [
    "lead capture",
    hasCapability(agentOf(finished), "booking") ? "booking" : null,
    agentOf(finished).promotion ? "a promotion" : null,
  ].filter(Boolean);
  return {
    doc: finished,
    draft,
    reply: `Got it. I'll create a smart page with ${features.join(", ").replace(/, ([^,]*)$/, " and $1")}, and an embedded Concierge agent.`,
  };
}

/* ============================================================================
   THE PLAN — what Concierge says it built, read back off the document
   ========================================================================== */

export interface PlanItem {
  id: "template" | "goal" | "cta" | "agent" | "sections" | "style";
  label: string;
  value: string;
  detail: string;
}

export function planFor(doc: PageDocument): PlanItem[] {
  const brief = doc.brief;
  const template = getTemplate(brief?.templateId ?? "local");
  const goal = getGoal(brief?.goal ?? template.goal);
  const style = getStyle(brief?.style ?? "signature");
  const home = doc.pages.find((p) => p.slug === "") ?? doc.pages[0];
  const hero = home?.sections.find((s): s is Hero => s.kind === "hero");
  const sections = (home?.sections ?? []).filter((s) => s.enabled).map((s) => sectionLabel(s.kind));
  const actions = quickActions(agentOf(doc));

  return [
    { id: "template", label: "Template", value: template.name, detail: template.summary.split(". ")[0] + "." },
    { id: "goal", label: "Goal", value: goal.label, detail: goal.description },
    {
      id: "cta",
      label: "Main button",
      value: [hero?.content.cta?.label, hero?.content.secondaryCta?.label].filter(Boolean).join(" · ") || "None yet",
      detail: "The action every visitor is asked to take.",
    },
    {
      id: "agent",
      label: "Agent actions",
      value: actions.join(", "),
      detail: "Your agent answers, guides and hands off when needed.",
    },
    { id: "sections", label: "Sections", value: sections.join(", "), detail: "Everything needed to build trust and convert." },
    {
      id: "style",
      label: "Style",
      value: style.id === "signature" ? `${template.name}, as designed` : style.label,
      detail: style.id === "signature" ? template.summary.split(". ")[0] + "." : style.hint,
    },
  ];
}
