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
  LinkButton,
  Panel,
  SectionHead,
  SegmentedControl,
  Toggle,
} from "@/components/ui";
import {
  AgentIcon,
  CheckIcon,
  EditIcon,
  ExternalIcon,
  EyeIcon,
  GlobeIcon,
  MoreIcon,
  PagesIcon,
  PlusIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { saveDocument, useDocument, useSite } from "@/lib/sim/store";
import { sectionHint, sectionSummary } from "@/lib/pages-builder";
import { relativeTime } from "@/lib/format";
import type { ConciergePage } from "@/lib/types";

type Device = "desktop" | "tablet" | "mobile";

/**
 * Concierge Pages for owners with no website. It is a site builder, so it
 * reads as a workspace with a live preview — not a CMS form.
 */
export default function PagesWorkspace({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const site = useSite(siteId);
  /* This site's own pages, not the fixture's: a site built in the setup flow
     has a document of its own, and listing Atlas Moving's pages under it was
     how this page used to answer. */
  const doc = useDocument(siteId);
  const pages = doc?.pages ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const selected: ConciergePage | undefined = pages.find((p) => p.id === selectedId) ?? pages[0];
  const sections = selected?.sections ?? [];
  const setSelected = (p: ConciergePage) => setSelectedId(p.id);

  /* Toggling a section writes to the document in the world, so the change is
     there when the editor opens and after a reload. It used to write to a copy
     held on this page alone, which forgot it the moment you left. */
  const setSectionEnabled = (sectionId: string, enabled: boolean) => {
    if (!doc || !selected) return;
    saveDocument(siteId, {
      ...doc,
      pages: doc.pages.map((p) =>
        p.id === selected.id
          ? { ...p, sections: p.sections.map((x) => (x.id === sectionId ? { ...x, enabled } : x)) }
          : p,
      ),
      updatedAt: new Date().toISOString(),
    });
  };

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
            body="Pages is for businesses starting from nothing. Concierge already runs on your existing site, so there is nothing to build here."
            action={
              <LinkButton href="/onboarding/pages" leading={<PlusIcon size={15} />}>
                Create a Pages site
              </LinkButton>
            }
            secondaryAction={
              <LinkButton href="/help/docs/build-pages" variant="secondary">
                Learn how Pages works
              </LinkButton>
            }
          />
        </Panel>
      </PageContainer>
    );
  }

  /* A Pages site whose document has not arrived yet — the world restores a
     tick after the first paint. Better a quiet frame than a crash. */
  if (!selected) return null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Pages"
        title={site.name}
        description="Your hosted site, with Concierge answering on every page. Publishing takes effect immediately."
        actions={
          <>
            <Button variant="secondary" leading={<ExternalIcon size={14} />}>
              Open site
            </Button>
            <LinkButton
              href={`/sites/${siteId}/pages/${selected.id}/edit`}
              leading={<EditIcon size={14} />}
            >
              Open editor
            </LinkButton>
          </>
        }
        meta={
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-divider pt-5">
            <span className="flex items-center gap-2 text-[11.5px]">
              <GlobeIcon size={15} className="text-text-tertiary" />
              {site.url}
            </span>
            <Badge tone="approved" dot pulse>
              {pages.filter((p) => p.published).length} pages live
            </Badge>
            <Badge tone="review">{pages.filter((p) => !p.published).length} draft</Badge>
            <span className="text-[11.5px] text-text-tertiary">Updated {relativeTime(site.updatedAt)}</span>
          </div>
        }
      />

      {/* `1fr` is `minmax(auto, 1fr)`, so the middle track refuses to shrink
          below its content's min-content width and shoves the preview off the
          right edge. `minmax(0, ...)` lets it shrink; the `min-w-0` below lets
          the text inside it actually truncate rather than setting a new floor. */}
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_360px]">
        {/* Pages ---------------------------------------------------------- */}
        <div className="min-w-0">
          <p className="t-eyebrow mb-2.5 text-text-muted">Pages</p>
          <ul className="space-y-1">
            {pages.map((p) => {
              const active = p.id === selected.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(p);
                    }}
                    className={cx(
                      "flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors",
                      active ? "bg-surface-hover" : "hover:bg-surface-subtle",
                    )}
                  >
                    <PagesIcon size={15} className="shrink-0 text-text-tertiary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">{p.title}</span>
                      <span className="block truncate text-[11.5px] text-text-tertiary">/{p.slug}</span>
                    </span>
                    {!p.published && <Badge tone="review">Draft</Badge>}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="mt-2 flex w-full items-center gap-2 border border-dashed border-line-strong px-2.5 py-2 text-[11.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
          >
            <PlusIcon size={14} />
            New page
          </button>
        </div>

        {/* Sections ------------------------------------------------------- */}
        <div className="min-w-0 space-y-5">
          <Panel className="p-6">
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
                    "flex items-center gap-3 border px-3.5 py-3 transition-colors",
                    s.enabled ? "border-line bg-surface" : "border-line bg-surface-subtle",
                  )}
                >
                  <span className="cursor-grab text-text-disabled" aria-hidden>
                    ⠿
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cx("block text-[13px] font-medium", !s.enabled && "text-text-tertiary")}>
                      {s.title}
                    </span>
                    <span className="block truncate text-[12.5px] text-text-tertiary">
                      {sectionSummary(s)} · {sectionHint(s.kind)}
                    </span>
                  </span>
                  <Toggle
                    size="sm"
                    checked={s.enabled}
                    onChange={(v) =>
                      setSectionEnabled(s.id, v)
                    }
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
              className="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-line-strong py-3 text-[11.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
            >
              <PlusIcon size={14} />
              Add a section
            </button>
          </Panel>

          <Panel className="p-6">
            <SectionHead title="Page details" className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Page title" htmlFor="page-title">
                <Input id="page-title" defaultValue={selected.title} />
              </Field>
              <Field label="Navigation label" htmlFor="page-nav">
                <Input id="page-nav" defaultValue={selected.navLabel} />
              </Field>
              <Field
                label="URL"
                htmlFor="page-slug"
                hint={`${site.url}/${selected.slug}`}
                className="sm:col-span-2"
              >
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
                  "mx-auto overflow-hidden bg-surface-subtle transition-[max-width] duration-[var(--dur-base)]",
                  device === "mobile" ? "max-w-[200px]" : "max-w-full",
                )}
              >
                <div className="border-b border-divider px-3 py-2">
                  <div className="h-1.5 w-16 bg-surface-sunken" />
                </div>
                <div className="space-y-3 p-3">
                  {sections
                    .filter((s) => s.enabled)
                    .map((s) => (
                      <div key={s.id} className="bg-surface-subtle p-2.5">
                        <div className="h-1.5 w-14 bg-line-strong" />
                        <div className="mt-1.5 h-1 w-full bg-line" />
                        <div className="mt-1 h-1 w-3/4 bg-line" />
                      </div>
                    ))}
                </div>
                <div className="flex justify-end p-2">
                  <span className="flex h-6 w-6 items-center justify-center bg-ink text-[8px] font-semibold text-text-inverse">
                    C+
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-divider p-4">
              <p className="flex items-center gap-2 text-[12.5px] font-medium">
                <AgentIcon size={14} className="text-text-tertiary" />
                Concierge is on every page
              </p>
              <p className="mt-1.5 text-[12.5px] leading-[1.55] text-text-tertiary">
                It answers from the same Site Brain as your Agent, and uses the same actions and routing.
              </p>
              <p className="mt-3 flex items-center gap-1.5 text-[11.5px] text-success">
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
