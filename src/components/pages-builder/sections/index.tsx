import type { ReactNode } from "react";
import type { OpeningHours, PageSection, SectionStyle } from "@/lib/types";
import { About } from "./About";
import { CallToAction } from "./CallToAction";
import { Contact } from "./Contact";
import { Faq } from "./Faq";
import { Gallery } from "./Gallery";
import { FULL_BLEED_HEROES, Hero } from "./Hero";
import { Pricing } from "./Pricing";
import { Services } from "./Services";
import { Testimonials } from "./Testimonials";

/**
 * `section.kind` narrows `section.content`, so each renderer receives exactly
 * the content type it was written against and the switch needs no assertions.
 * Omitting a kind is a compile error, which is the point of the union.
 */
function SectionBody({
  section,
  hours,
  heroAside,
}: {
  section: PageSection;
  hours?: OpeningHours;
  heroAside?: ReactNode;
}) {
  switch (section.kind) {
    case "hero":
      return <Hero content={section.content} aside={heroAside} />;
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
    case "cta":
      return <CallToAction content={section.content} />;
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
  heroAside,
}: {
  section: PageSection;
  style: SectionStyle;
  hours?: OpeningHours;
  /** Only the first hero on a page gets one. */
  heroAside?: ReactNode;
}) {
  const layout = "layout" in section.content ? section.content.layout : undefined;
  /* Full-bleed compositions run edge to edge, so they skip the padded inner
     column and draw their own. A closing band with a photograph does too. */
  const bleed =
    (section.kind === "hero" && FULL_BLEED_HEROES.includes(section.content.layout ?? "classic")) ||
    (section.kind === "cta" && Boolean(section.content.image?.src));

  return (
    <section
      id={section.id}
      className={`ps-section ps-section--${section.kind}`}
      data-section-id={section.id}
      data-kind={section.kind}
      data-layout={layout}
      data-bleed={bleed || undefined}
      data-bg={style.background}
      data-spacing={style.spacing}
      data-align={style.align}
      data-width={style.width}
      data-cols={style.columns}
    >
      {bleed ? (
        <SectionBody section={section} hours={hours} heroAside={heroAside} />
      ) : (
        <div className="ps-inner">
          <SectionBody section={section} hours={hours} heroAside={heroAside} />
        </div>
      )}
    </section>
  );
}
