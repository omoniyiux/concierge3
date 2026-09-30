import type { ServiceItem, ServicesContent } from "@/lib/types";
import { SiteIcon, isSiteIconName } from "../site-icons";
import { Empty, Media, Photo } from "./shared";

function CardItem({ item }: { item: ServiceItem }) {
  return (
    <article className="ps-card">
      {/* A picture outranks an icon: someone who went to the trouble of
          finding a photograph of their own meant to use it. */}
      {item.image?.src ? (
        <div className="ps-card__media">
          <Media image={item.image} />
        </div>
      ) : (
        item.icon &&
        isSiteIconName(item.icon) && (
          <span className="ps-card__icon">
            <SiteIcon name={item.icon} size={26} />
          </span>
        )
      )}
      <h3 className="ps-h3">{item.name}</h3>
      {item.description && <p className="ps-body" style={{ marginTop: 10 }}>{item.description}</p>}
      {item.price && <p className="ps-card__price">{item.price}</p>}
    </article>
  );
}

/**
 * Four ways to show the same list. `cards` is the plain grid; `photo` leads
 * with pictures; `rows` alternates picture and words down the page; `list` is
 * a numbered index for a business whose work is better described than shown.
 */
export function Services({ content }: { content: ServicesContent }) {
  const layout = content.layout ?? "cards";
  const items = content.items;

  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.intro && <p className="ps-intro">{content.intro}</p>}
      {items.length === 0 ? (
        <Empty>No services added yet.</Empty>
      ) : layout === "photo" ? (
        <div className="ps-grid">
          {items.map((item) => (
            <article key={item.id} className="ps-photo-card">
              <div className="ps-photo-card__media">
                <Photo image={item.image} className="ps-fill" />
              </div>
              <h3 className="ps-h3">{item.name}</h3>
              {item.description && <p className="ps-body">{item.description}</p>}
              {item.price && <p className="ps-card__price">{item.price}</p>}
            </article>
          ))}
        </div>
      ) : layout === "rows" ? (
        <div className="ps-rows">
          {items.map((item) => (
            <article key={item.id} className="ps-row">
              <div className="ps-row__media">
                <Photo image={item.image} className="ps-fill" />
              </div>
              <div className="ps-row__words">
                <h3 className="ps-row__title">{item.name}</h3>
                {item.description && <p className="ps-body">{item.description}</p>}
                {item.price && <p className="ps-card__price">{item.price}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : layout === "list" ? (
        <ol className="ps-index">
          {items.map((item, i) => (
            <li key={item.id} className="ps-index__item">
              <span className="ps-index__num">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="ps-index__title">{item.name}</h3>
              <span className="ps-index__body">
                {item.description}
                {item.price && <strong>{item.price}</strong>}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="ps-grid">
          {items.map((item) => (
            <CardItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}
