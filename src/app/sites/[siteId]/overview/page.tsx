import Link from "next/link";
import { PageContainer } from "@/components/shell/AppShell";
import { AttentionList, type AttentionItem } from "@/components/overview/AttentionList";
import { AreaChart, BarList, RadialGauge, Sparkline } from "@/components/ui/charts";
import { Badge, Card, LinkButton } from "@/components/ui";
import { ArrowRight, EyeIcon, InstallIcon } from "@/components/icons";
import {
  ACTIVITY,
  BRAIN,
  CONVERSATIONS,
  DESTINATIONS,
  INTENTS,
  METRICS,
  UNANSWERED,
  getSite,
} from "@/lib/demo-data";
import { INTENT_LABEL, formatMetric, relativeTime } from "@/lib/format";

export const metadata = { title: "Overview" };

const KIND_LABEL: Record<string, string> = {
  conversation: "Conversation",
  lead: "Lead",
  action: "Action",
  routing: "Routing",
  knowledge: "Site Brain",
  install: "Install",
  system: "System",
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

  const failing = DESTINATIONS.filter((d) => d.status === "failing");
  const openGaps = UNANSWERED.filter((u) => u.status === "open");

  const attention: AttentionItem[] = [
    ...(failing.length
      ? [
          {
            id: "routing",
            title: `${failing[0].name} is not delivering`,
            detail:
              "The endpoint returned an error on the last attempt. Visitor requests are still captured, but your team is not being told.",
            actionLabel: "Fix routing",
            href: `/sites/${siteId}/routing`,
            severity: "urgent" as const,
          },
        ]
      : []),
    ...(BRAIN.needsReviewCount
      ? [
          {
            id: "brain",
            title: `${BRAIN.needsReviewCount} knowledge items need review`,
            detail: "Concierge will not answer from these until you approve them. Two relate to pricing.",
            actionLabel: "Review Site Brain",
            href: `/sites/${siteId}/brain`,
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

  return (
    <PageContainer wide>
      {/* Greeting ------------------------------------------------------- */}
      <header className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
        <div>
          <h1 className="t-greeting">{greeting(now.getHours())}, Olaifa</h1>
          <p className="t-body mt-4 max-w-[54ch] text-text-tertiary">
            Here is what Concierge has been doing on {site.name}, and what needs you next.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton href={`/sites/${siteId}/agent`} variant="secondary" size="lg" leading={<EyeIcon size={17} />}>
            Test the Agent
          </LinkButton>
          {site.installState === "detected" ? (
            <LinkButton href={`/sites/${siteId}/insights`} size="lg" trailing={<ArrowRight size={17} />}>
              View insights
            </LinkButton>
          ) : (
            <LinkButton href={`/sites/${siteId}/settings`} size="lg" leading={<InstallIcon size={17} />}>
              Install Concierge
            </LinkButton>
          )}
        </div>
      </header>

      {/* Status ---------------------------------------------------------- */}
      <section className="mt-12">
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {[
            {
              label: "Status",
              value: site.status === "live" ? "Live" : "Not live",
              hint: site.status === "live" ? "Answering visitors now" : "Not yet answering",
              live: site.status === "live",
            },
            { label: "Site Brain", value: BRAIN.ready ? "Ready" : "Learning", hint: `${BRAIN.approvedCount} of ${BRAIN.itemCount} approved` },
            { label: "Install", value: site.installState === "detected" ? "Detected" : "Missing", hint: "Script found on the live site" },
            {
              label: "Routing",
              value: failing.length ? `${failing.length} failing` : "All delivering",
              hint: failing.length ? "Your team is not being notified" : "Every destination is healthy",
              alert: failing.length > 0,
            },
          ].map((c) => (
            <Card key={c.label} className="p-7">
              <p className="t-eyebrow text-text-muted">{c.label}</p>
              <p className={`mt-3.5 text-[20px] font-semibold tracking-[-0.02em] ${c.alert ? "text-danger" : ""}`}>
                {c.live && <span className="mr-2 inline-block h-2 w-2 -translate-y-0.5 rounded-full bg-success cg-live-dot" />}
                {c.value}
              </p>
              <p className="mt-2.5 text-[14px] text-text-tertiary">{c.hint}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Needs your attention -------------------------------------------- */}
      <section className="mt-14">
        <h2 className="t-feature">Needs your attention</h2>
        <p className="t-body mt-3 text-text-tertiary">Three things Concierge cannot resolve on its own.</p>
        <div className="mt-7">
          <AttentionList items={attention} />
        </div>
      </section>

      {/* Last 14 days ----------------------------------------------------- */}
      <section className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="t-feature">Last 14 days</h2>
            <p className="t-body mt-3 text-text-tertiary">Measured from real visitor sessions on this site.</p>
          </div>
          <LinkButton href={`/sites/${siteId}/insights`} variant="tertiary" trailing={<ArrowRight size={16} />}>
            All insights
          </LinkButton>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {headline.map((m) => (
            <Card key={m.key} className="p-7">
              <p className="t-eyebrow text-text-muted">{m.label}</p>
              <p className="t-num mt-4 text-[34px] leading-none">{formatMetric(m.value, m.format)}</p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <span className={`text-[14px] font-medium tabular-nums ${m.delta > 0 ? "text-success" : "text-danger"}`}>
                  {m.delta > 0 ? "↑" : "↓"} {Math.abs(m.delta)}%
                  <span className="ml-1.5 font-normal text-text-tertiary">vs. previous</span>
                </span>
                <Sparkline points={m.series} tone="ink" width={58} height={24} className="opacity-40" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Charts ----------------------------------------------------------- */}
      <section className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <Card className="p-7">
          <p className="text-[15px] font-bold">Conversation volume</p>
          <h3 className="t-feature mt-4 max-w-[18ch]">
            {conversations.value} conversations, up {conversations.delta}%
          </h3>
          <div className="mt-10">
            <AreaChart points={conversations.series} label="Conversations per day over the last 14 days" />
          </div>
        </Card>

        <Card className="p-7">
          <p className="text-[15px] font-bold">What visitors ask for</p>
          <p className="t-body mt-3 text-text-tertiary">Ranked by volume, with the share that converts.</p>
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
      <section className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          <div className="p-7 pb-5">
            <p className="text-[15px] font-bold">Recent activity</p>
            <p className="t-body mt-3 text-text-tertiary">Everything Concierge did, newest first.</p>
          </div>
          <ul className="divide-y divide-divider">
            {ACTIVITY.map((event) => (
              <li key={event.id}>
                <Link
                  href={event.href ?? "#"}
                  className="flex items-start gap-4 px-7 py-5 transition-colors duration-[var(--dur-micro)] hover:bg-surface-subtle"
                >
                  <Badge tone={event.kind === "routing" ? "restricted" : "neutral"} className="mt-0.5 shrink-0">
                    {KIND_LABEL[event.kind]}
                  </Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium">{event.title}</span>
                    {event.detail && (
                      <span className="mt-1.5 block text-[14px] leading-[1.5] text-text-tertiary">{event.detail}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[13.5px] tabular-nums text-text-muted">{relativeTime(event.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-7">
            <div className="flex items-start gap-5">
              <RadialGauge value={BRAIN.coverage} label="Site Brain coverage" tone="accent" size={62} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold">Site Brain coverage</p>
                <p className="mt-2.5 text-[14px] leading-[1.5] text-text-tertiary">
                  Concierge answers confidently across {BRAIN.coverage}% of what visitors ask.
                </p>
              </div>
            </div>
            <dl className="mt-7 space-y-4">
              {[
                { label: "Approved", value: BRAIN.approvedCount, tone: "text-success" },
                { label: "Needs review", value: BRAIN.needsReviewCount, tone: "text-warning" },
                { label: "Missing", value: BRAIN.missingCount, tone: "text-text-muted" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <dt className="text-[14px] text-text-secondary">{row.label}</dt>
                  <dd className={`text-[15px] font-semibold tabular-nums ${row.tone}`}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <LinkButton href={`/sites/${siteId}/brain`} variant="secondary" size="lg" block className="mt-7">
              Open Site Brain
            </LinkButton>
          </Card>

          {/* The one place Concierge orange leads. */}
          <Card className="bg-accent-subtle p-7">
            <p className="text-[15px] font-bold text-accent-ink">Suggested next step</p>
            <h3 className="t-feature mt-4">Answer the questions your site keeps missing</h3>
            <p className="t-body mt-4 text-text-secondary">
              Five questions came up repeatedly this month that Concierge could not answer. Closing them is the
              fastest way to lift your conversion rate.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <LinkButton href={`/sites/${siteId}/insights`} size="lg">
                Review the gaps
              </LinkButton>
              {CONVERSATIONS.filter((c) => c.status === "new").length > 0 && (
                <LinkButton href={`/sites/${siteId}/conversations`} variant="tertiary" size="lg">
                  {CONVERSATIONS.filter((c) => c.status === "new").length} new conversation
                </LinkButton>
              )}
            </div>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
