import type { AboutContent } from "@/lib/types";
import { Media } from "./shared";

export function About({ content }: { content: AboutContent }) {
  const hasMedia = content.image !== undefined;
  return (
    <div className="ps-about__layout" data-media={hasMedia}>
      <div>
        <h2 className="ps-h2">{content.heading}</h2>
        {content.body && <p className="ps-intro">{content.body}</p>}
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
