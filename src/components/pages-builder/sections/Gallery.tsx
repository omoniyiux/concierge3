import type { GalleryContent } from "@/lib/types";
import { Empty, Media } from "./shared";

export function Gallery({ content }: { content: GalleryContent }) {
  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.intro && <p className="ps-intro">{content.intro}</p>}
      {content.items.length === 0 ? (
        <Empty>No images added yet.</Empty>
      ) : (
        <div className="ps-grid">
          {content.items.map((item) => (
            <figure key={item.id} style={{ margin: 0, minWidth: 0 }}>
              <Media image={item.image} />
              {item.caption && <figcaption className="ps-gallery__caption">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
