import {
  BREAKPOINT_ORDER,
  STYLE_PROPERTIES,
  getBreakpoint,
  styleDeclKey,
} from "@/lib/pages-builder";
import type {
  ConciergePage,
  PageTheme,
  SectionBackground,
  SectionSpacing,
  SectionStyle,
  SectionStyleProperty,
  SectionWidth,
} from "@/lib/types";
import { fontImport, themeVarsCss } from "@/lib/page-theme";

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

/* Every dial resolves to a custom property before it is used. That indirection
   is what lets the published page carry the author's responsive rules as media
   queries: a breakpoint override is one custom-property declaration scoped to
   a section id, with no need to restate the rule it is overriding. */
.ps-section {
  --ps-pad: 64px;
  --ps-max: 1080px;
  --ps-cols: 3;
  --ps-align: left;
  --ps-justify: flex-start;
  --ps-mi: 0;
  --ps-section-bg: var(--ps-bg);
  --ps-section-fg: var(--ps-fg);
  --ps-section-muted: var(--ps-muted);
  padding-block: calc(var(--ps-pad) * var(--ps-density));
  background: var(--ps-section-bg);
  color: var(--ps-section-fg);
  text-align: var(--ps-align);
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

.ps-section[data-bg="subtle"]  { --ps-section-bg: var(--ps-subtle); }
.ps-section[data-bg="inverse"] {
  --ps-section-bg: var(--ps-inverse-bg);
  --ps-section-fg: var(--ps-inverse-fg);
  --ps-section-muted: var(--ps-inverse-muted);
}
.ps-section[data-bg="brand"] {
  --ps-section-bg: var(--ps-brand);
  --ps-section-fg: var(--ps-brand-ink);
  --ps-section-muted: currentColor;
}

.ps-section[data-align="center"] { --ps-align: center; --ps-justify: center; --ps-mi: auto; }

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
  font-weight: var(--ps-display-weight, 600);
  margin: 0;
  letter-spacing: var(--ps-display-tracking, -0.02em);
  line-height: 1.14;
  text-wrap: balance;
}
.ps-h1, .ps-h2 { text-transform: var(--ps-display-case, none); }
.ps-h1 { line-height: 1.04; }

.ps-h1 { font-size: clamp(34px, 5.2vw, 68px); }
.ps-h2 { font-size: clamp(23px, 2.6vw, 33px); }
.ps-h3 { font-size: 18px; letter-spacing: -0.01em; line-height: 1.3; }

.ps-lede {
  margin: 18px 0 0;
  margin-inline: var(--ps-mi);
  font-size: 18px;
  line-height: 1.55;
  color: var(--ps-section-muted);
  max-width: 58ch;
  text-wrap: pretty;
}

.ps-intro {
  margin: 14px 0 0;
  margin-inline: var(--ps-mi);
  color: var(--ps-section-muted);
  max-width: 62ch;
  text-wrap: pretty;
}

.ps-body { margin: 0; color: var(--ps-section-muted); }

.ps-note {
  margin-top: 28px;
  font-size: 14px;
  color: var(--ps-section-muted);
}

[data-bg="brand"] .ps-lede,
[data-bg="brand"] .ps-intro,
[data-bg="brand"] .ps-body,
[data-bg="brand"] .ps-note { opacity: 0.82; }

/* ---- Buttons ------------------------------------------------------------- */

.ps-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.ps-actions { justify-content: var(--ps-justify); }

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
.ps-attribution { justify-content: var(--ps-justify); }
.ps-attribution__name span { display: block; font-weight: 400; color: var(--ps-section-muted); }

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
.ps-tier__price span { font-size: 14px; font-weight: 400; color: var(--ps-section-muted); margin-left: 6px; }

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
.ps-section[data-align="center"] .ps-features li,
.ps-section[data-align="center"] .ps-highlights li { padding-left: 0; }

.ps-section[data-align="center"] .ps-features li::before,
.ps-section[data-align="center"] .ps-highlights li::before {
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
.ps-faq__a { margin: 8px 0 0; color: var(--ps-section-muted); text-wrap: pretty; }

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

.ps-eyebrow {
  margin: 0 0 18px;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ps-section-muted);
}
[data-bg="default"] .ps-eyebrow, [data-bg="subtle"] .ps-eyebrow { color: var(--ps-brand); }

/* Beside a headline with no picture: the page's own services, as a card. It
   stays light on every background so it reads as something to pick from. */
.ps-hero__card {
  background: var(--ps-bg);
  color: var(--ps-fg);
  border: 1px solid var(--ps-line);
  border-radius: var(--ps-radius);
  padding: 26px;
  box-shadow: 0 24px 60px rgb(0 0 0 / 12%);
  text-align: left;
}
.ps-hero__card-title {
  margin: 0 0 16px;
  font-family: var(--ps-font-display);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.ps-hero__card-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.ps-hero__card-list li { display: flex; gap: 14px; align-items: flex-start; }
.ps-hero__card-list strong { display: block; font-size: 15.5px; }
.ps-hero__card-list li > span:last-child > span { display: block; font-size: 14px; color: var(--ps-muted); line-height: 1.45; }
.ps-hero__card-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: var(--ps-radius);
  background: var(--ps-subtle);
  color: var(--ps-brand);
}
.ps-hero__card-foot {
  margin: 20px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--ps-line);
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13.5px;
  color: var(--ps-muted);
}
@media (max-width: 560px) { .ps-hero__card { display: none; } }

/* Over a full-bleed photograph the header turns transparent and light. */
.ps-top[data-overlay] {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  /* A bright sky behind white type is unreadable; the header brings its own
     shade rather than trusting the photograph. */
  background: linear-gradient(to bottom, rgb(0 0 0 / 50%), rgb(0 0 0 / 0%));
}
.ps-top[data-overlay] .ps-header {
  background: transparent;
  border-bottom-color: rgb(255 255 255 / 18%);
  color: #ffffff;
}
.ps-top[data-overlay] .ps-nav a { color: rgb(255 255 255 / 82%); }
.ps-top[data-overlay] .ps-nav a[aria-current="page"] { color: #ffffff; }
.ps-top[data-overlay] ~ main .ps-cover__words { padding-top: 150px; }

.ps-wordmark { display: flex; align-items: center; gap: 10px; font-family: var(--ps-font-display); }
.ps-logo { height: 32px; width: auto; max-width: 120px; object-fit: contain; }

.ps-header__cta { margin-left: auto; }
.ps-nav + .ps-header__cta { margin-left: 6px; }
.ps-header__cta .ps-btn { padding: 10px 18px; font-size: 14px; }

.ps-footer__powered {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
  font-size: 13px;
}
.ps-glyph { display: block; flex-shrink: 0; }

/* On a phone the header keeps the name and the one button that matters. */
@media (max-width: 560px) {
  .ps-nav { display: none; }
  .ps-header__inner { padding: 14px 18px; gap: 12px; }
  .ps-wordmark { font-size: 16px; }
  .ps-header__cta .ps-btn { padding: 9px 14px; font-size: 13px; }
  .ps-footer__powered { margin-left: 0; }
}

/* ---- Promotion ----------------------------------------------------------- */

/* One offer, read in three places — this banner, the popup, and the agent's
   answer to "any deals?" — so they can never disagree with each other. */
.ps-promo-bar { background: var(--ps-brand); color: var(--ps-brand-ink); font-size: 14px; }
.ps-promo-bar__inner {
  max-width: 1320px;
  margin-inline: auto;
  padding: 9px 28px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  justify-content: center;
  text-align: center;
}
.ps-promo-bar strong { font-weight: 650; }
.ps-promo-bar span { opacity: 0.86; }

.ps-promo {
  position: fixed;
  z-index: 40;
  top: 110px;
  right: 24px;
  width: 300px;
  background: var(--ps-bg);
  color: var(--ps-fg);
  border: 1px solid var(--ps-line);
  border-radius: var(--ps-radius);
  box-shadow: 0 22px 60px rgb(0 0 0 / 22%);
}
.ps-promo:not([open]) { display: none; }
/* One thing floating at a time: once a visitor opens the agent, the offer
   steps aside — it is still in the banner, and the agent can tell them about it. */
.ps-promo:has(~ .ps-agent[open]) { display: none; }
.ps-promo > summary {
  list-style: none;
  position: absolute;
  top: 8px;
  right: 12px;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  color: var(--ps-muted);
}
.ps-promo > summary::-webkit-details-marker { display: none; }
.ps-promo__body { padding: 22px; }
.ps-promo__eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ps-brand);
}
.ps-promo__title {
  margin: 8px 0 0;
  font-family: var(--ps-font-display);
  font-size: 26px;
  font-weight: 650;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.ps-promo__detail { margin: 8px 0 0; font-size: 14px; line-height: 1.5; color: var(--ps-muted); }
.ps-promo__field {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px solid var(--ps-line);
  border-radius: var(--ps-btn-radius);
  background: var(--ps-bg);
  color: var(--ps-fg);
  font: inherit;
  font-size: 14px;
}
.ps-promo .ps-btn { width: 100%; margin-top: 10px; }

/* ---- The agent ----------------------------------------------------------- */

/* Concierge's own surface on the customer's site: neutral enough to sit on any
   brand, with the brand colour carrying the launcher and the send button. */
.ps-agent { position: fixed; z-index: 50; right: 20px; bottom: 20px; font-family: var(--ps-font-body); }
.ps-agent > summary {
  list-style: none;
  cursor: pointer;
  width: max-content;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 16px 9px 9px;
  border-radius: 999px;
  background: var(--ps-brand);
  color: var(--ps-brand-ink);
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 26px rgb(0 0 0 / 18%);
}
.ps-agent > summary::-webkit-details-marker { display: none; }
.ps-agent > summary .ps-glyph { border-radius: 999px; }

.ps-agent__panel {
  position: absolute;
  right: 0;
  bottom: calc(100% + 12px);
  width: 340px;
  background: #ffffff;
  color: #16181c;
  border: 1px solid rgb(0 0 0 / 8%);
  border-radius: max(var(--ps-radius), 10px);
  box-shadow: 0 24px 60px rgb(0 0 0 / 20%);
  overflow: hidden;
  line-height: 1.45;
}
.ps-agent__head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border-bottom: 1px solid #eceef1;
}
.ps-agent__head .ps-glyph { border-radius: 8px; }
.ps-agent__who strong { display: block; font-size: 14px; }
.ps-agent__who span { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #5c6169; }
.ps-agent__who span::before { content: ""; width: 7px; height: 7px; border-radius: 999px; background: #16a34a; }

.ps-agent__body { display: grid; gap: 12px; padding: 16px; background: #f7f8f9; }
.ps-agent__bubble {
  margin: 0;
  padding: 11px 13px;
  background: #ffffff;
  border: 1px solid #eceef1;
  border-radius: 12px 12px 12px 4px;
  font-size: 13.5px;
}
.ps-agent__quick { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; }
.ps-agent__quick a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: #ffffff;
  border: 1px solid #e4e6e9;
  border-radius: 10px;
  color: #16181c;
  font-size: 13.5px;
  font-weight: 550;
  text-decoration: none;
}
.ps-agent__quick a::after { content: "\2192"; color: #5c6169; }

.ps-agent__compose {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 12px 14px 0;
  padding: 7px 7px 7px 14px;
  border: 1px solid #e4e6e9;
  border-radius: 999px;
  font-size: 13.5px;
  color: #8a9099;
}
.ps-agent__send {
  margin-left: auto;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--ps-brand);
  color: var(--ps-brand-ink);
  font-size: 14px;
}
.ps-agent__powered {
  margin: 0;
  padding: 10px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11.5px;
  color: #8a9099;
}

@media (max-width: 560px) {
  .ps-agent { right: 14px; bottom: 14px; }
  .ps-agent__panel { width: calc(100vw - 28px); }
  .ps-promo { top: auto; bottom: 84px; left: 14px; right: 14px; width: auto; }
}

/* ---- Photographs --------------------------------------------------------- */

.ps-photo { display: block; width: 100%; height: 100%; object-fit: cover; }
.ps-photo--empty {
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--ps-brand) 22%, var(--ps-subtle)), var(--ps-subtle));
  color: var(--ps-muted);
  font-size: 13px;
  text-align: center;
  padding: 12px;
}
.ps-fill { position: absolute; inset: 0; }

/* ---- Hero layouts ---------------------------------------------------------- */

/* Full-bleed sections draw their own column and ignore the section padding. */
.ps-section[data-bleed] { padding-block: 0; }
.ps-wide { max-width: var(--ps-max); margin-inline: auto; padding-inline: 28px; }

/* Cover: one photograph, words on top. The shade is what keeps them legible
   on whatever picture the owner chooses, so it is never optional. */
.ps-cover {
  position: relative;
  min-height: clamp(560px, 88vh, 920px);
  display: flex;
  align-items: flex-end;
  color: #ffffff;
  overflow: hidden;
}
.ps-cover__img { position: absolute; inset: 0; }
.ps-cover__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / 68%), rgb(0 0 0 / 18%) 55%, rgb(0 0 0 / 8%));
}
.ps-cover__words {
  position: relative;
  width: 100%;
  max-width: var(--ps-max);
  margin-inline: auto;
  padding: 120px 28px calc(88px * var(--ps-density));
  text-align: var(--ps-align);
}
.ps-cover__words .ps-h1 { max-width: 16ch; margin-inline: var(--ps-mi); font-size: clamp(40px, 6.4vw, 92px); }
.ps-cover__words .ps-lede,
.ps-cover__words .ps-eyebrow { color: rgb(255 255 255 / 86%); }
.ps-cover .ps-btn--ghost,
.ps-band[data-media="true"] .ps-btn--ghost { color: #ffffff; }

/* Poster: the headline is the picture. */
.ps-poster__title {
  margin: 0;
  font-family: var(--ps-font-display);
  font-weight: var(--ps-display-weight, 600);
  text-transform: var(--ps-display-case, none);
  font-size: clamp(56px, 11.5vw, 176px);
  line-height: 0.9;
  letter-spacing: var(--ps-display-tracking, -0.03em);
  text-wrap: balance;
}
.ps-poster__media {
  position: relative;
  margin-top: 36px;
  aspect-ratio: 16 / 7.5;
  border-radius: var(--ps-radius);
  overflow: hidden;
}
.ps-poster__img { position: absolute; inset: 0; }
.ps-poster__card {
  position: absolute;
  right: 24px;
  bottom: 24px;
  max-width: 400px;
  padding: 24px;
  background: var(--ps-bg);
  color: var(--ps-fg);
  border-radius: var(--ps-radius);
  text-align: left;
}
.ps-poster__card .ps-lede { margin: 0; font-size: 16px; color: var(--ps-muted); }
.ps-poster__card .ps-actions { margin-top: 18px; justify-content: flex-start; }

/* Editorial: a photograph half, a colour half, the headline across the seam. */
.ps-editorial {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: clamp(560px, 80vh, 820px);
  overflow: hidden;
}
.ps-editorial__photo { position: relative; }
.ps-editorial__photo::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgb(0 0 0 / 5%), rgb(0 0 0 / 35%));
}
.ps-editorial__panel { position: relative; background: var(--ps-section-bg); }
.ps-editorial__inset {
  position: absolute;
  top: 13%;
  right: 16%;
  width: 46%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--ps-radius);
}
.ps-editorial__words {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 12%;
  text-align: center;
  color: #ffffff;
}
.ps-editorial__words .ps-h1 {
  font-size: clamp(44px, 7vw, 108px);
  text-shadow: 0 2px 30px rgb(0 0 0 / 25%);
  max-width: 11ch;
}
.ps-editorial__words .ps-lede { color: rgb(255 255 255 / 88%); margin-inline: auto; }
.ps-editorial__words .ps-eyebrow { color: rgb(255 255 255 / 80%); }
.ps-editorial__words .ps-actions { justify-content: center; }
.ps-editorial .ps-btn--ghost { color: #ffffff; }

/* Split and arch: words on the section colour, a photograph beside them. */
.ps-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: clamp(540px, 78vh, 800px);
}
.ps-split__words {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 72px max(28px, 7%);
}
.ps-split__media { position: relative; overflow: hidden; }
.ps-split[data-shape="arch"] .ps-split__media {
  margin: 48px max(28px, 7%) 0;
  border-radius: 999px 999px 0 0;
}

/* Centered: words above a wide photograph. */
.ps-centered__words { text-align: center; }
.ps-centered__words .ps-h1 { margin-inline: auto; max-width: 18ch; font-size: clamp(40px, 6vw, 88px); }
.ps-centered__words .ps-lede { margin-inline: auto; }
.ps-centered__words .ps-actions { justify-content: center; }
.ps-centered__media {
  position: relative;
  margin-top: 48px;
  aspect-ratio: 21 / 9;
  border-radius: var(--ps-radius);
  overflow: hidden;
}

/* ---- Services layouts ------------------------------------------------------ */

.ps-photo-card { min-width: 0; }
.ps-photo-card__media {
  position: relative;
  aspect-ratio: 4 / 5;
  margin-bottom: 18px;
  border-radius: var(--ps-radius);
  overflow: hidden;
}
.ps-photo-card .ps-body { margin-top: 8px; }

.ps-rows { display: grid; gap: calc(56px * var(--ps-density)); margin-top: 44px; }
.ps-row { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.ps-row:nth-child(even) .ps-row__media { order: 2; }
.ps-row__media { position: relative; aspect-ratio: 5 / 4; border-radius: var(--ps-radius); overflow: hidden; }
.ps-row__words { text-align: left; }
.ps-row__title {
  margin: 0 0 14px;
  font-family: var(--ps-font-display);
  font-weight: var(--ps-display-weight, 600);
  letter-spacing: var(--ps-display-tracking, -0.02em);
  font-size: clamp(26px, 3vw, 40px);
  line-height: 1.08;
}

.ps-index { list-style: none; margin: 40px 0 0; padding: 0; border-top: 1px solid currentColor; }
.ps-index__item {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: baseline;
  padding: 26px 0;
  border-bottom: 1px solid var(--ps-line);
  text-align: left;
}
.ps-index__num { font-size: 13px; color: var(--ps-section-muted); font-variant-numeric: tabular-nums; }
.ps-index__title {
  margin: 0;
  font-family: var(--ps-font-display);
  font-weight: var(--ps-display-weight, 600);
  letter-spacing: var(--ps-display-tracking, -0.02em);
  font-size: clamp(24px, 2.6vw, 36px);
  line-height: 1.1;
}
.ps-index__body { color: var(--ps-section-muted); }
.ps-index__body strong { display: block; margin-top: 8px; color: var(--ps-section-fg); font-weight: 600; }

/* ---- About as a statement -------------------------------------------------- */

.ps-statement__text {
  margin: 0;
  font-family: var(--ps-font-display);
  font-weight: var(--ps-display-weight, 500);
  letter-spacing: var(--ps-display-tracking, -0.02em);
  font-size: clamp(26px, 3.4vw, 48px);
  line-height: 1.16;
  text-wrap: pretty;
  max-width: 30ch;
  margin-inline: var(--ps-mi);
}
.ps-statement .ps-intro { margin-top: 24px; }

/* ---- Gallery layouts ------------------------------------------------------- */

.ps-mosaic, .ps-strip { display: grid; gap: 16px; margin-top: 36px; }
.ps-mosaic { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: 240px; }
.ps-mosaic .ps-tile:first-child { grid-column: span 2; grid-row: span 2; }
.ps-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.ps-strip .ps-tile { aspect-ratio: 3 / 4; }
.ps-tile { position: relative; margin: 0; overflow: hidden; border-radius: var(--ps-radius); min-height: 0; }
.ps-tile__caption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 5px 10px;
  background: rgb(0 0 0 / 55%);
  color: #ffffff;
  font-size: 12.5px;
  border-radius: var(--ps-btn-radius);
}

/* ---- One large testimonial ------------------------------------------------- */

.ps-bigquote { margin: 0; text-align: center; }
.ps-bigquote__text {
  margin: 18px auto 0;
  max-width: 26ch;
  font-family: var(--ps-font-display);
  font-weight: var(--ps-display-weight, 500);
  letter-spacing: var(--ps-display-tracking, -0.02em);
  font-size: clamp(28px, 3.6vw, 50px);
  line-height: 1.15;
  text-wrap: balance;
}
.ps-bigquote__text::before { content: "\201C"; }
.ps-bigquote__text::after { content: "\201D"; }
.ps-bigquote .ps-attribution { justify-content: center; margin-top: 26px; }

/* ---- Call to action band --------------------------------------------------- */

.ps-band { position: relative; text-align: center; }
.ps-band[data-media="true"] {
  min-height: 460px;
  display: grid;
  place-items: center;
  color: #ffffff;
  overflow: hidden;
}
.ps-band__img { position: absolute; inset: 0; }
.ps-band__words { position: relative; padding: 96px 28px; max-width: 760px; margin-inline: auto; }
.ps-band[data-media="false"] .ps-band__words { padding: 0 0; }
.ps-band .ps-intro { margin-inline: auto; }
.ps-band[data-media="true"] .ps-intro { color: rgb(255 255 255 / 86%); }
.ps-band .ps-actions { justify-content: center; }
.ps-band .ps-h2 { font-size: clamp(30px, 4.4vw, 60px); }

/* ---- Narrow screens --------------------------------------------------------- */

/* Structure, not an author's dial, so it lives here rather than in the override
   table: two side-by-side halves cannot survive a phone, whatever was chosen. */
@media (max-width: 760px) {
  .ps-editorial, .ps-split { grid-template-columns: 1fr; min-height: 0; }
  .ps-editorial__photo { aspect-ratio: 4 / 5; }
  .ps-editorial__panel { display: none; }
  .ps-editorial__words { padding: 40px 24px; justify-content: flex-end; }
  .ps-split__media { order: -1; aspect-ratio: 4 / 5; }
  .ps-split[data-shape="arch"] .ps-split__media { margin: 24px 24px 0; }
  .ps-split__words { padding: 40px 24px 56px; }
  .ps-poster__media { aspect-ratio: 4 / 5; }
  .ps-poster__card { left: 14px; right: 14px; bottom: 14px; max-width: none; padding: 18px; }
  .ps-centered__media { aspect-ratio: 4 / 3; }
  .ps-row { grid-template-columns: 1fr; gap: 20px; }
  .ps-row:nth-child(even) .ps-row__media { order: 0; }
  .ps-index__item { grid-template-columns: 40px minmax(0, 1fr); }
  .ps-index__body { grid-column: 2; }
  .ps-mosaic { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; }
  .ps-strip { grid-template-columns: 1fr 1fr; }
}

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

/** The complete stylesheet for a rendered page, tokens and typefaces included. */
export const pageStylesheet = (theme: PageTheme): string =>
  `${fontImport(theme)}\n:root {\n${themeVarsCss(theme)}\n}\n${BASE}`;

/* ============================================================================
   RESPONSIVE CSS FOR THE PUBLISHED PAGE
   ----------------------------------------------------------------------------
   The canvas shows one breakpoint at a time and resolves the cascade in JS.
   A published page is viewed at every width at once, so the same override
   table is emitted as media queries here.

   One source, two outputs. The alternative — letting the live site fall back
   to plain CSS breakpoints — would mean the phone layout an owner arranged in
   the editor was not the phone layout their visitors got.
   ========================================================================== */

/** How each dial reaches the page: as a custom property on the section. */
const DIAL_VAR: Record<SectionStyleProperty, (value: SectionStyle[SectionStyleProperty]) => string> = {
  spacing: (v) => `--ps-pad:${SPACING_PX[v as SectionSpacing]}`,
  width: (v) => `--ps-max:${WIDTH_PX[v as SectionWidth]}`,
  columns: (v) => `--ps-cols:${v as number}`,
  align: (v) =>
    v === "center"
      ? "--ps-align:center;--ps-justify:center;--ps-mi:auto"
      : "--ps-align:left;--ps-justify:flex-start;--ps-mi:0",
  background: (v) => BACKGROUND_VARS[v as SectionBackground],
};

const SPACING_PX: Record<SectionSpacing, string> = {
  compact: "36px",
  normal: "64px",
  roomy: "92px",
  grand: "124px",
};

const WIDTH_PX: Record<SectionWidth, string> = {
  narrow: "680px",
  normal: "1080px",
  wide: "1320px",
};

const BACKGROUND_VARS: Record<SectionBackground, string> = {
  default: "--ps-section-bg:var(--ps-bg);--ps-section-fg:var(--ps-fg);--ps-section-muted:var(--ps-muted)",
  subtle:
    "--ps-section-bg:var(--ps-subtle);--ps-section-fg:var(--ps-fg);--ps-section-muted:var(--ps-muted)",
  inverse:
    "--ps-section-bg:var(--ps-inverse-bg);--ps-section-fg:var(--ps-inverse-fg);--ps-section-muted:var(--ps-inverse-muted)",
  brand:
    "--ps-section-bg:var(--ps-brand);--ps-section-fg:var(--ps-brand-ink);--ps-section-muted:currentColor",
};

/**
 * Media queries for every override on the page, narrowest last so the cascade
 * resolves the same way the editor does.
 */
export function responsiveCss(page: ConciergePage): string {
  const blocks: string[] = [];

  for (const breakpoint of BREAKPOINT_ORDER) {
    const maxWidth = getBreakpoint(breakpoint).maxWidth;
    if (maxWidth === null) continue;

    const rules: string[] = [];
    for (const section of page.sections) {
      const declarations = STYLE_PROPERTIES.map((property) => {
        const decl = page.styleOverrides[styleDeclKey(section.id, breakpoint, property)];
        return decl === undefined ? null : DIAL_VAR[decl.property](decl.value);
      }).filter((d): d is string => d !== null);

      if (declarations.length > 0) {
        /* `.ps-section[data-section-id]` rather than the attribute alone: the
           base rules are class-plus-attribute, so a bare attribute selector
           loses on specificity and source order never gets a say. Matching
           their specificity lets "later wins" do the work. */
        rules.push(`.ps-section[data-section-id="${section.id}"]{${declarations.join(";")}}`);
      }
    }

    if (rules.length > 0) {
      blocks.push(`@media (max-width:${maxWidth}px){${rules.join("")}}`);
    }
  }

  /* Below the narrowest authored breakpoint a multi-column grid is unusable no
     matter what the author chose, so one floor is applied. It sits after the
     authored rules deliberately: it is a safety net, not a preference. */
  blocks.push(
    `@media (max-width:560px){.ps-section[data-cols]{--ps-cols:1}` +
      `.ps-hero__layout[data-media="true"],.ps-about__layout[data-media="true"]{grid-template-columns:1fr}` +
      `.ps-header__inner{flex-wrap:wrap;gap:12px}.ps-nav{margin-left:0}}`,
  );

  return blocks.join("\n");
}
