/* ============================================================================
   PAGE THEME — TOKENS FOR THE CUSTOMER'S SITE
   ----------------------------------------------------------------------------
   The values here describe a *published website*, not the Concierge workspace.
   They must never reach for a Concierge token: the admin is square-cornered,
   monochrome and 12.5px because that is a considered position about software,
   and none of it is a considered position about a moving company's website.

   A page renders inside an iframe precisely so these two vocabularies cannot
   leak into one another. This module is the whole of the customer's side.
   ========================================================================== */

import type {
  PageTheme,
  ThemeButtonShape,
  ThemeDensity,
  ThemeFontPairing,
  ThemeRadius,
  ThemeSurface,
} from "./types";

/* ---- Contrast ------------------------------------------------------------ */

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full.slice(0, 6).padEnd(6, "0"), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toLinear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance. */
const luminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const contrastRatio = (a: string, b: string): number => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/**
 * Ink that is actually legible on a given fill, chosen by measurement rather
 * than by taste. globals.css makes the same argument about Concierge's orange:
 * white on it is 2.6:1 and fails, so it carries ink instead. A customer can
 * pick any brand colour they like, and the same arithmetic has to protect them.
 */
export const readableInk = (background: string): string =>
  contrastRatio(background, "#ffffff") >= contrastRatio(background, "#111111") ? "#ffffff" : "#111111";

/** Mix a hex toward black, for the pressed and hover states of brand fills. */
const darken = (hex: string, amount: number): string => {
  const rgb = hexToRgb(hex).map((c) => Math.round(c * (1 - amount)));
  return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
};

/* ---- Scales -------------------------------------------------------------- */

interface FontPairing {
  display: string;
  body: string;
  /** Poster faces are single-weight; asking them for 600 fakes a bold. */
  displayWeight: number;
  /** Tracking for the big type, which each face wants differently. */
  displayTracking: string;
  displayCase: "none" | "uppercase";
  /** The Google Fonts families to load, or none for a system pairing. */
  load?: string[];
}

const SANS = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
const SERIF = 'Georgia, "Iowan Old Style", "Times New Roman", serif';

/**
 * The first four are system stacks and need no network. The rest name a real
 * typeface first and keep a system face behind it, so a page whose font never
 * arrives still reads as intended rather than falling back to Times.
 */
const FONTS: Record<ThemeFontPairing, FontPairing> = {
  grotesk: { display: SANS, body: SANS, displayWeight: 600, displayTracking: "-0.02em", displayCase: "none" },
  editorial: { display: SERIF, body: SANS, displayWeight: 600, displayTracking: "-0.02em", displayCase: "none" },
  humanist: {
    display: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, system-ui, sans-serif',
    body: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, system-ui, sans-serif',
    displayWeight: 600,
    displayTracking: "-0.02em",
    displayCase: "none",
  },
  classic: { display: SERIF, body: SERIF, displayWeight: 600, displayTracking: "-0.02em", displayCase: "none" },
  garamond: {
    display: `"Cormorant Garamond", ${SERIF}`,
    body: `"Inter", ${SANS}`,
    displayWeight: 500,
    displayTracking: "-0.015em",
    displayCase: "none",
    load: ["Cormorant+Garamond:ital,wght@0,500;0,600;1,500", "Inter:wght@400;500;600"],
  },
  fraunces: {
    display: `"Fraunces", ${SERIF}`,
    body: `"DM Sans", ${SANS}`,
    displayWeight: 500,
    displayTracking: "-0.025em",
    displayCase: "none",
    load: ["Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600", "DM+Sans:wght@400;500;600"],
  },
  poster: {
    display: `"Anton", Impact, "Arial Narrow Bold", ${SANS}`,
    body: `"Inter", ${SANS}`,
    displayWeight: 400,
    displayTracking: "-0.005em",
    displayCase: "uppercase",
    load: ["Anton", "Inter:wght@400;500;600"],
  },
  heavy: {
    display: `"Archivo Black", "Arial Black", ${SANS}`,
    body: `"Archivo", ${SANS}`,
    displayWeight: 400,
    displayTracking: "-0.035em",
    displayCase: "none",
    load: ["Archivo+Black", "Archivo:wght@400;500;600"],
  },
  modern: {
    display: `"Manrope", ${SANS}`,
    body: `"Manrope", ${SANS}`,
    displayWeight: 700,
    displayTracking: "-0.035em",
    displayCase: "none",
    load: ["Manrope:wght@400;500;600;700;800"],
  },
};

/**
 * The stylesheet import for a theme's typefaces, or an empty string for a
 * system pairing. It has to be the very first rule in a stylesheet, so the
 * caller puts it there.
 */
export function fontImport(theme: PageTheme): string {
  const families = FONTS[theme.fonts]?.load;
  if (!families) return "";
  return `@import url("https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap");`;
}

const RADIUS: Record<ThemeRadius, string> = { square: "0px", soft: "8px", round: "18px" };

const BUTTON_RADIUS: Record<ThemeButtonShape, string> = {
  square: "0px",
  rounded: "8px",
  pill: "999px",
};

/** Multiplies every section's vertical rhythm, so one dial loosens the page. */
const DENSITY: Record<ThemeDensity, string> = { tight: "0.78", regular: "1", airy: "1.28" };

/** Palettes are defined per mode so a dark site is one switch, not a rewrite. */
const PALETTE = {
  light: {
    bg: "#ffffff",
    fg: "#16181c",
    muted: "#5c6169",
    subtle: "#f5f6f7",
    line: "#e4e6e9",
    inverseBg: "#16181c",
    inverseFg: "#f7f8f8",
    inverseMuted: "#a8adb5",
  },
  dark: {
    bg: "#121417",
    fg: "#f2f3f4",
    muted: "#9aa1aa",
    subtle: "#1a1d21",
    line: "#2a2e34",
    inverseBg: "#f2f3f4",
    inverseFg: "#16181c",
    inverseMuted: "#5c6169",
  },
} as const;

/**
 * Considered papers, each with the ink that reads on it. The inverse is what a
 * "dark" section becomes on that paper, so a cream site's dark band is a warm
 * charcoal rather than a cold black.
 */
type Palette = Record<keyof (typeof PALETTE)["light"], string>;

const SURFACES: Record<ThemeSurface, Palette> = {
  white: PALETTE.light,
  cream: {
    bg: "#f4efe4",
    fg: "#27241f",
    muted: "#6b6558",
    subtle: "#ebe4d4",
    line: "#d9d0bd",
    inverseBg: "#2b2926",
    inverseFg: "#f4efe4",
    inverseMuted: "#b9b19f",
  },
  sand: {
    bg: "#e9e3d3",
    fg: "#23211c",
    muted: "#625d50",
    subtle: "#ddd5c1",
    line: "#c9c0a9",
    inverseBg: "#23211c",
    inverseFg: "#e9e3d3",
    inverseMuted: "#aba38e",
  },
  blush: {
    bg: "#f7ece8",
    fg: "#2b1f1c",
    muted: "#735f59",
    subtle: "#efddd6",
    line: "#e0c9c0",
    inverseBg: "#3a2622",
    inverseFg: "#f7ece8",
    inverseMuted: "#c7aca4",
  },
  sage: {
    bg: "#eef0e8",
    fg: "#1f2620",
    muted: "#5b665c",
    subtle: "#e1e6d9",
    line: "#cdd5c4",
    inverseBg: "#263027",
    inverseFg: "#eef0e8",
    inverseMuted: "#a8b3a6",
  },
  mist: {
    bg: "#f3f5f7",
    fg: "#161b22",
    muted: "#57606b",
    subtle: "#e7ebef",
    line: "#d5dbe1",
    inverseBg: "#161b22",
    inverseFg: "#f3f5f7",
    inverseMuted: "#9ba5b1",
  },
  charcoal: {
    bg: "#262522",
    fg: "#efeadf",
    muted: "#b3ad9f",
    subtle: "#302e2a",
    line: "#45423c",
    inverseBg: "#efeadf",
    inverseFg: "#262522",
    inverseMuted: "#6b6558",
  },
  night: PALETTE.dark,
};

/* ---- The variables the stylesheet reads ---------------------------------- */

/**
 * One flat record so the caller can emit it as a `:root` block, hand it to an
 * inline `style`, or diff it. Every key is prefixed `--ps-` — nothing here can
 * be confused with a Concierge token even if the two ever share a document.
 */
export function themeVars(theme: PageTheme): Record<string, string> {
  const palette = theme.surface ? SURFACES[theme.surface] : PALETTE[theme.mode];
  const fonts = FONTS[theme.fonts] ?? FONTS.grotesk;
  const brandInk = readableInk(theme.brandColor);

  return {
    "--ps-brand": theme.brandColor,
    "--ps-brand-ink": brandInk,
    "--ps-brand-hover": darken(theme.brandColor, 0.14),

    "--ps-bg": palette.bg,
    "--ps-fg": palette.fg,
    "--ps-muted": palette.muted,
    "--ps-subtle": palette.subtle,
    "--ps-line": palette.line,
    "--ps-inverse-bg": palette.inverseBg,
    "--ps-inverse-fg": palette.inverseFg,
    "--ps-inverse-muted": palette.inverseMuted,

    "--ps-font-display": fonts.display,
    "--ps-font-body": fonts.body,
    "--ps-display-weight": String(fonts.displayWeight),
    "--ps-display-tracking": fonts.displayTracking,
    "--ps-display-case": fonts.displayCase,

    "--ps-radius": RADIUS[theme.radius],
    "--ps-btn-radius": BUTTON_RADIUS[theme.buttonShape],
    "--ps-density": DENSITY[theme.density],
  };
}

/** The same record as a CSS declaration block body. */
export const themeVarsCss = (theme: PageTheme): string =>
  Object.entries(themeVars(theme))
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
