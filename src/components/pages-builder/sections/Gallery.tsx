import type { GalleryContent } from "@/lib/types";
import { Empty, Media, Photo } from "./shared";

/**
 * `grid` is even; `mosaic` lets the first picture lead at twice the size;
 * `strip` is a row of tall portraits, for work that is best seen side by side.
 */
export function Gallery({ content }: { content: GalleryContent }) {
  const layout = content.layout ?? "grid";
  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.intro && <p className="ps-intro">{content.intro}</p>}
      {content.items.length === 0 ? (
        <Empty>No images added yet.</Empty>
      ) : layout === "grid" ? (
        <div className="ps-grid">
          {content.items.map((item) => (
            <figure key={item.id} style={{ margin: 0, minWidth: 0 }}>
              <Media image={item.image} />
              {item.caption && <figcaption className="ps-gallery__caption">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <div className={layout === "mosaic" ? "ps-mosaic" : "ps-strip"}>
          {content.items.map((item) => (
            <figure key={item.id} className="ps-tile">
              <Photo image={item.image} className="ps-fill" />
              {item.caption && <figcaption className="ps-tile__caption">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </>
  );
}
