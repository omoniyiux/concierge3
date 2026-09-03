"use client";

import { useId } from "react";
import { Field, Input, SegmentedControl, Select } from "@/components/ui";
import { contrastRatio, readableInk } from "@/lib/page-theme";
import { dispatch } from "@/lib/pages-editor";
import type {
  PageTheme,
  ThemeButtonShape,
  ThemeDensity,
  ThemeFontPairing,
  ThemeRadius,
} from "@/lib/types";

/* ============================================================================
   SITE THEME
   ----------------------------------------------------------------------------
   Set once for the whole site, because a site whose pages disagreed about
   their own typography would not read as a site.

   Nothing here is a Concierge token. The workspace is square-cornered and
   monochrome by conviction; a florist may want soft corners and a serif, and
   is right to. Keeping the two vocabularies apart is what the canvas iframe is
   for, and this panel is the customer's half of it.
   ========================================================================== */

const FONTS: { value: ThemeFontPairing; label: string }[] = [
  { value: "grotesk", label: "Clean and modern" },
  { value: "editorial", label: "Serif headings" },
  { value: "humanist", label: "Warm and friendly" },
  { value: "classic", label: "Traditional" },
];

const RADII: { value: ThemeRadius; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "soft", label: "Soft" },
  { value: "round", label: "Round" },
];

const BUTTONS: { value: ThemeButtonShape; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
];

const DENSITIES: { value: ThemeDensity; label: string }[] = [
  { value: "tight", label: "Tight" },
  { value: "regular", label: "Regular" },
  { value: "airy", label: "Airy" },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * A brand colour and what it will actually be legible against. An owner
 * picking a pale yellow deserves to be told before their buttons ship
 * unreadable, not after — the same argument globals.css makes about
 * Concierge's own orange carrying ink rather than white.
 */
function BrandColour({ theme }: { theme: PageTheme }) {
  const id = useId();
  const valid = HEX.test(theme.brandColor);
  const ink = valid ? readableInk(theme.brandColor) : "#ffffff";
  const ratio = valid ? contrastRatio(theme.brandColor, ink) : 0;

  const set = (brandColor: string) =>
    dispatch({ type: "setTheme", patch: { brandColor }, mergeKey: "brandColor" });

  return (
    <Field label="Brand colour" htmlFor={id} error={valid ? undefined : "Use a six-digit hex, like #1F3A5F"}>
      <div className="flex items-center gap-2">
        <label
          className="relative h-9 w-9 shrink-0 cursor-pointer border border-line-strong"
          style={{ background: valid ? theme.brandColor : "transparent" }}
        >
          <span className="sr-only">Pick a brand colour</span>
          <input
            type="color"
            value={valid ? theme.brandColor : "#000000"}
            onChange={(e) => set(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <Input
          id={id}
          value={theme.brandColor}
          spellCheck={false}
          onChange={(e) => set(e.target.value)}
        />
      </div>
      {valid && (
        <p className="mt-2 flex items-center gap-2 text-[11.5px] text-text-tertiary">
          <span
            className="inline-flex items-center px-1.5 py-0.5 text-[10.5px] font-semibold"
            style={{ background: theme.brandColor, color: ink }}
          >
            Buttons
          </span>
          {ink === "#ffffff" ? "White" : "Dark"} text, {ratio.toFixed(1)}:1
          {ratio < 4.5 && " — below the 4.5:1 minimum"}
        </p>
      )}
    </Field>
  );
}

export function ThemeForm({ theme }: { theme: PageTheme }) {
  const fontId = useId();
  const set = (patch: Partial<PageTheme>) => dispatch({ type: "setTheme", patch });

  return (
    <div className="space-y-5">
      <BrandColour theme={theme} />

      <Field label="Page colour" htmlFor="theme-mode">
        <SegmentedControl
          label="Page colour"
          value={theme.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Field>

      <Field label="Typeface" htmlFor={fontId}>
        <Select
          id={fontId}
          value={theme.fonts}
          onChange={(e) => set({ fonts: e.target.value as ThemeFontPairing })}
        >
          {FONTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Corners" htmlFor="theme-radius">
        <SegmentedControl
          label="Corners"
          value={theme.radius}
          onChange={(radius) => set({ radius })}
          options={RADII}
        />
      </Field>

      <Field label="Buttons" htmlFor="theme-buttons">
        <SegmentedControl
          label="Buttons"
          value={theme.buttonShape}
          onChange={(buttonShape) => set({ buttonShape })}
          options={BUTTONS}
        />
      </Field>

      <Field
        label="Density"
        htmlFor="theme-density"
        hint="Loosens or tightens the space around every section at once."
      >
        <SegmentedControl
          label="Density"
          value={theme.density}
          onChange={(density) => set({ density })}
          options={DENSITIES}
        />
      </Field>
    </div>
  );
}
