"use client";

import { useId, type ReactNode } from "react";
import { Select, SegmentedControl } from "@/components/ui";
import { cx } from "@/lib/cx";
import {
  BASE_BREAKPOINT,
  STYLE_PROPERTIES_BY_KIND,
  getBreakpoint,
  isStyleSetAt,
  resolveSectionStyle,
  styleOriginBreakpoint,
} from "@/lib/pages-builder";
import { dispatch } from "@/lib/pages-editor";
import type {
  ConciergePage,
  PageBreakpoint,
  PageSection,
  SectionAlign,
  SectionBackground,
  SectionColumns,
  SectionSpacing,
  SectionStyleProperty,
  SectionWidth,
} from "@/lib/types";

/* ============================================================================
   THE DESIGN TAB
   ----------------------------------------------------------------------------
   Five dials, each an enumeration. The owner cannot express an ugly page in
   this vocabulary, which is the point — every combination is one the renderers
   were designed against.

   Which breakpoint is being edited comes from the toolbar, so the dials always
   describe what is on screen. Editing at Desktop changes the base and every
   width inherits it; editing narrower writes an override and says so, with one
   click to give it back.
   ========================================================================== */

const BACKGROUNDS: { value: SectionBackground; label: string }[] = [
  { value: "default", label: "Page" },
  { value: "subtle", label: "Tinted" },
  { value: "inverse", label: "Dark" },
  { value: "brand", label: "Brand colour" },
];

const SPACINGS: { value: SectionSpacing; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "normal", label: "Normal" },
  { value: "roomy", label: "Roomy" },
  { value: "grand", label: "Generous" },
];

const WIDTHS: { value: SectionWidth; label: string }[] = [
  { value: "narrow", label: "Narrow" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
];

const ALIGNS: { value: SectionAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
];

const COLUMNS: { value: string; label: string }[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
];

/**
 * One dial, plus where its current value came from. Saying "inherited from
 * Desktop" matters: without it an owner cannot tell a value they chose here
 * from one that merely arrived, and they end up overriding things by accident.
 */
function Dial({
  label,
  overridden,
  originLabel,
  onReset,
  children,
}: {
  label: string;
  overridden: boolean;
  originLabel: string | null;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className={cx("text-[13px] font-medium", overridden && "text-accent-ink")}>{label}</span>
        {overridden && <span className="h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden />}
        {overridden ? (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-[11.5px] text-text-tertiary underline underline-offset-2 transition-colors hover:text-text-primary"
          >
            Reset
          </button>
        ) : (
          originLabel && (
            <span className="ml-auto text-[11.5px] text-text-tertiary">from {originLabel}</span>
          )
        )}
      </div>
      {children}
    </div>
  );
}

export function DesignForm({
  section,
  page,
  breakpoint,
}: {
  section: PageSection;
  page: ConciergePage;
  breakpoint: PageBreakpoint;
}) {
  const id = useId();
  const resolved = resolveSectionStyle(section, page.styleOverrides, breakpoint);
  const offered = STYLE_PROPERTIES_BY_KIND[section.kind];
  const atBase = breakpoint === BASE_BREAKPOINT;

  const dialProps = (property: SectionStyleProperty) => {
    const setHere = !atBase && isStyleSetAt(page.styleOverrides, section.id, breakpoint, property);
    const origin = styleOriginBreakpoint(section.id, page.styleOverrides, breakpoint, property);
    return {
      overridden: setHere,
      originLabel: setHere || atBase ? null : getBreakpoint(origin).label,
      onReset: () => dispatch({ type: "clearStyle", sectionId: section.id, breakpoint, property }),
    };
  };

  return (
    <div className="space-y-5">
      <p className="border border-line bg-surface-subtle px-3 py-2.5 text-[12.5px] leading-[1.5] text-text-secondary">
        {atBase
          ? "Editing at Desktop. Tablet and mobile inherit these unless you change them there."
          : `Editing at ${getBreakpoint(breakpoint).label}. Anything you change here overrides Desktop at this width only.`}
      </p>

      {offered.includes("background") && (
        <Dial label="Background" {...dialProps("background")}>
          <Select
            aria-label="Background"
            value={resolved.background}
            onChange={(e) =>
              dispatch({
                type: "setStyle",
                sectionId: section.id,
                breakpoint,
                property: "background",
                value: e.target.value as SectionBackground,
              })
            }
          >
            {BACKGROUNDS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Dial>
      )}

      {offered.includes("spacing") && (
        <Dial label="Vertical space" {...dialProps("spacing")}>
          <Select
            aria-label="Vertical space"
            value={resolved.spacing}
            onChange={(e) =>
              dispatch({
                type: "setStyle",
                sectionId: section.id,
                breakpoint,
                property: "spacing",
                value: e.target.value as SectionSpacing,
              })
            }
          >
            {SPACINGS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Dial>
      )}

      {offered.includes("width") && (
        <Dial label="Content width" {...dialProps("width")}>
          <Select
            aria-label="Content width"
            value={resolved.width}
            onChange={(e) =>
              dispatch({
                type: "setStyle",
                sectionId: section.id,
                breakpoint,
                property: "width",
                value: e.target.value as SectionWidth,
              })
            }
          >
            {WIDTHS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Dial>
      )}

      {offered.includes("align") && (
        <Dial label="Alignment" {...dialProps("align")}>
          <SegmentedControl
            label="Alignment"
            value={resolved.align}
            onChange={(value) =>
              dispatch({ type: "setStyle", sectionId: section.id, breakpoint, property: "align", value })
            }
            options={ALIGNS}
          />
        </Dial>
      )}

      {offered.includes("columns") && (
        <Dial label="Columns" {...dialProps("columns")}>
          <SegmentedControl
            label="Columns"
            value={String(resolved.columns)}
            onChange={(value) =>
              dispatch({
                type: "setStyle",
                sectionId: section.id,
                breakpoint,
                property: "columns",
                value: Number(value) as SectionColumns,
              })
            }
            options={COLUMNS}
          />
        </Dial>
      )}

      <p className="text-[12.5px] leading-[1.55] text-text-tertiary" id={id}>
        Colours, type and corners are set once for the whole site. Deselect this section to change
        them.
      </p>
    </div>
  );
}
