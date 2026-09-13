import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { ArrowRight, ChevronLeft, ChevronRight, ClockIcon, PlayIcon } from "@/components/icons";
import { DocBody } from "@/components/help/DocBody";
import { DocSticker } from "@/components/help/DocSticker";
import { DOCS, DOC_BY_SLUG, DOC_GROUPS, docsInGroup, relatedDocs } from "@/lib/docs";
import { TUTORIALS } from "@/lib/tutorials";

export function generateStaticParams() {
  return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const doc = DOC_BY_SLUG.get((await params).slug);
  if (!doc) return { title: "Documentation" };
  return { title: doc.title, description: doc.summary };
}

export default async function DocArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = DOC_BY_SLUG.get(slug);
  if (!doc) notFound();

  const group = DOC_GROUPS.find((g) => g.id === doc.group)!;
  const siblings = docsInGroup(doc.group);
  const index = siblings.findIndex((d) => d.slug === doc.slug);
  const prev = siblings[index - 1];
  const next = siblings[index + 1];
  const related = relatedDocs(doc);
  const video = TUTORIALS.find((t) => t.doc === doc.slug);
  const headings = doc.blocks.filter((b) => b.kind === "h");

  return (
    <main className="mx-auto w-full max-w-[1080px] px-5 pb-24 pt-10 lg:px-8">
      {/* ---- Breadcrumb --------------------------------------------------- */}
      <nav aria-label="Breadcrumb" className="t-body-sm flex items-center gap-1.5 text-text-tertiary">
        <Link href="/help/docs" className="hover:text-text-primary">
          Docs
        </Link>
        <ChevronRight size={12} className="text-text-disabled" />
        <Link href={`/help/docs#${group.id}`} className="hover:text-text-primary">
          {group.label}
        </Link>
      </nav>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* ---- The reading column gets its own surface ------------------- */}
        <article className="min-w-0 flex-1">
          <div className="border border-line-strong bg-surface p-6 sm:p-8 lg:p-10">
            <header className="flex gap-5 border-b border-divider pb-7">
              <DocSticker name={doc.sticker} size={44} className="hidden shrink-0 sm:block" />
              <div className="min-w-0">
                <h1 className="t-page">{doc.title}</h1>
                <p className="t-body mt-3 max-w-[64ch] leading-[19px] text-text-secondary">{doc.summary}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <Badge tone="neutral">{group.label}</Badge>
                  <span className="t-meta inline-flex items-center gap-1.5 text-text-muted">
                    <ClockIcon size={12} />
                    {doc.minutes} min read
                  </span>
                </div>
              </div>
            </header>

            <div className="pt-7">
              <DocBody blocks={doc.blocks} />
            </div>
          </div>

          {/* Prev / next within the same category ------------------------- */}
          {(prev || next) && (
            <nav aria-label="More in this category" className="mt-5 grid gap-4 sm:grid-cols-2">
              {prev ? (
                <Link
                  href={`/help/docs/${prev.slug}`}
                  className="group border border-line-strong bg-surface p-4.5 transition-colors duration-[var(--dur-micro)] hover:border-ink"
                >
                  <span className="t-meta inline-flex items-center gap-1 text-text-muted">
                    <ChevronLeft size={12} />
                    Previous
                  </span>
                  <p className="t-card mt-1.5">{prev.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={`/help/docs/${next.slug}`}
                  className="group border border-line-strong bg-surface p-4.5 text-right transition-colors duration-[var(--dur-micro)] hover:border-ink sm:col-start-2"
                >
                  <span className="t-meta inline-flex items-center gap-1 text-text-muted">
                    Next
                    <ChevronRight size={12} />
                  </span>
                  <p className="t-card mt-1.5">{next.title}</p>
                </Link>
              )}
            </nav>
          )}
        </article>

        {/* ---- Rail ------------------------------------------------------- */}
        <aside className="w-full shrink-0 lg:w-[224px]">
          <div className="space-y-7 lg:sticky lg:top-[84px]">
            {headings.length > 0 && (
              <nav aria-label="In this guide">
                <p className="t-eyebrow text-text-muted">In this guide</p>
                <ul className="mt-3">
                  {headings.map((h) => (
                    <li key={h.text} className="border-b border-divider py-2.5">
                      <span className="t-body-sm text-text-secondary">{h.text}</span>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {video && (
              <Card className="p-5">
                <p className="t-eyebrow text-accent-ink">Watch</p>
                <p className="t-card mt-2">{video.title}</p>
                <p className="t-body-sm mt-1 text-text-tertiary">{video.duration}</p>
                <Link
                  href={`/help/video-tutorials#${video.id}`}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 border border-line-strong px-2.5 text-[11.5px] font-medium transition-colors hover:border-ink"
                >
                  <PlayIcon size={12} className="text-accent-ink" />
                  Play the walkthrough
                </Link>
              </Card>
            )}

            {related.length > 0 && (
              <nav aria-label="Related guides">
                <p className="t-eyebrow text-text-muted">Related</p>
                <ul className="mt-3">
                  {related.map((r) => (
                    <li key={r.slug} className="border-b border-divider">
                      <Link
                        href={`/help/docs/${r.slug}`}
                        className="group flex items-center gap-2 py-2 text-text-secondary hover:text-text-primary"
                      >
                        <span className="t-body-sm flex-1">{r.title}</span>
                        <ArrowRight
                          size={12}
                          className="shrink-0 text-transparent transition-colors group-hover:text-text-primary"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <Card className="p-5">
              <p className="t-card">Did this miss something?</p>
              <p className="t-body-sm mt-1.5 text-text-tertiary">
                Tell us what you expected to find here and we will write it.
              </p>
              <a
                href={`mailto:support@poweredbyconcierge.com?subject=${encodeURIComponent(`Docs feedback: ${doc.title}`)}`}
                className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-text-primary underline decoration-accent decoration-2 underline-offset-4"
              >
                Send feedback
                <ArrowRight size={12} />
              </a>
            </Card>
          </div>
        </aside>
      </div>
    </main>
  );
}
