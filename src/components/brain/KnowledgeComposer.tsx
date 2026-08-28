"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Field, Input, Panel, Select, Textarea } from "@/components/ui";
import { CloseIcon } from "@/components/icons";
import { ApprovedSticker } from "@/components/stickers";
import { CATEGORY_LABEL } from "@/lib/format";
import type { KnowledgeCategory, KnowledgeItem } from "@/lib/types";

/* ============================================================================
   KNOWLEDGE COMPOSER
   ----------------------------------------------------------------------------
   Opens in place under the page header rather than over the top of it, so the
   library stays visible and the new item can be seen landing in it.

   An item the owner typed themselves is approved the moment it is saved: they
   are the source. The panel says so, because "approved" everywhere else in
   Site Brain means "a person read this and agreed", and that must keep meaning
   the same thing here.
   ========================================================================== */

const CATEGORIES = Object.keys(CATEGORY_LABEL) as KnowledgeCategory[];

export function KnowledgeComposer({
  siteId,
  initialTitle = "",
  onAdd,
  onClose,
}: {
  siteId: string;
  /** Prefilled when the owner got here from a search that found nothing. */
  initialTitle?: string;
  onAdd: (item: KnowledgeItem) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<KnowledgeCategory>("faqs");
  const [body, setBody] = useState("");
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const ready = title.trim().length > 0 && body.trim().length > 0;

  function save() {
    if (!ready) return;
    const now = new Date().toISOString();
    onAdd({
      id: `k_new_${Date.now()}`,
      siteId,
      category,
      title: title.trim(),
      body: body.trim(),
      status: "approved",
      confidence: 1,
      required: false,
      sources: [{ id: `src_${Date.now()}`, kind: "manual", label: "Written by you", fetchedAt: now }],
      updatedAt: now,
    });
    onClose();
  }

  return (
    <Panel className="cg-enter mb-6">
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <h2 className="t-section">Add knowledge</h2>
          <p className="t-body-sm mt-1 text-text-tertiary">
            Something Concierge should be able to answer that your pages do not say.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close without saving"
          className="shrink-0 p-1 text-text-tertiary transition-colors hover:text-text-primary"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
          <Field label="What is the question?" htmlFor="k-title">
            <Input
              id="k-title"
              ref={first}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Do you treat children under 5?"
            />
          </Field>
          <Field label="Where it belongs" htmlFor="k-category">
            <Select
              id="k-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="What should Concierge say?"
          htmlFor="k-body"
          hint="Write it the way you would say it to a customer on the phone."
        >
          <Textarea
            id="k-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="We see children from age 3. The first visit is a short familiarisation appointment and it is free."
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface-subtle px-6 py-4">
        <Button onClick={save} disabled={!ready}>
          Save and approve
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <p className="ml-auto flex items-center gap-1.5 text-[11px] text-text-tertiary">
          <ApprovedSticker size={20} />
          You wrote it, so it is approved and usable straight away.
        </p>
      </div>
    </Panel>
  );
}
