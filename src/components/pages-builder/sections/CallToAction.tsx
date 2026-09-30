import type { CtaContent } from "@/lib/types";
import { Cta, Photo } from "./shared";

/**
 * The closing ask. With a photograph it becomes a full-width band with the
 * words over it; without one it is a plain centred block on the section's own
 * background, which the owner can make brand-coloured.
 */
export function CallToAction({ content }: { content: CtaContent }) {
  const hasImage = Boolean(content.image?.src);
  return (
    <div className="ps-band" data-media={hasImage}>
      {hasImage && (
        <>
          <Photo image={content.image} className="ps-band__img" />
          <div className="ps-cover__shade" aria-hidden />
        </>
      )}
      <div className="ps-band__words">
        <h2 className="ps-h2">{content.heading}</h2>
        {content.body && <p className="ps-intro">{content.body}</p>}
        {content.cta && (
          <div className="ps-actions">
            <Cta cta={content.cta} />
          </div>
        )}
      </div>
    </div>
  );
}
