"use client";

import { useId } from "react";
import { Field, Select, Toggle } from "@/components/ui";
import { ACTIONS } from "@/lib/demo-data";
import type {
  AboutContent,
  ContactContent,
  FaqContent,
  GalleryContent,
  HeroContent,
  PricingContent,
  ServicesContent,
  TestimonialsContent,
} from "@/lib/types";
import {
  CtaRow,
  Repeater,
  StringList,
  TextRow,
  moveItem,
  newItemId,
  removeAt,
  replaceAt,
} from "./fields";
import { IconField, ImageField } from "./media";

/* ============================================================================
   ONE FORM PER SECTION KIND
   ----------------------------------------------------------------------------
   Each form is written against exactly one content type, which is what makes
   the whole approach worth it: there is no generic property editor to get
   wrong, no way to set a field the kind does not have, and the questions are
   the ones the owner actually needs answering — "what do you charge", not
   "what is the flex-basis".

   `onChange` takes a merge key so a burst of typing collapses into a single
   undo step rather than one per keystroke.
   ========================================================================== */

export type FormProps<C> = {
  content: C;
  onChange: (patch: Partial<C>, mergeKey?: string) => void;
};

/* ---- Hero ---------------------------------------------------------------- */

export function HeroForm({ content, onChange }: FormProps<HeroContent>) {
  return (
    <>
      <TextRow
        label="Headline"
        value={content.headline}
        onChange={(v) => onChange({ headline: v }, "headline")}
        hint="One plain sentence. Say what you do and where."
      />
      <TextRow
        label="Supporting line"
        multiline
        value={content.subheadline}
        onChange={(v) => onChange({ subheadline: v }, "subheadline")}
      />
      <CtaRow label="Primary button" cta={content.cta} onChange={(cta) => onChange({ cta })} removable />
      <CtaRow
        label="Secondary button"
        cta={content.secondaryCta}
        onChange={(secondaryCta) => onChange({ secondaryCta })}
        removable
      />
      <ImageField
        label="Picture"
        image={content.image}
        onChange={(image) => onChange({ image })}
        hint="Adding one puts the hero into two columns."
      />
    </>
  );
}

/* ---- Services ------------------------------------------------------------ */

export function ServicesForm({ content, onChange }: FormProps<ServicesContent>) {
  const { items } = content;
  return (
    <>
      <TextRow
        label="Heading"
        value={content.heading}
        onChange={(v) => onChange({ heading: v }, "heading")}
      />
      <TextRow
        label="Intro"
        multiline
        rows={2}
        value={content.intro ?? ""}
        onChange={(v) => onChange({ intro: v }, "intro")}
      />
      <Repeater
        label="Services"
        count={items.length}
        addLabel="Add a service"
        empty="No services yet."
        onAdd={() =>
          onChange({ items: [...items, { id: newItemId("sv"), name: "", description: "" }] })
        }
        onRemove={(i) => onChange({ items: removeAt(items, i) })}
        onMove={(from, to) => onChange({ items: moveItem(items, from, to) })}
      >
        {items.map((item, i) => (
          <div key={item.id} className="space-y-3">
            <TextRow
              label="Name"
              value={item.name}
              onChange={(v) => onChange({ items: replaceAt(items, i, { ...item, name: v }) }, `sv-name-${item.id}`)}
            />
            <TextRow
              label="Description"
              multiline
              rows={2}
              value={item.description}
              onChange={(v) =>
                onChange({ items: replaceAt(items, i, { ...item, description: v }) }, `sv-desc-${item.id}`)
              }
            />
            <TextRow
              label="Price"
              value={item.price ?? ""}
              hint="Free text, so a range or a starting point both work."
              onChange={(v) =>
                onChange({ items: replaceAt(items, i, { ...item, price: v }) }, `sv-price-${item.id}`)
              }
            />
            <IconField
              label="Icon"
              value={item.icon}
              onChange={(icon) => onChange({ items: replaceAt(items, i, { ...item, icon }) })}
            />
            <ImageField
              label="Picture"
              image={item.image}
              onChange={(image) => onChange({ items: replaceAt(items, i, { ...item, image }) })}
              hint="A picture is used instead of the icon when both are set."
            />
          </div>
        ))}
      </Repeater>
    </>
  );
}

/* ---- About --------------------------------------------------------------- */

export function AboutForm({ content, onChange }: FormProps<AboutContent>) {
  return (
    <>
      <TextRow
        label="Heading"
        value={content.heading}
        onChange={(v) => onChange({ heading: v }, "heading")}
      />
      <TextRow
        label="Body"
        multiline
        rows={5}
        value={content.body}
        onChange={(v) => onChange({ body: v }, "body")}
      />
      <StringList
        label="Proof points"
        items={content.highlights}
        addLabel="Add a proof point"
        placeholder="Family run since 2009"
        onChange={(highlights) => onChange({ highlights })}
      />
      <ImageField
        label="Picture"
        image={content.image}
        onChange={(image) => onChange({ image })}
        hint="Adding one puts this section into two columns."
      />
    </>
  );
}

/* ---- Testimonials -------------------------------------------------------- */

export function TestimonialsForm({ content, onChange }: FormProps<TestimonialsContent>) {
  const { items } = content;
  const ratingId = useId();
  return (
    <>
      <TextRow
        label="Heading"
        value={content.heading}
        onChange={(v) => onChange({ heading: v }, "heading")}
      />
      <Repeater
        label="Reviews"
        count={items.length}
        addLabel="Add a review"
        empty="No reviews yet."
        onAdd={() => onChange({ items: [...items, { id: newItemId("tm"), quote: "", author: "" }] })}
        onRemove={(i) => onChange({ items: removeAt(items, i) })}
        onMove={(from, to) => onChange({ items: moveItem(items, from, to) })}
      >
        {items.map((item, i) => (
          <div key={item.id} className="space-y-3">
            <TextRow
              label="Quote"
              multiline
              rows={3}
              value={item.quote}
              onChange={(v) => onChange({ items: replaceAt(items, i, { ...item, quote: v }) }, `tm-q-${item.id}`)}
            />
            <TextRow
              label="Name"
              value={item.author}
              onChange={(v) => onChange({ items: replaceAt(items, i, { ...item, author: v }) }, `tm-a-${item.id}`)}
            />
            <TextRow
              label="Context"
              value={item.detail ?? ""}
              hint="What they had done. It makes the quote land."
              onChange={(v) => onChange({ items: replaceAt(items, i, { ...item, detail: v }) }, `tm-d-${item.id}`)}
            />
            <ImageField
              label="Photo"
              image={item.avatar}
              onChange={(avatar) => onChange({ items: replaceAt(items, i, { ...item, avatar }) })}
              hint="Optional. Shown as a small circle beside the name."
            />
            <Field label="Rating" htmlFor={`${ratingId}-${item.id}`}>
              <Select
                id={`${ratingId}-${item.id}`}
                value={item.rating === undefined ? "" : String(item.rating)}
                onChange={(e) =>
                  onChange({
                    items: replaceAt(items, i, {
                      ...item,
                      rating: e.target.value === "" ? undefined : Number(e.target.value),
                    }),
                  })
                }
              >
                <option value="">No rating</option>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} out of 5
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        ))}
      </Repeater>
    </>
  );
}

/* ---- Pricing ------------------------------------------------------------- */

export function PricingForm({ content, onChange }: FormProps<PricingContent>) {
  const { tiers } = content;
  return (
    <>
      <TextRow label="Heading" value={content.heading} onChange={(v) => onChange({ heading: v }, "heading")} />
      <TextRow
        label="Intro"
        multiline
        rows={2}
        value={content.intro ?? ""}
        onChange={(v) => onChange({ intro: v }, "intro")}
      />
      <Repeater
        label="Tiers"
        count={tiers.length}
        addLabel="Add a tier"
        empty="No tiers yet."
        onAdd={() =>
          onChange({
            tiers: [...tiers, { id: newItemId("tr"), name: "", price: "", features: [], featured: false }],
          })
        }
        onRemove={(i) => onChange({ tiers: removeAt(tiers, i) })}
        onMove={(from, to) => onChange({ tiers: moveItem(tiers, from, to) })}
      >
        {tiers.map((tier, i) => (
          <div key={tier.id} className="space-y-3">
            <TextRow
              label="Name"
              value={tier.name}
              onChange={(v) => onChange({ tiers: replaceAt(tiers, i, { ...tier, name: v }) }, `tr-n-${tier.id}`)}
            />
            <TextRow
              label="Price"
              value={tier.price}
              onChange={(v) => onChange({ tiers: replaceAt(tiers, i, { ...tier, price: v }) }, `tr-p-${tier.id}`)}
            />
            <TextRow
              label="Per"
              value={tier.cadence ?? ""}
              hint="per move, per hour, per month."
              onChange={(v) => onChange({ tiers: replaceAt(tiers, i, { ...tier, cadence: v }) }, `tr-c-${tier.id}`)}
            />
            <TextRow
              label="Description"
              multiline
              rows={2}
              value={tier.description ?? ""}
              onChange={(v) =>
                onChange({ tiers: replaceAt(tiers, i, { ...tier, description: v }) }, `tr-d-${tier.id}`)
              }
            />
            <StringList
              label="What is included"
              items={tier.features}
              addLabel="Add a line"
              onChange={(features) => onChange({ tiers: replaceAt(tiers, i, { ...tier, features }) })}
            />
            <CtaRow
              label="Button"
              cta={tier.cta}
              removable
              onChange={(cta) => onChange({ tiers: replaceAt(tiers, i, { ...tier, cta }) })}
            />
            <Toggle
              checked={tier.featured}
              onChange={(featured) => onChange({ tiers: replaceAt(tiers, i, { ...tier, featured }) })}
              label="Highlight this tier"
            />
          </div>
        ))}
      </Repeater>
      <TextRow
        label="Small print"
        multiline
        rows={2}
        value={content.note ?? ""}
        hint="The honest caveat. Owners who set expectations get fewer disputes."
        onChange={(v) => onChange({ note: v }, "note")}
      />
    </>
  );
}

/* ---- FAQ ----------------------------------------------------------------- */

export function FaqForm({ content, onChange }: FormProps<FaqContent>) {
  const { items } = content;
  return (
    <>
      <TextRow label="Heading" value={content.heading} onChange={(v) => onChange({ heading: v }, "heading")} />
      <Repeater
        label="Questions"
        count={items.length}
        addLabel="Add a question"
        empty="No questions yet."
        onAdd={() => onChange({ items: [...items, { id: newItemId("q"), question: "", answer: "" }] })}
        onRemove={(i) => onChange({ items: removeAt(items, i) })}
        onMove={(from, to) => onChange({ items: moveItem(items, from, to) })}
      >
        {items.map((item, i) => (
          <div key={item.id} className="space-y-3">
            <TextRow
              label="Question"
              value={item.question}
              onChange={(v) =>
                onChange({ items: replaceAt(items, i, { ...item, question: v }) }, `q-q-${item.id}`)
              }
            />
            <TextRow
              label="Answer"
              multiline
              rows={4}
              value={item.answer}
              onChange={(v) => onChange({ items: replaceAt(items, i, { ...item, answer: v }) }, `q-a-${item.id}`)}
            />
          </div>
        ))}
      </Repeater>
    </>
  );
}

/* ---- Contact ------------------------------------------------------------- */

export function ContactForm({ content, onChange }: FormProps<ContactContent>) {
  const id = useId();
  return (
    <>
      <TextRow label="Heading" value={content.heading} onChange={(v) => onChange({ heading: v }, "heading")} />
      <TextRow
        label="Intro"
        multiline
        rows={2}
        value={content.body ?? ""}
        onChange={(v) => onChange({ body: v }, "body")}
      />
      <TextRow label="Phone" value={content.phone ?? ""} onChange={(v) => onChange({ phone: v }, "phone")} />
      <TextRow label="Email" value={content.email ?? ""} onChange={(v) => onChange({ email: v }, "email")} />
      <TextRow
        label="Address"
        value={content.address ?? ""}
        onChange={(v) => onChange({ address: v }, "address")}
      />
      <Field label="Enquiry form" htmlFor={id} hint="Runs the same Action the Agent uses.">
        <Select
          id={id}
          value={content.actionId ?? ""}
          onChange={(e) => onChange({ actionId: e.target.value === "" ? undefined : e.target.value })}
        >
          <option value="">No form</option>
          {ACTIONS.map((action) => (
            <option key={action.id} value={action.id}>
              {action.name}
            </option>
          ))}
        </Select>
      </Field>
      <Toggle
        checked={content.showHours}
        onChange={(showHours) => onChange({ showHours })}
        label="Show opening hours"
      />
      <p className="text-[12.5px] text-text-tertiary">
        Hours come from the site settings, so changing them there updates this page too.
      </p>
    </>
  );
}

/* ---- Gallery ------------------------------------------------------------- */

export function GalleryForm({ content, onChange }: FormProps<GalleryContent>) {
  const { items } = content;
  return (
    <>
      <TextRow label="Heading" value={content.heading} onChange={(v) => onChange({ heading: v }, "heading")} />
      <TextRow
        label="Intro"
        multiline
        rows={2}
        value={content.intro ?? ""}
        onChange={(v) => onChange({ intro: v }, "intro")}
      />
      <Repeater
        label="Images"
        count={items.length}
        addLabel="Add an image"
        empty="No images yet."
        onAdd={() =>
          onChange({ items: [...items, { id: newItemId("g"), image: { src: "", alt: "" } }] })
        }
        onRemove={(i) => onChange({ items: removeAt(items, i) })}
        onMove={(from, to) => onChange({ items: moveItem(items, from, to) })}
      >
        {items.map((item, i) => (
          <div key={item.id} className="space-y-3">
            <ImageField
              label="Picture"
              removable={false}
              image={item.image}
              onChange={(image) =>
                onChange({ items: replaceAt(items, i, { ...item, image: image ?? { src: "", alt: "" } }) })
              }
            />
            <TextRow
              label="Caption"
              value={item.caption ?? ""}
              onChange={(v) =>
                onChange({ items: replaceAt(items, i, { ...item, caption: v }) }, `g-cap-${item.id}`)
              }
            />
          </div>
        ))}
      </Repeater>
      <p className="text-[12.5px] text-text-tertiary">
        Uploaded files are held in the page for now. Publishing moves them to proper hosting.
      </p>
    </>
  );
}
