"use client";

import { useState } from "react";
import { Button, Tabs, Toggle } from "@/components/ui";
import { CopyIcon, TrashIcon } from "@/components/icons";
import { sectionHint, sectionLabel } from "@/lib/pages-builder";
import { dispatch } from "@/lib/pages-editor";
import type { ConciergePage, PageBreakpoint, PageSection, PageTheme } from "@/lib/types";
import { TextRow } from "./inspector/fields";
import { DesignForm } from "./inspector/design";
import { ThemeForm } from "./inspector/theme";
import {
  AboutForm,
  ContactForm,
  FaqForm,
  GalleryForm,
  HeroForm,
  PricingForm,
  ServicesForm,
  TestimonialsForm,
} from "./inspector/forms";

/**
 * Narrowing on `kind` hands each form exactly the content type it was written
 * against, so the switch needs no assertions and a missing kind is a compile
 * error. Nothing here has to know what the other seven sections contain.
 */
function SectionForm({ section }: { section: PageSection }) {
  const patch = (patch: object, mergeKey?: string) =>
    dispatch({
      type: "patchContent",
      sectionId: section.id,
      patch,
      /* Scoped by section so the same field on two sections never coalesces. */
      mergeKey: mergeKey === undefined ? undefined : `${section.id}:${mergeKey}`,
    });

  switch (section.kind) {
    case "hero":
      return <HeroForm content={section.content} onChange={patch} />;
    case "services":
      return <ServicesForm content={section.content} onChange={patch} />;
    case "about":
      return <AboutForm content={section.content} onChange={patch} />;
    case "testimonials":
      return <TestimonialsForm content={section.content} onChange={patch} />;
    case "pricing":
      return <PricingForm content={section.content} onChange={patch} />;
    case "faq":
      return <FaqForm content={section.content} onChange={patch} />;
    case "contact":
      return <ContactForm content={section.content} onChange={patch} />;
    case "gallery":
      return <GalleryForm content={section.content} onChange={patch} />;
  }
}

/**
 * With nothing selected the panel is about the whole site. That is not an
 * empty state dressed up: deselecting is how you step back out to the theme,
 * and it keeps one panel doing one thing at each level rather than hiding
 * site-wide settings behind a second surface.
 */
function ThemePanel({ theme }: { theme: PageTheme }) {
  return (
    <div className="cg-scroll h-full overflow-y-auto">
      <div className="border-b border-divider px-4 py-3.5">
        <p className="t-eyebrow text-text-muted">Site theme</p>
        <p className="mt-1.5 text-[12.5px] leading-[1.5] text-text-tertiary">
          Applies to every page. Select a section to edit what it says.
        </p>
      </div>
      <div className="px-4 py-4">
        <ThemeForm theme={theme} />
      </div>
    </div>
  );
}

export function Inspector({
  section,
  page,
  theme,
  breakpoint,
}: {
  section: PageSection | undefined;
  page: ConciergePage;
  theme: PageTheme;
  breakpoint: PageBreakpoint;
}) {
  if (section === undefined) return <ThemePanel theme={theme} />;
  /* Keyed on the section so the tab resets with the selection. Content is the
     right landing place every time: a section that was just added is empty,
     and what it says matters more than how it looks. */
  return <SectionPanel key={section.id} section={section} page={page} breakpoint={breakpoint} />;
}

function SectionPanel({
  section,
  page,
  breakpoint,
}: {
  section: PageSection;
  page: ConciergePage;
  breakpoint: PageBreakpoint;
}) {
  const [tab, setTab] = useState<"content" | "design">("content");

  return (
    <div className="cg-scroll h-full overflow-y-auto">
      <div className="border-b border-divider px-4 py-3.5">
        <p className="t-eyebrow text-text-muted">{sectionLabel(section.kind)}</p>
        <p className="mt-1.5 text-[12.5px] leading-[1.5] text-text-tertiary">
          {sectionHint(section.kind)}
        </p>
      </div>

      <div className="space-y-5 border-b border-divider px-4 py-4">
        <TextRow
          label="Section name"
          value={section.title}
          hint="Only you see this. It names the section in the list."
          onChange={(title) => dispatch({ type: "setTitle", sectionId: section.id, title })}
        />
        <Toggle
          checked={section.enabled}
          onChange={() => dispatch({ type: "toggle", sectionId: section.id })}
          label="Show on the published page"
        />
      </div>

      <div className="border-b border-divider px-4 py-3">
        <Tabs
          label="Section settings"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "content", label: "Content" },
            { value: "design", label: "Design" },
          ]}
        />
      </div>

      <div className="space-y-5 px-4 py-4">
        {tab === "content" ? (
          <SectionForm section={section} />
        ) : (
          <DesignForm section={section} page={page} breakpoint={breakpoint} />
        )}
      </div>

      <div className="flex gap-2 border-t border-divider px-4 py-4">
        <Button
          variant="secondary"
          size="sm"
          leading={<CopyIcon size={13} />}
          onClick={() => dispatch({ type: "duplicateSection", sectionId: section.id })}
        >
          Duplicate
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leading={<TrashIcon size={13} />}
          onClick={() => dispatch({ type: "removeSection", sectionId: section.id })}
        >
          Remove section
        </Button>
      </div>
    </div>
  );
}
