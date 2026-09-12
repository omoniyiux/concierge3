"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/shell/AppShell";
import { EditorCanvas } from "@/components/pages-builder/EditorCanvas";
import { Inspector } from "@/components/pages-builder/Inspector";
import { SectionsRail } from "@/components/pages-builder/SectionsRail";
import { Badge, Button, EmptyState, IconButton, LinkButton, Panel, SegmentedControl } from "@/components/ui";
import { ExternalIcon, PagesIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { getSite } from "@/lib/demo-data";
import { BREAKPOINTS, findPage, pagePath } from "@/lib/pages-builder";
import {
  canRedo,
  canUndo,
  dispatch,
  handleEditorShortcut,
  isDirty,
  useEditor,
} from "@/lib/pages-editor";
import type { PageBreakpoint } from "@/lib/types";

/**
 * The visual editor: sections on the left, the live page in the middle, and
 * what the selected section says on the right.
 *
 * The document comes from the editor store rather than the fixtures directly,
 * so edits survive moving between pages in the rail. Nothing is persisted yet
 * — a reload starts over, which Phase 4 fixes.
 */
export default function PageEditor({
  params,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
}) {
  const { siteId, pageId } = use(params);
  const site = getSite(siteId);
  const [breakpoint, setBreakpoint] = useState<PageBreakpoint>("desktop");
  const editor = useEditor();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (handleEditorShortcut(event)) event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const doc = editor.doc;
  const page = findPage(doc, pageId);
  /* Scoped to this page, so switching pages never leaves the inspector
     pointing at a section that is no longer on screen. */
  const selected = page?.sections.find((s) => s.id === editor.selectedId);

  if (site.product !== "pages" || page === undefined) {
    return (
      <PageContainer>
        <Panel className="mt-16">
          <EmptyState
            icon={<PagesIcon size={19} />}
            title={page === undefined ? "That page does not exist" : `${site.name} is not a Pages site`}
            body="The editor opens on a Concierge Pages site. Pick one from the Pages workspace and open it from there."
            action={<LinkButton href={`/sites/${siteId}/pages`}>Back to Pages</LinkButton>}
          />
        </Panel>
      </PageContainer>
    );
  }

  return (
    <PageContainer flush>
      <div className="flex h-full flex-col">
        {/* Toolbar ------------------------------------------------------- */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-divider bg-surface px-4">
          <Link
            href={`/sites/${siteId}/pages`}
            className="flex items-center gap-1.5 text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary"
          >
            <span aria-hidden>&larr;</span>
            Pages
          </Link>

          <span className="h-4 w-px bg-line-strong" aria-hidden />

          <div className="flex min-w-0 items-baseline gap-2.5">
            <span className="truncate text-[12.5px] font-semibold">{page.title}</span>
            <span className="truncate text-[11.5px] text-text-tertiary">{pagePath(page)}</span>
            {!page.published && <Badge tone="review">Draft</Badge>}
            {isDirty(editor) && <Badge tone="accent">Unsaved</Badge>}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-0.5">
              <IconButton
                label="Undo"
                size={28}
                disabled={!canUndo(editor)}
                onClick={() => dispatch({ type: "undo" })}
              >
                <span aria-hidden className="text-[13px]">
                  &#8630;
                </span>
              </IconButton>
              <IconButton
                label="Redo"
                size={28}
                disabled={!canRedo(editor)}
                onClick={() => dispatch({ type: "redo" })}
              >
                <span aria-hidden className="text-[13px]">
                  &#8631;
                </span>
              </IconButton>
            </div>

            <span className="h-4 w-px bg-line-strong" aria-hidden />

            <SegmentedControl
              label="Preview width"
              value={breakpoint}
              onChange={setBreakpoint}
              options={BREAKPOINTS.map((b) => ({ value: b.id, label: b.label }))}
            />

            <span className="h-4 w-px bg-line-strong" aria-hidden />

            <Button variant="secondary" size="sm" leading={<ExternalIcon size={13} />}>
              Preview
            </Button>
            <Button size="sm">Publish</Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* Pages and sections -------------------------------------------- */}
          <aside className="cg-scroll hidden w-[232px] shrink-0 overflow-y-auto border-r border-divider bg-surface py-3 lg:block">
            <p className="t-eyebrow mb-2.5 px-4 text-text-muted">Pages</p>
            <ul className="mb-6 space-y-0.5 px-1.5">
              {doc.pages.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/sites/${siteId}/pages/${p.id}/edit`}
                    className={cx(
                      "flex items-center gap-2.5 px-2.5 py-2 transition-colors",
                      p.id === page.id ? "bg-surface-hover" : "hover:bg-surface-subtle",
                    )}
                  >
                    <PagesIcon size={15} className="shrink-0 text-text-tertiary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">{p.title}</span>
                      <span className="block truncate text-[11.5px] text-text-tertiary">
                        {pagePath(p)}
                      </span>
                    </span>
                    {!p.published && <Badge tone="review">Draft</Badge>}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="t-eyebrow mb-2.5 px-4 text-text-muted">Sections</p>
            <div className="px-1.5">
              <SectionsRail page={page} selectedId={editor.selectedId} />
            </div>

            {/* Deselecting is what opens the theme, so it needs a visible
                handle as well as the Escape key. */}
            <button
              type="button"
              onClick={() => dispatch({ type: "select", sectionId: null })}
              className={cx(
                "mt-6 flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[12.5px] transition-colors",
                editor.selectedId === null
                  ? "bg-surface-hover font-medium"
                  : "text-text-tertiary hover:bg-surface-subtle hover:text-text-primary",
              )}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 border border-line-strong"
                style={{ background: doc.theme.brandColor }}
                aria-hidden
              />
              Site theme
            </button>
          </aside>

          {/* Canvas -------------------------------------------------------- */}
          <div className="min-w-0 flex-1">
            <EditorCanvas document={doc} page={page} site={site} breakpoint={breakpoint} />
          </div>

          {/* Inspector ----------------------------------------------------- */}
          <aside className="hidden w-[340px] shrink-0 border-l border-divider bg-surface xl:block">
            <Inspector
              section={selected}
              page={page}
              theme={doc.theme}
              breakpoint={breakpoint}
            />
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
