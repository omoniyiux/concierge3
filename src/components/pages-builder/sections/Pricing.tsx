import type { PricingContent } from "@/lib/types";
import { Cta, Empty } from "./shared";

export function Pricing({ content }: { content: PricingContent }) {
  return (
    <>
      <h2 className="ps-h2">{content.heading}</h2>
      {content.intro && <p className="ps-intro">{content.intro}</p>}
      {content.tiers.length === 0 ? (
        <Empty>No pricing added yet.</Empty>
      ) : (
        <div className="ps-grid">
          {content.tiers.map((tier) => (
            <article key={tier.id} className="ps-card ps-tier" data-featured={tier.featured}>
              <h3 className="ps-h3">{tier.name}</h3>
              <p className="ps-tier__price">
                {tier.price}
                {tier.cadence && <span> {tier.cadence}</span>}
              </p>
              {tier.description && (
                <p className="ps-body" style={{ marginTop: 10 }}>
                  {tier.description}
                </p>
              )}
              {tier.features.length > 0 && (
                <ul className="ps-features">
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              )}
              {tier.cta && <Cta cta={tier.cta} variant={tier.featured ? "primary" : "ghost"} />}
            </article>
          ))}
        </div>
      )}
      {content.note && <p className="ps-note">{content.note}</p>}
    </>
  );
}
