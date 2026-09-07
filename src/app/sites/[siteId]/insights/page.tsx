"use client";

import { use, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { AreaChart, BarList, Sparkline } from "@/components/ui/charts";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LinkButton,
  Panel,
  SectionHead,
  SegmentedControl,
} from "@/components/ui";
import {
  ArrowRight,
  BrainIcon,
  CheckIcon,
  InsightsIcon,
  PlusIcon,
  SparkIcon,
  UploadIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { INTENTS, METRICS, UNANSWERED } from "@/lib/demo-data";
import { CATEGORY_LABEL, INTENT_LABEL, formatMetric, relativeTime } from "@/lib/format";

type Range = "7d" | "14d" | "30d";

/**
 * Insights leads with the thing only Concierge can tell you: the questions
 * your website could not answer. Volume charts come second — they describe,
 * they do not prompt an action.
 */
export default function InsightsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [range, setRange] = useState<Range>("14d");
  const [resolved, setResolved] = useState<string[]>([]);

  const open = UNANSWERED.filter((u) => u.status === "open" && !resolved.includes(u.id));
  const conversations = METRICS.find((m) => m.key === "conversations")!;
  const missedDemand = open.reduce((n, u) => n + u.askCount, 0);

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
            <Button variant="secondary" leading={<UploadIcon size={15} />}>
              Export
            </Button>
          </>
        }
      />

      {/* The headline insight ------------------------------------------- */}
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
                title="Nothing went unanswered"
                body="Every question a visitor asked this fortnight was covered by your approved knowledge. When that changes, the gaps will show up here first."
              />
            </Panel>
          ) : (
            <ul className="divide-y divide-divider overflow-hidden bg-surface">
              {open.map((q) => (
                <li key={q.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4">
                  <div className="min-w-[240px] flex-1">
                    <p className="text-[12.5px] font-medium">&ldquo;{q.question}&rdquo;</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2.5 text-[12.5px] text-text-tertiary">
                      <span className="tabular-nums">Asked {q.askCount} times</span>
                      <span aria-hidden>·</span>
                      <span>Last {relativeTime(q.lastAskedAt)}</span>
                      <span aria-hidden>·</span>
                      <span>Belongs in {CATEGORY_LABEL[q.suggestedCategory]}</span>
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      leading={<PlusIcon size={13} />}
                      onClick={() => setResolved((r) => [...r, q.id])}
                    >
                      Answer it
                    </Button>
                    <Button size="sm" variant="tertiary" onClick={() => setResolved((r) => [...r, q.id])}>
                      Dismiss
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {resolved.length > 0 && (
            <p className="mt-3 flex items-center gap-2 text-[12px] text-success">
              <CheckIcon size={13} strokeWidth={2.4} />
              {resolved.length} added to your Site Brain queue.{""}
              <LinkButton href={`/sites/${siteId}/agent/brain`} variant="tertiary" size="sm">
                Review them
              </LinkButton>
            </p>
          )}
        </div>
      </section>

      {/* Performance ----------------------------------------------------- */}
      <section className="mb-10">
        <SectionHead
          title="How Concierge performed"
          hint="Measured against the previous period of the same length."
          className="mb-3.5"
        />
        <div className="grid grid-cols-2 gap-3 overflow-hidden bg-transparent lg:grid-cols-3 xl:grid-cols-6">
          {METRICS.map((m) => {
            const up = m.delta > 0;
            return (
              <div key={m.key} className="bg-surface p-4">
                <p className="t-eyebrow text-text-muted">{m.label}</p>
                <p className="t-num mt-2 text-[15px] leading-none">{formatMetric(m.value, m.format)}</p>
                <div className="mt-2.5 flex items-end justify-between gap-2">
                  <span
                    className={cx(
                      "text-[13px] font-medium tabular-nums",
                      up ? "text-success" : "text-danger",
                    )}
                  >
                    {up ? "↑" : "↓"} {Math.abs(m.delta)}%
                  </span>
                  <Sparkline points={m.series} tone="ink" width={54} height={20} className="opacity-50" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
        <Panel className="p-6">
          <SectionHead
            title="Conversation volume"
            hint="Daily conversations across the selected period."
            className="mb-5"
          />
          <AreaChart points={conversations.series} label="Conversations per day" />
        </Panel>

        <Panel className="p-6">
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
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="p-6">
            <p className="t-eyebrow text-text-muted">Answered without a person</p>
            <p className="t-num mt-2.5 text-[18px] leading-none">83%</p>
            <p className="t-body-sm mt-2 text-text-tertiary">
              320 of 386 conversations resolved from approved knowledge alone.
            </p>
          </Card>
          <Card className="p-6">
            <p className="t-eyebrow text-text-muted">Average time to a person</p>
            <p className="t-num mt-2.5 text-[18px] leading-none">
              4<span className="text-[14.5px] font-normal text-text-tertiary">s</span>
            </p>
            <p className="t-body-sm mt-2 text-text-tertiary">
              From a visitor asking for a human to your team being told.
            </p>
          </Card>
          <Card className="p-6">
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
    </PageContainer>
  );
}

export { InsightsIcon, SparkIcon, Badge };
