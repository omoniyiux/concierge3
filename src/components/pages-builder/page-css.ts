import type { PageTheme } from "@/lib/types";
import { themeVarsCss } from "@/lib/page-theme";

/* ============================================================================
   THE PUBLISHED PAGE'S STYLESHEET
   ----------------------------------------------------------------------------
   Plain CSS, deliberately. Tailwind belongs to the Concierge workspace and its
   theme block carries opinions — zero radius, an orange accent, a 12.5px body
   — that are right for software and wrong for a moving company's website.
   Pulling it into the canvas would dress every customer's site as an admin
   panel, so the page gets its own vocabulary and reads only `--ps-*` tokens.

   The section dials arrive as data attributes rather than classes, which keeps
   the resolved style legible in devtools and gives Phase 2's selection layer
   something stable to hook onto.

   One rule worth stating: there are no column media queries here. Which layout
   applies at which width is the author's decision, held in the override table
   and resolved before render. Phase 4 emits that same table as media queries
   for the published page — one source, two outputs, and no possibility of the
   canvas and the live site disagreeing.
   ========================================================================== */

const BASE = String.raw`
*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: var(--ps-bg);
  color: var(--ps-fg);
  font-family: var(--ps-font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

img { max-width: 100%; display: block; }

a { color: inherit; }

/* ---- Structure ----------------------------------------------------------- */

.ps-section {
  --ps-pad: 64px;
  --ps-max: 1080px;
  --ps-cols: 3;
  padding-block: calc(var(--ps-pad) * var(--ps-density));
  background: var(--ps-bg);
  color: var(--ps-fg);
}

.ps-section[data-spacing="compact"] { --ps-pad: 36px; }
.ps-section[data-spacing="normal"]  { --ps-pad: 64px; }
.ps-section[data-spacing="roomy"]   { --ps-pad: 92px; }
.ps-section[data-spacing="grand"]   { --ps-pad: 124px; }

.ps-section[data-width="narrow"] { --ps-max: 680px; }
.ps-section[data-width="normal"] { --ps-max: 1080px; }
.ps-section[data-width="wide"]   { --ps-max: 1320px; }

.ps-section[data-cols="1"] { --ps-cols: 1; }
.ps-section[data-cols="2"] { --ps-cols: 2; }
.ps-section[data-cols="3"] { --ps-cols: 3; }
.ps-section[data-cols="4"] { --ps-cols: 4; }

.ps-section[data-bg="subtle"]  { background: var(--ps-subtle); }
.ps-section[data-bg="inverse"] { background: var(--ps-inverse-bg); color: var(--ps-inverse-fg); }
.ps-section[data-bg="brand"]   { background: var(--ps-brand); color: var(--ps-brand-ink); }

.ps-section[data-align="center"] { text-align: center; }

.ps-inner {
  max-width: var(--ps-max);
  margin-inline: auto;
  padding-inline: 28px;
}

.ps-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(var(--ps-cols), minmax(0, 1fr));
  margin-top: 36px;
}

.ps-stack { display: grid; gap: 14px; }

/* ---- Type ---------------------------------------------------------------- */

.ps-h1, .ps-h2, .ps-h3 {
  font-family: var(--ps-font-display);
  font-weight: 600;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.14;
  text-wrap: balance;
}

.ps-h1 { font-size: clamp(30px, 4.4vw, 52px); }
.ps-h2 { font-size: clamp(23px, 2.6vw, 33px); }
.ps-h3 { font-size: 18px; letter-spacing: -0.01em; line-height: 1.3; }

.ps-lede {
  margin: 18px 0 0;
  font-size: 18px;
  line-height: 1.55;
  color: var(--ps-muted);
  max-width: 58ch;
  text-wrap: pretty;
}

.ps-section[data-align="center"] .ps-lede,
.ps-section[data-align="center"] .ps-intro { margin-inline: auto; }

.ps-intro {
  margin: 14px 0 0;
  color: var(--ps-muted);
  max-width: 62ch;
  text-wrap: pretty;
}

.ps-body { margin: 0; color: var(--ps-muted); }

.ps-note {
  margin-top: 28px;
  font-size: 14px;
  color: var(--ps-muted);
}

/* Inverse and brand fills need their own quiet tone; the light one vanishes. */
[data-bg="inverse"] .ps-lede,
[data-bg="inverse"] .ps-intro,
[data-bg="inverse"] .ps-body,
[data-bg="inverse"] .ps-note { color: var(--ps-inverse-muted); }

[data-bg="brand"] .ps-lede,
[data-bg="brand"] .ps-intro,
[data-bg="brand"] .ps-body,
[data-bg="brand"] .ps-note { color: inherit; opacity: 0.82; }

/* ---- Buttons ------------------------------------------------------------- */

.ps-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.ps-section[data-align="center"] .ps-actions { justify-content: center; }

.ps-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  border-radius: var(--ps-btn-radius);
  border: 1px solid transparent;
  font: inherit;
  font-weight: 550;
  font-size: 15px;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease, opacity 140ms ease;
}

.ps-btn--primary { background: var(--ps-brand); color: var(--ps-brand-ink); }
.ps-btn--primary:hover { background: var(--ps-brand-hover); }

.ps-btn--ghost { border-color: currentColor; opacity: 0.85; background: transparent; }
.ps-btn--ghost:hover { opacity: 1; }

[data-bg="brand"] .ps-btn--primary { background: var(--ps-brand-ink); color: var(--ps-brand); }

/* ---- Cards --------------------------------------------------------------- */

.ps-card {
  border: 1px solid var(--ps-line);
  border-radius: var(--ps-radius);
  padding: 24px;
  background: var(--ps-bg);
  min-width: 0;
}

[data-bg="subtle"] .ps-card { background: var(--ps-bg); }
[data-bg="inverse"] .ps-card,
[data-bg="brand"] .ps-card { border-color: currentColor; background: transparent; }

.ps-card__price {
  margin-top: 14px;
  font-family: var(--ps-font-display);
  font-size: 15px;
  font-weight: 600;
}

/* The icon carries the brand colour so a page with no photographs still reads
   as the customer's rather than as a default template. */
.ps-card__icon {
  display: block;
  margin-bottom: 14px;
  color: var(--ps-brand);
}
[data-bg="inverse"] .ps-card__icon,
[data-bg="brand"] .ps-card__icon { color: inherit; }

.ps-card__media { margin: -24px -24px 18px; }
.ps-card__media .ps-media {
  border: 0;
  border-radius: 0;
  aspect-ratio: 16 / 10;
}

/* ---- Media placeholders -------------------------------------------------- */

.ps-media {
  border: 1px dashed var(--ps-line);
  border-radius: var(--ps-radius);
  background: var(--ps-subtle);
  aspect-ratio: 4 / 3;
  display: grid;
  place-items: center;
  color: var(--ps-muted);
  font-size: 13px;
  padding: 12px;
  text-align: center;
  overflow: hidden;
}

.ps-media img { width: 100%; height: 100%; object-fit: cover; }

/* ---- Hero ---------------------------------------------------------------- */

.ps-hero__layout { display: grid; gap: 44px; align-items: center; }
.ps-hero__layout[data-media="true"] { grid-template-columns: 1.1fr 0.9fr; }

/* ---- Testimonials -------------------------------------------------------- */

.ps-quote { margin: 0; font-size: 17px; line-height: 1.5; text-wrap: pretty; }
.ps-quote::before { content: "\201C"; }
.ps-quote::after { content: "\201D"; }

.ps-rating { color: var(--ps-brand); letter-spacing: 2px; font-size: 13px; }
[data-bg="brand"] .ps-rating, [data-bg="inverse"] .ps-rating { color: inherit; }

.ps-attribution {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 11px;
}
.ps-section[data-align="center"] .ps-attribution { justify-content: center; }
.ps-attribution__name span { display: block; font-weight: 400; color: var(--ps-muted); }
[data-bg="inverse"] .ps-attribution__name span { color: var(--ps-inverse-muted); }

.ps-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

/* ---- Pricing ------------------------------------------------------------- */

.ps-tier { display: flex; flex-direction: column; }
.ps-tier[data-featured="true"] { border-color: var(--ps-brand); border-width: 2px; }

.ps-tier__price {
  font-family: var(--ps-font-display);
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-top: 12px;
}
.ps-tier__price span { font-size: 14px; font-weight: 400; color: var(--ps-muted); margin-left: 6px; }

.ps-features { list-style: none; margin: 20px 0 24px; padding: 0; display: grid; gap: 9px; font-size: 14.5px; }
.ps-features li { padding-left: 20px; position: relative; }
.ps-features li::before {
  content: "";
  position: absolute;
  left: 0; top: 0.55em;
  width: 9px; height: 2px;
  background: var(--ps-brand);
}
.ps-tier .ps-btn { margin-top: auto; }

/* An absolute marker stays pinned to the box's left edge, which strands it
   when the author centres the section. Inline it instead so the dash travels
   with the text and the list still reads as a list. */
[data-align="center"] .ps-features li,
[data-align="center"] .ps-highlights li { padding-left: 0; }

[data-align="center"] .ps-features li::before,
[data-align="center"] .ps-highlights li::before {
  position: static;
  display: inline-block;
  margin-right: 9px;
  vertical-align: middle;
}

/* ---- FAQ ----------------------------------------------------------------- */

.ps-faq { display: grid; gap: 0; margin-top: 34px; }
.ps-faq__item { padding: 22px 0; border-top: 1px solid var(--ps-line); }
.ps-faq__item:last-child { border-bottom: 1px solid var(--ps-line); }
.ps-faq__q { margin: 0; font-size: 16.5px; font-weight: 600; }
.ps-faq__a { margin: 8px 0 0; color: var(--ps-muted); text-wrap: pretty; }

/* ---- About --------------------------------------------------------------- */

.ps-about__layout { display: grid; gap: 44px; align-items: start; }
.ps-about__layout[data-media="true"] { grid-template-columns: 1fr 0.8fr; }
.ps-highlights { list-style: none; margin: 26px 0 0; padding: 0; display: grid; gap: 10px; }
.ps-highlights li { padding-left: 20px; position: relative; font-size: 15px; }
.ps-highlights li::before {
  content: "";
  position: absolute;
  left: 0; top: 0.6em;
  width: 9px; height: 2px;
  background: var(--ps-brand);
}

/* ---- Contact ------------------------------------------------------------- */

.ps-contact__list { list-style: none; margin: 28px 0 0; padding: 0; display: grid; gap: 14px; }
.ps-contact__row { display: grid; gap: 2px; }
.ps-contact__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ps-muted);
}
.ps-contact__value { font-size: 17px; }

/* ---- Gallery ------------------------------------------------------------- */

.ps-gallery__caption { margin-top: 10px; font-size: 13.5px; color: var(--ps-muted); }

/* ---- Site chrome --------------------------------------------------------- */

.ps-header {
  border-bottom: 1px solid var(--ps-line);
  background: var(--ps-bg);
}
.ps-header__inner {
  max-width: 1320px;
  margin-inline: auto;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  gap: 28px;
}
.ps-wordmark {
  font-family: var(--ps-font-display);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: -0.02em;
}
.ps-nav { margin-left: auto; display: flex; gap: 22px; font-size: 14.5px; }
.ps-nav a { text-decoration: none; color: var(--ps-muted); }
.ps-nav a[aria-current="page"] { color: var(--ps-fg); font-weight: 550; }

.ps-footer {
  border-top: 1px solid var(--ps-line);
  background: var(--ps-subtle);
  padding-block: 40px;
  font-size: 14px;
  color: var(--ps-muted);
}
.ps-footer__inner {
  max-width: 1320px;
  margin-inline: auto;
  padding-inline: 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 14px 28px;
  align-items: baseline;
}

/* The Agent, promised on every page. A stub until Phase 5 mounts the real one. */
.ps-badge {
  position: fixed;
  right: 22px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 16px 11px 12px;
  border-radius: 999px;
  background: var(--ps-brand);
  color: var(--ps-brand-ink);
  font-size: 14px;
  font-weight: 550;
  box-shadow: 0 6px 22px rgb(0 0 0 / 16%);
}
.ps-badge__dot {
  width: 24px; height: 24px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: currentColor;
  font-size: 10px;
  font-weight: 700;
}
.ps-badge__dot span { color: var(--ps-brand); }

/* ---- Empty states -------------------------------------------------------- */

/* A section with nothing in it must still occupy space, or the owner cannot
   tell it exists. It says what is missing rather than collapsing silently. */
.ps-empty {
  border: 1px dashed var(--ps-line);
  border-radius: var(--ps-radius);
  padding: 30px;
  text-align: center;
  color: var(--ps-muted);
  font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.001ms !important; }
}
`;

/** The complete stylesheet for a rendered page, tokens included. */
export const pageStylesheet = (theme: PageTheme): string =>
  `:root {\n${themeVarsCss(theme)}\n}\n${BASE}`;
