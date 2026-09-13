"use client";

import { useSyncExternalStore } from "react";
import { PAGE_DOCUMENT, getSite } from "./demo-data";
import {
  clearSectionStyle,
  createSection,
  dropSectionOverrides,
  duplicateSection,
  setSectionStyle,
} from "./pages-builder";
import type {
  ConciergePage,
  ID,
  PageBreakpoint,
  PageDocument,
  PageSection,
  PageSectionKind,
  PageTheme,
  PublishedSiteFacts,
  SectionStylePatch,
  SectionStyleProperty,
} from "./types";

/* ============================================================================
   THE EDITOR'S STATE
   ----------------------------------------------------------------------------
   A pure reducer over the page document, behind a module-level store.

   The store lives outside React on purpose. Switching pages in the rail is a
   route change, and component state would not survive it — an owner who edited
   the hero, clicked Pricing and came back would find their work gone. Module
   state persists for the session, so the whole document stays editable while
   they move around it. A hard reload still discards everything; that is what
   Phase 4's persistence is for, and until then the reset is honest.

   Undo keeps whole-document snapshots rather than inverse patches. Every
   update here is immutable, so an untouched section is the *same object* in
   the old and new document and a snapshot costs one root object plus the spine
   of what changed. At this document size that is cheaper than maintaining
   patch pairs, and it cannot drift out of step with the forward operation the
   way a hand-written inverse can.
   ========================================================================== */

const HISTORY_LIMIT = 60;

/** Keystrokes inside this window collapse into one undo step. */
const MERGE_WINDOW_MS = 700;

/** Who the open document belongs to. Carried in state because a site created
 *  by the setup flow does not exist in the fixtures. */
export interface EditorSite extends PublishedSiteFacts {
  id: ID;
  /** The address chosen at setup, so Publish does not propose a different one. */
  subdomain?: string;
}

export interface EditorState {
  doc: PageDocument;
  site: EditorSite;
  past: PageDocument[];
  future: PageDocument[];
  selectedId: ID | null;
  /** Identifies the field being typed into, so a burst coalesces. */
  mergeKey: string | null;
  mergeAt: number;
}

export type EditorAction =
  | { type: "select"; sectionId: ID | null }
  | { type: "setTitle"; sectionId: ID; title: string }
  | { type: "toggle"; sectionId: ID }
  | { type: "reorder"; pageId: ID; from: number; to: number }
  /**
   * `patch` is typed `object` rather than the content type `sectionId` implies,
   * because an action union cannot express that correlation. `object` rather
   * than a record so that each form still type-checks its own payload against
   * its own content type; the single assertion that re-pairs them lives in the
   * reducer, not scattered across the eight forms.
   */
  | { type: "patchContent"; sectionId: ID; patch: object; mergeKey?: string }
  | ({ type: "setStyle"; sectionId: ID; breakpoint: PageBreakpoint } & SectionStylePatch)
  | {
      type: "clearStyle";
      sectionId: ID;
      breakpoint: PageBreakpoint;
      property: SectionStyleProperty;
    }
  | { type: "setTheme"; patch: Partial<PageTheme>; mergeKey?: string }
  | { type: "addSection"; pageId: ID; kind: PageSectionKind }
  | { type: "removeSection"; sectionId: ID }
  | { type: "duplicateSection"; sectionId: ID }
  /** Replace everything. Used by the setup flow when a site is created. */
  | { type: "load"; doc: PageDocument; site: EditorSite }
  | { type: "undo" }
  | { type: "redo" };

const fixtureSite = (): EditorSite => {
  const site = getSite(PAGE_DOCUMENT.siteId);
  return { id: site.id, name: site.name, url: site.url, openingHours: site.openingHours };
};

const initialState = (): EditorState => ({
  doc: PAGE_DOCUMENT,
  site: fixtureSite(),
  past: [],
  future: [],
  selectedId: null,
  mergeKey: null,
  mergeAt: 0,
});

/* ---- Document helpers ---------------------------------------------------- */

/**
 * Every mapper returns the *same* document when nothing changed. Identity is
 * how `commit` recognises a no-op, and a no-op that slipped through would sit
 * in the history as an undo step that visibly does nothing.
 */
const withPages = (doc: PageDocument, pages: ConciergePage[]): PageDocument =>
  pages.every((page, i) => page === doc.pages[i]) ? doc : { ...doc, pages };

const mapSection = (
  doc: PageDocument,
  sectionId: ID,
  fn: (section: PageSection) => PageSection,
): PageDocument =>
  withPages(
    doc,
    doc.pages.map((page) =>
      page.sections.some((s) => s.id === sectionId)
        ? { ...page, sections: page.sections.map((s) => (s.id === sectionId ? fn(s) : s)) }
        : page,
    ),
  );

const mapPage = (
  doc: PageDocument,
  pageId: ID,
  fn: (page: ConciergePage) => ConciergePage,
): PageDocument =>
  withPages(doc, doc.pages.map((page) => (page.id === pageId ? fn(page) : page)));

/** Sections are addressed by id alone, but overrides live on their page. */
const mapPageOfSection = (
  doc: PageDocument,
  sectionId: ID,
  fn: (page: ConciergePage, section: PageSection) => ConciergePage,
): PageDocument =>
  withPages(
    doc,
    doc.pages.map((page) => {
      const section = page.sections.find((s) => s.id === sectionId);
      return section === undefined ? page : fn(page, section);
    }),
  );

const move = <T,>(items: T[], from: number, to: number): T[] => {
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

/**
 * Record a new document version. A `mergeKey` that matches the previous edit
 * and arrives inside the merge window replaces the top of the stack instead of
 * adding to it, so undo steps back over a typed phrase rather than a letter.
 */
const commit = (state: EditorState, doc: PageDocument, mergeKey?: string): EditorState => {
  if (doc === state.doc) return state;

  const now = Date.now();
  const merges =
    mergeKey !== undefined && state.mergeKey === mergeKey && now - state.mergeAt < MERGE_WINDOW_MS;

  return {
    ...state,
    doc,
    past: merges ? state.past : [...state.past, state.doc].slice(-HISTORY_LIMIT),
    future: [],
    mergeKey: mergeKey ?? null,
    mergeAt: now,
  };
};

/* ---- The reducer --------------------------------------------------------- */

export function reduce(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    /* Selection is interface state, not document state: it is not undoable and
       it never lands in history. */
    case "select":
      return state.selectedId === action.sectionId
        ? state
        : { ...state, selectedId: action.sectionId };

    case "setTitle":
      return commit(
        state,
        mapSection(state.doc, action.sectionId, (s) => ({ ...s, title: action.title })),
        `title:${action.sectionId}`,
      );

    case "toggle":
      return commit(
        state,
        mapSection(state.doc, action.sectionId, (s) => ({ ...s, enabled: !s.enabled })),
      );

    case "reorder": {
      if (action.from === action.to) return state;
      return commit(
        state,
        mapPage(state.doc, action.pageId, (p) => ({
          ...p,
          sections: move(p.sections, action.from, action.to),
        })),
      );
    }

    case "patchContent":
      return commit(
        state,
        mapSection(
          state.doc,
          action.sectionId,
          /* Spreading the patch widens `content` to the union of all eight
             content types, because nothing in the type system ties this
             action's payload back to the section's `kind`. The Inspector
             narrows before dispatching, so the pairing is correct by
             construction and this is the one place it has to be asserted. */
          (s) => ({ ...s, content: { ...s.content, ...action.patch } }) as PageSection,
        ),
        action.mergeKey,
      );

    case "setStyle": {
      /* The narrowed action already *is* a style patch, so it is passed whole.
         Destructuring `property` and `value` apart would break the pairing the
         union exists to hold together. */
      const { sectionId, breakpoint } = action;
      return commit(
        state,
        mapPageOfSection(state.doc, sectionId, (page, section) => {
          const next = setSectionStyle(section, page.styleOverrides, breakpoint, action);
          return {
            ...page,
            styleOverrides: next.overrides,
            sections: page.sections.map((s) => (s.id === sectionId ? next.section : s)),
          };
        }),
      );
    }

    case "clearStyle":
      return commit(
        state,
        mapPageOfSection(state.doc, action.sectionId, (page) => {
          const styleOverrides = clearSectionStyle(
            page.styleOverrides,
            action.sectionId,
            action.breakpoint,
            action.property,
          );
          return styleOverrides === page.styleOverrides ? page : { ...page, styleOverrides };
        }),
      );

    case "setTheme":
      return commit(
        state,
        { ...state.doc, theme: { ...state.doc.theme, ...action.patch } },
        action.mergeKey,
      );

    case "addSection": {
      const section = createSection(action.kind);
      return {
        ...commit(
          state,
          mapPage(state.doc, action.pageId, (p) => ({ ...p, sections: [...p.sections, section] })),
        ),
        /* Select it, because the next thing anyone does is fill it in. */
        selectedId: section.id,
      };
    }

    case "removeSection":
      return {
        ...commit(
          state,
          mapPageOfSection(state.doc, action.sectionId, (page) => ({
            ...page,
            sections: page.sections.filter((s) => s.id !== action.sectionId),
            styleOverrides: dropSectionOverrides(page.styleOverrides, action.sectionId),
          })),
        ),
        selectedId: state.selectedId === action.sectionId ? null : state.selectedId,
      };

    case "duplicateSection": {
      let copyId: ID | null = null;
      const doc = mapPageOfSection(state.doc, action.sectionId, (page, section) => {
        const next = duplicateSection(section, page.styleOverrides);
        copyId = next.section.id;
        const at = page.sections.findIndex((s) => s.id === action.sectionId);
        const sections = [...page.sections];
        sections.splice(at + 1, 0, next.section);
        return { ...page, sections, styleOverrides: next.overrides };
      });
      return { ...commit(state, doc), selectedId: copyId ?? state.selectedId };
    }

    /* A new document starts a new history. Letting undo reach back into the
       previous site's edits would be a way to resurrect content that is not
       yours any more. */
    case "load":
      return { ...initialState(), doc: action.doc, site: action.site };

    case "undo": {
      if (state.past.length === 0) return state;
      return {
        ...state,
        doc: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [state.doc, ...state.future],
        mergeKey: null,
      };
    }

    case "redo": {
      if (state.future.length === 0) return state;
      return {
        ...state,
        doc: state.future[0],
        past: [...state.past, state.doc].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        mergeKey: null,
      };
    }
  }
}

/* ---- The store ----------------------------------------------------------- */

let state = initialState();
const listeners = new Set<() => void>();

export function dispatch(action: EditorAction): void {
  const next = reduce(state, action);
  if (next === state) return;
  state = next;
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => state;

export const useEditor = (): EditorState => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

/** Reset between demos, and the seam Phase 4 replaces with a real load. */
export const resetEditor = (): void => {
  state = initialState();
  for (const listener of listeners) listener();
};

/* ---- Selectors ----------------------------------------------------------- */

export const findSection = (doc: PageDocument, sectionId: ID | null): PageSection | undefined =>
  sectionId === null
    ? undefined
    : doc.pages.flatMap((p) => p.sections).find((s) => s.id === sectionId);

export const canUndo = (state: EditorState) => state.past.length > 0;
export const canRedo = (state: EditorState) => state.future.length > 0;

/** Nothing is persisted yet, so any history at all means unsaved work. */
export const isDirty = (state: EditorState) => state.past.length > 0;

/* ---- Keyboard ------------------------------------------------------------ */

/**
 * Shared because focus can be in the workspace or inside the canvas frame, and
 * a keystroke only reaches the document it landed in.
 *
 * Undo is intercepted even while a text field has focus. Native field undo is
 * already broken by controlled inputs — the browser would restore text React
 * immediately overwrites — so the document-level history is the only one that
 * can be correct. Coalescing means one press still steps back over a whole
 * typed phrase rather than a single letter.
 *
 * Returns true when the event was handled, so the caller can prevent default.
 */
export function handleEditorShortcut(event: KeyboardEvent): boolean {
  if (event.key === "Escape") {
    dispatch({ type: "select", sectionId: null });
    return true;
  }
  if ((event.metaKey || event.ctrlKey) === false) return false;
  if (event.key.toLowerCase() !== "z") return false;
  dispatch({ type: event.shiftKey ? "redo" : "undo" });
  return true;
}
