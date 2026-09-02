"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { Toggle } from "@/components/ui";
import { PlusIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { SECTION_CATALOGUE, sectionSummary } from "@/lib/pages-builder";
import { dispatch } from "@/lib/pages-editor";
import type { ConciergePage, ID, PageSection } from "@/lib/types";

/**
 * The sections list, which is the page's running order. Drag reorders it; the
 * toggle takes a section off the published page without deleting the work.
 *
 * A pointer sensor with a small activation distance keeps a click on the row
 * from being read as the start of a drag, so selecting and reordering share
 * the same list without fighting each other.
 */
function Row({
  section,
  active,
  onSelect,
}: {
  section: PageSection;
  active: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        /* Vertical only. Horizontal drift in a single-column list reads as a
           bug, and constraining it here avoids pulling in the modifiers
           package for one axis. */
        transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      className={cx(
        "relative flex items-center gap-1.5 bg-surface pr-1.5 transition-colors",
        isDragging ? "z-10 opacity-90 shadow-md" : "",
        active ? "bg-surface-hover" : "hover:bg-surface-subtle",
      )}
    >
      {/* Ties the row to the orange outline on the canvas. */}
      {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" aria-hidden />}

      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${section.title}`}
        className="shrink-0 cursor-grab px-1.5 py-2.5 text-text-disabled transition-colors hover:text-text-tertiary active:cursor-grabbing"
      >
        <span aria-hidden>⠿</span>
      </button>

      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 py-2 text-left"
      >
        <span
          className={cx(
            "block truncate text-[12.5px] font-medium",
            !section.enabled && "text-text-disabled",
          )}
        >
          {section.title}
        </span>
        <span className="block truncate text-[11.5px] text-text-tertiary">
          {section.enabled ? sectionSummary(section) : "Hidden"}
        </span>
      </button>

      <Toggle
        size="sm"
        checked={section.enabled}
        onChange={() => dispatch({ type: "toggle", sectionId: section.id })}
        label={`Show ${section.title}`}
      />
    </li>
  );
}

export function SectionsRail({
  page,
  selectedId,
}: {
  page: ConciergePage;
  selectedId: ID | null;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over === null || active.id === over.id) return;
    const from = page.sections.findIndex((s) => s.id === active.id);
    const to = page.sections.findIndex((s) => s.id === over.id);
    if (from === -1 || to === -1) return;
    dispatch({ type: "reorder", pageId: page.id, from, to });
  };

  return (
    <>
      {/* A stable id: dnd-kit numbers its accessibility ids from a module
          counter, which lands differently on the server and the client and
          trips a hydration mismatch without one. */}
      <DndContext
        id={`sections-${page.id}`}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={page.sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-0.5">
            {page.sections.map((section) => (
              <Row
                key={section.id}
                section={section}
                active={section.id === selectedId}
                onSelect={() => dispatch({ type: "select", sectionId: section.id })}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <AddSection pageId={page.id} />
    </>
  );
}

/**
 * The picker is a disclosure rather than a popover: the rail has room, the
 * eight kinds are the whole vocabulary, and each one needs its sentence of
 * explanation more than it needs to be compact. An owner choosing "Testimonials"
 * is deciding what their page should say, not picking a widget.
 */
function AddSection({ pageId }: { pageId: ID }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2 px-1">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 border border-dashed border-line-strong py-2.5 text-[11.5px] text-text-tertiary transition-colors hover:border-line-hover hover:text-text-primary"
      >
        <PlusIcon size={13} />
        {open ? "Close" : "Add a section"}
      </button>

      {open && (
        <ul className="mt-1.5 border border-line">
          {SECTION_CATALOGUE.map((entry) => (
            <li key={entry.kind}>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "addSection", pageId, kind: entry.kind });
                  setOpen(false);
                }}
                className="w-full border-b border-divider px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-subtle"
              >
                <span className="block text-[12.5px] font-medium">{entry.label}</span>
                <span className="block text-[11.5px] leading-[1.4] text-text-tertiary">
                  {entry.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
