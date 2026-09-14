"use client";

import { use, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { VerdictBar } from "@/components/assistants/VerdictBar";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Panel,
  SectionHead,
  SegmentedControl,
  Toggle,
} from "@/components/ui";
import {
  AlertIcon,
  BrainIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  ExternalIcon,
  GlobeIcon,
  PlusIcon,
  RefreshIcon,
  SparkIcon,
} from "@/components/icons";
import { ACTIONS, ASSISTANT_ANSWERS, KNOWLEDGE, SURFACES, getSite } from "@/lib/demo-data";
import { buildAgentCard, buildJsonLd, buildLlmsTxt, publishable } from "@/lib/answers";
import { CATEGORY_LABEL, relativeTime } from "@/lib/format";
import type { AssistantName, MentionVerdict, PublishedSurfaceKind } from "@/lib/types";

/* ============================================================================
   ASSISTANTS
   ----------------------------------------------------------------------------
   Most customers now meet a business through an assistant before they ever
   meet its website. Concierge holds the one thing those assistants are
   guessing at — an approved, current account of the business — so this
   surface does two jobs:

     · publishes that account outward, in the formats machines read
     · reports back what the assistants are actually saying

   The second half is the sharper one. A question no assistant can answer is
   demand the owner never even sees arrive.
   ========================================================================== */

const ASSISTANT_LABEL: Record<AssistantName, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  gemini: "Gemini",
};

const VERDICT: Record<
  MentionVerdict,
  { label: string; tone: "approved" | "review" | "restricted" | "neutral"; cost: string }
> = {
  accurate: { label: "Right", tone: "approved", cost: "Answered from what you published." },
  incomplete: {
    label: "Half an answer",
    tone: "review",
    cost: "They hedge, and the customer keeps looking.",
  },
  outdated: { label: "Out of date", tone: "restricted", cost: "They quote a price you no longer charge." },
  absent: { label: "Nothing", tone: "restricted", cost: "You are not in the answer at all." },
};

const SURFACE_COPY: Record<PublishedSurfaceKind, { title: string; body: string }> = {
  "structured-data": {
    title: "Structured data on your pages",
    body: "Your hours, services and answers, written into every page in the format search engines and assistants parse first.",
  },
  "llms-txt": {
    title: "An index for assistants",
    body: "A plain, maintained list of everything you have approved, at a fixed address they know to look for.",
  },
  "answer-mirror": {
    title: "A clean copy of every answer",
    body: "Each approved item as plain text, so nothing is lost to your page layout.",
  },
  mcp: {
    title: "A live endpoint they can ask",
    body: "Rather than reading a copy, an assistant asks your Site Brain directly and gets today's answer.",
  },
  "agent-card": {
    title: "What you can be asked to do",
    body: "Lists the actions that are genuinely ready, so an assistant can offer a booking it knows will complete.",
  },
};

type Preview = "llms" | "jsonld" | "card";

export default function AssistantsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const site = getSite(siteId);
  const [preview, setPreview] = useState<Preview>("llms");
  const [mcpOn, setMcpOn] = useState(false);
  const [copied, setCopied] = useState(false);

  const answers = [...ASSISTANT_ANSWERS].sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict));
  const wrong = answers.filter((a) => a.verdict !== "accurate");
  const approved = publishable(KNOWLEDGE);
  const readyActions = ACTIONS.filter((a) => a.readiness === "ready");

  const text =
    preview === "llms"
      ? buildLlmsTxt(site, KNOWLEDGE)
      : JSON.stringify(
          preview === "jsonld" ? buildJsonLd(site, KNOWLEDGE) : buildAgentCard(site, readyActions),
          null,
          2,
        );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Assistants"
        title="Where assistants get their answers about you"
        description="Your customers ask ChatGPT before they visit your website. Concierge publishes the knowledge you have already approved, then checks weekly what the assistants actually say back."
        actions={
          <Button variant="secondary" leading={<RefreshIcon size={15} />}>
            Check again now
          </Button>
        }
        meta={
          <p className="t-body-sm text-text-tertiary">
            Last checked {relativeTime(answers[0].checkedAt)} · {answers.length} questions across{" "}
            {new Set(answers.map((a) => a.assistant)).size} assistants · {approved.length} approved items
            published
          </p>
        }
      />

      {/* ---- What they are saying --------------------------------------- */}
      <Panel className="mb-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <SectionHead
            title="What they say when someone asks about you"
            hint="The questions your customers actually ask, put to each assistant."
          />
          <div className="shrink-0 text-right">
            <p className="t-num text-[23px] leading-none text-accent">
              {wrong.length}
              <span className="text-text-tertiary">/{answers.length}</span>
            </p>
            <p className="mt-1.5 text-[11.5px] text-text-secondary">answered wrong or not at all</p>
          </div>
        </div>

        <div className="mt-6">
          <VerdictBar
            counts={ORDER.map((v) => ({
              verdict: v,
              label: VERDICT[v].label,
              count: answers.filter((a) => a.verdict === v).length,
            }))}
          />
        </div>
      </Panel>

      {/* ---- The answers themselves, worst first ------------------------ */}
      <Panel className="mb-4">
        <div className="p-6 pb-4">
          <SectionHead
            title="Ordered by what it costs you"
            hint="Nothing at all is worse than out of date; out of date is worse than half an answer."
          />
        </div>

        {answers.length === 0 ? (
          <EmptyState
            icon={<SparkIcon size={19} />}
            title="No checks yet"
            body="Concierge asks each assistant your customers' most common questions once a week. The first results land within a day of publishing."
          />
        ) : (
          <ul className="divide-y divide-divider border-t border-line">
            {answers.map((a) => {
              const v = VERDICT[a.verdict];
              const item = a.fixWithItemId ? KNOWLEDGE.find((k) => k.id === a.fixWithItemId) : undefined;
              return (
                <li key={a.id} className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2">
                    <div className="min-w-[280px] flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <Badge tone={v.tone}>{v.label}</Badge>
                        <span className="t-meta text-text-tertiary">
                          {ASSISTANT_LABEL[a.assistant]} · {relativeTime(a.checkedAt)}
                        </span>
                      </p>
                      <p className="mt-2.5 text-[12.5px] font-medium">{a.question}</p>
                      {/* Quoted, not summarised — the owner should read the
                          words their customer read. */}
                      <blockquote className="t-serif mt-2.5 border-l-2 border-line-strong pl-3.5 text-[13px] leading-[1.55] text-text-secondary">
                        {a.quote}
                      </blockquote>
                      <p className="t-meta mt-2.5 text-text-tertiary">{v.cost}</p>
                    </div>

                    <div className="shrink-0">
                      {a.verdict === "accurate" ? (
                        <span className="flex items-center gap-1.5 text-[11.5px] text-success">
                          <CheckIcon size={13} strokeWidth={2.4} />
                          From your Site Brain
                        </span>
                      ) : item ? (
                        <LinkButton
                          href={`/sites/${siteId}/agent/brain`}
                          size="sm"
                          variant="secondary"
                          leading={<BrainIcon size={13} />}
                        >
                          Update &ldquo;{item.title}&rdquo;
                        </LinkButton>
                      ) : (
                        <LinkButton
                          href={`/sites/${siteId}/agent/brain`}
                          size="sm"
                          leading={<PlusIcon size={13} />}
                        >
                          Add to {a.suggestedCategory ? CATEGORY_LABEL[a.suggestedCategory] : "Site Brain"}
                        </LinkButton>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* ---- What you publish ------------------------------------------- */}
      <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel className="p-6">
          <SectionHead
            title="What you publish outward"
            hint="Only approved items ever leave. Restricted material never does."
          />
          <ul className="mt-5 divide-y divide-divider border-t border-line">
            {SURFACES.map((srf) => {
              const copy = SURFACE_COPY[srf.kind];
              const live = srf.state === "live" || (srf.kind === "mcp" && mcpOn);
              return (
                <li key={srf.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="text-[12.5px] font-medium">{copy.title}</span>
                        {live ? (
                          <Badge tone="approved" dot>
                            Live
                          </Badge>
                        ) : srf.state === "blocked" ? (
                          <Badge tone="restricted">Blocked</Badge>
                        ) : (
                          <Badge tone="neutral">Ready</Badge>
                        )}
                      </p>
                      <p className="t-body-sm mt-1.5 text-text-tertiary">{copy.body}</p>
                      <p className="t-mono mt-2 truncate text-text-muted">{srf.url}</p>
                    </div>

                    {srf.kind === "mcp" && srf.state === "ready" && (
                      <Toggle
                        size="sm"
                        checked={mcpOn}
                        onChange={setMcpOn}
                        label="Publish the live endpoint"
                      />
                    )}
                  </div>

                  {srf.state === "blocked" && srf.blocker && (
                    <div className="mt-3 flex gap-2.5 border border-line bg-surface-subtle p-3">
                      <AlertIcon size={14} className="mt-px shrink-0 text-warning" />
                      <div className="min-w-0">
                        <p className="text-[11.5px] leading-[1.5] text-text-secondary">
                          {srf.blocker.reason}
                        </p>
                        <LinkButton
                          href={`/sites/${siteId}/integrations`}
                          size="sm"
                          variant="tertiary"
                          className="mt-1.5 -ml-2.5"
                        >
                          {srf.blocker.remedy}
                        </LinkButton>
                      </div>
                    </div>
                  )}

                  {live && srf.fetches30d > 0 && (
                    <p className="t-meta mt-2 text-text-tertiary">
                      Fetched {srf.fetches30d.toLocaleString()} times in 30 days · {srf.itemsExposed} items
                      {srf.lastPublishedAt && ` · updated ${relativeTime(srf.lastPublishedAt)}`}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* ---- The artefact itself, not a description of it -------------- */}
        <Panel className="flex min-w-0 flex-col p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionHead title="Exactly what they read" hint="Generated from your approved knowledge." />
            <SegmentedControl
              label="Which published file to preview"
              value={preview}
              onChange={setPreview}
              options={[
                { value: "llms", label: "llms.txt" },
                { value: "jsonld", label: "JSON-LD" },
                { value: "card", label: "Actions" },
              ]}
            />
          </div>

          {/* A published file, shown as the file. The long lines here are URLs,
              so they wrap rather than scroll sideways — a reader checking what
              their agent says should never have to drag a bar to finish a
              sentence. The fade says the file continues past the fold. */}
          <div className="relative mt-5 min-h-[320px] min-w-0 flex-1">
            <pre className="cg-scroll absolute inset-0 overflow-y-auto overflow-x-hidden border border-line-strong bg-surface-subtle p-4">
              <code className="t-mono block whitespace-pre-wrap break-all text-[10.5px] leading-[1.7] text-text-secondary">
                {text}
              </code>
            </pre>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-px bottom-px h-10 bg-gradient-to-t from-[var(--color-surface-subtle)] to-transparent"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              leading={copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
              onClick={() => {
                navigator.clipboard?.writeText(text);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
            <LinkButton
              href={`https://${site.url}/llms.txt`}
              external
              size="sm"
              variant="tertiary"
              trailing={<ExternalIcon size={13} />}
            >
              Open it live
            </LinkButton>
            <span className="ml-auto flex items-center gap-1.5 text-[10.5px] text-text-tertiary">
              <CodeIcon size={12} />
              Rewritten whenever you approve something
            </span>
          </div>
        </Panel>
      </div>

      {/* ---- The connection back to Insights ---------------------------- */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="max-w-[62ch]">
            <p className="t-eyebrow text-accent-ink">The same gap, twice</p>
            <h2 className="t-section mt-2.5">
              Every question your Site Brain cannot answer is a question no assistant can answer either
            </h2>
            <p className="t-body mt-2.5 text-text-secondary">
              Two of the questions above came back empty for the same reason visitors on your own site got a
              handoff: nothing in your approved knowledge covers them. Close the gap once and it closes in
              both places.
            </p>
          </div>
          <LinkButton
            href={`/sites/${siteId}/insights`}
            variant="secondary"
            leading={<GlobeIcon size={15} />}
            className="shrink-0"
          >
            See the gaps on your site
          </LinkButton>
        </div>
      </Card>
    </PageContainer>
  );
}

/** Worst first: an absent answer costs more than a hedged one. */
const ORDER: MentionVerdict[] = ["absent", "outdated", "incomplete", "accurate"];
