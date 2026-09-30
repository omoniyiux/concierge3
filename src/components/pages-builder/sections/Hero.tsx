import type { ReactNode } from "react";
import type { HeroContent, HeroLayout } from "@/lib/types";
import { Cta, Media, Photo } from "./shared";

/** Layouts that run edge to edge and so draw their own inner column. */
export const FULL_BLEED_HEROES: HeroLayout[] = ["cover", "editorial", "split", "arch"];

function Words({ content, className }: { content: HeroContent; className?: string }) {
  return (
    <div className={className}>
      {content.eyebrow && <p className="ps-eyebrow">{content.eyebrow}</p>}
      <h1 className="ps-h1">{content.headline}</h1>
      {content.subheadline && <p className="ps-lede">{content.subheadline}</p>}
      {(content.cta || content.secondaryCta) && (
        <div className="ps-actions">
          {content.cta && <Cta cta={content.cta} />}
          {content.secondaryCta && <Cta cta={content.secondaryCta} variant="ghost" />}
        </div>
      )}
    </div>
  );
}

/**
 * Seven compositions over the same content, so switching layout never loses a
 * word the owner wrote. `aside` fills the second column of `classic` when
 * there is no picture — the page's own services, drawn as a card — so a site
 * with no photographs yet still has a first screen with some weight to it.
 */
export function Hero({ content, aside }: { content: HeroContent; aside?: ReactNode }) {
  const layout = content.layout ?? "classic";

  switch (layout) {
    case "cover":
      return (
        <div className="ps-cover">
          <Photo image={content.image} className="ps-cover__img" />
          <div className="ps-cover__shade" aria-hidden />
          <Words content={content} className="ps-cover__words" />
        </div>
      );

    case "poster":
      return (
        <div className="ps-poster">
          {content.eyebrow && <p className="ps-eyebrow">{content.eyebrow}</p>}
          <h1 className="ps-poster__title">{content.headline}</h1>
          <div className="ps-poster__media">
            <Photo image={content.image} className="ps-poster__img" />
            {(content.subheadline || content.cta) && (
              <div className="ps-poster__card">
                {content.subheadline && <p className="ps-lede">{content.subheadline}</p>}
                <div className="ps-actions">
                  {content.cta && <Cta cta={content.cta} />}
                  {content.secondaryCta && <Cta cta={content.secondaryCta} variant="ghost" />}
                </div>
              </div>
            )}
          </div>
        </div>
      );

    case "editorial":
      return (
        <div className="ps-editorial">
          <div className="ps-editorial__photo">
            <Photo image={content.image} className="ps-fill" />
          </div>
          <div className="ps-editorial__panel">
            {content.secondaryImage?.src && (
              <div className="ps-editorial__inset">
                <Photo image={content.secondaryImage} className="ps-fill" />
              </div>
            )}
          </div>
          <Words content={content} className="ps-editorial__words" />
        </div>
      );

    case "split":
    case "arch":
      return (
        <div className="ps-split" data-shape={layout}>
          <Words content={content} className="ps-split__words" />
          <div className="ps-split__media">
            <Photo image={content.image} className="ps-fill" />
          </div>
        </div>
      );

    case "centered":
      return (
        <div className="ps-centered">
          <Words content={content} className="ps-centered__words" />
          {content.image?.src && (
            <div className="ps-centered__media">
              <Photo image={content.image} className="ps-fill" />
            </div>
          )}
        </div>
      );

    case "classic": {
      const hasMedia = content.image !== undefined;
      return (
        <div className="ps-hero__layout" data-media={hasMedia || aside !== undefined}>
          <Words content={content} />
          {hasMedia ? <Media image={content.image} /> : aside}
        </div>
      );
    }
  }
}
