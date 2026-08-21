/* ============================================================================
   PAGES BUILDER — THE MODEL LAYER
   ----------------------------------------------------------------------------
   Everything the visual editor needs to reason about a page without rendering
   one: the breakpoint cascade, the section catalogue, and the derivations the
   UI would otherwise be tempted to store.

   The rule this file exists to enforce is that a page's meaning lives in the
   document, never in a component. A renderer asks what a section looks like at
   a breakpoint; it does not work it out for itself, and two renderers can
   therefore never disagree — which is what keeps the editor's canvas and the
   published page identical once publishing arrives.
   ========================================================================== */

import type {
  ConciergePage,
  ID,
  PageBreakpoint,
  PageDocument,
  PageSection,
  PageSectionKind,
  PageTheme,
  SectionStyle,
  SectionStyleDecl,
  SectionStyleDeclKey,
  SectionStyleOverrides,
  SectionStylePatch,
  SectionStyleProperty,
} from "./types";

/** Bumped when the document shape changes, so stored pages can be migrated. */
export const PAGE_DOCUMENT_VERSION = 1;

const newId = (prefix: string): ID => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

/* ============================================================================
   BREAKPOINTS
   ========================================================================== */

/**
 * Widest first, and that order is load-bearing: it is the cascade. `desktop`
 * is the base every section is authored at and carries no media query, so the
 * two narrower entries only ever hold overrides.
 *
 * `frameWidth` is what the canvas renders the page at — a real device width,
 * not the media-query threshold, so the preview shows a plausible page rather
 * than one sitting exactly on its own breakpoint edge.
 */
export const BREAKPOINTS: {
  id: PageBreakpoint;
  label: string;
  /** null for the base. Otherwise the `max-width` this breakpoint applies at. */
  maxWidth: number | null;
  frameWidth: number;
}[] = [
  { id: "desktop", label: "Desktop", maxWidth: null, frameWidth: 1280 },
  { id: "tablet", label: "Tablet", maxWidth: 991, frameWidth: 834 },
  { id: "mobile", label: "Mobile", maxWidth: 479, frameWidth: 390 },
];

export const BREAKPOINT_ORDER: PageBreakpoint[] = BREAKPOINTS.map((b) => b.id);

export const BASE_BREAKPOINT: PageBreakpoint = "desktop";

export const getBreakpoint = (id: PageBreakpoint) =>
  BREAKPOINTS.find((b) => b.id === id) ?? BREAKPOINTS[0];

/* ============================================================================
   THE STYLE CASCADE
   ========================================================================== */

export const STYLE_PROPERTIES: SectionStyleProperty[] = [
  "background",
  "spacing",
  "align",
  "width",
  "columns",
];

/** Not every dial means something on every kind; the inspector offers these. */
export const STYLE_PROPERTIES_BY_KIND: Record<PageSectionKind, SectionStyleProperty[]> = {
  hero: ["background", "spacing", "align", "width"],
  services: ["background", "spacing", "align", "width", "columns"],
  about: ["background", "spacing", "align", "width"],
  testimonials: ["background", "spacing", "align", "width", "columns"],
  pricing: ["background", "spacing", "align", "width", "columns"],
  faq: ["background", "spacing", "align", "width"],
  contact: ["background", "spacing", "align", "width"],
  gallery: ["background", "spacing", "align", "width", "columns"],
};

export const styleDeclKey = (
  sectionId: ID,
  breakpoint: PageBreakpoint,
  property: SectionStyleProperty,
): SectionStyleDeclKey => `${sectionId}:${breakpoint}:${property}`;

/**
 * The decl union ties `value` to the property it belongs to, but TypeScript
 * cannot follow that correlation through an index assignment. `Object.assign`
 * sidesteps it without a cast; constructing a mismatched decl remains
 * impossible, which is where the guarantee actually matters.
 */
const applyDecl = (style: SectionStyle, decl: SectionStyleDecl): void => {
  Object.assign(style, { [decl.property]: decl.value });
};

/** Breakpoints from the base down to `breakpoint`, inclusive. */
const cascadeTo = (breakpoint: PageBreakpoint): PageBreakpoint[] =>
  BREAKPOINT_ORDER.slice(0, BREAKPOINT_ORDER.indexOf(breakpoint) + 1);

/**
 * What this section actually looks like at this width. Start from the base on
 * the section, then let each narrower breakpoint overwrite what it sets —
 * last write wins, exactly as CSS would resolve it.
 */
export function resolveSectionStyle(
  section: PageSection,
  overrides: SectionStyleOverrides,
  breakpoint: PageBreakpoint,
): SectionStyle {
  const resolved: SectionStyle = { ...section.style };
  for (const bp of cascadeTo(breakpoint)) {
    if (bp === BASE_BREAKPOINT) continue;
    for (const property of STYLE_PROPERTIES) {
      const decl = overrides[styleDeclKey(section.id, bp, property)];
      if (decl) applyDecl(resolved, decl);
    }
  }
  return resolved;
}

/** True when this dial is set *at this exact breakpoint*, not inherited. */
export const isStyleSetAt = (
  overrides: SectionStyleOverrides,
  sectionId: ID,
  breakpoint: PageBreakpoint,
  property: SectionStyleProperty,
): boolean =>
  breakpoint === BASE_BREAKPOINT ||
  styleDeclKey(sectionId, breakpoint, property) in overrides;

/**
 * Which breakpoint supplies the value in force here. The inspector needs it to
 * say "inherited from Desktop" rather than presenting an inherited value as
 * though it had been set on purpose.
 */
export function styleOriginBreakpoint(
  sectionId: ID,
  overrides: SectionStyleOverrides,
  breakpoint: PageBreakpoint,
  property: SectionStyleProperty,
): PageBreakpoint {
  let origin: PageBreakpoint = BASE_BREAKPOINT;
  for (const bp of cascadeTo(breakpoint)) {
    if (bp === BASE_BREAKPOINT) continue;
    if (styleDeclKey(sectionId, bp, property) in overrides) origin = bp;
  }
  return origin;
}

/**
 * Setting a dial at the base edits the section itself; at a narrower
 * breakpoint it writes an override. Callers get the same pair back either way,
 * so the inspector never has to know which case it is in.
 *
 * The patch arrives as a single object rather than a property/value pair of
 * arguments, because only that shape keeps the two correlated once the call
 * has passed through an action union.
 */
export function setSectionStyle(
  section: PageSection,
  overrides: SectionStyleOverrides,
  breakpoint: PageBreakpoint,
  patch: SectionStylePatch,
): { section: PageSection; overrides: SectionStyleOverrides } {
  const decl: SectionStyleDecl = { sectionId: section.id, breakpoint, ...patch };

  if (breakpoint === BASE_BREAKPOINT) {
    const style = { ...section.style };
    applyDecl(style, decl);
    return { section: { ...section, style }, overrides };
  }

  return {
    section,
    overrides: { ...overrides, [styleDeclKey(section.id, breakpoint, patch.property)]: decl },
  };
}

/** Drop an override so the dial inherits again. The base cannot be cleared. */
export function clearSectionStyle(
  overrides: SectionStyleOverrides,
  sectionId: ID,
  breakpoint: PageBreakpoint,
  property: SectionStyleProperty,
): SectionStyleOverrides {
  if (breakpoint === BASE_BREAKPOINT) return overrides;
  const key = styleDeclKey(sectionId, breakpoint, property);
  if (key in overrides === false) return overrides;
  const next = { ...overrides };
  delete next[key];
  return next;
}

/** Every override belonging to a section, for deleting or duplicating one. */
export const overridesForSection = (
  overrides: SectionStyleOverrides,
  sectionId: ID,
): SectionStyleDeclKey[] =>
  Object.keys(overrides).filter((key) => key.startsWith(`${sectionId}:`));

/* ============================================================================
   THE SECTION CATALOGUE
   ========================================================================== */

export const DEFAULT_SECTION_STYLE: SectionStyle = {
  background: "default",
  spacing: "normal",
  align: "left",
  width: "normal",
  columns: 3,
};

/** What the owner is choosing between in the "Add a section" picker. */
export const SECTION_CATALOGUE: {
  kind: PageSectionKind;
  label: string;
  /** Written for an owner, not a designer. */
  hint: string;
}[] = [
  { kind: "hero", label: "Hero", hint: "The first thing a visitor reads" },
  { kind: "services", label: "Services", hint: "What you offer, and roughly what it costs" },
  { kind: "about", label: "About", hint: "Who you are and why you are trusted" },
  { kind: "testimonials", label: "Testimonials", hint: "Proof from customers" },
  { kind: "pricing", label: "Pricing", hint: "Plans or price bands" },
  { kind: "faq", label: "FAQ", hint: "The questions you answer most" },
  { kind: "contact", label: "Contact", hint: "How to reach a person" },
  { kind: "gallery", label: "Gallery", hint: "Work you have done" },
];

export const sectionLabel = (kind: PageSectionKind): string =>
  SECTION_CATALOGUE.find((s) => s.kind === kind)?.label ?? kind;

export const sectionHint = (kind: PageSectionKind): string =>
  SECTION_CATALOGUE.find((s) => s.kind === kind)?.hint ?? "";

/**
 * A new section, ready to render before a single field is filled in. The
 * placeholder copy is deliberately generic and obviously provisional: an owner
 * should feel prompted to replace it, not tricked into shipping it.
 */
export function createSection(kind: PageSectionKind): PageSection {
  const base = {
    id: newId("s"),
    title: sectionLabel(kind),
    enabled: true,
    style: { ...DEFAULT_SECTION_STYLE },
  };

  switch (kind) {
    case "hero":
      return {
        ...base,
        kind,
        content: {
          headline: "A short, plain sentence about what you do",
          subheadline: "One line more. Who you help, and where.",
          cta: { label: "Get in touch" },
        },
      };
    case "services":
      return {
        ...base,
        kind,
        content: {
          heading: "What we do",
          items: [
            { id: newId("sv"), name: "First service", description: "A sentence on what it involves." },
            { id: newId("sv"), name: "Second service", description: "A sentence on what it involves." },
            { id: newId("sv"), name: "Third service", description: "A sentence on what it involves." },
          ],
        },
      };
    case "about":
      return {
        ...base,
        kind,
        content: {
          heading: "About us",
          body: "A paragraph about how you started and who you look after.",
          highlights: [],
        },
      };
    case "testimonials":
      return {
        ...base,
        kind,
        content: {
          heading: "What customers say",
          items: [{ id: newId("tm"), quote: "Something a customer actually said.", author: "Customer name" }],
        },
      };
    case "pricing":
      return {
        ...base,
        kind,
        content: {
          heading: "Pricing",
          tiers: [
            {
              id: newId("tr"),
              name: "Standard",
              price: "$0",
              features: ["What is included"],
              featured: false,
            },
          ],
        },
      };
    case "faq":
      return {
        ...base,
        kind,
        content: {
          heading: "Common questions",
          items: [{ id: newId("q"), question: "A question you are asked often", answer: "Your answer." }],
        },
      };
    case "contact":
      return {
        ...base,
        kind,
        content: { heading: "Get in touch", showHours: true },
      };
    case "gallery":
      return {
        ...base,
        kind,
        content: { heading: "Our work", items: [] },
      };
  }
}

/* ============================================================================
   DERIVATIONS
   ----------------------------------------------------------------------------
   Read off the content every time rather than stored alongside it. A summary
   that is written once and never revisited starts lying the moment a fifth
   testimonial is added, and the sections list is precisely where an owner
   looks to check what is on the page.
   ========================================================================== */

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The one-line description under a section's name in the sections list. */
export function sectionSummary(section: PageSection): string {
  switch (section.kind) {
    case "hero":
      return section.content.headline || "No headline yet";
    case "services": {
      const names = section.content.items.map((i) => i.name).filter(Boolean);
      return names.length ? names.join(" · ") : "No services yet";
    }
    case "about":
      return section.content.body.split("\n")[0] || "Nothing written yet";
    case "testimonials":
      return count(section.content.items.length, "review");
    case "pricing":
      return count(section.content.tiers.length, "tier");
    case "faq":
      return count(section.content.items.length, "question");
    case "contact": {
      const channels = [
        section.content.phone && "Phone",
        section.content.email && "Email",
        section.content.address && "Address",
        section.content.actionId && "Enquiry form",
      ].filter(Boolean) as string[];
      return channels.length ? channels.join(" · ") : "No contact details yet";
    }
    case "gallery":
      return count(section.content.items.length, "image");
  }
}

/** Sections in publish order. Disabled ones stay in the document, off the page. */
export const visibleSections = (page: ConciergePage): PageSection[] =>
  page.sections.filter((s) => s.enabled);

/* ============================================================================
   THEME
   ========================================================================== */

/**
 * A neutral starting point for a site that has just been created. It is not
 * Concierge's own look: the builder chrome is square and monochrome by
 * conviction, while a customer's site is theirs to shape.
 */
export const DEFAULT_THEME: PageTheme = {
  brandColor: "#1F3A5F",
  mode: "light",
  fonts: "grotesk",
  radius: "soft",
  buttonShape: "rounded",
  density: "regular",
};

/* ============================================================================
   DOCUMENTS
   ========================================================================== */

export function createPage(siteId: ID, title: string, slug: string): ConciergePage {
  return {
    id: newId("p"),
    siteId,
    slug,
    title,
    navLabel: title,
    sections: [createSection("hero")],
    styleOverrides: {},
    published: false,
    updatedAt: new Date().toISOString(),
  };
}

export function createDocument(siteId: ID): PageDocument {
  return {
    version: PAGE_DOCUMENT_VERSION,
    siteId,
    theme: { ...DEFAULT_THEME },
    pages: [createPage(siteId, "Home", "")],
    updatedAt: new Date().toISOString(),
  };
}

export const findPage = (doc: PageDocument, pageId: ID): ConciergePage | undefined =>
  doc.pages.find((p) => p.id === pageId);

/** A page's public path. The home page is the bare root, not "/home". */
export const pagePath = (page: ConciergePage): string => (page.slug === "" ? "/" : `/${page.slug}`);

/**
 * A copy of a section under a fresh id, together with its overrides rekeyed to
 * point at the copy. Leaving the overrides behind would silently drop the
 * responsive work, which is the part an owner is least likely to notice.
 */
export function duplicateSection(
  section: PageSection,
  overrides: SectionStyleOverrides,
): { section: PageSection; overrides: SectionStyleOverrides } {
  const copy = { ...section, id: newId("s"), title: `${section.title} copy` };
  const copied: SectionStyleOverrides = {};

  for (const key of overridesForSection(overrides, section.id)) {
    const decl = overrides[key];
    copied[styleDeclKey(copy.id, decl.breakpoint, decl.property)] = { ...decl, sectionId: copy.id };
  }

  return { section: copy, overrides: { ...overrides, ...copied } };
}

/** Every override belonging to a section, removed. */
export function dropSectionOverrides(
  overrides: SectionStyleOverrides,
  sectionId: ID,
): SectionStyleOverrides {
  const next = { ...overrides };
  for (const key of overridesForSection(overrides, sectionId)) delete next[key];
  return next;
}
