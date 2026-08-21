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

import type { PageTheme, ThemeButtonShape, ThemeDensity, ThemeFontPairing, ThemeRadius } from "./types";

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

/**
 * System stacks only. A published page must render correctly with no network,
 * and a webfont that arrives late is worse than one that was never promised.
 * Phase 3 can add real faces on top of these as the fallback.
 */
const FONTS: Record<ThemeFontPairing, { display: string; body: string }> = {
  grotesk: {
    display: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
    body: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  },
  editorial: {
    display: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
    body: '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif',
  },
  humanist: {
    display: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, system-ui, sans-serif',
    body: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, system-ui, sans-serif',
  },
  classic: {
    display: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
    body: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
  },
};

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

/* ---- The variables the stylesheet reads ---------------------------------- */

/**
 * One flat record so the caller can emit it as a `:root` block, hand it to an
 * inline `style`, or diff it. Every key is prefixed `--ps-` — nothing here can
 * be confused with a Concierge token even if the two ever share a document.
 */
export function themeVars(theme: PageTheme): Record<string, string> {
  const palette = PALETTE[theme.mode];
  const fonts = FONTS[theme.fonts];
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
