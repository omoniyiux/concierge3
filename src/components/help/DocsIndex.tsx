"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, EmptyState, SearchInput } from "@/components/ui";
import { ArrowRight, ChevronRight, ClockIcon, PlayIcon, SearchIcon } from "@/components/icons";
import { DocSticker } from "@/components/help/DocSticker";
import { DOCS, DOC_GROUPS, LAUNCH_CHECKLIST, LAUNCH_PATH, docsInGroup, type DocArticle } from "@/lib/docs";

function GuideCard({ doc }: { doc: DocArticle }) {
  return (
    <Card interactive className="group relative flex gap-4 p-5">
      <DocSticker name={doc.sticker} size={36} className="mt-px shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="t-card">
          <Link href={`/help/docs/${doc.slug}`} className="after:absolute after:inset-0">
            {doc.title}
          </Link>
        </h3>
        <p className="t-body-sm mt-2 leading-[16px] text-text-tertiary">{doc.summary}</p>
        <p className="t-meta mt-3 flex items-center gap-1.5 text-text-muted">
          <ClockIcon size={12} />
          {doc.minutes} min read
        </p>
      </div>
      <ChevronRight
        size={15}
        className="mt-0.5 shrink-0 text-text-disabled transition-colors group-hover:text-text-primary"
      />
    </Card>
  );
}

export function DocsIndex() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return DOCS.filter((d) => {
      const haystack = [d.title, d.summary, d.group, ...d.blocks.flatMap(blockText)].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [q]);

  return (
    <main className="mx-auto w-full max-w-[1080px] px-5 pb-24 pt-12 lg:px-8">
      {/* ---- Hero --------------------------------------------------------- */}
      <div className="max-w-[62ch]">
        <p className="t-eyebrow text-accent-ink">Documentation</p>
        <h1 className="t-display mt-3">Build, review, route and launch with confidence</h1>
        <p className="t-body mt-4 leading-[19px] text-text-secondary">
          Guides for setting up Concierge, publishing Pages, connecting the response path, and helping a
          visitor get the right answer instead of a plausible one.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="min-w-[260px] flex-1">
          <SearchInput
            placeholder="Search the guides"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search documentation"
          />
        </div>
        <Link
          href="/help/video-tutorials"
          className="inline-flex h-10 items-center gap-2 border border-line-strong bg-surface px-3.5 text-[12px] font-medium transition-colors hover:border-ink"
        >
          <PlayIcon size={14} className="text-accent-ink" />
          Watch instead
        </Link>
      </div>

      {/* ---- Search results replace the page while a query is live -------- */}
      {results ? (
        <section className="mt-10" aria-live="polite">
          <p className="t-eyebrow text-text-muted">
            {results.length} {results.length === 1 ? "guide" : "guides"} matching “{query.trim()}”
          </p>
          {results.length === 0 ? (
            <Card className="mt-4">
              <EmptyState
                icon={<SearchIcon size={19} />}
                title="Nothing here covers that yet"
                body="Try a shorter phrase, or send us the question — the gaps people search for are how these guides get written."
                action={
                  <a
                    href="mailto:support@poweredbyconcierge.com"
                    className="inline-flex h-9 items-center gap-1.5 bg-ink px-3.5 text-[11.5px] font-medium text-text-inverse hover:bg-ink-hover"
                  >
                    Ask support
                    <ArrowRight size={13} />
                  </a>
                }
              />
            </Card>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {results.map((d) => (
                <GuideCard key={d.slug} doc={d} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ---- The launch path ----------------------------------------- */}
          <section className="mt-16" aria-labelledby="launch-path">
            <h2 id="launch-path" className="t-section">
              The launch path
            </h2>
            <p className="t-body-sm mt-2 text-text-tertiary">
              Four moves, in this order. Everything else is refinement.
            </p>
            <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {LAUNCH_PATH.map((s) => (
                <li key={s.step}>
                  <Card interactive className="group relative h-full p-5">
                    <span className="t-num text-[13px] text-accent-ink">{s.step}</span>
                    <h3 className="t-card mt-3">
                      <Link href={s.href} className="after:absolute after:inset-0">
                        {s.title}
                      </Link>
                    </h3>
                    <p className="t-body-sm mt-2 leading-[16px] text-text-tertiary">{s.body}</p>
                  </Card>
                </li>
              ))}
            </ol>
          </section>

          {/* ---- Pre-launch checklist ------------------------------------ */}
          <section className="mt-6" aria-labelledby="checklist">
            <Card className="p-6 sm:p-7">
              <h2 id="checklist" className="t-section">
                What needs to be true before visitors arrive
              </h2>
              <p className="t-body-sm mt-2 max-w-[58ch] leading-[16px] text-text-tertiary">
                Concierge will not stop you launching with any of these open. It will only tell you plainly
                what a visitor is about to run into.
              </p>
              <ul className="mt-6 grid gap-x-10 gap-y-0 sm:grid-cols-2">
                {LAUNCH_CHECKLIST.map((item, i) => (
                  <li key={item.label} className="border-b border-divider py-3">
                    <Link
                      href={item.href}
                      className="group flex items-baseline gap-3 text-text-secondary hover:text-text-primary"
                    >
                      <span className="t-num w-4 shrink-0 text-[11px] text-text-disabled">{i + 1}</span>
                      <span className="t-body flex-1">{item.label}</span>
                      <ArrowRight
                        size={13}
                        className="shrink-0 self-center text-transparent transition-colors group-hover:text-text-primary"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* ---- Every guide, by group ----------------------------------- */}
          <div className="mt-16 flex gap-12">
            <nav aria-label="Guide categories" className="hidden w-[172px] shrink-0 lg:block">
              <div className="sticky top-[84px]">
                <p className="t-eyebrow text-text-muted">Categories</p>
                <ul className="mt-3 space-y-0">
                  {DOC_GROUPS.map((g) => (
                    <li key={g.id}>
                      <a
                        href={`#${g.id}`}
                        className="flex items-center justify-between border-b border-divider py-2 text-[12px] text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {g.label}
                        <span className="t-meta text-text-disabled">{docsInGroup(g.id).length}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="min-w-0 flex-1 space-y-14">
              {DOC_GROUPS.map((g) => (
                <section key={g.id} id={g.id} className="scroll-mt-[84px]">
                  <h2 className="t-section">{g.label}</h2>
                  <p className="t-body-sm mt-2 text-text-tertiary">{g.blurb}</p>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {docsInGroup(g.id).map((d) => (
                      <GuideCard key={d.slug} doc={d} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

/** Article bodies are searchable too — a guide is easier to find by its content. */
function blockText(block: DocArticle["blocks"][number]): string[] {
  switch (block.kind) {
    case "p":
    case "h":
      return [block.text];
    case "list":
      return block.items;
    case "steps":
      return block.items.flatMap((i) => [i.title, i.body]);
    case "note":
      return [block.title, block.body];
    case "code":
      return [block.caption ?? "", block.code];
  }
}
