import type { OpeningHours, PageSection, SectionStyle } from "@/lib/types";
import { About } from "./About";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { Gallery } from "./Gallery";
import { Hero } from "./Hero";
import { Pricing } from "./Pricing";
import { Services } from "./Services";
import { Testimonials } from "./Testimonials";

export { RenderModeProvider, useRenderMode, type RenderMode } from "./shared";

/**
 * `section.kind` narrows `section.content`, so each renderer receives exactly
 * the content type it was written against and the switch needs no assertions.
 * Omitting a kind is a compile error, which is the point of the union.
 */
function SectionBody({ section, hours }: { section: PageSection; hours?: OpeningHours }) {
  switch (section.kind) {
    case "hero":
      return <Hero content={section.content} />;
    case "services":
      return <Services content={section.content} />;
    case "about":
      return <About content={section.content} />;
    case "testimonials":
      return <Testimonials content={section.content} />;
    case "pricing":
      return <Pricing content={section.content} />;
    case "faq":
      return <Faq content={section.content} />;
    case "contact":
      return <Contact content={section.content} hours={hours} />;
    case "gallery":
      return <Gallery content={section.content} />;
  }
}

/**
 * The wrapper every section shares. The resolved dials go on as data
 * attributes rather than classes: the stylesheet reads them, devtools shows
 * the effective look at a glance, and Phase 2's selection layer gets a stable
 * `data-section-id` to hit-test against without touching the renderers.
 */
export function SectionRenderer({
  section,
  style,
  hours,
}: {
  section: PageSection;
  style: SectionStyle;
  hours?: OpeningHours;
}) {
  return (
    <section
      className={`ps-section ps-section--${section.kind}`}
      data-section-id={section.id}
      data-kind={section.kind}
      data-bg={style.background}
      data-spacing={style.spacing}
      data-align={style.align}
      data-width={style.width}
      data-cols={style.columns}
    >
      <div className="ps-inner">
        <SectionBody section={section} hours={hours} />
      </div>
    </section>
  );
}
