import { PAGE_DOCUMENT_VERSION, createSection } from "./pages-builder";
import { actionIdFor, DEFAULT_AGENT } from "./page-agent";
import { TEMPLATE_PHOTOS, photo, type TemplatePhotos } from "./stock-photos";
import type {
  AboutLayout,
  AgentCapability,
  BusinessInfo,
  ConciergePage,
  GalleryLayout,
  HeroLayout,
  ID,
  PageAgent,
  PageAgentTone,
  PageBrief,
  PageDocument,
  PageGoal,
  PageSection,
  PageSectionKind,
  PageStylePreset,
  PageTheme,
  SectionBackground,
  ServicesLayout,
  SiteIconRef,
  TestimonialsLayout,
} from "./types";

/* ============================================================================
   SMART TEMPLATES
   ----------------------------------------------------------------------------
   A template decides which sections are on the page, how each one is laid
   out, and how the whole thing looks — typeface, paper, corners, photography.
   What makes it "smart" is that each arrives with the Concierge agent already
   configured for the trade: a main button that opens a real action, and a
   default set of things the agent will do for a visitor.

   The designs are original. They were drawn after studying what makes the
   best template sites work — a full-bleed photograph, a poster headline, an
   editorial split, a warm paper instead of white — not copied from any of
   them. Every photograph is from Unsplash under its free licence (see
   `stock-photos.ts`) and the launch checklist asks the owner to swap them for
   their own.

   The copy is written from what the owner told us — their name, their offer,
   their town — and nothing else. No invented prices, reviews or statistics.
   Where a section needs something only the owner has, like a real review, it
   is generated switched off, waiting for them.
   ========================================================================== */

const newId = (prefix: string): ID => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/* ============================================================================
   GOALS — asked first, because they decide the button and the agent
   ========================================================================== */

export interface GoalDef {
  id: PageGoal;
  label: string;
  description: string;
  /** Best first, used to recommend a template. */
  templates: string[];
  /** Always switched on for this goal. */
  capabilities: AgentCapability[];
}

export const GOALS: GoalDef[] = [
  {
    id: "opportunities",
    label: "Capture more opportunities",
    description: "Turn visitors into leads you can follow up.",
    templates: ["local", "builders", "realestate", "agency"],
    capabilities: ["leads", "answer"],
  },
  {
    id: "customers",
    label: "Win more customers",
    description: "Make the case for your business, then ask for it.",
    templates: ["agency", "saas", "photographer"],
    capabilities: ["leads", "guide"],
  },
  {
    id: "appointments",
    label: "Book appointments",
    description: "Let people ask for a time without a phone call.",
    templates: ["wellness", "salon", "therapy", "coach", "grooming"],
    capabilities: ["booking", "answer"],
  },
  {
    id: "sell",
    label: "Sell a service",
    description: "Show what you offer and take people to checkout.",
    templates: ["atelier", "skincare", "coach", "launch"],
    capabilities: ["leads", "guide", "payment"],
  },
  {
    id: "event",
    label: "Promote an event",
    description: "Build interest and fill the room.",
    templates: ["event", "weddings", "smokehouse"],
    capabilities: ["leads", "promotions", "answer"],
  },
  {
    id: "emails",
    label: "Capture emails",
    description: "Grow a list you can talk to later.",
    templates: ["launch", "skincare", "coach"],
    capabilities: ["leads", "promotions"],
  },
  {
    id: "questions",
    label: "Answer customer questions",
    description: "Let the agent handle the questions you answer every day.",
    templates: ["local", "therapy", "saas", "wellness"],
    capabilities: ["answer", "handoff"],
  },
];

export const getGoal = (id: PageGoal): GoalDef => GOALS.find((g) => g.id === id) ?? GOALS[0];

/* ============================================================================
   LOOKS AND STYLE PRESETS
   ========================================================================== */

/** Everything visual about a site that is not its words or its pictures. */
export interface Look {
  theme: Pick<PageTheme, "fonts" | "radius" | "buttonShape" | "density" | "surface">;
  /** What the first screen of the home page sits on. */
  hero: SectionBackground;
  tone: PageAgentTone;
}

export interface StyleDef {
  id: PageStylePreset;
  label: string;
  hint: string;
  /** Unset for `signature`, which is whatever the template was designed with. */
  look?: Look;
}

/**
 * "As designed" first: each template is a considered look, and the presets are
 * alternatives to it rather than the only choices. A preset changes the look
 * and never the layout, so switching one never moves a photograph.
 */
export const STYLES: StyleDef[] = [
  { id: "signature", label: "As designed", hint: "The template's own look" },
  {
    id: "bold",
    label: "Bold and modern",
    hint: "Heavy type, dark hero",
    look: {
      theme: { fonts: "heavy", surface: "white", radius: "soft", buttonShape: "rounded", density: "regular" },
      hero: "inverse",
      tone: "friendly",
    },
  },
  {
    id: "clean",
    label: "Clean and professional",
    hint: "Light, calm, lots of air",
    look: {
      theme: { fonts: "modern", surface: "white", radius: "soft", buttonShape: "rounded", density: "airy" },
      hero: "default",
      tone: "professional",
    },
  },
  {
    id: "warm",
    label: "Warm and personal",
    hint: "Cream paper, soft serif",
    look: {
      theme: { fonts: "fraunces", surface: "cream", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "subtle",
      tone: "friendly",
    },
  },
  {
    id: "premium",
    label: "Premium and minimal",
    hint: "Garamond, square, quiet",
    look: {
      theme: { fonts: "garamond", surface: "cream", radius: "square", buttonShape: "square", density: "airy" },
      hero: "inverse",
      tone: "premium",
    },
  },
  {
    id: "sales",
    label: "High-converting sales page",
    hint: "Brand hero, one clear ask",
    look: {
      theme: { fonts: "heavy", surface: "white", radius: "soft", buttonShape: "pill", density: "tight" },
      hero: "brand",
      tone: "friendly",
    },
  },
];

export const getStyle = (id: PageStylePreset): StyleDef => STYLES.find((s) => s.id === id) ?? STYLES[0];

/** The look a style produces on a template. `signature` is the template's own. */
export const lookFor = (style: PageStylePreset, template: SmartTemplate): Look =>
  getStyle(style).look ?? template.look;

/* ============================================================================
   THE TEMPLATES
   ========================================================================== */

interface ServiceSeed {
  name: string;
  description: string;
  icon: SiteIconRef;
}

export type TemplateCategory = "Local services" | "Food & drink" | "Beauty & wellness" | "Creative" | "Business & tech" | "Events & stays";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Local services",
  "Food & drink",
  "Beauty & wellness",
  "Creative",
  "Business & tech",
  "Events & stays",
];

export interface SmartTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  /** Above the headline, before the location: "Local experts". */
  eyebrow: string;
  /** "Best for …" — the one line that does most of the choosing. */
  bestFor: string;
  /** Why an owner would pick it, in a sentence or two. */
  summary: string;
  includes: string[];
  industry: string;
  goal: PageGoal;
  brandColor: string;
  look: Look;
  layouts: {
    hero: HeroLayout;
    services: ServicesLayout;
    about: AboutLayout;
    gallery: GalleryLayout;
    testimonials: TestimonialsLayout;
  };
  cta: string;
  secondaryCta: string;
  capabilities: AgentCapability[];
  sections: PageSectionKind[];
  /** A believable business, used only to preview the template before the owner's own. */
  sample: BusinessInfo;
  headline: (b: BusinessInfo) => string;
  subheadline: (b: BusinessInfo) => string;
  servicesHeading: string;
  services: ServiceSeed[];
  highlights: string[];
  faq: { question: string; answer: string }[];
  galleryHeading: string;
  gallery: string[];
  /** The last ask, above the contact details. */
  closing: { heading: string; body: string };
}

/** A name as it reads mid-sentence: "Vows & Co." must not end up "Co..". */
const bare = (name: string) => name.trim().replace(/[.!?]+$/, "");
/** " in Austin", " online", or nothing — never "in Online". */
const where = (b: BusinessInfo) => {
  const place = b.location.trim();
  if (!place) return "";
  return /^(online|remote|worldwide|everywhere)$/i.test(place) ? ` ${place.toLowerCase()}` : ` in ${place}`;
};
const lowerFirst = (text: string) => (text ? text[0].toLowerCase() + text.slice(1) : text);
const sentence = (text: string) => {
  const t = text.trim();
  return t.length === 0 ? t : /[.!?]$/.test(t) ? t : `${t}.`;
};
/**
 * The owner's offer where it says enough on its own. "Landscaping" alone is a
 * label, not a sentence, so a short offer leads into the template's line
 * instead of replacing it.
 */
const offerOr = (b: BusinessInfo, fallback: string) => {
  const offer = b.offer.trim();
  if (!offer) return fallback;
  if (offer.split(/\s+/).length >= 3) return offer;
  if (fallback.toLowerCase().includes(offer.toLowerCase())) return fallback;
  return `${offer} — ${lowerFirst(fallback)}`;
};

/* The usual order. Testimonials are generated switched off; see `sectionFor`. */
const FULL: PageSectionKind[] = ["hero", "services", "about", "gallery", "testimonials", "faq", "cta", "contact"];

export const TEMPLATES: SmartTemplate[] = [
  /* ---- Local services ------------------------------------------------------ */
  {
    id: "local",
    name: "Local Service",
    category: "Local services",
    eyebrow: "Local experts",
    bestFor: "Best for quote requests",
    summary:
      "For work that happens at the customer's address. A full-screen photograph, the services with pictures, and a quote request everywhere.",
    includes: ["Quote requests", "Service area", "Photo services", "Agent answers and routes"],
    industry: "Home services",
    goal: "opportunities",
    brandColor: "#2F6B3B",
    look: {
      theme: { fonts: "modern", surface: "white", radius: "soft", buttonShape: "rounded", density: "regular" },
      hero: "inverse",
      tone: "friendly",
    },
    layouts: { hero: "cover", services: "photo", about: "classic", gallery: "mosaic", testimonials: "cards" },
    cta: "Get a free quote",
    secondaryCta: "View our work",
    capabilities: ["answer", "guide", "leads", "handoff"],
    sections: FULL,
    sample: {
      name: "Oak & Ember Landscaping",
      offer: "Landscaping, lawn care and outdoor living spaces",
      industry: "Home services",
      contact: "(555) 321-9876",
      location: "Austin, Texas",
    },
    headline: (b) => {
      const first = b.offer.split(/,| and /)[0]?.trim();
      return first ? `${first[0].toUpperCase()}${first.slice(1)} done right.` : "Local experts. Honest work.";
    },
    subheadline: (b) => sentence(`${offerOr(b, "Quality work from a local team")}${where(b)}`),
    servicesHeading: "Our services",
    services: [
      { name: "Design and installation", description: "Planned with you, priced up front, finished on schedule.", icon: "home" },
      { name: "Regular maintenance", description: "Visits that keep everything looking and working its best.", icon: "shield" },
      { name: "Repairs", description: "Small jobs done properly, first time.", icon: "wrench" },
    ],
    highlights: ["Local and family run", "Clear quotes before we start"],
    faq: [{ question: "Do you give free quotes?", answer: "Yes — tell us about the job and we'll come back with a quote." }],
    galleryHeading: "Recent work",
    gallery: ["A recent project", "Planting season", "Outdoor living"],
    closing: { heading: "Let's plan your project", body: "Tell us what you have in mind and we'll come back with a clear quote." },
  },
  {
    id: "builders",
    name: "Builders",
    category: "Local services",
    eyebrow: "Build · Renovate · Repair",
    bestFor: "Best for construction leads",
    summary: "A confident poster headline on the brand colour, the work in pictures, and a quote request that never leaves the page.",
    includes: ["Quote requests", "Project gallery", "Services in detail", "Agent qualifies jobs"],
    industry: "Construction",
    goal: "opportunities",
    brandColor: "#2641A8",
    look: {
      theme: { fonts: "heavy", surface: "white", radius: "square", buttonShape: "square", density: "regular" },
      hero: "brand",
      tone: "professional",
    },
    layouts: { hero: "poster", services: "rows", about: "classic", gallery: "grid", testimonials: "cards" },
    cta: "Get a free quote",
    secondaryCta: "See our projects",
    capabilities: ["answer", "guide", "leads", "handoff"],
    sections: FULL,
    sample: { name: "Ridgeline Builders", offer: "New homes, extensions and roofing", industry: "Construction", contact: "(555) 640-1180", location: "Denver" },
    headline: () => "New homes. Built to last.",
    subheadline: (b) => sentence(`${offerOr(b, "Construction and renovation from a team that shows up")}${where(b)}`),
    servicesHeading: "What we build",
    services: [
      { name: "New builds", description: "From the first sketch to handing over the keys.", icon: "building" },
      { name: "Roofing", description: "Replacements and repairs, done safely and properly.", icon: "home" },
      { name: "Renovations", description: "Kitchens, extensions and the rooms you have outgrown.", icon: "wrench" },
    ],
    highlights: ["Licensed and insured", "One project manager, start to finish"],
    faq: [{ question: "How soon can you start?", answer: "Tell us about the project and we'll give you honest dates with the quote." }],
    galleryHeading: "Recent projects",
    gallery: ["Framing a new home", "Roof replacement", "Topping out"],
    closing: { heading: "Got a project in mind?", body: "Send us the details and we'll come back with a clear, written quote." },
  },
  {
    id: "realestate",
    name: "Real Estate",
    category: "Local services",
    eyebrow: "Local property experts",
    bestFor: "Best for buyer and seller leads",
    summary: "The house is the hero. Captures buyers and sellers, and lets the agent answer questions about areas and next steps.",
    includes: ["Buyer and seller capture", "Listings gallery", "Valuation requests", "Agent answers search questions"],
    industry: "Real estate",
    goal: "opportunities",
    brandColor: "#1F3A5F",
    look: {
      theme: { fonts: "modern", surface: "mist", radius: "soft", buttonShape: "rounded", density: "regular" },
      hero: "inverse",
      tone: "professional",
    },
    layouts: { hero: "cover", services: "photo", about: "classic", gallery: "mosaic", testimonials: "cards" },
    cta: "Book a viewing",
    secondaryCta: "Get a home valuation",
    capabilities: ["answer", "guide", "leads", "handoff"],
    sections: FULL,
    sample: { name: "Harbor & Main Realty", offer: "Buying, selling and letting homes", industry: "Real estate", contact: "(555) 210-4400", location: "Portland" },
    headline: (b) => `Find your place${b.location.trim() ? ` in ${b.location.trim()}` : ""}.`,
    subheadline: (b) => sentence(`${offerOr(b, "Buying, selling and letting homes")} — with a local team that picks up the phone`),
    servicesHeading: "How we help",
    services: [
      { name: "Buying", description: "Find the right home and make an offer with confidence.", icon: "key" },
      { name: "Selling", description: "Price it well, present it well, and sell it well.", icon: "home" },
      { name: "Valuations", description: "An honest view of what your home is worth today.", icon: "building" },
    ],
    highlights: ["Local market knowledge", "One agent from first viewing to keys"],
    faq: [{ question: "Can you value my home?", answer: "Yes — ask for a valuation and we'll arrange a visit." }],
    galleryHeading: "Recent listings",
    gallery: ["A family home", "Light-filled living", "A recent sale"],
    closing: { heading: "Thinking of moving?", body: "Book a viewing or ask for a valuation — we'll take it from there." },
  },
  {
    id: "grooming",
    name: "Pet Grooming",
    category: "Local services",
    eyebrow: "Grooming · Spa · Care",
    bestFor: "Best for bookings",
    summary: "Cheerful and bright. A big photo beside a sunny panel, services with pictures, and booking one tap away.",
    includes: ["Appointment booking", "Services with photos", "Happy-pet gallery", "Agent answers care questions"],
    industry: "Pets",
    goal: "appointments",
    brandColor: "#F2C94C",
    look: {
      theme: { fonts: "modern", surface: "white", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "brand",
      tone: "friendly",
    },
    layouts: { hero: "split", services: "photo", about: "classic", gallery: "mosaic", testimonials: "cards" },
    cta: "Book a groom",
    secondaryCta: "Our services",
    capabilities: ["answer", "booking", "handoff"],
    sections: FULL,
    sample: { name: "Happy Tails Grooming", offer: "Grooming, baths and nail care for dogs", industry: "Pets", contact: "(555) 288-7310", location: "San Diego" },
    headline: () => "Clean, calm and very good dogs.",
    subheadline: (b) => sentence(`${offerOr(b, "Gentle grooming for every breed")}${where(b)}`),
    servicesHeading: "Services",
    services: [
      { name: "Full groom", description: "Bath, cut, dry and a tidy finish.", icon: "scissors" },
      { name: "Bath and brush", description: "Fresh and fluffy between full grooms.", icon: "sparkle" },
      { name: "Puppy intro", description: "A gentle first visit to build confidence.", icon: "paw" },
    ],
    highlights: ["Calm, one-to-one appointments", "Every breed welcome"],
    faq: [{ question: "How long does a groom take?", answer: "Most take two to three hours, depending on the breed and coat." }],
    galleryHeading: "Fresh from the salon",
    gallery: ["After the bath", "Looking sharp", "Best friends", "All done"],
    closing: { heading: "Time for a fresh look?", body: "Book a groom in a minute — we'll confirm the time with you." },
  },

  /* ---- Food & drink ------------------------------------------------------ */
  {
    id: "restaurant",
    name: "Restaurant",
    category: "Food & drink",
    eyebrow: "Kitchen & table",
    bestFor: "Best for reservations",
    summary: "Appetite first. An editorial split on warm charcoal, the menu in pictures, and a reservation button that never leaves the screen.",
    includes: ["Reservations", "Menu highlights", "Promotions", "Agent answers menu questions"],
    industry: "Restaurant",
    goal: "appointments",
    brandColor: "#B5552B",
    look: {
      theme: { fonts: "garamond", surface: "charcoal", radius: "square", buttonShape: "square", density: "regular" },
      hero: "default",
      tone: "premium",
    },
    layouts: { hero: "editorial", services: "rows", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Reserve a table",
    secondaryCta: "See the menu",
    capabilities: ["answer", "booking", "promotions", "contact"],
    sections: ["hero", "about", "services", "gallery", "testimonials", "faq", "cta", "contact"],
    sample: { name: "Olive & Ember", offer: "Wood-fired Mediterranean kitchen", industry: "Restaurant", contact: "(555) 332-0199", location: "Austin" },
    headline: () => "Fire, bread and good company.",
    subheadline: (b) => sentence(`${offerOr(b, "Seasonal food, made with care")}${where(b)}`),
    servicesHeading: "On the menu",
    services: [
      { name: "Small plates", description: "Made for sharing, and for ordering one more of.", icon: "coffee" },
      { name: "From the grill", description: "Whatever is best this week, cooked over the fire.", icon: "star" },
      { name: "Private dining", description: "A room of your own for the occasion.", icon: "gift" },
    ],
    highlights: ["Seasonal menu", "Walk-ins welcome"],
    faq: [{ question: "Do you cater for dietary needs?", answer: "Tell us when you book and the kitchen will look after you." }],
    galleryHeading: "From the kitchen",
    gallery: ["Straight from the oven", "To share", "Dessert"],
    closing: { heading: "Pull up a chair", body: "Reserve a table tonight, or ask us about a private evening." },
  },
  {
    id: "smokehouse",
    name: "Smokehouse",
    category: "Food & drink",
    eyebrow: "Low · Slow · Smoked",
    bestFor: "Best for orders and tables",
    summary: "Loud and hungry. A poster headline on the brand colour, big food photography, and the menu down the page.",
    includes: ["Table bookings", "Menu in pictures", "Promotions", "Agent answers opening hours"],
    industry: "Restaurant",
    goal: "event",
    brandColor: "#D9481C",
    look: {
      theme: { fonts: "poster", surface: "cream", radius: "soft", buttonShape: "pill", density: "regular" },
      hero: "brand",
      tone: "friendly",
    },
    layouts: { hero: "poster", services: "rows", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Book a table",
    secondaryCta: "See the menu",
    capabilities: ["answer", "booking", "promotions", "contact"],
    sections: FULL,
    sample: { name: "Hickory Street BBQ", offer: "Texas-style barbecue, smoked daily", industry: "Restaurant", contact: "(555) 402-7722", location: "Kansas City" },
    headline: () => "Smoke is our love language.",
    subheadline: (b) => sentence(`${offerOr(b, "Barbecue smoked low and slow, every single day")}${where(b)}`),
    servicesHeading: "From the pit",
    services: [
      { name: "Ribs", description: "Smoked for hours, sticky at the edges.", icon: "star" },
      { name: "Brisket", description: "Sliced to order until it's gone.", icon: "heart" },
      { name: "Sides and sauces", description: "The supporting cast, made in house.", icon: "coffee" },
    ],
    highlights: ["Smoked fresh daily", "Until it sells out"],
    faq: [{ question: "Do you do catering?", answer: "Yes — ask the assistant for catering and the team will get back to you." }],
    galleryHeading: "Fresh off the smoker",
    gallery: ["On the grill", "Ribs, sliced", "Fire"],
    closing: { heading: "Hungry yet?", body: "Book a table before it sells out — the brisket always goes first." },
  },

  /* ---- Beauty & wellness ------------------------------------------------- */
  {
    id: "wellness",
    name: "Wellness",
    category: "Beauty & wellness",
    eyebrow: "Wellness & care",
    bestFor: "Best for appointments",
    summary: "Calm and reassuring, on soft sage. A full-screen photograph, treatments in pictures, and booking up front.",
    includes: ["Appointment booking", "Treatments explained", "Human handoff", "Agent answers FAQs"],
    industry: "Health and wellness",
    goal: "appointments",
    brandColor: "#4E6B57",
    look: {
      theme: { fonts: "garamond", surface: "sage", radius: "soft", buttonShape: "pill", density: "airy" },
      hero: "inverse",
      tone: "premium",
    },
    layouts: { hero: "cover", services: "photo", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Book an appointment",
    secondaryCta: "Explore treatments",
    capabilities: ["answer", "booking", "handoff"],
    sections: FULL,
    sample: { name: "Willow & Bloom", offer: "Massage, facials and holistic care", industry: "Health and wellness", contact: "(555) 481-2210", location: "Denver" },
    headline: () => "A calmer, brighter you.",
    subheadline: (b) => sentence(`${offerOr(b, "Personal care designed around you")}${where(b)}`),
    servicesHeading: "Treatments",
    services: [
      { name: "Massage", description: "Relieve tension and reset.", icon: "heart" },
      { name: "Facials", description: "Skin care tailored to you.", icon: "sparkle" },
      { name: "Rituals", description: "Longer sessions for a proper pause.", icon: "leaf" },
    ],
    highlights: ["Qualified practitioners", "Evening appointments"],
    faq: [{ question: "Is this my first visit — what should I expect?", answer: "We start with a short conversation about what you need, then tailor the session to you." }],
    galleryHeading: "The space",
    gallery: ["Quiet rooms", "Treatment", "Light and calm"],
    closing: { heading: "Make time for yourself", body: "Book a treatment, or ask the assistant which one suits you." },
  },
  {
    id: "salon",
    name: "Salon",
    category: "Beauty & wellness",
    eyebrow: "Hair · Colour · Care",
    bestFor: "Best for bookings",
    summary: "Warm terracotta, a photograph in an arch, and services that sell themselves in pictures.",
    includes: ["Online booking", "Services with photos", "Look book", "Agent helps choose"],
    industry: "Beauty",
    goal: "appointments",
    brandColor: "#A5502E",
    look: {
      theme: { fonts: "fraunces", surface: "cream", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "brand",
      tone: "friendly",
    },
    layouts: { hero: "arch", services: "photo", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Book an appointment",
    secondaryCta: "Services and prices",
    capabilities: ["answer", "guide", "booking", "handoff"],
    sections: FULL,
    sample: { name: "Maison Salon", offer: "Cuts, colour and styling", industry: "Beauty", contact: "(555) 377-0160", location: "Chicago" },
    headline: (b) => `Welcome to ${bare(b.name) || "the salon"}.`,
    subheadline: (b) => sentence(`${offerOr(b, "Cuts, colour and care from people who listen")}${where(b)}`),
    servicesHeading: "Services",
    services: [
      { name: "Colour", description: "From a gloss to a whole new shade.", icon: "brush" },
      { name: "Cut and finish", description: "A cut that grows out as well as it starts.", icon: "scissors" },
      { name: "Styling", description: "For the big day, or just because.", icon: "sparkle" },
    ],
    highlights: ["Consultation with every visit", "Products we'd use ourselves"],
    faq: [{ question: "Do I need a consultation for colour?", answer: "For big changes, yes — book one and we'll plan it together." }],
    galleryHeading: "Recent looks",
    gallery: ["Soft waves", "Fresh cut", "The salon"],
    closing: { heading: "Your chair is waiting", body: "Book online in a minute, or ask the assistant which service is right." },
  },
  {
    id: "atelier",
    name: "Beauty Academy",
    category: "Beauty & wellness",
    eyebrow: "Courses & certification",
    bestFor: "Best for course sign-ups",
    summary: "Editorial and dramatic. A photo half and a charcoal half with the headline across both, then courses in pictures.",
    includes: ["Course enquiries", "Editorial hero", "Course cards", "Agent helps choose a course"],
    industry: "Beauty",
    goal: "sell",
    brandColor: "#6E6A2F",
    look: {
      theme: { fonts: "garamond", surface: "cream", radius: "square", buttonShape: "square", density: "regular" },
      hero: "inverse",
      tone: "premium",
    },
    layouts: { hero: "editorial", services: "photo", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Explore courses",
    secondaryCta: "Talk to us",
    capabilities: ["answer", "guide", "leads", "payment"],
    sections: ["hero", "about", "services", "gallery", "testimonials", "faq", "cta", "contact"],
    sample: { name: "Kira Studio", offer: "Make-up courses and certification", industry: "Beauty", contact: "hello@kirastudio.co", location: "Online" },
    headline: () => "Make-up for humans.",
    subheadline: (b) => sentence(offerOr(b, "Courses that take you from curious to certified")),
    servicesHeading: "Courses for every artist",
    services: [
      { name: "Foundations", description: "Skin, tools and technique, from the beginning.", icon: "brush" },
      { name: "Editorial", description: "Colour, texture and looks for the camera.", icon: "camera" },
      { name: "Pro certification", description: "Build a portfolio and go professional.", icon: "star" },
    ],
    highlights: ["Learn at your own pace", "Feedback from working artists"],
    faq: [{ question: "Do I need experience?", answer: "No — Foundations starts from the very beginning." }],
    galleryHeading: "Student work",
    gallery: ["Colour study", "Detail", "Portrait", "The kit"],
    closing: { heading: "Start your journey", body: "Find the course that fits, or ask the assistant to help you choose." },
  },
  {
    id: "skincare",
    name: "Skincare Brand",
    category: "Beauty & wellness",
    eyebrow: "Clean skincare",
    bestFor: "Best for launches and lists",
    summary: "A bold beauty brand page. A full-screen portrait, products in pictures, and a list worth joining.",
    includes: ["Email capture", "Launch offer", "Product cards", "Agent answers ingredient questions"],
    industry: "Beauty",
    goal: "sell",
    brandColor: "#8E1E3C",
    look: {
      theme: { fonts: "heavy", surface: "blush", radius: "soft", buttonShape: "pill", density: "regular" },
      hero: "inverse",
      tone: "friendly",
    },
    layouts: { hero: "cover", services: "photo", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Shop the collection",
    secondaryCta: "Our ingredients",
    capabilities: ["answer", "guide", "leads", "promotions", "payment"],
    sections: FULL,
    sample: { name: "Glow Theory", offer: "Clean, fragrance-free skincare", industry: "Beauty", contact: "hello@glowtheory.co", location: "" },
    headline: () => "The skincare revolution is here.",
    subheadline: (b) => sentence(offerOr(b, "Simple formulas that do what they say")),
    servicesHeading: "The collection",
    services: [
      { name: "Cleanse", description: "Gentle enough for every day.", icon: "sparkle" },
      { name: "Treat", description: "Serums that target one thing, well.", icon: "star" },
      { name: "Hydrate", description: "Moisture that lasts all day.", icon: "heart" },
    ],
    highlights: ["Fragrance-free", "Made in small batches"],
    faq: [{ question: "Is it suitable for sensitive skin?", answer: "Ask the assistant about your skin and it will point you to the right product." }],
    galleryHeading: "In the wild",
    gallery: ["Morning routine", "The range", "Glow"],
    closing: { heading: "Your skin, simplified", body: "Join the list for early access and the launch offer." },
  },
  {
    id: "athletics",
    name: "Fitness Coach",
    category: "Beauty & wellness",
    eyebrow: "Train · Recover · Repeat",
    bestFor: "Best for sign-ups",
    summary: "High energy. A full-screen action shot with a poster headline, programmes in pictures, and a big sign-up button.",
    includes: ["Class and session booking", "Programmes", "Promotions", "Agent answers membership questions"],
    industry: "Fitness",
    goal: "appointments",
    brandColor: "#D4F53C",
    look: {
      theme: { fonts: "poster", surface: "white", radius: "square", buttonShape: "square", density: "regular" },
      hero: "inverse",
      tone: "friendly",
    },
    layouts: { hero: "cover", services: "photo", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Start training",
    secondaryCta: "See programmes",
    capabilities: ["answer", "guide", "booking", "promotions"],
    sections: FULL,
    sample: { name: "Stride Athletics", offer: "Personal training and strength programmes", industry: "Fitness", contact: "(555) 919-4100", location: "Miami" },
    headline: () => "It doesn't get easier. You get better.",
    subheadline: (b) => sentence(`${offerOr(b, "Coaching that meets you where you are")}${where(b)}`),
    servicesHeading: "Programmes",
    services: [
      { name: "1:1 training", description: "A plan built around you, adjusted every week.", icon: "users" },
      { name: "Strength", description: "Lift well, move better, feel stronger.", icon: "star" },
      { name: "Conditioning", description: "Engine work for sport and for life.", icon: "heart" },
    ],
    highlights: ["All levels welcome", "Progress you can measure"],
    faq: [{ question: "I'm a beginner — is this for me?", answer: "Yes. Every programme starts from where you are today." }],
    galleryHeading: "On the floor",
    gallery: ["Track day", "Kit", "Every rep"],
    closing: { heading: "Your first session starts here", body: "Book a session, or ask the assistant which programme fits." },
  },
  {
    id: "therapy",
    name: "Therapy Practice",
    category: "Beauty & wellness",
    eyebrow: "Counselling & therapy",
    bestFor: "Best for consultations",
    summary: "Quiet and trustworthy. Words on a soft panel beside a calm photograph, and a gentle way to take the first step.",
    includes: ["Consultation booking", "Approach explained", "Human handoff", "Agent answers first questions"],
    industry: "Therapy",
    goal: "appointments",
    brandColor: "#4E6B57",
    look: {
      theme: { fonts: "fraunces", surface: "sage", radius: "round", buttonShape: "pill", density: "airy" },
      hero: "subtle",
      tone: "professional",
    },
    layouts: { hero: "split", services: "list", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Book a consultation",
    secondaryCta: "How it works",
    capabilities: ["answer", "booking", "handoff", "contact"],
    sections: FULL,
    sample: { name: "Stillwater Therapy", offer: "Individual and couples therapy", industry: "Therapy", contact: "(555) 612-3300", location: "Seattle" },
    headline: () => "Your path to feeling better starts here.",
    subheadline: (b) => sentence(`${offerOr(b, "Compassionate, practical support, in person or online")}${where(b)}`),
    servicesHeading: "How we can help",
    services: [
      { name: "Individual therapy", description: "A space to work through what matters to you.", icon: "chat" },
      { name: "Couples therapy", description: "Better conversations, and a way forward together.", icon: "heart" },
      { name: "Online sessions", description: "The same care, from wherever you are.", icon: "home" },
    ],
    highlights: ["Confidential and unhurried", "In person or online"],
    faq: [{ question: "What happens in the first session?", answer: "We talk about what brought you here and whether we're the right fit — no pressure." }],
    galleryHeading: "A calm place to talk",
    gallery: ["The room", "Take your time", "Light", "Reflection"],
    closing: { heading: "Take the first step", body: "Book a free consultation, or ask the assistant anything first." },
  },

  /* ---- Creative ------------------------------------------------------------ */
  {
    id: "agency",
    name: "Agency",
    category: "Creative",
    eyebrow: "Strategy · Design · Growth",
    bestFor: "Best for getting leads",
    summary: "Confident and work-first. A poster headline over the studio, services as an index, and the work in a mosaic.",
    includes: ["Lead capture", "Work showcase", "Services index", "Agent qualifies enquiries"],
    industry: "Agency and studio",
    goal: "opportunities",
    brandColor: "#111111",
    look: {
      theme: { fonts: "heavy", surface: "white", radius: "square", buttonShape: "square", density: "regular" },
      hero: "default",
      tone: "professional",
    },
    layouts: { hero: "poster", services: "list", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Book a strategy call",
    secondaryCta: "See our work",
    capabilities: ["answer", "guide", "leads", "handoff"],
    sections: FULL,
    sample: { name: "Northline Studio", offer: "Brand, web and growth for ambitious companies", industry: "Agency and studio", contact: "hello@northline.studio", location: "Brooklyn" },
    headline: () => "Big ideas. Real results.",
    subheadline: (b) => sentence(`${offerOr(b, "Strategy, design and growth for ambitious brands")}${where(b)}`),
    servicesHeading: "What we do",
    services: [
      { name: "Strategy", description: "Positioning, research and a plan everyone can act on.", icon: "briefcase" },
      { name: "Design", description: "Brands and websites that look like they mean it.", icon: "brush" },
      { name: "Growth", description: "Campaigns and automation that keep the pipeline full.", icon: "sparkle" },
    ],
    highlights: ["Senior people on every project", "Clear scope before we start"],
    faq: [{ question: "What kind of projects do you take on?", answer: "Brand, web and growth work — ask the assistant about yours and it will point you to the right team." }],
    galleryHeading: "Selected work",
    gallery: ["Studio", "Brand system", "Launch"],
    closing: { heading: "Have a project in mind?", body: "Book a call and we'll tell you honestly whether we're the right fit." },
  },
  {
    id: "photographer",
    name: "Photographer",
    category: "Creative",
    eyebrow: "Photography & art direction",
    bestFor: "Best for bookings",
    summary: "Portfolio-first on blush paper. Your name set large beside a portrait, the work in a mosaic, and a booking form that feels personal.",
    includes: ["Shoot enquiries", "Portfolio mosaic", "Services index", "Agent answers availability"],
    industry: "Photography",
    goal: "customers",
    brandColor: "#3B2E4F",
    look: {
      theme: { fonts: "garamond", surface: "blush", radius: "square", buttonShape: "pill", density: "regular" },
      hero: "subtle",
      tone: "friendly",
    },
    layouts: { hero: "split", services: "list", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Book a shoot",
    secondaryCta: "See the portfolio",
    capabilities: ["answer", "guide", "booking", "leads"],
    sections: ["hero", "gallery", "about", "services", "testimonials", "faq", "cta", "contact"],
    sample: { name: "Lena Marsh", offer: "Portrait, wedding and brand photography", industry: "Photography", contact: "studio@lenamarsh.com", location: "New York" },
    headline: (b) => b.name.trim() || "Your name, set large.",
    subheadline: (b) => sentence(`${offerOr(b, "Portraits and stories, honestly told")}${where(b)}`),
    servicesHeading: "Commissions",
    services: [
      { name: "Portraits", description: "For people, and for the brands they build.", icon: "camera" },
      { name: "Weddings", description: "The whole day, told as it happened.", icon: "heart" },
      { name: "Editorial", description: "Art direction and photography for print and web.", icon: "star" },
    ],
    highlights: ["Film and digital", "Available to travel"],
    faq: [{ question: "How far ahead should I book?", answer: "Ask the assistant for your date and it will check availability." }],
    galleryHeading: "Selected work",
    gallery: ["Portrait", "In the studio", "Quiet moments", "Behind the lens"],
    closing: { heading: "Let's make something", body: "Tell me about your shoot, and I'll come back with ideas and dates." },
  },
  {
    id: "florist",
    name: "Florist",
    category: "Creative",
    eyebrow: "Flowers · Events · Delivery",
    bestFor: "Best for orders",
    summary: "Soft and romantic. A photograph in an arch on blush, bouquets in pictures, and ordering one tap away.",
    includes: ["Order enquiries", "Bouquets with photos", "Event flowers", "Agent answers delivery questions"],
    industry: "Florist",
    goal: "sell",
    brandColor: "#9C3D54",
    look: {
      theme: { fonts: "fraunces", surface: "blush", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "subtle",
      tone: "friendly",
    },
    layouts: { hero: "arch", services: "photo", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Order flowers",
    secondaryCta: "Event flowers",
    capabilities: ["answer", "guide", "leads", "payment"],
    sections: FULL,
    sample: { name: "Petal & Stem", offer: "Seasonal bouquets and event flowers", industry: "Florist", contact: "(555) 504-8811", location: "Charleston" },
    headline: () => "Flowers for every season.",
    subheadline: (b) => sentence(`${offerOr(b, "Seasonal bouquets, arranged by hand")}${where(b)}`),
    servicesHeading: "Our flowers",
    services: [
      { name: "Bouquets", description: "Seasonal, hand-tied, ready to give.", icon: "leaf" },
      { name: "Events", description: "Weddings, dinners and the days that matter.", icon: "gift" },
      { name: "Subscriptions", description: "Fresh flowers every week or month.", icon: "calendar" },
    ],
    highlights: ["Arranged by hand", "Local delivery"],
    faq: [{ question: "Do you deliver?", answer: "Yes — ask the assistant for your area and delivery times." }],
    galleryHeading: "In the shop",
    gallery: ["The shop", "Seasonal colour", "Fresh in", "To give"],
    closing: { heading: "Send something beautiful", body: "Order a bouquet, or tell us about your event." },
  },

  /* ---- Business & tech -------------------------------------------------- */
  {
    id: "coach",
    name: "Creator + Coach",
    category: "Business & tech",
    eyebrow: "Coaching",
    bestFor: "Best for booking calls",
    summary: "Personal and warm. Your portrait in an arch on cream, your story as a statement, and booking a first call made effortless.",
    includes: ["Booking built in", "Your story up front", "Programmes explained", "Agent helps people choose"],
    industry: "Coaching",
    goal: "appointments",
    brandColor: "#B4532A",
    look: {
      theme: { fonts: "fraunces", surface: "cream", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "subtle",
      tone: "friendly",
    },
    layouts: { hero: "arch", services: "photo", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Book a free intro call",
    secondaryCta: "How I work",
    capabilities: ["answer", "guide", "booking", "leads"],
    sections: ["hero", "about", "services", "testimonials", "faq", "cta", "contact"],
    sample: { name: "Maya Brooks Coaching", offer: "Career and confidence coaching for women in tech", industry: "Coaching", contact: "maya@mayabrooks.co", location: "Online" },
    headline: () => "Turn your knowledge into momentum.",
    subheadline: (b) => sentence(offerOr(b, "Coaching that fits your life and moves you forward")),
    servicesHeading: "Ways to work together",
    services: [
      { name: "1:1 coaching", description: "Focused sessions built around your goals.", icon: "users" },
      { name: "Group programme", description: "Learn alongside people on the same path.", icon: "chat" },
      { name: "Intro call", description: "A short call to see whether we are a fit.", icon: "calendar" },
    ],
    highlights: ["Sessions online or in person", "A plan you can keep"],
    faq: [{ question: "How does the first call work?", answer: "It's a short conversation to understand where you are and whether coaching is the right next step." }],
    galleryHeading: "Behind the work",
    gallery: ["Planning", "Quiet focus", "Notes"],
    closing: { heading: "Ready for your next chapter?", body: "Book a free intro call — no pressure, just a conversation." },
  },
  {
    id: "saas",
    name: "SaaS",
    category: "Business & tech",
    eyebrow: "Software for modern teams",
    bestFor: "Best for demo requests",
    summary: "Crisp product storytelling. A centred headline over the product in use, features down the page, and a clear path to a demo.",
    includes: ["Demo requests", "Feature rows", "Product FAQ", "Agent qualifies leads"],
    industry: "Software",
    goal: "customers",
    brandColor: "#4F46E5",
    look: {
      theme: { fonts: "modern", surface: "white", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "default",
      tone: "professional",
    },
    layouts: { hero: "centered", services: "rows", about: "classic", gallery: "grid", testimonials: "quote" },
    cta: "Book a demo",
    secondaryCta: "See how it works",
    capabilities: ["answer", "guide", "leads", "handoff"],
    sections: ["hero", "services", "about", "testimonials", "faq", "cta", "contact"],
    sample: { name: "Relay", offer: "Scheduling software for field teams", industry: "Software", contact: "sales@relay.app", location: "" },
    headline: () => "The faster way to grow.",
    subheadline: (b) => sentence(`${bare(b.name) || "Our platform"} — ${lowerFirst(offerOr(b, "all-in-one tools for modern teams"))}`),
    servicesHeading: "Everything you need",
    services: [
      { name: "See everything", description: "Every job, every person, one live view.", icon: "star" },
      { name: "Automate the busywork", description: "Take the repetitive work off your team's plate.", icon: "sparkle" },
      { name: "Work together", description: "Everyone on the same page, in real time.", icon: "users" },
    ],
    highlights: ["Set up in an afternoon", "Support from real people"],
    faq: [{ question: "Is there a free trial?", answer: "Book a demo and we'll set you up with the right plan for your team." }],
    galleryHeading: "In use",
    gallery: ["The team", "Dashboard", "Planning"],
    closing: { heading: "See it with your own work", body: "Book a demo and we'll set it up around how your team already works." },
  },
  {
    id: "launch",
    name: "Product Launch",
    category: "Business & tech",
    eyebrow: "Launching soon",
    bestFor: "Best for waitlists and pre-orders",
    summary: "One product, one page, one ask. A centred headline over the product, features down the page, and a list worth joining.",
    includes: ["Waitlist capture", "Launch offer", "Feature rows", "Agent answers product questions"],
    industry: "Consumer product",
    goal: "emails",
    brandColor: "#0F172A",
    look: {
      theme: { fonts: "modern", surface: "mist", radius: "round", buttonShape: "pill", density: "regular" },
      hero: "default",
      tone: "friendly",
    },
    layouts: { hero: "centered", services: "rows", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Join the waitlist",
    secondaryCta: "Learn more",
    capabilities: ["answer", "leads", "promotions"],
    sections: ["hero", "services", "about", "faq", "cta", "contact"],
    sample: { name: "Lumen Bottle", offer: "The self-cleaning water bottle", industry: "Consumer product", contact: "hello@lumen.co", location: "" },
    headline: (b) => `Meet ${bare(b.name) || "something new"}.`,
    subheadline: (b) => sentence(offerOr(b, "Something new is coming. Be the first to know")),
    servicesHeading: "Why you'll love it",
    services: [
      { name: "Thoughtfully made", description: "Designed to last, and to be used every day.", icon: "sparkle" },
      { name: "Goes everywhere", description: "From the desk to the trail and back.", icon: "check" },
      { name: "Yours first", description: "Early supporters hear about it before anyone else.", icon: "gift" },
    ],
    highlights: ["Launching soon", "Early list gets first access"],
    faq: [{ question: "When does it launch?", answer: "Soon — join the list and you'll be the first to know." }],
    galleryHeading: "Details",
    gallery: ["Outdoors", "Minimal", "Everyday"],
    closing: { heading: "Be first in line", body: "Join the waitlist for launch day news and the early offer." },
  },

  /* ---- Events & stays ------------------------------------------------------- */
  {
    id: "event",
    name: "Event",
    category: "Events & stays",
    eyebrow: "Live event",
    bestFor: "Best for RSVPs and tickets",
    summary: "Built to fill a room. A poster headline on night-black, the line-up in pictures, and the agent answering logistics.",
    includes: ["RSVP capture", "Promotions", "Line-up in pictures", "Agent answers logistics"],
    industry: "Events",
    goal: "event",
    brandColor: "#FF5A36",
    look: {
      theme: { fonts: "poster", surface: "night", radius: "square", buttonShape: "square", density: "regular" },
      hero: "default",
      tone: "friendly",
    },
    layouts: { hero: "poster", services: "photo", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Reserve your spot",
    secondaryCta: "See the line-up",
    capabilities: ["answer", "leads", "promotions", "payment"],
    sections: ["hero", "about", "services", "gallery", "faq", "cta", "contact"],
    sample: { name: "Night Market Live", offer: "An evening of music, food and makers", industry: "Events", contact: "tickets@nightmarket.live", location: "Chicago" },
    headline: (b) => b.name.trim() || "The night of the year.",
    subheadline: (b) => sentence(`${offerOr(b, "Join us for an evening worth remembering")}${where(b)}`),
    servicesHeading: "What to expect",
    services: [
      { name: "Live sets", description: "Music from the first hour to the last.", icon: "star" },
      { name: "Street food", description: "Local vendors, all evening.", icon: "coffee" },
      { name: "The crowd", description: "The best part of any night out.", icon: "users" },
    ],
    highlights: ["Limited capacity", "All ages welcome"],
    faq: [{ question: "Can I bring a friend?", answer: "Of course — reserve a spot for each person so we can plan numbers." }],
    galleryHeading: "Last time",
    gallery: ["Lanterns", "After dark", "Hands up"],
    closing: { heading: "Don't miss it", body: "Spots are limited — reserve yours now." },
  },
  {
    id: "weddings",
    name: "Weddings",
    category: "Events & stays",
    eyebrow: "Wedding planning & design",
    bestFor: "Best for enquiries",
    summary: "Romantic and editorial. A centred serif over the couple, services in pictures, and a single kind review in large type.",
    includes: ["Enquiry capture", "Services with photos", "Portfolio strip", "Agent checks your date"],
    industry: "Weddings",
    goal: "event",
    brandColor: "#B2473E",
    look: {
      theme: { fonts: "garamond", surface: "cream", radius: "square", buttonShape: "square", density: "airy" },
      hero: "default",
      tone: "premium",
    },
    layouts: { hero: "centered", services: "photo", about: "statement", gallery: "strip", testimonials: "quote" },
    cta: "Plan your day",
    secondaryCta: "Our weddings",
    capabilities: ["answer", "guide", "leads", "handoff"],
    sections: FULL,
    sample: { name: "Vows & Co.", offer: "Wedding planning, styling and coordination", industry: "Weddings", contact: "hello@vowsandco.com", location: "Napa Valley" },
    headline: (b) => `Weddings by ${bare(b.name) || "us"}.`,
    subheadline: (b) => sentence(`${offerOr(b, "Planning and styling for days that feel like you")}${where(b)}`),
    servicesHeading: "How we help",
    services: [
      { name: "Full planning", description: "From the first idea to the last dance.", icon: "calendar" },
      { name: "Styling", description: "Flowers, tables and the details you'll remember.", icon: "sparkle" },
      { name: "On the day", description: "We run it, so you can simply be there.", icon: "heart" },
    ],
    highlights: ["A limited number of weddings each year", "Planning that listens"],
    faq: [{ question: "Is our date available?", answer: "Ask the assistant with your date and it will check with the team." }],
    galleryHeading: "Recent weddings",
    gallery: ["The veil", "Bouquet", "The table", "Golden hour"],
    closing: { heading: "Tell us about your day", body: "Share your date and ideas — we'll come back with how we'd make it yours." },
  },
  {
    id: "retreat",
    name: "Retreat & Stays",
    category: "Events & stays",
    eyebrow: "Cabins & retreats",
    bestFor: "Best for booking enquiries",
    summary: "Escape on the first screen. A full-bleed landscape, the rooms in pictures, and availability one question away.",
    includes: ["Availability enquiries", "Rooms with photos", "Promotions", "Agent answers stay questions"],
    industry: "Travel & stays",
    goal: "appointments",
    brandColor: "#5A4632",
    look: {
      theme: { fonts: "fraunces", surface: "sand", radius: "soft", buttonShape: "pill", density: "airy" },
      hero: "inverse",
      tone: "premium",
    },
    layouts: { hero: "cover", services: "photo", about: "statement", gallery: "mosaic", testimonials: "quote" },
    cta: "Check availability",
    secondaryCta: "The cabins",
    capabilities: ["answer", "booking", "promotions", "payment"],
    sections: FULL,
    sample: { name: "Cedar Hollow", offer: "Cabins in the mountains, made for slowing down", industry: "Travel & stays", contact: "stay@cedarhollow.co", location: "Blue Ridge" },
    headline: () => "Somewhere quiet, waiting for you.",
    subheadline: (b) => sentence(`${offerOr(b, "Cabins made for slowing down")}${where(b)}`),
    servicesHeading: "The stay",
    services: [
      { name: "The cabins", description: "Warm wood, big windows, proper beds.", icon: "home" },
      { name: "The views", description: "Mountains from the porch, stars at night.", icon: "leaf" },
      { name: "The fire", description: "Evenings that end by the stove.", icon: "heart" },
    ],
    highlights: ["Pet friendly", "Self check-in"],
    faq: [{ question: "Is there a minimum stay?", answer: "Ask the assistant for your dates and it will check what's available." }],
    galleryHeading: "Around the place",
    gallery: ["The lake", "Inside", "Morning"],
    closing: { heading: "Book your escape", body: "Check your dates, or ask the assistant anything about the stay." },
  },
];

export const getTemplate = (id: string): SmartTemplate => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

/** The template to suggest for a goal, before the owner has chosen one. */
export const recommendedTemplate = (goal: PageGoal): SmartTemplate => getTemplate(getGoal(goal).templates[0]);

export const photosFor = (templateId: string): TemplatePhotos => TEMPLATE_PHOTOS[templateId] ?? TEMPLATE_PHOTOS.local;

export const INDUSTRIES = [
  "Home services",
  "Construction",
  "Agency and studio",
  "Coaching",
  "Real estate",
  "Restaurant",
  "Health and wellness",
  "Therapy",
  "Fitness",
  "Beauty",
  "Florist",
  "Photography",
  "Weddings",
  "Events",
  "Travel & stays",
  "Pets",
  "Software",
  "Consumer product",
  "Professional services",
  "Retail",
  "Other",
];

export const CTA_OPTIONS = [
  "Get a free quote",
  "Book an appointment",
  "Book a call",
  "Book a free intro call",
  "Book a consultation",
  "Book a demo",
  "Get started",
  "Reserve a table",
  "Reserve your spot",
  "Check availability",
  "Order flowers",
  "Shop the collection",
  "Join the waitlist",
  "Join the list",
  "Contact us",
  "Ask us anything",
];

/** Brand colours offered next to the template's own. Any hex works. */
export const BRAND_SWATCHES = ["#111111", "#1F3A5F", "#2F6B3B", "#4E6B57", "#4F46E5", "#B4532A", "#9C3D54", "#D9481C"];

/* ============================================================================
   THE DRAFT — everything the flow collects before a site exists
   ========================================================================== */

export interface SmartDraft {
  brief: PageBrief;
  brandColor: string;
  logo?: string;
  agent: PageAgent;
}

/**
 * The button's job, read from its words. "Reserve a table" is a booking even
 * on a page whose goal was leads — the label is the promise the visitor sees,
 * so it wins over the goal.
 */
export function capabilityForCta(label: string, goal: PageGoal): AgentCapability {
  const l = label.toLowerCase();
  if (/book|appointment|reserve a table|schedule|viewing|availability|training|groom/.test(l)) return "booking";
  if (/ask|question/.test(l)) return "answer";
  if (/pay|buy|checkout|shop|order/.test(l)) return "payment";
  if (/quote|started|contact|join|waitlist|list|spot|ticket|demo|valuation|courses|plan your/.test(l)) return "leads";
  const fromGoal: Record<PageGoal, AgentCapability> = {
    opportunities: "leads",
    customers: "leads",
    appointments: "booking",
    sell: "leads",
    event: "leads",
    emails: "leads",
    questions: "answer",
  };
  return fromGoal[goal];
}

const unique = <T,>(items: T[]) => [...new Set(items)];

/** A draft for a goal, with the template it recommends. */
export function draftForGoal(goal: PageGoal, previous: SmartDraft = blankDraft()): SmartDraft {
  return draftForTemplate(recommendedTemplate(goal).id, { ...previous, brief: { ...previous.brief, goal } });
}

/**
 * Switching template keeps everything the owner typed and swaps what the
 * template owns: its button, its colour, its look, its default agent.
 */
export function draftForTemplate(templateId: string, previous: SmartDraft, keepGoal = true): SmartDraft {
  const template = getTemplate(templateId);
  const goal = keepGoal ? previous.brief.goal : template.goal;
  const goalDef = getGoal(goal);
  /* The template's own button: "Order flowers" says more to a florist's
     visitor than any goal's generic one. The goal still decides what the
     agent can do, below. */
  const cta = template.cta;
  const capabilities = unique([...template.capabilities, ...goalDef.capabilities, capabilityForCta(cta, goal)]);
  /* The industry follows the template until the owner has typed their own. */
  const industry = previous.brief.business.industry;
  const typedIndustry = industry !== "" && industry !== getTemplate(previous.brief.templateId).industry;
  return {
    ...previous,
    brandColor: template.brandColor,
    brief: {
      ...previous.brief,
      goal,
      templateId,
      style: "signature",
      cta,
      business: { ...previous.brief.business, industry: typedIndustry ? industry : template.industry },
    },
    agent: { ...previous.agent, capabilities, tone: template.look.tone },
  };
}

export function blankDraft(): SmartDraft {
  const template = getTemplate("local");
  return {
    brandColor: template.brandColor,
    brief: {
      goal: "opportunities",
      templateId: template.id,
      style: "signature",
      cta: template.cta,
      business: { name: "", offer: "", industry: "", contact: "", location: "" },
    },
    agent: { ...DEFAULT_AGENT, capabilities: template.capabilities },
  };
}

/** A template shown with its sample business, for the gallery. */
export function sampleDraft(templateId: string): SmartDraft {
  const template = getTemplate(templateId);
  const base = draftForTemplate(templateId, blankDraft(), false);
  return { ...base, brief: { ...base.brief, business: template.sample } };
}

/** The business as it should read on the page, with a placeholder name if none was given. */
export const displayName = (b: BusinessInfo) => b.name.trim() || "Your business";

/* ============================================================================
   BUILDING THE DOCUMENT
   ========================================================================== */

/**
 * The owner's own services where they listed them — "Landscaping, lawn care
 * and patios" is three services — and the template's otherwise.
 */
function servicesFrom(template: SmartTemplate, b: BusinessInfo): ServiceSeed[] {
  const parts = b.offer
    .split(/,|;|\band\b|&/)
    .map((p) => p.trim())
    .filter((p) => p.length > 1 && p.length < 40);
  if (parts.length < 2) return template.services;
  return parts.slice(0, 4).map((name, i) => {
    const seed = template.services[i % template.services.length];
    return { ...seed, name: name[0].toUpperCase() + name.slice(1) };
  });
}

function faqFrom(template: SmartTemplate, draft: SmartDraft) {
  const b = draft.brief.business;
  const name = displayName(b);
  const items = [...template.faq];
  if (b.location.trim()) {
    items.push({ question: "Where are you based?", answer: `${name} is based in ${b.location.trim()}.` });
  }
  items.push({
    question: "How do I get started?",
    answer: `Use the "${draft.brief.cta}" button, or ask the assistant in the corner of this page — it can take it from there.`,
  });
  if (b.contact.trim()) {
    items.push({ question: "How can I reach you?", answer: `You can reach us at ${b.contact.trim()}, or leave a message with the assistant any time.` });
  }
  return items.map((i) => ({ id: newId("q"), ...i }));
}

const isEmail = (value: string) => /@/.test(value);

function sectionFor(
  kind: PageSectionKind,
  template: SmartTemplate,
  draft: SmartDraft,
  siteId: ID,
  index: number,
): PageSection {
  const section = createSection(kind);
  const b = draft.brief.business;
  const look = lookFor(draft.brief.style, template);
  const photos = photosFor(template.id);
  const name = displayName(b);
  const mainCta = {
    label: draft.brief.cta,
    actionId: actionIdFor(siteId, capabilityForCta(draft.brief.cta, draft.brief.goal)),
  };

  switch (section.kind) {
    case "hero":
      return {
        ...section,
        title: "Hero",
        style: {
          ...section.style,
          background: index === 0 ? look.hero : "default",
          spacing: template.layouts.hero === "poster" ? "normal" : "grand",
        },
        content: {
          layout: template.layouts.hero,
          eyebrow: b.location.trim() ? `${template.eyebrow} · ${b.location.trim()}` : template.eyebrow,
          /* The owner's own name or the template's fallback line — never the
             "Your business" placeholder, which reads badly in a headline. */
          headline: template.headline(b),
          subheadline: template.subheadline(b),
          cta: mainCta,
          secondaryCta: { label: template.secondaryCta },
          image: photo(photos.hero, 1920),
          secondaryImage: photo(photos.secondary, 900, 1200),
        },
      };
    case "services":
      return {
        ...section,
        style: { ...section.style, columns: 3 },
        content: {
          layout: template.layouts.services,
          heading: template.servicesHeading,
          items: servicesFrom(template, b).map((s, i) => ({
            id: newId("sv"),
            ...s,
            image: photo(photos.services[i % photos.services.length], 900, 1100),
          })),
        },
      };
    case "about":
      return {
        ...section,
        style: { ...section.style, background: "subtle", spacing: template.layouts.about === "statement" ? "roomy" : "normal" },
        content: {
          layout: template.layouts.about,
          heading: `About ${name}`,
          body: [
            b.offer.trim()
              ? sentence(`${bare(name)} — ${lowerFirst(b.offer.trim())}${where(b)}`)
              : `${name}${where(b) ? ` is based${where(b)}` : ""}.`,
            "Tell visitors how you started and who you look after. A few honest sentences do more than a page of claims.",
          ].join("\n\n"),
          highlights: template.highlights,
          image: photo(photos.about, 1000, 1200),
        },
      };
    case "testimonials":
      /* Off until the owner has a real one. A generated review is a lie on a
         customer's own website, so the section waits rather than inventing. */
      return {
        ...section,
        enabled: false,
        style: { ...section.style, columns: 3 },
        content: {
          layout: template.layouts.testimonials,
          heading: "What customers say",
          items: [{ id: newId("tm"), quote: "Paste a real review here, then switch this section on.", author: "Your customer" }],
        },
      };
    case "faq":
      return { ...section, content: { heading: "Common questions", items: faqFrom(template, draft) } };
    case "contact":
      return {
        ...section,
        style: { ...section.style, background: "subtle" },
        content: {
          heading: "Get in touch",
          body: "Ask the assistant anything, or use the details below.",
          phone: b.contact.trim() && !isEmail(b.contact) ? b.contact.trim() : undefined,
          email: isEmail(b.contact) ? b.contact.trim() : undefined,
          address: b.location.trim() || undefined,
          actionId: actionIdFor(siteId, "contact"),
          showHours: false,
        },
      };
    case "gallery":
      return {
        ...section,
        style: { ...section.style, columns: 3, width: template.layouts.gallery === "strip" ? "wide" : "normal" },
        content: {
          layout: template.layouts.gallery,
          heading: template.galleryHeading,
          items: photos.gallery.map((ref, i) => ({
            id: newId("g"),
            image: photo(ref, 1000, 1200),
            caption: template.gallery[i],
          })),
        },
      };
    case "cta":
      return {
        ...section,
        title: "Closing call to action",
        content: {
          heading: template.closing.heading,
          body: template.closing.body,
          cta: mainCta,
          image: photo(photos.cta, 1920, 900),
        },
      };
    case "pricing":
      return section;
  }
}

/**
 * The document a draft describes. `keepIds` lets a rebuild — "turn this into
 * a restaurant page" — keep the page ids the editor's address points at, so
 * the owner is not thrown out of the page they were looking at.
 */
export function buildSmartDocument(
  draft: SmartDraft,
  siteId: ID,
  keepIds: Record<string, ID> = {},
): PageDocument {
  const template = getTemplate(draft.brief.templateId);
  const look = lookFor(draft.brief.style, template);
  const now = new Date().toISOString();

  const home: ConciergePage = {
    id: keepIds[""] ?? newId("p"),
    siteId,
    slug: "",
    title: "Home",
    navLabel: "Home",
    published: true,
    updatedAt: now,
    styleOverrides: {},
    sections: template.sections.map((kind, index) => sectionFor(kind, template, draft, siteId, index)),
  };

  /* The button opens whatever its label promises, so that capability is on
     whether or not the owner remembered to switch it on. */
  const primary = capabilityForCta(draft.brief.cta, draft.brief.goal);
  const capabilities = draft.agent.capabilities.includes(primary)
    ? draft.agent.capabilities
    : [...draft.agent.capabilities, primary];

  return {
    version: PAGE_DOCUMENT_VERSION,
    siteId,
    updatedAt: now,
    theme: { ...look.theme, brandColor: draft.brandColor, mode: "light", logo: draft.logo },
    pages: [home],
    agent: { ...draft.agent, capabilities },
    brief: draft.brief,
  };
}

/** The draft a document was built from, recovered so it can be rebuilt. */
export function draftFromDocument(doc: PageDocument, siteName: string): SmartDraft {
  const base = blankDraft();
  const brief: PageBrief = doc.brief ?? {
    ...base.brief,
    business: { ...base.brief.business, name: siteName },
  };
  return {
    brief: { ...brief, business: { ...brief.business, name: brief.business.name || siteName } },
    brandColor: doc.theme.brandColor,
    logo: doc.theme.logo,
    agent: doc.agent ?? base.agent,
  };
}
