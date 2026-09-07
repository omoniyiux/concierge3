"use client";

import { use, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Input,
  Panel,
  SectionHead,
  SegmentedControl,
  Toggle,
} from "@/components/ui";
import {
  AgentIcon,
  CheckIcon,
  ExternalIcon,
  EyeIcon,
  GlobeIcon,
  MoreIcon,
  PagesIcon,
  PlusIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { PAGES, getSite } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";
import type { ConciergePage } from "@/lib/types";

type Device = "desktop" | "tablet" | "mobile";

const SECTION_HINT: Record<string, string> = {
  hero: "The first thing a visitor reads",
  services: "What you offer, and roughly what it costs",
  about: "Who you are and why you are trusted",
  testimonials: "Proof from customers",
  pricing: "Plans or price bands",
  faq: "The questions you answer most",
  contact: "How to reach a person",
  gallery: "Work you have done",
};

/**
 * Concierge Pages for owners with no website. It is a site builder, so it
 * reads as a workspace with a live preview — not a CMS form.
 */
export default function PagesWorkspace({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const site = getSite(siteId);
  const [selected, setSelected] = useState<ConciergePage>(PAGES[0]);
  const [device, setDevice] = useState<Device>("desktop");
  const [sections, setSections] = useState(PAGES[0].sections);

  /* Agent sites do not have Pages; say so rather than showing an empty shell. */
  if (site.product !== "pages") {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Pages"
          title="Concierge Pages"
          description="A hosted website with the Agent already on it, for businesses that do not have a site yet."
        />
        <Panel>
          <EmptyState
            icon={<PagesIcon size={19} />}
            title={`${site.name} already has a website`}
            body="Pages is for businesses starting from nothing. Since Concierge is installed on your existing site, there is nothing to build here — but you can add a Pages site to your organisation at any time."
            action={<Button leading={<PlusIcon size={15} />}>Create a Pages site</Button>}
            secondaryAction={
              <Button variant="secondary" onClick={() => undefined}>
                Learn how Pages works
              </Button>
            }
          />
        </Panel>
      </PageContainer>
    );
  }

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Pages"
        title={site.name}
        description="Your hosted site, with Concierge answering on every page. Publishing takes effect immediately."
        actions={
          <>
            <Button variant="secondary" leading={<ExternalIcon size={14} />}>
              Open site
            </Button>
            <Button>Publish changes</Button>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-divider pt-5">
            <span className="flex items-center gap-2 text-[13px]">
              <GlobeIcon size={15} className="text-text-tertiary" />
              {site.url}
            </span>
            <Badge tone="approved" dot pulse>
              {PAGES.filter((p) => p.published).length} pages live
            </Badge>
            <Badge tone="review">{PAGES.filter((p) => !p.published).length} draft</Badge>
            <span className="text-[13.5px] text-text-tertiary">
              Updated {relativeTime(site.updatedAt)}
            </span>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[240px_1fr_360px]">
        {/* Pages ---------------------------------------------------------- */}
        <div>
          <p className="t-eyebrow mb-2.5 text-text-muted">Pages</p>
          <ul className="space-y-1">
            {PAGES.map((p) => {
              const active = p.id === selected.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(p);
                      setSections(p.sections);
                    }}
                    className={cx(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      active ? "bg-surface-hover" : "hover:bg-surface-subtle",
                    )}
                  >
                    <PagesIcon size={15} className="shrink-0 text-text-tertiary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium">{p.title}</span>
                      <span className="block truncate text-[13.5px] text-text-tertiary">/{p.slug}</span>
                    </span>
                    {!p.published && <Badge tone="review">Draft</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-line-strong px-2.5 py-2 text-[13.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
          >
            <PlusIcon size={14} />
            New page
          </button>
        </div>

        {/* Sections ------------------------------------------------------- */}
        <div className="space-y-5">
          <Panel className="p-7">
            <SectionHead
              title="Sections"
              hint="Drag to reorder. Anything switched off stays out of the published page."
              className="mb-4"
            />
            <ul className="space-y-3">
              {sections.map((s) => (
                <li
                  key={s.id}
                  className={cx(
                    "flex items-center gap-3 rounded-lg border px-3.5 py-3 transition-colors",
                    s.enabled ? "border-line bg-surface" : "border-line bg-surface-subtle",
                  )}
                >
                  <span className="cursor-grab text-text-disabled" aria-hidden>
                    ⠿
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx("block text-[15px] font-medium", !s.enabled && "text-text-tertiary")}>
                      {s.title}
                    </span>
                    <span className="block truncate text-[14px] text-text-tertiary">
                      {s.summary} · {SECTION_HINT[s.kind]}
                    </span>
                  </span>
                  <Toggle
                    size="sm"
                    checked={s.enabled}
                    onChange={(v) => setSections((prev) => prev.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))}
                    label={`Show ${s.title}`}
                  />
                  <IconButton label={`Edit ${s.title}`} size={28}>
                    <MoreIcon size={15} />
                  </IconButton>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line-strong py-3 text-[13.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
            >
              <PlusIcon size={14} />
              Add a section
            </button>
          </Panel>

          <Panel className="p-7">
            <SectionHead title="Page details" className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Page title" htmlFor="page-title">
                <Input id="page-title" defaultValue={selected.title} />
              </Field>
              <Field label="Navigation label" htmlFor="page-nav">
                <Input id="page-nav" defaultValue={selected.navLabel} />
              </Field>
              <Field label="URL" htmlFor="page-slug" hint={`${site.url}/${selected.slug}`} className="sm:col-span-2">
                <Input id="page-slug" defaultValue={selected.slug} />
              </Field>
            </div>
          </Panel>
        </div>

        {/* Preview -------------------------------------------------------- */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-divider px-3 py-2">
              <EyeIcon size={14} className="text-text-muted" />
              <p className="t-eyebrow text-text-muted">Preview</p>
              <div className="ml-auto">
                <SegmentedControl
                  label="Preview device"
                  value={device}
                  onChange={setDevice}
                  options={[
                    { value: "desktop", label: "Desktop" },
                    { value: "mobile", label: "Mobile" },
                  ]}
                />
              </div>
            </div>

            <div className="bg-surface-subtle p-4">
              <div
                className={cx(
                  "mx-auto overflow-hidden rounded-xl bg-surface-subtle transition-[max-width] duration-[var(--dur-base)]",
                  device === "mobile" ? "max-w-[200px]" : "max-w-full",
                )}
              >
                <div className="border-b border-divider px-3 py-2">
                  <div className="h-1.5 w-16 rounded-full bg-surface-sunken" />
                </div>
                <div className="space-y-3 p-3">
                  {sections
                    .filter((s) => s.enabled)
                    .map((s) => (
                      <div key={s.id} className="rounded-md bg-surface-subtle p-2.5">
                        <div className="h-1.5 w-14 rounded-full bg-line-strong" />
                        <div className="mt-1.5 h-1 w-full rounded-full bg-line" />
                        <div className="mt-1 h-1 w-3/4 rounded-full bg-line" />
                      </div>
                    ))}
                </div>
                <div className="flex justify-end p-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[8px] font-semibold text-text-inverse">
                    C+
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-divider p-4">
              <p className="flex items-center gap-2 text-[15px] font-medium">
                <AgentIcon size={14} className="text-text-tertiary" />
                Concierge is on every page
              </p>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-text-tertiary">
                It answers from the same Site Brain as your Agent, and uses the same actions and routing.
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[13px] text-success">
                <CheckIcon size={12} strokeWidth={2.4} />
                Site Brain ready · 3 actions placed
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
