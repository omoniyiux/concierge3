"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowRight,
  BillingIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  ConversationsIcon,
  InsightsIcon,
  LeadsIcon,
  MailIcon,
  SparkIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/icons";
import { Badge, Button, Field, Input, Panel, Select, tabClass, tabCountClass } from "@/components/ui";
import { cx } from "@/lib/cx";
import { agentOf, capabilityDef, quickActions } from "@/lib/page-agent";
import {
  BRAND_SWATCHES,
  CTA_OPTIONS,
  GOALS,
  INDUSTRIES,
  STYLES,
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  buildSmartDocument,
  getGoal,
  getTemplate,
  lookFor,
  recommendedTemplate,
  sampleDraft,
  type SmartDraft,
  type TemplateCategory,
} from "@/lib/starters";
import type { PageAgent, PageGoal, PageStylePreset, ThemeFontPairing } from "@/lib/types";
import { AgentSettings, CapabilityList } from "./AgentControls";
import { AgentIncluded, StepHeader, StickyAside, previewFacts } from "./shared";
import { BrowserFrame, PhoneFrame, SitePreview } from "./SitePreview";

/* ============================================================================
   THE GUIDED FLOW
   ----------------------------------------------------------------------------
   Four questions, in the order that lets each one be answered well: what the
   page is for, which shape suits it, who the business is, and what the agent
   should do. Every step shows the real page it is producing beside it, so
   the owner is choosing from something they can see rather than from a list.

   The steps hold no state of their own. They read the draft and hand back a
   new one, which is what lets Vibe Chat drop an owner into the middle of this
   flow with everything already filled in.
   ========================================================================== */

const SAMPLE_SITE_ID = "site_sample";

const GOAL_ICON: Record<PageGoal, (p: { size?: number; className?: string }) => ReactNode> = {
  opportunities: LeadsIcon,
  customers: InsightsIcon,
  appointments: CalendarIcon,
  sell: BillingIcon,
  event: SparkIcon,
  emails: MailIcon,
  questions: ConversationsIcon,
};

/** The face each pairing sets headings in, so a style tile previews its own type. */
const STYLE_FACE: Record<ThemeFontPairing, string> = {
  grotesk: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  editorial: 'Georgia, "Times New Roman", serif',
  humanist: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, sans-serif',
  classic: 'Georgia, "Times New Roman", serif',
  garamond: '"Cormorant Garamond", Georgia, serif',
  fraunces: '"Fraunces", Georgia, serif',
  poster: '"Anton", Impact, sans-serif',
  heavy: '"Archivo Black", "Arial Black", sans-serif',
  modern: '"Manrope", "Helvetica Neue", sans-serif',
};

/* The same families the pages load, so the tiles are honest about the type. */
const TILE_FONTS =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Fraunces:wght@500&family=Anton&family=Archivo+Black&family=Manrope:wght@700&display=swap";

function StepFooter({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-divider pt-6">
      {children}
      {note && <span className="text-[11.5px] text-text-tertiary">{note}</span>}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="tertiary" onClick={onClick} leading={<ChevronLeft size={15} />}>
      Back
    </Button>
  );
}

/* ---- 1 · Goal --------------------------------------------------------------- */

export function GoalStep({
  draft,
  onGoal,
  onNext,
}: {
  draft: SmartDraft;
  onGoal: (goal: PageGoal) => void;
  onNext: () => void;
}) {
  const recommended = recommendedTemplate(draft.brief.goal);
  const sample = useMemo(() => buildSmartDocument(sampleDraft(recommended.id), SAMPLE_SITE_ID), [recommended.id]);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="min-w-0">
        <StepHeader
          eyebrow="Step 1 of 5 · Goal"
          title="What do you want to launch today?"
          description="Choose a goal and Concierge builds the page around it — the main button, the sections, and what your AI agent does for visitors."
        />

        <ul className="mt-8 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Page goal">
          {GOALS.map((goal) => {
            const Icon = GOAL_ICON[goal.id];
            const selected = goal.id === draft.brief.goal;
            return (
              <li key={goal.id} className={goal.id === "questions" ? "sm:col-span-2" : undefined}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onGoal(goal.id)}
                  className={cx(
                    "flex h-full w-full items-center gap-3.5 border bg-surface p-4 text-left transition-[border-color,box-shadow] duration-[var(--dur-micro)]",
                    selected ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-hover",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-10 w-10 shrink-0 items-center justify-center transition-colors",
                      selected ? "bg-ink text-accent" : "bg-surface-subtle text-text-secondary",
                    )}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{goal.label}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-[1.45] text-text-tertiary">
                      {goal.description}
                    </span>
                  </span>
                  <ChevronRight size={15} className={selected ? "text-text-primary" : "text-text-disabled"} />
                </button>
              </li>
            );
          })}
        </ul>

        <StepFooter note="You can change this later.">
          <Button size="lg" onClick={onNext} trailing={<ArrowRight size={15} />}>
            Continue
          </Button>
        </StepFooter>
      </div>

      <StickyAside>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[12px] text-text-tertiary">
            Recommended for this goal: <span className="font-medium text-text-primary">{recommended.name}</span>
          </p>
          <AgentIncluded compact />
        </div>
        <BrowserFrame url={previewFacts(recommended.sample).url}>
          <SitePreview document={sample} site={previewFacts(recommended.sample)} aspect={1280 / 880} agentOpen />
        </BrowserFrame>
        <p className="t-serif mt-4 text-[15px] text-text-secondary">Your site. Your AI agent. Ready in minutes.</p>
      </StickyAside>
    </div>
  );
}

/* ---- 2 · Template ----------------------------------------------------------- */

export function TemplateStep({
  draft,
  onTemplate,
  onBack,
  onNext,
}: {
  draft: SmartDraft;
  onTemplate: (templateId: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const samples = useMemo(
    () => Object.fromEntries(TEMPLATES.map((t) => [t.id, buildSmartDocument(sampleDraft(t.id), SAMPLE_SITE_ID)])),
    [],
  );
  const goal = getGoal(draft.brief.goal);
  const selected = getTemplate(draft.brief.templateId);
  const selectedDoc = samples[selected.id];
  const facts = previewFacts(selected.sample);
  const [category, setCategory] = useState<TemplateCategory | "recommended" | "all">("recommended");
  /* Recommended ones first, then the rest in catalogue order. */
  const ordered = [
    ...goal.templates.map(getTemplate),
    ...TEMPLATES.filter((t) => !goal.templates.includes(t.id)),
  ].filter((t) =>
    category === "all" ? true : category === "recommended" ? goal.templates.includes(t.id) : t.category === category,
  );
  const filters: { id: typeof category; label: string; count: number }[] = [
    { id: "recommended", label: "For your goal", count: goal.templates.length },
    { id: "all", label: "All", count: TEMPLATES.length },
    ...TEMPLATE_CATEGORIES.map((c) => ({ id: c, label: c, count: TEMPLATES.filter((t) => t.category === c).length })),
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 2 of 5 · Template"
        title="Choose a smart template"
        description="Every page comes with your AI agent built in. Pick the shape closest to your business — you can change everything after."
      />

      <div role="tablist" aria-label="Template category" className="mt-7 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={category === f.id}
            onClick={() => setCategory(f.id)}
            className={tabClass(category === f.id)}
          >
            {f.label}
            <span className={tabCountClass(category === f.id)}>{f.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <ul className="grid min-w-0 content-start gap-3 sm:grid-cols-2 2xl:grid-cols-3" role="radiogroup" aria-label="Template">
          {ordered.map((template) => {
            const isSelected = template.id === selected.id;
            const isRecommended = goal.templates.includes(template.id);
            return (
              <li key={template.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => onTemplate(template.id)}
                  className={cx(
                    "group block w-full border bg-surface text-left transition-[border-color,box-shadow] duration-[var(--dur-micro)]",
                    isSelected ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-hover",
                  )}
                >
                  <span className="relative block border-b border-divider">
                    <SitePreview
                      document={samples[template.id]}
                      site={previewFacts(template.sample)}
                      aspect={16 / 11}
                    />
                    <AgentIncluded compact className="absolute bottom-2 left-2" />
                  </span>
                  <span className="flex items-start gap-2 p-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{template.name}</span>
                      <span className="mt-0.5 block text-[11.5px] text-text-tertiary">
                        {template.category} · {template.bestFor}
                      </span>
                    </span>
                    {isSelected ? (
                      <CheckIcon size={15} strokeWidth={2.4} className="mt-0.5 shrink-0" />
                    ) : (
                      isRecommended && <Badge tone="accent">Recommended</Badge>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <StickyAside>
          <Panel className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="t-section">{selected.name} template</p>
              <Badge tone="approved" dot>
                Selected
              </Badge>
            </div>

            {/* Desktop and phone together, the way a visitor might meet it. */}
            <div className="relative mt-4 pb-6 pr-16">
              <BrowserFrame url={facts.url}>
                <SitePreview document={selectedDoc} site={facts} aspect={1280 / 860} agentOpen />
              </BrowserFrame>
              <PhoneFrame className="absolute bottom-0 right-0 w-[112px]">
                <SitePreview document={selectedDoc} site={facts} device="mobile" aspect={390 / 740} />
              </PhoneFrame>
            </div>

            <p className="mt-5 text-[12.5px] font-medium">Why choose this template?</p>
            <p className="mt-1.5 text-[12px] leading-[1.55] text-text-tertiary">{selected.summary}</p>
            <ul className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {selected.includes.map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11.5px] leading-[1.45]">
                  <CheckIcon size={12} strokeWidth={2.4} className="mt-0.5 shrink-0 text-accent-ink" />
                  {item}
                </li>
              ))}
            </ul>

            <dl className="mt-4 grid gap-2 border-t border-divider pt-4 text-[11.5px]">
              <div className="flex gap-3">
                <dt className="w-[92px] shrink-0 text-text-tertiary">Main button</dt>
                <dd className="font-medium">{selected.cta}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-[92px] shrink-0 text-text-tertiary">Agent does</dt>
                <dd>{selected.capabilities.map((c) => capabilityDef(c).label).join(", ")}</dd>
              </div>
            </dl>
          </Panel>

          <StepFooter>
            <BackButton onClick={onBack} />
            <Button size="lg" onClick={onNext} trailing={<ArrowRight size={15} />} className="ml-auto">
              Use this template
            </Button>
          </StepFooter>
        </StickyAside>
      </div>
    </div>
  );
}

/* ---- 3 · Business ----------------------------------------------------------- */

const MAX_LOGO_BYTES = 300_000;

export function BusinessStep({
  draft,
  siteId,
  onChange,
  onBack,
  onNext,
}: {
  draft: SmartDraft;
  siteId: string;
  onChange: (draft: SmartDraft) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const b = draft.brief.business;
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoProblem, setLogoProblem] = useState<string | null>(null);
  const doc = useMemo(() => buildSmartDocument(draft, siteId), [draft, siteId]);
  const facts = previewFacts(b);

  const setBusiness = (patch: Partial<typeof b>) =>
    onChange({ ...draft, brief: { ...draft.brief, business: { ...b, ...patch } } });
  const setStyle = (style: PageStylePreset) =>
    onChange({
      ...draft,
      brief: { ...draft.brief, style },
      agent: { ...draft.agent, tone: lookFor(style, getTemplate(draft.brief.templateId)).tone },
    });

  const ready = b.name.trim().length > 1 && b.offer.trim().length > 1;
  const ctas = CTA_OPTIONS.includes(draft.brief.cta) ? CTA_OPTIONS : [draft.brief.cta, ...CTA_OPTIONS];

  const readLogo = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setLogoProblem("That file is over 300 KB. A smaller PNG or SVG will look just as sharp.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoProblem(null);
      onChange({ ...draft, logo: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="min-w-0">
        <StepHeader
          eyebrow="Step 3 of 5 · Business"
          title="Tell us about your business"
          description="Concierge writes the page from this — in your words, about your business. Nothing is invented."
        />

        <Panel className="mt-8 space-y-4 p-5">
          <Field label="Business name" htmlFor="biz-name">
            <Input
              id="biz-name"
              value={b.name}
              placeholder="Oak & Ember Landscaping"
              onChange={(e) => setBusiness({ name: e.target.value })}
            />
          </Field>

          <Field label="Logo" hint="Optional. PNG, SVG or JPG, up to 300 KB." error={logoProblem ?? undefined}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-line-strong bg-surface-subtle">
                {draft.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.logo} alt="Your logo" className="h-full w-full object-contain" />
                ) : (
                  <UploadIcon size={15} className="text-text-muted" />
                )}
              </span>
              <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                {draft.logo ? "Replace" : "Upload logo"}
              </Button>
              {draft.logo && (
                <Button variant="tertiary" size="sm" leading={<TrashIcon size={13} />} onClick={() => onChange({ ...draft, logo: undefined })}>
                  Remove
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => readLogo(e.target.files?.[0])}
              />
            </div>
          </Field>

          <Field label="Primary offer" htmlFor="biz-offer" hint="List a few and each becomes a service on the page.">
            <Input
              id="biz-offer"
              value={b.offer}
              placeholder="Landscaping, lawn care and outdoor living spaces"
              onChange={(e) => setBusiness({ offer: e.target.value })}
            />
          </Field>

          <Field label="Industry" htmlFor="biz-industry">
            <Select id="biz-industry" value={b.industry} onChange={(e) => setBusiness({ industry: e.target.value })}>
              {(INDUSTRIES.includes(b.industry) ? INDUSTRIES : [b.industry, ...INDUSTRIES]).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone or email" htmlFor="biz-contact">
              <Input
                id="biz-contact"
                value={b.contact}
                placeholder="(555) 321-9876"
                onChange={(e) => setBusiness({ contact: e.target.value })}
              />
            </Field>
            <Field label="Location" htmlFor="biz-location">
              <Input
                id="biz-location"
                value={b.location}
                placeholder="Austin, Texas"
                onChange={(e) => setBusiness({ location: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Main call to action" htmlFor="biz-cta" hint="The one thing every visitor is asked to do.">
            <Select
              id="biz-cta"
              value={draft.brief.cta}
              onChange={(e) => onChange({ ...draft, brief: { ...draft.brief, cta: e.target.value } })}
            >
              {ctas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </Panel>

        <StepFooter note={ready ? undefined : "Add a name and what you offer to continue."}>
          <BackButton onClick={onBack} />
          <Button size="lg" disabled={!ready} onClick={onNext} trailing={<ArrowRight size={15} />}>
            Continue to agent
          </Button>
        </StepFooter>
      </div>

      <StickyAside>
        <p className="t-section">Choose your page style</p>
        <p className="mt-1 text-[12px] text-text-tertiary">A direction, not a panel of settings. You can change it any time.</p>

        <link rel="stylesheet" href={TILE_FONTS} precedence="default" />
        <ul className="mt-4 grid grid-cols-3 gap-2 xl:grid-cols-6" role="radiogroup" aria-label="Page style">
          {STYLES.map((style) => {
            const selected = style.id === draft.brief.style;
            const look = lookFor(style.id, getTemplate(draft.brief.templateId));
            return (
              <li key={style.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setStyle(style.id)}
                  className={cx(
                    "flex h-full w-full flex-col items-center gap-1.5 border bg-surface px-2 py-3 text-center transition-[border-color,box-shadow]",
                    selected ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-hover",
                  )}
                >
                  <span
                    className="text-[22px] leading-none"
                    style={{ fontFamily: STYLE_FACE[look.theme.fonts] }}
                  >
                    Aa
                  </span>
                  <span className="text-[11px] font-medium leading-[1.3]">{style.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11.5px] text-text-tertiary">Brand colour</span>
          {[...new Set([getTemplate(draft.brief.templateId).brandColor, ...BRAND_SWATCHES])].map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`Use ${color}`}
              aria-pressed={draft.brandColor === color}
              onClick={() => onChange({ ...draft, brandColor: color })}
              className={cx(
                "h-6 w-6 border transition-shadow",
                draft.brandColor === color ? "border-ink ring-2 ring-ink ring-offset-2" : "border-line-strong",
              )}
              style={{ background: color }}
            />
          ))}
          <label className="ml-1 flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
            <input
              type="color"
              value={draft.brandColor}
              onChange={(e) => onChange({ ...draft, brandColor: e.target.value })}
              className="h-6 w-8 cursor-pointer border border-line-strong bg-surface p-0"
            />
            Custom
          </label>
        </div>

        <BrowserFrame url={facts.url} className="mt-5">
          <SitePreview document={doc} site={facts} aspect={1280 / 900} />
        </BrowserFrame>
      </StickyAside>
    </div>
  );
}

/* ---- 4 · Agent -------------------------------------------------------------- */

export function AgentStep({
  draft,
  siteId,
  onAgent,
  onBack,
  onGenerate,
}: {
  draft: SmartDraft;
  siteId: string;
  onAgent: (agent: PageAgent) => void;
  onBack: () => void;
  onGenerate: () => void;
}) {
  const doc = useMemo(() => buildSmartDocument(draft, siteId), [draft, siteId]);
  const facts = previewFacts(draft.brief.business);
  const actions = quickActions(agentOf(doc));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
      <div className="min-w-0">
        <StepHeader
          eyebrow="Step 4 of 5 · Agent"
          title="Configure your website agent"
          description="Choose what your Concierge agent should help visitors do. Each switch changes the page too — the buttons, the widget, and where the work lands."
        />

        <div className="mt-8">
          <CapabilityList document={doc} onChange={onAgent} />
        </div>

        <Panel className="mt-4 p-5">
          <p className="t-section">Agent behaviour</p>
          <p className="mt-1 mb-4 text-[12px] text-text-tertiary">
            How it sounds, and anything a switched-on capability needs before it can work.
          </p>
          <AgentSettings document={doc} siteName={facts.name} onChange={onAgent} />
        </Panel>

        <StepFooter note="Takes a few seconds. You can change everything after.">
          <BackButton onClick={onBack} />
          <Button size="lg" variant="accent" onClick={onGenerate} leading={<SparkIcon size={15} />} trailing={<ArrowRight size={15} />}>
            Generate my smart page
          </Button>
        </StepFooter>
      </div>

      <StickyAside>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-medium">Live preview</p>
          <span className="flex items-center gap-1.5 text-[11.5px] text-success">
            <span className="cg-live-dot h-1.5 w-1.5 bg-success" aria-hidden />
            Updates as you switch
          </span>
        </div>
        <PhoneFrame className="mx-auto w-full max-w-[320px]">
          <SitePreview document={doc} site={facts} device="mobile" aspect={390 / 760} agentOpen />
        </PhoneFrame>
        <p className="mt-4 text-[11.5px] leading-[1.55] text-text-tertiary">
          Visitors will see: <span className="text-text-primary">{actions.join(" · ") || "Ask a question"}</span>
        </p>
      </StickyAside>
    </div>
  );
}
