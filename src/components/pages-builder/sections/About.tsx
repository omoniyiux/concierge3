import type { AboutContent } from "@/lib/types";
import { Media } from "./shared";

/**
 * `statement` sets the first paragraph as display type — one confident
 * sentence about the business, the way an editorial site introduces itself.
 * The heading steps down to a label above it.
 */
export function About({ content }: { content: AboutContent }) {
  if (content.layout === "statement") {
    const [lead, ...rest] = content.body.split(/\n\s*\n/);
    return (
      <div className="ps-statement">
        <p className="ps-eyebrow">{content.heading}</p>
        <p className="ps-statement__text">{lead}</p>
        {rest.length > 0 && <p className="ps-intro">{rest.join(" ")}</p>}
      </div>
    );
  }

  const hasMedia = content.image !== undefined;
  return (
    <div className="ps-about__layout" data-media={hasMedia}>
      <div>
        <h2 className="ps-h2">{content.heading}</h2>
        {content.body && <p className="ps-intro" style={{ whiteSpace: "pre-line" }}>{content.body}</p>}
        {content.highlights.length > 0 && (
          <ul className="ps-highlights">
            {content.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
      </div>
      {hasMedia && <Media image={content.image} label="Photograph" />}
    </div>
  );
}
