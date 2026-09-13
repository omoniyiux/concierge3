import { notFound } from "next/navigation";
import { DocBody } from "@/components/help/DocBody";
import { LEGAL_BY_SLUG, LEGAL_DOCS } from "@/lib/legal";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const doc = LEGAL_BY_SLUG.get((await params).slug);
  if (!doc) return { title: "Legal" };
  return { title: doc.title, description: doc.summary };
}

export default async function LegalDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = LEGAL_BY_SLUG.get(slug);
  if (!doc) notFound();

  return (
    <article className="mx-auto w-full max-w-[880px] px-5 pb-20 pt-10 lg:px-8">
      <div className="border border-line-strong bg-surface p-6 sm:p-9 lg:p-11">
        <header className="border-b border-divider pb-7">
          <h1 className="t-page">{doc.title}</h1>
          <p className="t-body mt-3 max-w-[64ch] leading-[19px] text-text-secondary">{doc.summary}</p>
          <p className="t-meta mt-4 text-text-muted">Last updated {doc.updated}</p>
        </header>

        {/* An unreviewed draft must never read as settled policy just because
            it is sitting at a /legal URL. */}
        {!doc.reviewed && (
          <div className="mt-7 border border-warning-line bg-warning-soft p-4" role="note">
            <p className="text-[13px] font-semibold text-warning">Draft — not yet reviewed by counsel</p>
            <p className="t-body-sm mt-1.5 text-text-secondary">
              This document describes how Concierge actually behaves, but it has not been through legal
              review and is not yet binding. Do not rely on it, and do not launch on it.
            </p>
          </div>
        )}

        <div className="pt-7">
          <DocBody blocks={doc.blocks} />
        </div>
      </div>
    </article>
  );
}
