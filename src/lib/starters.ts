import { PAGE_DOCUMENT_VERSION, createSection } from "./pages-builder";
import type { ConciergePage, ID, PageDocument, PageSectionKind, PageTheme } from "./types";

/* ============================================================================
   STARTERS
   ----------------------------------------------------------------------------
   A starter is a shape, not a skin. It decides which pages exist and what
   sections are on them — the decisions an owner cannot make well before they
   have seen a page, and the ones they will change least often afterwards.

   It deliberately does not lock anything: every page, section and theme value
   a starter produces is editable the moment the editor opens. The point is to
   replace a blank canvas with something already recognisable as their trade,
   not to sell a template.

   `helpsWith` is the honest reason Pages exists at all. A site is the surface;
   the Agent answering on it is the product, and each trade asks a different
   set of questions.
   ========================================================================== */

export interface StarterPage {
  title: string;
  slug: string;
  sections: PageSectionKind[];
}

export interface Starter {
  id: string;
  name: string;
  /** The trade, in the owner's words. */
  category: string;
  description: string;
  pages: StarterPage[];
  /** What the Agent will be doing for this kind of business. */
  helpsWith: string[];
  theme: Pick<PageTheme, "brandColor" | "fonts" | "radius" | "buttonShape">;
}

export const STARTERS: Starter[] = [
  {
    id: "trade",
    name: "Trade and field service",
    category: "Movers, plumbers, electricians, landscapers",
    description:
      "For work that happens at the customer's address. Leads on price and availability, and puts a quote request everywhere.",
    pages: [
      { title: "Home", slug: "", sections: ["hero", "services", "testimonials", "contact"] },
      { title: "Services", slug: "services", sections: ["services", "faq"] },
      { title: "Pricing", slug: "pricing", sections: ["pricing", "faq"] },
    ],
    helpsWith: ["quote a job from a description", "check whether you cover an address", "book a survey"],
    theme: { brandColor: "#1F3A5F", fonts: "grotesk", radius: "soft", buttonShape: "rounded" },
  },
  {
    id: "agency",
    name: "Agency and studio",
    category: "Agencies, consultants, done-for-you teams",
    description:
      "For work sold on judgement rather than price. Leads with the work, then the process, then proof.",
    pages: [
      { title: "Home", slug: "", sections: ["hero", "services", "testimonials", "contact"] },
      { title: "Work", slug: "work", sections: ["gallery", "testimonials"] },
      { title: "Services", slug: "services", sections: ["services", "pricing"] },
      { title: "Process", slug: "process", sections: ["about", "faq"] },
    ],
    helpsWith: ["qualify a service need", "recommend the right engagement", "book a call"],
    theme: { brandColor: "#111827", fonts: "editorial", radius: "square", buttonShape: "square" },
  },
  {
    id: "clinic",
    name: "Clinic and practice",
    category: "Dentists, physios, opticians, vets",
    description:
      "For regulated work where trust and hours matter more than price. Puts booking and opening hours up front.",
    pages: [
      { title: "Home", slug: "", sections: ["hero", "services", "testimonials", "contact"] },
      { title: "Treatments", slug: "treatments", sections: ["services", "pricing", "faq"] },
      { title: "About", slug: "about", sections: ["about", "gallery"] },
    ],
    helpsWith: ["explain a treatment", "answer insurance questions", "book an appointment"],
    theme: { brandColor: "#0F766E", fonts: "humanist", radius: "round", buttonShape: "pill" },
  },
  {
    id: "studio",
    name: "Salon and studio",
    category: "Hair, beauty, fitness, wellbeing",
    description:
      "For places people come to. Leads with pictures, because the work is the reason they choose you.",
    pages: [
      { title: "Home", slug: "", sections: ["hero", "gallery", "services", "contact"] },
      { title: "Services", slug: "services", sections: ["services", "pricing"] },
      { title: "Reviews", slug: "reviews", sections: ["testimonials", "faq"] },
    ],
    helpsWith: ["quote a treatment", "check availability", "take a booking"],
    theme: { brandColor: "#9D174D", fonts: "editorial", radius: "round", buttonShape: "pill" },
  },
  {
    id: "shop",
    name: "Shop and local business",
    category: "Cafés, retailers, garages, anything with a door",
    description:
      "For a business people visit. Hours, address and what you sell, without pretending to be a webshop.",
    pages: [
      { title: "Home", slug: "", sections: ["hero", "about", "gallery", "contact"] },
      { title: "What we do", slug: "what-we-do", sections: ["services", "faq"] },
    ],
    helpsWith: ["answer opening hours", "confirm what you stock", "take an enquiry"],
    theme: { brandColor: "#B45309", fonts: "humanist", radius: "soft", buttonShape: "rounded" },
  },
  {
    id: "one-page",
    name: "A single page",
    category: "Anyone who wants one page and no more",
    description:
      "Everything on one scroll. The fastest thing to finish, and often the right answer for a small business.",
    pages: [
      {
        title: "Home",
        slug: "",
        sections: ["hero", "services", "about", "testimonials", "faq", "contact"],
      },
    ],
    helpsWith: ["answer anything on the page", "capture a lead", "route an urgent request"],
    theme: { brandColor: "#1F3A5F", fonts: "grotesk", radius: "soft", buttonShape: "rounded" },
  },
];

export const getStarter = (id: string): Starter =>
  STARTERS.find((s) => s.id === id) ?? STARTERS[0];

/* ---- Turning a starter into a document ------------------------------------ */

const newId = (prefix: string): ID => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/**
 * Build the document a starter describes.
 *
 * The business name is written into the places an owner would otherwise have
 * to type it themselves, and nowhere else. Inventing claims about a business
 * from its name is how a starter stops being a head start and becomes
 * something to unpick — so the copy stays visibly provisional.
 */
export function buildDocument(args: {
  starter: Starter;
  siteId: ID;
  businessName: string;
}): PageDocument {
  const { starter, siteId, businessName } = args;

  const pages: ConciergePage[] = starter.pages.map((template, index) => ({
    id: newId("p"),
    siteId,
    slug: template.slug,
    title: template.title,
    navLabel: template.title,
    /* The home page goes live on the first publish; the rest wait until the
       owner has looked at them. */
    published: index === 0,
    updatedAt: new Date().toISOString(),
    styleOverrides: {},
    sections: template.sections.map((kind, position) => {
      const section = createSection(kind);

      if (kind === "hero" && section.kind === "hero") {
        return {
          ...section,
          style: { ...section.style, background: position === 0 ? "inverse" : "default", spacing: "grand" },
          content: {
            ...section.content,
            headline: `${businessName}`,
            subheadline: "One line about what you do and who you do it for.",
          },
        };
      }

      /* A grid of three reads well by default; four gets cramped on a laptop. */
      if (kind === "services" || kind === "gallery" || kind === "testimonials") {
        return { ...section, style: { ...section.style, columns: 3 } };
      }

      return section;
    }),
  }));

  return {
    version: PAGE_DOCUMENT_VERSION,
    siteId,
    updatedAt: new Date().toISOString(),
    theme: {
      ...starter.theme,
      mode: "light",
      density: "regular",
    },
    pages,
  };
}
