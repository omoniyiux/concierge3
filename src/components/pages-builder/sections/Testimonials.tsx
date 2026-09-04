import type { TestimonialsContent } from "@/lib/types";
import { Empty, Rating } from "./shared";

export function Testimonials({ content }: { content: TestimonialsContent }) {
  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.items.length === 0 ? (
        <Empty>No reviews added yet.</Empty>
      ) : (
        <div className="ps-grid">
          {content.items.map((t) => (
            <figure key={t.id} className="ps-card" style={{ margin: 0 }}>
              {t.rating !== undefined && <Rating value={t.rating} />}
              <blockquote className="ps-quote" style={{ marginTop: t.rating === undefined ? 0 : 12 }}>
                {t.quote}
              </blockquote>
              <figcaption className="ps-attribution">
                {t.avatar?.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="ps-avatar" src={t.avatar.src} alt={t.avatar.alt} />
                )}
                <span className="ps-attribution__name">
                  {t.author}
                  {t.detail && <span>{t.detail}</span>}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
