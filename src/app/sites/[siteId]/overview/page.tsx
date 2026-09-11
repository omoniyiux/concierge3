import Link from "next/link";
import { PageContainer } from "@/components/shell/AppShell";
import { AttentionList, type AttentionItem } from "@/components/overview/AttentionList";
import { HealthCard } from "@/components/overview/HealthCard";
import { LaunchPanel, WaitingPanel } from "@/components/overview/LaunchPanel";
import { InstallButton } from "@/components/overview/InstallButton";
import { StatusStrip } from "@/components/overview/StatusStrip";
import { AreaChart, BarList, RadialGauge, Sparkline } from "@/components/ui/charts";
import { Card, LinkButton } from "@/components/ui";
import { ArrowRight, EyeIcon, ShieldIcon } from "@/components/icons";
import {
  ACTIVITY,
  FOLLOW_UPS,
  INTENTS,
  LEDGER,
  METRICS,
  brainFor,
  conversationsFor,
  destinationsFor,
  gapsFor,
  getSite,
} from "@/lib/demo-data";
import { launchChecklist, launchPhase, launchProgress, siteHealth } from "@/lib/health";
import { INTENT_LABEL, formatMetric, money, relativeTime } from "@/lib/format";

export const metadata = { title: "Overview" };

/**
 * Every kind of event gets its own hue, and every pill is set to the width of
 * the longest label so the titles beside them line up into a column. The wash
 * is pale and the ink saturated: each pairing clears 7:1, so the label is
 * readable on its own and colour is only ever the second signal.
 */
const KIND_STYLE: Record<string, { label: string; wash: string; ink: string }> = {
  conversation: { label: "Conversation", wash: "#DCEBFF", ink: "#12518F" },
  lead: { label: "Lead", wash: "#E4DCFF", ink: "#4A2FBD" },
  action: { label: "Action", wash: "#FFE7C2", ink: "#8A5400" },
  routing: { label: "Routing", wash: "#FFDCD4", ink: "#B4291A" },
  knowledge: { label: "Site Brain", wash: "#D2F0E5", ink: "#0B6B41" },
  install: { label: "Install", wash: "#FFDCEC", ink: "#A32064" },
  system: { label: "System", wash: "#ECECEC", ink: "#4A4A4A" },
};

function greeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function OverviewPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = getSite(siteId);
  const now = new Date();

  const brain = brainFor(siteId);
  const destinations = destinationsFor(siteId);
  const siteConversations = conversationsFor(siteId);
  const failing = destinations.filter((d) => d.status === "failing");
  const openGaps = gapsFor(siteId).filter((u) => u.status === "open");
  const waiting = FOLLOW_UPS.filter((f) => f.siteId === siteId && f.state === "suggested");

  // Where this site is in its life: still being set up, live but untouched,
  // or running. The three need three different pages.
  const steps = launchChecklist(site, brain, destinations, siteId);
  const phase = launchPhase(steps, siteConversations.length);
  const progress = launchProgress(steps);
  const health = siteHealth({ site, brain, destinations, conversations: siteConversations, gaps: openGaps, siteId });

  const attention: AttentionItem[] = [
    ...(failing.length
      ? [
          {
            id: "routing",
            title: `${failing[0].name} is not delivering`,
            detail:
              "The endpoint returned an error on the last attempt. Visitor requests are still captured, but your team is not being told.",
            actionLabel: "Fix routing",
            href: `/sites/${siteId}/agent/routing`,
            severity: "urgent" as const,
          },
        ]
      : []),
    ...(waiting.length
      ? [
          {
            id: "follow-ups",
            title: `${waiting.length} follow-ups are written and waiting on you`,
            detail:
              "Visitors who left their details and never heard back. Concierge has drafted the replies; it will not send them until you say so.",
            actionLabel: "Read the drafts",
            href: `/sites/${siteId}/conversations?c=${waiting[0].conversationId}`,
            severity: "opportunity" as const,
          },
        ]
      : []),
    ...(brain.needsReviewCount
      ? [
          {
            id: "brain",
            title: `${brain.needsReviewCount} knowledge items need review`,
            detail: "Concierge will not answer from these until you approve them. Two relate to pricing.",
            actionLabel: "Review Site Brain",
            href: `/sites/${siteId}/agent/brain`,
            severity: "review" as const,
          },
        ]
      : []),
    ...(openGaps.length
      ? [
          {
            id: "gaps",
            title: `${openGaps.length} questions your site could not answer`,
            detail: `“${openGaps[0].question}” came up ${openGaps[0].askCount} times this month.`,
            actionLabel: "See the gaps",
            href: `/sites/${siteId}/insights`,
            severity: "opportunity" as const,
          },
        ]
      : []),
  ];

  const headline = METRICS.filter((m) => ["conversations", "leads", "actions", "conversion"].includes(m.key));
  const conversations = METRICS.find((m) => m.key === "conversations")!;

  // Read off the same series the chart draws, so the footer can never disagree
  // with the line above it.
  const volumePeak = conversations.series.reduce((a, b) => (b.value > a.value ? b : a));
  const volumeLow = conversations.series.reduce((a, b) => (b.value < a.value ? b : a));
  const volumeAverage = Math.round(
    conversations.series.reduce((n, p) => n + p.value, 0) / conversations.series.length,
  );
  const asDay = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const peakDay = asDay(volumePeak.date);
  const lowDay = asDay(volumeLow.date);

  return (
    <PageContainer wide>
      {/* Greeting ------------------------------------------------------- */}
      <header className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div>
          <h1 className="t-greeting">{greeting(now.getHours())}, Olaifa</h1>
          <p className="t-body mt-3 max-w-[54ch] text-text-primary">
            {phase === "setting-up"
              ? `Let us finish getting Concierge live on ${site.name}. It takes about ten minutes.`
              : phase === "waiting"
                ? `Concierge is live on ${site.name} and waiting for its first visitor.`
                : `Here is what Concierge has been doing on ${site.name}, and what needs you next.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton
            href={`/sites/${siteId}/agent`}
            variant="secondary"
            leading={<EyeIcon size={15} />}
          >
            Test the Agent
          </LinkButton>
          {/* A Pages site carries the Agent already, so there is nothing to
              install; offering it there would be an instruction to nowhere. */}
          {site.product === "pages" || site.installState === "detected" ? (
            <LinkButton
              href={`/sites/${siteId}/insights`}
              variant="accent"
                trailing={<ArrowRight size={15} />}
            >
              View insights
            </LinkButton>
          ) : (
            <InstallButton siteId={siteId} siteName={site.name} />
          )}
        </div>
      </header>

      {/* Setting up ------------------------------------------------------ */}
      {phase === "setting-up" && (
        <section className="mt-10">
          <LaunchPanel steps={steps} progress={progress} siteName={site.name} />
        </section>
      )}

      {/* Live, but nothing has happened yet -------------------------------- */}
      {phase === "waiting" && (
        <section className="mt-10">
          <WaitingPanel siteId={siteId} siteUrl={site.url} />
        </section>
      )}

      {/* Status ---------------------------------------------------------- */}
      {phase === "live" && (
        <>
          <section className="mt-10">
            <StatusStrip site={site} brain={brain} destinations={destinations} />
          </section>

          {/* Still working? ----------------------------------------------- */}
          <section className="mt-6">
            <HealthCard health={health} siteId={siteId} />
          </section>
        </>
      )}

      {phase === "live" && (
        <>
      {/* What it was worth ------------------------------------------------ */}
      <section className="mt-11">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="t-feature">What it was worth</h2>
            <p className="t-body mt-3 text-text-primary">
              Over the last 30 days, traced to the conversations that produced it.
            </p>
          </div>
          <LinkButton href={`/sites/${siteId}/ledger`} variant="tertiary" trailing={<ArrowRight size={16} />}>
            Open the ledger
          </LinkButton>
        </div>

        <Card className="mt-5">
          <div className="grid sm:grid-cols-3">
            <div className="p-6">
              <p className="t-eyebrow flex items-center gap-2 text-text-muted">
                <ShieldIcon size={14} className="text-success" />
                Money confirmed
              </p>
              <p className="t-num mt-3.5 text-[27px] leading-none">
                {money(LEDGER.confirmedValue, site.currency)}
              </p>
              <p className="t-body-sm mt-3 text-text-tertiary">Settled, not projected.</p>
            </div>
            <div className="border-t border-line-strong p-6 sm:border-l sm:border-t-0">
              <p className="t-eyebrow text-text-muted">Value estimated</p>
              <p className="t-num mt-3.5 text-[27px] leading-none">
                {money(LEDGER.estimatedValue, site.currency)}
              </p>
              <p className="t-body-sm mt-3 text-text-tertiary">
                Your figures, applied to what Concierge produced. Never added to the number beside it.
              </p>
            </div>
            <div className="border-t border-line-strong p-6 sm:border-l sm:border-t-0">
              <p className="t-eyebrow text-text-muted">Arrived after hours</p>
              <p className="t-num mt-3.5 text-[27px] leading-none text-accent">
                {LEDGER.afterHoursConversations}
                <span className="text-text-tertiary">/{LEDGER.conversations}</span>
              </p>
              <p className="t-body-sm mt-3 text-text-tertiary">
                Conversations that happened with nobody there to take them.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Needs your attention -------------------------------------------- */}
      <section className="mt-11">
        <h2 className="t-feature">Needs your attention</h2>
        <p className="t-body mt-3 text-text-primary">Three things Concierge cannot resolve on its own.</p>
        <div className="mt-5">
          <AttentionList items={attention} />
        </div>
      </section>

      {/* Last 14 days ----------------------------------------------------- */}
      <section className="mt-11">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="t-feature">Last 14 days</h2>
            <p className="t-body mt-3 text-text-primary">Measured from real visitor sessions on this site.</p>
          </div>
          <LinkButton
            href={`/sites/${siteId}/insights`}
            variant="tertiary"
            trailing={<ArrowRight size={16} />}
          >
            All insights
          </LinkButton>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {headline.map((m) => (
            <Card key={m.key} className="p-6">
              <p className="t-eyebrow text-text-muted">{m.label}</p>
              <p className="t-num mt-3 text-[19px] leading-none">{formatMetric(m.value, m.format)}</p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <span
                  className={`text-[11.5px] font-medium tabular-nums ${m.delta > 0 ? "text-success" : "text-danger"}`}
                >
                  {m.delta > 0 ? "↑" : "↓"} {Math.abs(m.delta)}%
                  <span className="ml-1.5 font-normal text-text-tertiary">vs. previous</span>
                </span>
                <Sparkline points={m.series} width={62} height={26} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Charts ----------------------------------------------------------- */}
      <section className="mt-11 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
        {/* The chart used to float in the middle of an over-tall card. It now
            sits between a headline that says what happened and a footer that
            says what the shape of the line means, so the card fills. */}
        <Card className="flex flex-col p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[12.5px] font-bold">Conversation volume</p>
              <h3 className="t-feature mt-3">{conversations.value} conversations</h3>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${
                conversations.delta > 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
              }`}
            >
              {conversations.delta > 0 ? "↑" : "↓"} {Math.abs(conversations.delta)}% vs. previous
            </span>
          </div>

          <div className="mt-6 flex flex-1 items-center">
            <AreaChart
              points={conversations.series}
              height={260}
              label="Conversations per day over the last 14 days"
            />
          </div>

          <dl className="mt-6 grid grid-cols-3 border-t border-divider pt-4">
            {[
              { label: "Busiest day", value: String(volumePeak.value), hint: peakDay },
              { label: "Daily average", value: String(volumeAverage), hint: "Across 14 days" },
              {
                label: "Quietest day",
                value: String(volumeLow.value),
                hint: lowDay,
              },
            ].map((f, i) => (
              <div key={f.label} className={i > 0 ? "border-l border-divider pl-4" : "pr-4"}>
                <dt className="t-eyebrow text-text-muted">{f.label}</dt>
                <dd className="t-num mt-2 text-[16px] leading-none">{f.value}</dd>
                <p className="mt-1.5 text-[11.5px] text-text-tertiary">{f.hint}</p>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="p-6">
          <p className="text-[12.5px] font-bold">What visitors ask for</p>
          <p className="t-body mt-3 text-text-primary">Ranked by volume, with the share that converts.</p>
          <div className="mt-6">
            <BarList
              items={INTENTS.slice(0, 6).map((i) => ({
                label: INTENT_LABEL[i.intent],
                value: i.count,
                sub: `${i.conversionRate}% convert`,
              }))}
            />
          </div>
        </Card>
      </section>

      {/* Activity + next step --------------------------------------------- */}
      <section className="mt-11 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          <div className="p-6 pb-4">
            <p className="text-[12.5px] font-bold">Recent activity</p>
            <p className="t-body mt-3 text-text-primary">Everything Concierge did, newest first.</p>
          </div>
          <ul className="divide-y divide-divider">
            {ACTIVITY.map((event) => {
              const kind = KIND_STYLE[event.kind] ?? KIND_STYLE.system;
              return (
                <li key={event.id}>
                  <Link
                    href={event.href ?? "#"}
                    className="grid grid-cols-[104px_1fr_auto] items-start gap-4 px-6 py-4 transition-colors duration-[var(--dur-micro)] hover:bg-surface-subtle"
                  >
                    <span
                      className="mt-px inline-flex h-[22px] items-center justify-center rounded-full px-2 text-[11px] font-semibold"
                      style={{ background: kind.wash, color: kind.ink }}
                    >
                      {kind.label}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[12.5px] font-semibold leading-[1.35]">{event.title}</span>
                      {event.detail && (
                        <span className="mt-1 block text-[11.5px] leading-[1.5] text-text-tertiary">
                          {event.detail}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 shrink-0 text-[11.5px] tabular-nums text-text-muted">
                      {relativeTime(event.at)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-6">
            <div className="flex items-start gap-5">
              <RadialGauge value={brain.coverage} label="Site Brain coverage" tone="accent" size={62} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-bold">Site Brain coverage</p>
                <p className="mt-2.5 text-[12.5px] leading-[1.5] text-text-tertiary">
                  Concierge answers confidently across {brain.coverage}% of what visitors ask.
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-3">
              {[
                { label: "Approved", value: brain.approvedCount, tone: "text-success" },
                { label: "Needs review", value: brain.needsReviewCount, tone: "text-warning" },
                { label: "Missing", value: brain.missingCount, tone: "text-text-muted" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <dt className="text-[12px] text-text-secondary">{row.label}</dt>
                  <dd className={`text-[12.5px] font-semibold tabular-nums ${row.tone}`}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <LinkButton
              href={`/sites/${siteId}/agent/brain`}
              variant="secondary"
              block
              className="mt-5"
            >
              Open Site Brain
            </LinkButton>
          </Card>

          {/* The one place Concierge orange leads. */}
          <Card className="bg-accent-subtle p-6">
            <p className="text-[13px] font-bold text-accent-ink">Suggested next step</p>
            <h3 className="t-feature mt-4">Answer the questions your site keeps missing</h3>
            <p className="t-body mt-4 text-text-secondary">
              Five questions came up repeatedly this month that Concierge could not answer. Closing them is
              the fastest way to lift your conversion rate.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <LinkButton href={`/sites/${siteId}/insights`}>
                Review the gaps
              </LinkButton>
              {siteConversations.filter((c) => c.status === "new").length > 0 && (
                <LinkButton href={`/sites/${siteId}/conversations`} variant="tertiary">
                  {siteConversations.filter((c) => c.status === "new").length} new conversation
                </LinkButton>
              )}
            </div>
          </Card>
        </div>
      </section>
        </>
      )}
    </PageContainer>
  );
}
