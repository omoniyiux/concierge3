"use client";

import { use, useRef, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { AreaChart, BarList, Sparkline } from "@/components/ui/charts";
import { StickerStats } from "@/components/ui/StickerStats";
import { InsightsReport, RANGE_LABEL } from "@/components/insights/InsightsReport";
import {
  ChatSticker,
  ContactSticker,
  HandoffSticker,
  LeadSticker,
  SalesSticker,
  TargetSticker,
} from "@/components/stickers";
import {
  Button,
  Card,
  EmptyState,
  Field,
  LinkButton,
  Panel,
  SectionHead,
  SegmentedControl,
  Select,
  Textarea,
} from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { TryItSheet } from "@/components/agent/TryItSheet";
import { ArrowRight, BrainIcon, CheckIcon, PlusIcon, SparkIcon, UploadIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import {
  INTENTS,
  brainFor,
  conversationsFor,
  destinationsFor,
  gapsFor,
  getSite,
  metricsFor,
} from "@/lib/demo-data";
import { launchChecklist } from "@/lib/health";
import { NothingYet } from "@/components/shell/NothingYet";
import { CATEGORY_LABEL, INTENT_LABEL, formatMetric, relativeTime } from "@/lib/format";
import { printElement } from "@/lib/print";
import { downloadFile, toCsv } from "@/lib/download";
import type { Metric, UnansweredQuestion } from "@/lib/types";

/** One drawing per metric, so the row reads as six facts rather than six boxes. */
const METRIC_STICKER: Record<string, typeof TargetSticker> = {
  visitors: ContactSticker,
  conversations: ChatSticker,
  leads: LeadSticker,
  actions: SalesSticker,
  handoffs: HandoffSticker,
  conversion: TargetSticker,
};

/** What an owner would actually quote off a volume chart. */
function volumeFigures(series: { date: string; value: number }[]) {
  const values = series.map((p) => p.value);
  const total = values.reduce((n, v) => n + v, 0);
  const peak = series.reduce((best, p) => (p.value > best.value ? p : best), series[0]);
  return [
    {
      label: "Busiest day",
      value: String(peak.value),
      detail: new Date(peak.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    },
    { label: "Daily average", value: String(Math.round(total / values.length)), detail: "across the period" },
    { label: "Total", value: total.toLocaleString(), detail: "conversations handled" },
  ];
}

type Range = "7d" | "14d" | "30d";

/**
 * Insights opens on the scoreboard — six figures against the period before,
 * because that is the question an owner arrives with. The gap worth closing
 * comes straight after: it is the part that asks something of you, and it
 * lands harder once you have seen what the fortnight actually did.
 */
export default function InsightsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const site = getSite(siteId);
  const METRICS = metricsFor(siteId);
  const UNANSWERED = gapsFor(siteId);
  const [range, setRange] = useState<Range>("14d");
  const [answered, setAnswered] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [answering, setAnswering] = useState<UnansweredQuestion | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  /** The answer just written, so the preview can be asked to prove it works. */
  const [justAnswered, setJustAnswered] = useState<{ question: string; body: string } | null>(null);

  const hasHistory = conversationsFor(siteId).length > 0;
  const handled = [...answered, ...dismissed];
  const open = UNANSWERED.filter((u) => u.status === "open" && !handled.includes(u.id));
  const conversations = METRICS.find((m) => m.key === "conversations")!;
  const missedDemand = open.reduce((n, u) => n + u.askCount, 0);

  if (!hasHistory) {
    const setupComplete = launchChecklist(site, brainFor(siteId), destinationsFor(siteId), siteId).every(
      (s) => s.done,
    );
    return (
      <PageContainer wide>
        <PageHeader
          eyebrow="Insights"
          title="What your visitors are telling you"
          description="Every conversation is a signal about what people want and where your website falls short."
        />
        <NothingYet
          siteId={siteId}
          setupComplete={setupComplete}
          noun="insights"
          body="Once visitors start talking to Concierge, this shows what they came for, what converted, and — the part worth acting on — every question your site could not answer."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Insights"
        title="What your visitors are telling you"
        description="Every conversation is a signal about what people want and where your website falls short. This is the part you can act on."
        actions={
          <>
            <SegmentedControl
              label="Date range"
              value={range}
              onChange={setRange}
              options={[
                { value: "7d", label: "7 days" },
                { value: "14d", label: "14 days" },
                { value: "30d", label: "30 days" },
              ]}
            />
            <Button
              variant="secondary"
              leading={<UploadIcon size={15} />}
              onClick={() => setExportOpen(true)}
            >
              Export
            </Button>
          </>
        }
      />

      {/* How it performed ------------------------------------------------ */}
      <section className="mb-10">
        <SectionHead
          title="How Concierge performed"
          hint={`${RANGE_LABEL[range]}, measured against the previous period of the same length.`}
          className="mb-3.5"
        />
        <StickerStats
          columns={3}
          items={METRICS.map((m) => ({
            Sticker: METRIC_STICKER[m.key] ?? TargetSticker,
            value: formatMetric(m.value, m.format),
            label: m.label,
            detail:
              m.delta > 0
                ? `Up ${m.delta}% on the period before`
                : `Down ${Math.abs(m.delta)}% on the period before`,
            trend: (
              <div className="mt-3 flex items-end justify-between gap-3">
                <span
                  className={cx(
                    "text-[12px] font-medium tabular-nums",
                    m.delta > 0 ? "text-success" : "text-danger",
                  )}
                >
                  {m.delta > 0 ? "↑" : "↓"} {Math.abs(m.delta)}%
                </span>
                <Sparkline points={m.series} width={72} height={26} />
              </div>
            ),
          }))}
        />
      </section>

      {/* Then the thing that asks something of you ------------------------ */}
      <section className="mb-10">
        <Card className="border-accent-line bg-accent-subtle p-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-[52ch]">
              <p className="t-eyebrow text-accent-ink">The gap worth closing</p>
              <h2 className="t-section mt-2.5">
                {missedDemand} visitors asked something your site could not answer
              </h2>
              <p className="t-body mt-2.5 text-text-secondary">
                Each one ended in a handoff or a dead end. These are not complaints — they are the questions
                your customers actually have, ranked by how often they came up.
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="t-num text-[23px] leading-none text-accent-ink">{open.length}</p>
              <p className="mt-1.5 text-[12px] text-text-secondary">distinct questions</p>
            </div>
          </div>
        </Card>

        <div className="mt-4">
          {open.length === 0 ? (
            <Panel>
              <EmptyState
                icon={<CheckIcon size={19} />}
                title="Nothing left unanswered"
                body="Every question a visitor asked this period is now covered or set aside. When a new one comes up, it shows here first."
              />
            </Panel>
          ) : (
            <Panel className="divide-y divide-divider">
              {open.map((q) => (
                <div
                  key={q.id}
                  className="flex flex-wrap items-center gap-x-5 gap-y-3.5 px-5 py-4 sm:px-6 sm:py-5"
                >
                  <div className="min-w-[220px] flex-1">
                    <p className="text-[12.5px] font-medium">&ldquo;{q.question}&rdquo;</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-text-tertiary">
                      <span className="tabular-nums">Asked {q.askCount} times</span>
                      <span aria-hidden>·</span>
                      <span>Last {relativeTime(q.lastAskedAt)}</span>
                      <span aria-hidden>·</span>
                      <span>Belongs in {CATEGORY_LABEL[q.suggestedCategory]}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="sm" leading={<PlusIcon size={13} />} onClick={() => setAnswering(q)}>
                      Answer it
                    </Button>
                    <Button size="sm" variant="tertiary" onClick={() => setDismissed((d) => [...d, q.id])}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </Panel>
          )}

          {handled.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {answered.length > 0 && (
                <p className="flex items-center gap-2 text-[12px] text-success">
                  <CheckIcon size={13} strokeWidth={2.4} />
                  {answered.length} answered and queued for Site Brain.
                  <LinkButton href={`/sites/${siteId}/agent/brain`} variant="tertiary" size="sm">
                    Review them
                  </LinkButton>
                </p>
              )}
              {dismissed.length > 0 && (
                <p className="flex items-center gap-2 text-[12px] text-text-tertiary">
                  {dismissed.length} dismissed.
                  <Button size="sm" variant="tertiary" onClick={() => setDismissed([])}>
                    Undo
                  </Button>
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Panel className="flex flex-col p-5 sm:p-6">
          <SectionHead
            title="Conversation volume"
            hint="Daily conversations across the selected period."
            className="mb-5"
          />
          <AreaChart points={conversations.series} label="Conversations per day" />

          {/* The chart shows shape; these are the figures you would quote. */}
          <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-divider pt-4">
            {volumeFigures(conversations.series).map((f) => (
              <div key={f.label}>
                <dt className="t-eyebrow text-text-muted">{f.label}</dt>
                <dd className="t-num mt-2 text-[17px] leading-none">{f.value}</dd>
                <dd className="mt-1.5 text-[11.5px] text-text-tertiary">{f.detail}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <SectionHead
            title="What visitors came for"
            hint="Ranked by volume. Conversion is the share that reached an action."
            className="mb-4"
          />
          <BarList
            items={INTENTS.map((i) => ({
              label: INTENT_LABEL[i.intent],
              value: i.count,
              sub: `${i.conversionRate}% reached an action`,
            }))}
          />
          <p className="mt-4 border-t border-divider pt-3.5 text-[11.5px] leading-[1.5] text-text-tertiary">
            Booking is your highest-volume intent and converts at 41%. Pricing is second by volume but
            converts at 22% — worth a look at what Concierge is able to say about price.
          </p>
        </Panel>
      </div>

      {/* Agent behaviour -------------------------------------------------- */}
      <section className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5 sm:p-6">
            <p className="t-eyebrow text-text-muted">Answered without a person</p>
            <p className="t-num mt-2.5 text-[18px] leading-none">83%</p>
            <p className="t-body-sm mt-2 text-text-tertiary">
              320 of 386 conversations resolved from approved knowledge alone.
            </p>
          </Card>
          <Card className="p-5 sm:p-6">
            <p className="t-eyebrow text-text-muted">Average time to a person</p>
            <p className="t-num mt-2.5 text-[18px] leading-none">
              4<span className="text-[14.5px] font-normal text-text-tertiary">s</span>
            </p>
            <p className="t-body-sm mt-2 text-text-tertiary">
              From a visitor asking for a human to your team being told.
            </p>
          </Card>
          <Card className="p-5 sm:p-6">
            <p className="t-eyebrow text-text-muted">Refused safely</p>
            <p className="t-num mt-2.5 text-[18px] leading-none">28</p>
            <p className="t-body-sm mt-2 text-text-tertiary">
              Times Concierge declined to guess and offered a handoff instead.
            </p>
          </Card>
        </div>
      </section>

      <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
        <BrainIcon size={18} className="shrink-0 text-text-tertiary" />
        <p className="min-w-0 flex-1 text-[12.5px] text-text-secondary">
          <span className="font-medium text-text-primary">Insights feed back into Site Brain.</span> Answer a
          gap here and Concierge starts using it immediately — no re-crawl, no reinstall.
        </p>
        <LinkButton
          href={`/sites/${siteId}/agent/brain`}
          variant="secondary"
          size="sm"
          trailing={<ArrowRight size={13} />}
        >
          Open Site Brain
        </LinkButton>
      </Card>

      {/* ---- Flows -------------------------------------------------------- */}
      <AnswerModal
        question={answering}
        onClose={() => setAnswering(null)}
        onSave={(id, body) => {
          setAnswered((a) => [...a, id]);
          const asked = UNANSWERED.find((q) => q.id === id);
          setAnswering(null);
          if (asked) setJustAnswered({ question: asked.question, body });
        }}
      />

      {/* The loop closed: ask the agent the question you just answered. */}
      <TryItSheet
        open={Boolean(justAnswered)}
        onClose={() => setJustAnswered(null)}
        title="Your answer, live"
        description="The same question a visitor asked, run against your knowledge as it now stands. Nothing here reaches anyone."
        seedQuestion={justAnswered?.question}
        extraAnswers={
          justAnswered
            ? {
                [justAnswered.question.trim().toLowerCase()]: {
                  a: justAnswered.body,
                  verdict: { kind: "answer", note: "Answered from the knowledge you just approved" },
                  cites: ["Just added"],
                  confidence: 0.93,
                },
              }
            : undefined
        }
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        siteName={site.name}
        range={range}
        openQuestions={open}
        site={site}
        metrics={METRICS}
      />
    </PageContainer>
  );
}

/* ---- Answering a gap ------------------------------------------------------ */

/**
 * Answering is where an insight turns into knowledge, so the flow asks for
 * the answer itself rather than just acknowledging the question. What is
 * typed here is what a visitor will be told.
 */
function AnswerModal({
  question,
  onClose,
  onSave,
}: {
  question: UnansweredQuestion | null;
  onClose: () => void;
  onSave: (id: string, body: string) => void;
}) {
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  // Each question opens its own blank sheet rather than the last one's text.
  const key = question?.id ?? "";
  const [seen, setSeen] = useState("");
  if (question && seen !== key) {
    setSeen(key);
    setBody("");
    setCategory(question.suggestedCategory);
    setSaving(false);
  }

  if (!question) return null;

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow="Site Brain"
      title="Answer this question"
      description="Concierge will use this the moment you save it. Write it the way you would say it to someone standing at the desk."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            disabled={body.trim().length < 3}
            leading={<CheckIcon size={13} />}
            onClick={() => {
              setSaving(true);
              // Stands in for the write; the queue it lands in is real.
              setTimeout(() => onSave(question.id, body.trim()), 450);
            }}
          >
            Save to Site Brain
          </Button>
        </>
      }
    >
      <ModalSection>
        <div className="border border-line-strong bg-surface-subtle p-4">
          <p className="text-[12.5px] font-medium">&ldquo;{question.question}&rdquo;</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 text-[12px] text-text-tertiary">
            <span className="tabular-nums">Asked {question.askCount} times</span>
            <span aria-hidden>·</span>
            <span>Last {relativeTime(question.lastAskedAt)}</span>
          </p>
        </div>
      </ModalSection>

      <ModalSection>
        <Field label="Your answer" htmlFor="answer-body" hint="Plain language. No greeting, no sign-off.">
          <Textarea
            id="answer-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Whitening is not covered by most dental plans, but we offer it from $X and can split it across two visits."
            className="min-h-[120px]"
          />
        </Field>
      </ModalSection>

      <ModalSection>
        <Field label="Where it belongs" htmlFor="answer-category">
          <Select id="answer-category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </ModalSection>

      <p className="mt-5 flex items-start gap-2.5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
        <SparkIcon size={14} className="mt-px shrink-0 text-accent-ink" />
        It lands in Site Brain as approved knowledge for this site only, and Concierge cites it whenever it
        uses it.
      </p>
    </Modal>
  );
}

/* ---- Export --------------------------------------------------------------- */

/**
 * Export is a real document, not a data dump: the PDF is the Insights page
 * re-laid out for A4, drawn by the same components and printed in the same
 * palette. The CSV is there for anyone who wants the numbers in a sheet.
 */
function ExportModal({
  open,
  onClose,
  site,
  range,
  openQuestions,
  siteName,
  metrics,
}: {
  open: boolean;
  onClose: () => void;
  site: ReturnType<typeof getSite>;
  range: Range;
  openQuestions: UnansweredQuestion[];
  siteName: string;
  metrics: Metric[];
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const [working, setWorking] = useState<"pdf" | "csv" | null>(null);

  const title = `Concierge insights — ${siteName} — ${RANGE_LABEL[range]}`;

  async function downloadPdf() {
    setWorking("pdf");
    try {
      // A frame for the off-screen document to finish drawing itself in.
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 60)));
      if (sheet.current) await printElement(sheet.current, { title });
    } finally {
      setWorking(null);
    }
  }

  function downloadCsv() {
    setWorking("csv");
    const rows: (string | number)[][] = [
      ["Concierge insights", siteName, RANGE_LABEL[range]],
      [],
      ["Metric", "Value", "Change on previous period"],
      ...metrics.map((m) => [
        m.label,
        formatMetric(m.value, m.format),
        `${m.delta > 0 ? "+" : ""}${m.delta}%`,
      ]),
      [],
      ["Intent", "Conversations", "Share", "Reached an action"],
      ...INTENTS.map((i) => [INTENT_LABEL[i.intent], i.count, `${i.share}%`, `${i.conversionRate}%`]),
      [],
      ["Unanswered question", "Times asked", "Last asked", "Belongs in"],
      ...openQuestions.map((q) => [
        q.question,
        q.askCount,
        relativeTime(q.lastAskedAt),
        CATEGORY_LABEL[q.suggestedCategory],
      ]),
    ];
    downloadFile(`${title}.csv`, toCsv(rows), "text/csv;charset=utf-8");
    setWorking(null);
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        eyebrow="Insights"
        title="Export this period"
        description="The report carries the figures, both charts and every unanswered question — laid out as a document you can send on."
        footer={
          <>
            <Button variant="secondary" loading={working === "csv"} onClick={downloadCsv}>
              Download CSV
            </Button>
            <Button loading={working === "pdf"} leading={<UploadIcon size={13} />} onClick={downloadPdf}>
              Download PDF
            </Button>
          </>
        }
      >
        <ModalSection title="What is in it">
          <ul className="space-y-2">
            {[
              `Six headline figures for ${RANGE_LABEL[range].toLowerCase()}, each against the period before`,
              "Conversation volume, with the busiest day, daily average and total",
              "What visitors came for, ranked by volume and conversion",
              `${openQuestions.length} unanswered questions, in the order worth working down`,
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[12.5px] leading-[1.5]">
                <CheckIcon size={13} className="mt-0.5 shrink-0 text-success" strokeWidth={2.4} />
                {line}
              </li>
            ))}
          </ul>
        </ModalSection>

        <p className="mt-5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
          The PDF opens in your browser&rsquo;s print dialog — choose{" "}
          <span className="font-medium text-text-primary">Save as PDF</span> as the destination. Colour and
          the drawings are kept exactly as they appear here.
        </p>
      </Modal>

      {/* The document itself, rendered off-screen so printing clones something
          the browser has already laid out and styled. */}
      {open && (
        <div
          ref={sheet}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 -z-10 w-[686px] opacity-0"
        >
          <InsightsReport
            site={site}
            range={range}
            metrics={metrics}
            intents={INTENTS}
            unanswered={openQuestions}
          />
        </div>
      )}
    </>
  );
}
