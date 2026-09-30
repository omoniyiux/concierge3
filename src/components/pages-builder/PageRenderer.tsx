import { resolveSectionStyle, sectionLabel, visibleSections } from "@/lib/pages-builder";
import { agentOf, greetingFor, hasCapability, homeHero, quickActions } from "@/lib/page-agent";
import type {
  ConciergePage,
  PageAgent,
  PageBreakpoint,
  PageDocument,
  PublishedSiteFacts,
  ServiceItem,
} from "@/lib/types";
import { SectionRenderer } from "./sections";
import { Cta } from "./sections/shared";
import { SiteIcon, isSiteIconName } from "./site-icons";

/**
 * How the page is being looked at.
 *
 * - `edit`: the editor canvas. Clicks select sections, so nothing floats over
 *   the page that could get in the way of one — the agent sits closed and the
 *   promotion stays in its banner.
 * - `preview`: the owner looking at the finished thing. The agent can be shown
 *   open, the way a visitor would see it after one tap.
 * - `live`: the published site. Everything is there, closed until a visitor
 *   opens it.
 */
export type RenderMode = "edit" | "preview" | "live";

/**
 * A whole page: the site chrome an owner never has to think about, the
 * sections they do, and the Concierge agent that every Pages site carries.
 * The editor canvas and the published site both render this, which is what
 * guarantees the canvas cannot drift from what visitors eventually see.
 */
export function PageRenderer({
  document,
  page,
  site,
  breakpoint,
  mode = "live",
  agentOpen = false,
}: {
  document: PageDocument;
  page: ConciergePage;
  site: PublishedSiteFacts;
  breakpoint: PageBreakpoint;
  mode?: RenderMode;
  agentOpen?: boolean;
}) {
  const sections = visibleSections(page);
  const agent = agentOf(document);
  const cta = homeHero(document)?.content.cta;
  const promotion = hasCapability(agent, "promotions") ? agent.promotion : undefined;
  const firstHero = sections.find((s) => s.kind === "hero");
  /* A photograph that runs to the top of the page takes the header with it,
     the way every good template site does: the header sits on the picture. */
  const overlay =
    sections[0]?.kind === "hero" &&
    (sections[0].content.layout === "cover" || sections[0].content.layout === "editorial");
  const services = sections.find((s) => s.kind === "services");
  const heroAside =
    services?.kind === "services" && services.content.items.length > 0 ? (
      <HeroCard heading={services.content.heading} items={services.content.items} />
    ) : undefined;

  /* A one-page site has nowhere to navigate to, so its nav walks the page
     instead: the sections, in order, as anchors. */
  const nav =
    document.pages.length > 1
      ? document.pages.map((p) => ({
          key: p.id,
          href: p.slug === "" ? "/" : `/${p.slug}`,
          label: p.navLabel,
          current: p.id === page.id,
        }))
      : sections
          /* The hero is where they already are, and the closing band is an
             ask rather than a destination. */
          .filter((s) => s.kind !== "hero" && s.kind !== "cta")
          .slice(0, 4)
          .map((s) => ({ key: s.id, href: `#${s.id}`, label: sectionLabel(s.kind), current: false }));

  return (
    <>
      <div className="ps-top" data-overlay={overlay || undefined}>
        {promotion && (
          <div className="ps-promo-bar">
            <div className="ps-promo-bar__inner">
              <strong>{promotion.headline}</strong>
              <span>{promotion.detail}</span>
            </div>
          </div>
        )}

        <header className="ps-header">
          <div className="ps-header__inner">
            <span className="ps-wordmark">
              {document.theme.logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="ps-logo" src={document.theme.logo} alt="" />
              )}
              {site.name}
            </span>
            {nav.length > 0 && (
              <nav className="ps-nav">
                {nav.map((item) => (
                  <a key={item.key} href={item.href} aria-current={item.current ? "page" : undefined}>
                    {item.label}
                  </a>
                ))}
              </nav>
            )}
            {cta && (
              <span className="ps-header__cta">
                <Cta cta={cta} />
              </span>
            )}
          </div>
        </header>
      </div>

      <main>
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            style={resolveSectionStyle(section, page.styleOverrides, breakpoint)}
            hours={site.openingHours}
            heroAside={section === firstHero ? heroAside : undefined}
          />
        ))}
        {sections.length === 0 && (
          <section className="ps-section" data-spacing="grand" data-width="narrow" data-align="center">
            <div className="ps-inner">
              <p className="ps-empty">This page has no sections switched on yet. Add one to see it here.</p>
            </div>
          </section>
        )}
      </main>

      <footer className="ps-footer">
        <div className="ps-footer__inner">
          <span>
            &copy; {new Date().getFullYear()} {site.name}
          </span>
          <span>{site.url}</span>
          <a className="ps-footer__powered" href="https://poweredbyconcierge.com" rel="noreferrer">
            <ConciergeGlyph size={14} />
            Powered by Concierge
          </a>
        </div>
      </footer>

      {promotion && mode !== "edit" && (
        <details className="ps-promo" open>
          <summary aria-label="Close offer">&times;</summary>
          <div className="ps-promo__body">
            <p className="ps-promo__eyebrow">Special offer</p>
            <p className="ps-promo__title">{promotion.headline}</p>
            <p className="ps-promo__detail">{promotion.detail}</p>
            <input
              className="ps-promo__field"
              type={promotion.collects === "phone" ? "tel" : "email"}
              placeholder={promotion.collects === "phone" ? "Your phone number" : "Your email"}
              aria-label={promotion.collects === "phone" ? "Your phone number" : "Your email"}
            />
            <a className="ps-btn ps-btn--primary" href="#concierge">
              {promotion.cta}
            </a>
          </div>
        </details>
      )}

      <AgentWidget agent={agent} siteName={site.name} open={mode !== "live" && agentOpen} />
    </>
  );
}

/** The page's own services, as a card beside the headline. */
function HeroCard({ heading, items }: { heading: string; items: ServiceItem[] }) {
  return (
    <div className="ps-hero__card">
      <p className="ps-hero__card-title">{heading}</p>
      <ul className="ps-hero__card-list">
        {items.slice(0, 4).map((item) => (
          <li key={item.id}>
            <span className="ps-hero__card-icon">
              {item.icon && isSiteIconName(item.icon) ? <SiteIcon name={item.icon} size={18} /> : "✓"}
            </span>
            <span>
              <strong>{item.name}</strong>
              {item.description && <span>{item.description}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="ps-hero__card-foot">
        <ConciergeGlyph size={16} />
        Questions? Ask the assistant — it answers straight away.
      </p>
    </div>
  );
}

/**
 * The agent, promised on every page. A `<details>` element so that it opens
 * and closes on the published site without shipping a line of JavaScript; the
 * live conversation mounts into it once a visitor starts one.
 */
function AgentWidget({ agent, siteName, open }: { agent: PageAgent; siteName: string; open: boolean }) {
  const actions = quickActions(agent);
  return (
    <details className="ps-agent" id="concierge" open={open || undefined}>
      <summary aria-label={`Chat with ${siteName}`}>
        <ConciergeGlyph size={26} />
        Ask us anything
      </summary>
      <div className="ps-agent__panel" role="dialog" aria-label={`${siteName} assistant`}>
        <div className="ps-agent__head">
          <ConciergeGlyph size={30} />
          <span className="ps-agent__who">
            <strong>{siteName}</strong>
            <span>Online now</span>
          </span>
        </div>
        <div className="ps-agent__body">
          <p className="ps-agent__bubble">{greetingFor(agent, siteName)}</p>
          {actions.length > 0 && (
            <ul className="ps-agent__quick">
              {actions.map((label) => (
                <li key={label}>
                  <a href="#concierge">{label}</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="ps-agent__compose">
          Type a message…
          <span className="ps-agent__send" aria-hidden>
            &rarr;
          </span>
        </div>
        <p className="ps-agent__powered">
          <ConciergeGlyph size={13} />
          Powered by Concierge
        </p>
      </div>
    </details>
  );
}

/** The Concierge mark, drawn inline so a published page needs no asset for it. */
function ConciergeGlyph({ size }: { size: number }) {
  return (
    <svg className="ps-glyph" width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="15" fill="#0B0B0C" />
      <path
        d="M 49.835 48.059 A 24 24 0 1 1 49.835 15.941 L 43.519 21.628 A 15.5 15.5 0 1 0 43.519 42.372 Z"
        fill="#FF7A00"
      />
      <path d="M 49 24 H 53 V 30 H 59 V 34 H 53 V 40 H 49 V 34 H 43 V 30 H 49 Z" fill="#FFB347" />
    </svg>
  );
}
