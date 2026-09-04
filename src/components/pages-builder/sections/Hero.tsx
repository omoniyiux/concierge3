import type { HeroContent } from "@/lib/types";
import { Cta, Media } from "./shared";

export function Hero({ content }: { content: HeroContent }) {
  const hasMedia = content.image !== undefined;
  return (
    <div className="ps-hero__layout" data-media={hasMedia}>
      <div>
        <h1 className="ps-h1">{content.headline}</h1>
        {content.subheadline && <p className="ps-lede">{content.subheadline}</p>}
        {(content.cta || content.secondaryCta) && (
          <div className="ps-actions">
            {content.cta && <Cta cta={content.cta} />}
            {content.secondaryCta && <Cta cta={content.secondaryCta} variant="ghost" />}
          </div>
        )}
      </div>
      {hasMedia && <Media image={content.image} />}
    </div>
  );
}
