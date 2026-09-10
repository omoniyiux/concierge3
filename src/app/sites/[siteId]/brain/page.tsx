"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { KnowledgeCard } from "@/components/brain/KnowledgeCard";
import { KnowledgeComposer } from "@/components/brain/KnowledgeComposer";
import { RelearnPanel } from "@/components/brain/RelearnPanel";
import { RadialGauge } from "@/components/ui/charts";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Panel,
  SearchInput,
  SectionHead,
  SegmentedControl,
  Tabs,
} from "@/components/ui";
import {
  BrainIcon,
  CheckIcon,
  ExternalIcon,
  PlusIcon,
  RefreshIcon,
  SourceIcon,
  SparkIcon,
  UploadIcon,
} from "@/components/icons";
import {
  ApprovedSticker,
  GapSticker,
  PendingSticker,
  RestrictedSticker,
  SparkSticker,
} from "@/components/stickers";
import { cx } from "@/lib/cx";
import { BRAIN, DEFAULT_SITE_ID, KNOWLEDGE, getSite } from "@/lib/demo-data";
import { CATEGORY_LABEL, relativeTime } from "@/lib/format";
import type { KnowledgeCategory, KnowledgeItem, KnowledgeStatus } from "@/lib/types";

type Tab = "review" | "library" | "sources";
type Filter = "all" | "needs-review" | "approved" | "restricted" | "missing";

/**
 * Site Brain — the answer to"what does Concierge know about my business, and
 * what is it allowed to say?"This is the product's trust surface, so status
 * and evidence are visible on every row rather than hidden behind a click.
 */
/**
 * What a re-crawl of Northlane turns up. The changed pricing is the same stale
 * figure Perplexity is quoting on the Assistants surface — one edit closes it
 * in both places.
 */
const RELEARN_RESULT = {
  changedIds: ["k_pricing", "k_hours"],
  changedTitles: ["Treatment pricing", "Opening hours"],
  newQuestion: "Do you offer sedation for nervous patients?",
  unchanged: 14,
};

export default function SiteBrainPage() {
  const siteId = String(useParams().siteId ?? DEFAULT_SITE_ID);
  const site = getSite(siteId);
  // null closed; a string opens it, prefilled with that title.
  const [composing, setComposing] = useState<string | null>(null);
  const [relearning, setRelearning] = useState(false);
  const [tab, setTab] = useState<Tab>("review");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<KnowledgeItem[]>(KNOWLEDGE);

  const setStatus = (id: string, status: KnowledgeStatus) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  const setBody = (id: string, body: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, body } : i)));

  const counts = useMemo(
    () => ({
      approved: items.filter((i) => i.status === "approved").length,
      review: items.filter((i) => i.status === "needs-review").length,
      missing: items.filter((i) => i.status === "missing").length,
      restricted: items.filter((i) => i.status === "restricted").length,
      suggested: items.filter((i) => i.status === "suggested").length,
    }),
    [items],
  );

  const needsAttention = items.filter((i) => i.status === "needs-review" || i.status === "missing");
  const requiredPending = items.filter((i) => i.required && i.status !== "approved").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "needs-review" && i.status !== "needs-review") return false;
      if (filter === "approved" && i.status !== "approved") return false;
      if (filter === "restricted" && i.status !== "restricted") return false;
      if (filter === "missing" && i.status !== "missing") return false;
      if (q && !`${i.title} ${i.body}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, filter, query]);

  const byCategory = useMemo(() => {
    const map = new Map<KnowledgeCategory, KnowledgeItem[]>();
    filtered.forEach((i) => {
      const list = map.get(i.category) ?? [];
      list.push(i);
      map.set(i.category, list);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Site Brain"
        title="What Concierge knows"
        description="Everything Concierge is allowed to say about your business, where it learned it, and how sure it is. Nothing here reaches a visitor until you approve it."
        actions={
          <>
            <Button
              variant="secondary"
              leading={<RefreshIcon size={15} />}
              disabled={relearning}
              onClick={() => {
                setComposing(null);
                setRelearning(true);
              }}
            >
              {relearning ? "Re-learning…" : "Re-learn site"}
            </Button>
            <Button leading={<PlusIcon size={15} />} onClick={() => setComposing("")}>
              Add knowledge
            </Button>
          </>
        }
        meta={<BrainSummary counts={counts} requiredPending={requiredPending} />}
      />

      {relearning && (
        <RelearnPanel
          url={site.url}
          result={RELEARN_RESULT}
          onDone={(ids) => {
            // A changed source retracts its own approval. Concierge does not
            // start saying something new on the owner's behalf unread.
            setItems((prev) =>
              prev.map((i) => (ids.includes(i.id) ? { ...i, status: "needs-review" as const } : i)),
            );
            setRelearning(false);
            setTab("review");
            setFilter("all");
          }}
          onClose={() => setRelearning(false)}
        />
      )}

      {composing !== null && (
        <KnowledgeComposer
          siteId={siteId}
          initialTitle={composing}
          onAdd={(item) => setItems((prev) => [item, ...prev])}
          onClose={() => setComposing(null)}
        />
      )}

      <Tabs
        label="Site Brain sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "review", label: "Needs you", count: needsAttention.length },
          { value: "library", label: "Knowledge library", count: items.length },
          { value: "sources", label: "Sources", count: 7 },
        ]}
      />

      {/* ---- Needs you ------------------------------------------------- */}
      {tab === "review" && (
        <div className="mt-6">
          {needsAttention.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<CheckIcon size={19} />}
                title="Everything is approved"
                body="Concierge is answering from knowledge you have vetted. When it learns something new, or a visitor asks something it cannot answer, it will show up here."
                action={<Button variant="secondary">View the full library</Button>}
              />
            </Panel>
          ) : (
            <>
              <SafeApproveBanner
                items={items}
                onApprove={(ids) => ids.forEach((id) => setStatus(id, "approved"))}
              />
              <div className="mt-5 space-y-4">
                {needsAttention.map((item) => (
                  <KnowledgeCard
                    key={item.id}
                    item={item}
                    onStatusChange={setStatus}
                    onBodyChange={setBody}
                    defaultOpen={item.required}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ---- Library --------------------------------------------------- */}
      {tab === "library" && (
        <div className="mt-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <SearchInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search everything Concierge knows"
              className="min-w-[220px] flex-1 sm:max-w-[340px]"
              aria-label="Search knowledge"
            />
            <SegmentedControl
              label="Filter by status"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "All" },
                { value: "approved", label: `Approved ${counts.approved}` },
                { value: "needs-review", label: `Review ${counts.review}` },
                { value: "restricted", label: "Restricted" },
              ]}
            />
          </div>

          {filtered.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<BrainIcon size={19} />}
                title={`Nothing matches “${query}”`}
                body="Try a different word, or add this as a new knowledge item so Concierge can answer it next time."
                action={
                  <Button leading={<PlusIcon size={15} />} onClick={() => setComposing(query)}>
                    Add knowledge
                  </Button>
                }
                secondaryAction={
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            </Panel>
          ) : (
            <div className="space-y-8">
              {byCategory.map(([category, list]) => (
                <section key={category}>
                  <div className="mb-3 flex items-baseline gap-2.5">
                    <h2 className="t-section">{CATEGORY_LABEL[category]}</h2>
                    <span className="text-[11.5px] tabular-nums text-text-muted">{list.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {list.map((item) => (
                      <KnowledgeCard
                        key={item.id}
                        item={item}
                        onStatusChange={setStatus}
                        onBodyChange={setBody}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Sources --------------------------------------------------- */}
      {tab === "sources" && <SourcesTab />}
    </PageContainer>
  );
}

/* ---- Summary ------------------------------------------------------------- */

function BrainSummary({
  counts,
  requiredPending,
}: {
  counts: { approved: number; review: number; missing: number; restricted: number; suggested: number };
  requiredPending: number;
}) {
  const total = counts.approved + counts.review + counts.missing + counts.restricted + counts.suggested;
  const coverage = Math.round((counts.approved / Math.max(total, 1)) * 100);

  const ready = requiredPending === 0;

  return (
    /* Told the way the Overview status strip tells it: the drawing, the
       figure, then the sentence. A number on its own never explained what
       "3" was supposed to mean to the person reading it. */
    <Card className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
      <div className="flex items-center gap-4 border-b border-divider px-6 py-6 lg:border-b-0 lg:border-r">
        <RadialGauge
          value={coverage}
          label="Approved knowledge"
          tone={coverage >= 80 ? "success" : "accent"}
          size={64}
        />
        <div className="min-w-0">
          <p className="text-[16px] font-semibold leading-[1.25]">
            <span className={ready ? "text-success" : "text-accent-ink"}>
              {ready ? "Ready to answer" : `${requiredPending} required`}
            </span>
            <br />
            {ready ? "across your site" : "still outstanding"}
          </p>
          <p className="mt-2 text-[11.5px] leading-[1.45] text-text-tertiary">
            Last learned {relativeTime(BRAIN.lastLearnedAt)} · {total} items in the brain
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            Sticker: ApprovedSticker,
            label: "Approved",
            value: counts.approved,
            cls: "text-success",
          },
          { Sticker: PendingSticker, label: "Needs review", value: counts.review, cls: "text-warning" },
          { Sticker: SparkSticker, label: "Suggested", value: counts.suggested, cls: "" },
          {
            Sticker: RestrictedSticker,
            label: "Restricted",
            value: counts.restricted,
            cls: "text-danger",
          },
          { Sticker: GapSticker, label: "Missing", value: counts.missing, cls: "text-text-muted" },
        ].map((s, i) => (
          <div
            key={s.label}
            className={cx(
              "px-5 py-5",
              i >= 2 && "border-t border-divider",
              i === 2 && "sm:border-t-0",
              i >= 3 && "lg:border-t-0",
            )}
          >
            <s.Sticker size={26} />
            <dd className={cx("t-num mt-3 text-[20px] leading-none", s.cls)}>{s.value}</dd>
            <dt className="mt-1.5 text-[11.5px] font-medium text-text-secondary">{s.label}</dt>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function SafeApproveBanner({
  items,
  onApprove,
}: {
  items: KnowledgeItem[];
  onApprove: (ids: string[]) => void;
}) {
  const safe = items.filter((i) => i.status === "needs-review" && i.confidence >= 0.8);
  if (safe.length === 0) return null;
  return (
    <Card className="flex flex-wrap items-center gap-3 border-accent-line bg-accent-subtle p-4">
      <SparkIcon size={16} className="shrink-0 text-accent" />
      <p className="min-w-0 flex-1 text-[11.5px]">
        <span className="font-medium">{safe.length} items came back with high confidence.</span>
        {""}
        <span className="text-text-secondary">Approve them together, then read the rest properly.</span>
      </p>
      <Button size="sm" variant="secondary" onClick={() => onApprove(safe.map((i) => i.id))}>
        Approve {safe.length}
      </Button>
    </Card>
  );
}

/* ---- Sources ------------------------------------------------------------- */

const SOURCES = [
  { label: "Homepage", url: "/", items: 8, kind: "crawl" },
  { label: "Services", url: "/services", items: 11, kind: "crawl" },
  { label: "Pricing", url: "/pricing", items: 6, kind: "crawl" },
  { label: "Invisalign", url: "/invisalign", items: 5, kind: "crawl" },
  { label: "FAQs", url: "/faq", items: 7, kind: "crawl" },
  { label: "Contact", url: "/contact", items: 3, kind: "crawl" },
  { label: "Owner interview", url: null, items: 4, kind: "manual" },
];

function SourcesTab() {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
      <Panel className="overflow-hidden">
        <SectionHead
          title="Where the knowledge came from"
          hint="Every answer Concierge gives can be traced back to one of these."
          className="p-6 pb-4"
        />
        <ul className="divide-y divide-divider border-t border-divider">
          {SOURCES.map((s) => (
            <li key={s.label} className="flex items-center gap-3.5 px-6 py-3.5">
              <SourceIcon size={16} className="shrink-0 text-text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-medium">{s.label}</span>
                <span className="block truncate text-[12.5px] text-text-tertiary">
                  {s.url ? `northlanedental.com${s.url}` : "Added by you"}
                </span>
              </span>
              <Badge tone="neutral">{s.items} items</Badge>
              {s.url && (
                <a
                  href={`https://northlanedental.com${s.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
                  aria-label={`Open ${s.label}`}
                >
                  <ExternalIcon size={14} />
                </a>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="space-y-5">
        <Card className="p-6">
          <h3 className="t-card">Teach Concierge something new</h3>
          <p className="t-body-sm mt-1.5 text-text-tertiary">
            Anything you add is treated as owner-approved and answers immediately.
          </p>
          <div className="mt-4 space-y-3">
            <Button variant="secondary" size="sm" block leading={<PlusIcon size={14} />}>
              Write it yourself
            </Button>
            <Button variant="secondary" size="sm" block leading={<UploadIcon size={14} />}>
              Upload a document
            </Button>
            <Button variant="secondary" size="sm" block leading={<ExternalIcon size={14} />}>
              Point at another page
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="t-card">Re-learn the site</h3>
          <p className="t-body-sm mt-1.5 text-text-tertiary">
            Changed your pricing or opening hours? Concierge will re-read the site and flag only what changed
            — your approvals stay intact.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" leading={<RefreshIcon size={14} />}>
            Re-learn now
          </Button>
        </Card>
      </div>
    </div>
  );
}
