import type { ServicesContent } from "@/lib/types";
import { SiteIcon, isSiteIconName } from "../site-icons";
import { Empty, Media } from "./shared";

export function Services({ content }: { content: ServicesContent }) {
  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.intro && <p className="ps-intro">{content.intro}</p>}
      {content.items.length === 0 ? (
        <Empty>No services added yet.</Empty>
      ) : (
        <div className="ps-grid">
          {content.items.map((item) => (
            <article key={item.id} className="ps-card">
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
          ))}
        </div>
      )}
    </>
  );
}
