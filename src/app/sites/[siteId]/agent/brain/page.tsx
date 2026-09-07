"use client";

import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { KnowledgeCard } from "@/components/brain/KnowledgeCard";
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
import { cx } from "@/lib/cx";
import { BRAIN, KNOWLEDGE } from "@/lib/demo-data";
import { CATEGORY_LABEL, relativeTime } from "@/lib/format";
import type { KnowledgeCategory, KnowledgeItem, KnowledgeStatus } from "@/lib/types";

type Tab = "review" | "library" | "sources";
type Filter = "all" | "needs-review" | "approved" | "restricted" | "missing";

/**
 * Site Brain — the answer to "what does Concierge know about my business, and
 * what is it allowed to say?" This is the product's trust surface, so status
 * and evidence are visible on every row rather than hidden behind a click.
 */
export default function SiteBrainPage() {
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
      if (q && !(`${i.title} ${i.body}`.toLowerCase().includes(q))) return false;
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
        eyebrow="Agent"
        title="What Concierge knows"
        description="Everything Concierge is allowed to say about your business, where it learned it, and how sure it is. Nothing here reaches a visitor until you approve it."
        actions={
          <>
            <Button variant="secondary" leading={<RefreshIcon size={15} />}>
              Re-learn site
            </Button>
            <Button leading={<PlusIcon size={15} />}>Add knowledge</Button>
          </>
        }
        meta={<BrainSummary counts={counts} requiredPending={requiredPending} />}
      />

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
              <SafeApproveBanner items={items} onApprove={(ids) => ids.forEach((id) => setStatus(id, "approved"))} />
              <div className="mt-4 space-y-3">
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
                action={<Button leading={<PlusIcon size={15} />}>Add knowledge</Button>}
                secondaryAction={
                  <Button variant="tertiary" onClick={() => { setQuery(""); setFilter("all"); }}>
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
                    <span className="text-[13px] tabular-nums text-text-muted">{list.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {list.map((item) => (
                      <KnowledgeCard key={item.id} item={item} onStatusChange={setStatus} onBodyChange={setBody} />
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

  return (
    <Card className="flex flex-wrap items-center gap-x-8 gap-y-5 p-5">
      <div className="flex items-center gap-4">
        <RadialGauge value={coverage} label="Approved knowledge" tone={coverage >= 80 ? "success" : "accent"} size={54} />
        <div>
          <p className="t-card">
            {requiredPending === 0 ? "Ready to answer" : `${requiredPending} required items outstanding`}
          </p>
          <p className="t-body-sm mt-0.5 text-text-tertiary">
            Last learned {relativeTime(BRAIN.lastLearnedAt)} · {total} items
          </p>
        </div>
      </div>

      <dl className="flex flex-wrap items-center gap-x-7 gap-y-3">
        {[
          { label: "Approved", value: counts.approved, cls: "text-success" },
          { label: "Needs review", value: counts.review, cls: "text-warning" },
          { label: "Suggested", value: counts.suggested, cls: "text-text-secondary" },
          { label: "Restricted", value: counts.restricted, cls: "text-danger" },
          { label: "Missing", value: counts.missing, cls: "text-text-muted" },
        ].map((s) => (
          <div key={s.label}>
            <dt className="t-eyebrow text-text-muted">{s.label}</dt>
            <dd className={cx("t-num mt-1.5 text-[17px] leading-none", s.cls)}>{s.value}</dd>
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
      <p className="min-w-0 flex-1 text-[13px]">
        <span className="font-medium">{safe.length} items came back with high confidence.</span>{" "}
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
    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
      <Panel className="overflow-hidden">
        <SectionHead
          title="Where the knowledge came from"
          hint="Every answer Concierge gives can be traced back to one of these."
          className="p-6 pb-4"
        />
        <ul className="divide-y divide-divider border-t border-divider">
          {SOURCES.map((s) => (
            <li key={s.label} className="flex items-center gap-3.5 px-5 py-3">
              <SourceIcon size={16} className="shrink-0 text-text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{s.label}</span>
                <span className="block truncate text-[14px] text-text-tertiary">
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
            Changed your pricing or opening hours? Concierge will re-read the site and flag only what changed —
            your approvals stay intact.
          </p>
          <Button variant="secondary" size="sm" className="mt-4" leading={<RefreshIcon size={14} />}>
            Re-learn now
          </Button>
        </Card>
      </div>
    </div>
  );
}
