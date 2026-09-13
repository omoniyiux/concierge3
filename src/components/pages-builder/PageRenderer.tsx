import { resolveSectionStyle, visibleSections } from "@/lib/pages-builder";
import type { ConciergePage, PageBreakpoint, PageDocument, PublishedSiteFacts } from "@/lib/types";
import { SectionRenderer } from "./sections";

/**
 * A whole page: the site chrome an owner never has to think about, and the
 * sections they do. This is the component Phase 4 will also render on the
 * public site, which is what guarantees the canvas cannot drift from what
 * visitors eventually see.
 */
export function PageRenderer({
  document,
  page,
  site,
  breakpoint,
}: {
  document: PageDocument;
  page: ConciergePage;
  site: PublishedSiteFacts;
  breakpoint: PageBreakpoint;
}) {
  const sections = visibleSections(page);

  return (
    <>
      <header className="ps-header">
        <div className="ps-header__inner">
          <span className="ps-wordmark">{site.name}</span>
          <nav className="ps-nav">
            {document.pages.map((p) => (
              <a
                key={p.id}
                href={p.slug === "" ? "/" : `/${p.slug}`}
                aria-current={p.id === page.id ? "page" : undefined}
              >
                {p.navLabel}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            style={resolveSectionStyle(section, page.styleOverrides, breakpoint)}
            hours={site.openingHours}
          />
        ))}
        {sections.length === 0 && (
          <section className="ps-section" data-spacing="grand" data-width="narrow" data-align="center">
            <div className="ps-inner">
              <p className="ps-empty">
                This page has no sections switched on yet. Add one to see it here.
              </p>
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
        </div>
      </footer>

      {/* The promise the Pages screen already makes: Concierge on every page. */}
      <div className="ps-badge">
        <span className="ps-badge__dot">
          <span>C+</span>
        </span>
        Ask a question
      </div>
    </>
  );
}
