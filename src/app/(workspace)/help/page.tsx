import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { ArrowRight, ChevronRight, ClockIcon, PlayIcon } from "@/components/icons";
import { VideoSticker } from "@/components/stickers";
import { DocSticker } from "@/components/help/DocSticker";
import { DOCS, DOC_BY_SLUG, DOC_GROUPS, docsInGroup } from "@/lib/docs";
import { FEATURED_TUTORIAL, TUTORIALS } from "@/lib/tutorials";

export const metadata = { title: "Help" };

/** The guides people actually open first, in the order they tend to need them. */
const POPULAR = ["install-concierge", "review-site-brain", "routing-readiness", "troubleshooting"];

export default function HelpPage() {
  const popular = POPULAR.map((s) => DOC_BY_SLUG.get(s)!).filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-[1080px] px-5 pb-24 pt-14 lg:px-8">
      <div className="max-w-[56ch]">
        <p className="t-eyebrow text-accent-ink">Help</p>
        <h1 className="t-display mt-3">How can we help?</h1>
        <p className="t-body mt-4 leading-[19px] text-text-secondary">
          Setup guides, how Concierge decides what to say, and what to do when something is not behaving.
        </p>
      </div>

      {/* ---- The two ways in ---------------------------------------------- */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card interactive className="group relative flex flex-col p-6">
          <DocSticker name="knowledge" size={40} />
          <p className="t-eyebrow mt-5 text-text-muted">Documentation</p>
          <h2 className="t-feature mt-2">
            <Link href="/help/docs" className="after:absolute after:inset-0">
              {DOCS.length} guides, start to launch
            </Link>
          </h2>
          <p className="t-body-sm mt-2.5 leading-[16px] text-text-tertiary">
            The launch path, the pre-flight checklist, and a guide for every surface in the product.
          </p>
          <span className="t-body-sm mt-5 inline-flex items-center gap-1.5 font-medium">
            Browse the docs
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Card>

        <Card interactive className="group relative flex flex-col p-6">
          <VideoSticker size={40} />
          <p className="t-eyebrow mt-5 text-text-muted">Video tutorials</p>
          <h2 className="t-feature mt-2">
            <Link href="/help/video-tutorials" className="after:absolute after:inset-0">
              Watch the {FEATURED_TUTORIAL.duration} walkthrough
            </Link>
          </h2>
          <p className="t-body-sm mt-2.5 leading-[16px] text-text-tertiary">
            {TUTORIALS.length} short videos: scan a site, review what it learned, connect a destination, and
            watch a real request land.
          </p>
          <span className="t-body-sm mt-5 inline-flex items-center gap-1.5 font-medium">
            <PlayIcon size={13} className="text-accent-ink" />
            Start watching
          </span>
        </Card>
      </div>

      {/* ---- Categories ---------------------------------------------------- */}
      <section className="mt-16" aria-labelledby="topics">
        <h2 id="topics" className="t-section">
          Browse by topic
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {DOC_GROUPS.map((g) => (
            <Card key={g.id} interactive className="group relative flex flex-col p-5">
              <DocSticker name={g.sticker} size={36} />
              <h3 className="t-card mt-4">
                <Link href={`/help/docs#${g.id}`} className="after:absolute after:inset-0">
                  {g.label}
                </Link>
              </h3>
              <p className="t-body-sm mt-2 leading-[16px] text-text-tertiary">{g.blurb}</p>
              <p className="t-meta mt-auto flex items-center gap-1 pt-5 text-text-muted">
                {docsInGroup(g.id).length} guides
                <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Most-opened guides -------------------------------------------- */}
      <section className="mt-16" aria-labelledby="popular">
        <h2 id="popular" className="t-section">
          Where most people start
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {popular.map((doc) => (
            <Card key={doc.slug} interactive className="group relative flex gap-4 p-5">
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
            </Card>
          ))}
        </div>
      </section>

      {/* ---- Support -------------------------------------------------------- */}
      <Card className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 p-6">
        <p className="min-w-[240px] flex-1 text-[12.5px] leading-[18px]">
          <span className="font-medium">Still stuck? </span>
          <span className="text-text-tertiary">
            Send us the site and what you expected to happen. The conversation ID from the transcript makes it
            quick to trace.
          </span>
        </p>
        <LinkButton
          href="mailto:support@poweredbyconcierge.com"
          external
          variant="secondary"
          size="md"
          trailing={<ArrowRight size={13} />}
        >
          Contact support
        </LinkButton>
      </Card>
    </main>
  );
}
