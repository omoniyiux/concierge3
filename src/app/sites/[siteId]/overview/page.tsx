import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { SiteStatusBadge } from "@/components/shell/SiteSwitcher";
import { AttentionList, type AttentionItem } from "@/components/overview/AttentionList";
import { AreaChart, BarList, RadialGauge, Sparkline } from "@/components/ui/charts";
import { Badge, Card, LinkButton, Panel, SectionHead } from "@/components/ui";
import { cx } from "@/lib/cx";
import { ArrowRight, ExternalIcon, EyeIcon, InstallIcon } from "@/components/icons";
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

export default async function OverviewPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const site = getSite(siteId);

  const failing = DESTINATIONS.filter((d) => d.status === "failing");
  const openGaps = UNANSWERED.filter((u) => u.status === "open");

  /* What needs the owner, in the order it should be dealt with. */
  const attention: AttentionItem[] = [
    ...(failing.length
      ? [
          {
            id: "routing",
            title: `${failing[0].name} is not delivering`,
            detail: `The endpoint returned an error on the last ${failing.length === 1 ? "attempt" : "attempts"}. Visitor requests are still captured, but your team is not being told.`,
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
            detail: `"${openGaps[0].question}" was asked ${openGaps[0].askCount} times this month.`,
            actionLabel: "See the gaps",
            href: `/sites/${siteId}/insights`,
            severity: "opportunity" as const,
          },
        ]
      : []),
  ];

  const headline = METRICS.filter((m) =>
    ["conversations", "leads", "actions", "conversion"].includes(m.key),
  );
  const conversations = METRICS.find((m) => m.key === "conversations")!;

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Overview"
        title={site.name}
        description="What Concierge has been doing on your website, and what needs you next."
        actions={
          <>
            <LinkButton
              href={`/sites/${siteId}/agent?tab=preview`}
              variant="secondary"
              leading={<EyeIcon size={15} />}
            >
              Test the Agent
            </LinkButton>
            {site.installState === "detected" ? (
              <LinkButton
                href={`https://${site.url}`}
                external
                variant="secondary"
                leading={<ExternalIcon size={14} />}
              >
                Open site
              </LinkButton>
            ) : (
              <LinkButton href={`/sites/${siteId}/settings/install`} leading={<InstallIcon size={15} />}>
                Install Concierge
              </LinkButton>
            )}
          </>
        }
        meta={<StatusStrip siteId={siteId} />}
      />

      {/* 1 — What needs my attention ------------------------------------ */}
      <section className="mb-9">
        <SectionHead
          title="Needs your attention"
          hint="Three things Concierge cannot resolve on its own."
          className="mb-3.5"
        />
        <AttentionList items={attention} />
      </section>

      {/* 2 — What is happening ------------------------------------------ */}
      <section className="mb-9">
        <SectionHead
          title="Last 14 days"
          hint="Measured from real visitor sessions on this site."
          action={
            <LinkButton
              href={`/sites/${siteId}/insights`}
              variant="tertiary"
              size="sm"
              trailing={<ArrowRight size={14} />}
            >
              All insights
            </LinkButton>
          }
          className="mb-3.5"
        />

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
          {headline.map((m) => {
            const up = m.delta > 0;
            return (
              <div key={m.key} className="bg-surface p-5">
                <p className="t-eyebrow text-text-muted">{m.label}</p>
                <div className="mt-2.5 flex items-end justify-between gap-3">
                  <div>
                    <p className="t-num text-[27px] leading-none">{formatMetric(m.value, m.format)}</p>
                    <p
                      className={cx(
                        "mt-2 text-[12px] font-medium tabular-nums",
                        up ? "text-success" : "text-danger",
                      )}
                    >
                      {up ? "↑" : "↓"} {Math.abs(m.delta)}%
                      <span className="ml-1 font-normal text-text-tertiary">vs. previous</span>
                    </p>
                  </div>
                  <Sparkline points={m.series} tone="ink" width={64} height={26} className="opacity-60" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 — What Concierge is doing, and what visitors want ------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <Panel className="p-6">
          <SectionHead
            title="Conversation volume"
            hint={`${conversations.value} conversations, up ${conversations.delta}% on the previous fortnight.`}
            className="mb-5"
          />
          <AreaChart points={conversations.series} label="Conversations per day over the last 14 days" />
        </Panel>

        <Panel className="p-6">
          <SectionHead
            title="What visitors ask for"
            hint="Ranked by volume, with the share that converts."
            className="mb-4"
          />
          <BarList
            items={INTENTS.slice(0, 6).map((i) => ({
              label: INTENT_LABEL[i.intent],
              value: i.count,
              sub: `${i.conversionRate}% convert`,
            }))}
          />
        </Panel>
      </div>

      {/* 4 — What happened ---------------------------------------------- */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        <Panel className="overflow-hidden">
          <SectionHead
            title="Recent activity"
            hint="Everything Concierge did on your site, newest first."
            className="p-6 pb-4"
          />
          <ul className="divide-y divide-line border-t border-line">
            {ACTIVITY.map((event) => (
              <li key={event.id}>
                <Link
                  href={event.href ?? "#"}
                  className="flex items-start gap-3.5 px-6 py-3.5 transition-colors hover:bg-surface-subtle"
                >
                  <span className="mt-0.5 shrink-0">
                    <Badge tone={event.kind === "routing" ? "restricted" : "neutral"}>
                      {KIND_LABEL[event.kind]}
                    </Badge>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{event.title}</span>
                    {event.detail && (
                      <span className="mt-0.5 block truncate text-[12.5px] text-text-tertiary">{event.detail}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-[12px] tabular-nums text-text-muted">{relativeTime(event.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <BrainHealthCard siteId={siteId} />
          <NextStepCard siteId={siteId} />
        </div>
      </div>
    </PageContainer>
  );
}

/* ---- The four facts that describe the system's state --------------------- */

function StatusStrip({ siteId }: { siteId: string }) {
  const site = getSite(siteId);
  const failing = DESTINATIONS.filter((d) => d.status === "failing").length;
  const live = DESTINATIONS.filter((d) => d.status === "connected").length;

  const cells: { label: string; value: React.ReactNode; hint: string }[] = [
    {
      label: "Status",
      value: <SiteStatusBadge site={site} />,
      hint: site.status === "live" ? "Answering visitors now" : "Not yet answering visitors",
    },
    {
      label: "Site Brain",
      value: <span className="text-[15px] font-medium">{BRAIN.ready ? "Ready" : "Learning"}</span>,
      hint: `${BRAIN.approvedCount} of ${BRAIN.itemCount} items approved`,
    },
    {
      label: "Install",
      value: (
        <span className="text-[15px] font-medium">
          {site.installState === "detected" ? "Detected" : "Not installed"}
        </span>
      ),
      hint: site.installState === "detected" ? "Script found on the live site" : "Add the script to go live",
    },
    {
      label: "Routing",
      value: (
        <span className={cx("text-[15px] font-medium", failing > 0 && "text-danger")}>
          {failing ? `${failing} failing` : `${live} connected`}
        </span>
      ),
      hint: failing ? "Your team is not being notified" : "Every destination is delivering",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-5 sm:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label}>
          <p className="t-eyebrow text-text-muted">{c.label}</p>
          <div className="mt-2 flex h-[22px] items-center">{c.value}</div>
          <p className="mt-1.5 text-[12px] text-text-tertiary">{c.hint}</p>
        </div>
      ))}
    </div>
  );
}

function BrainHealthCard({ siteId }: { siteId: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <RadialGauge value={BRAIN.coverage} label="Site Brain coverage" tone="accent" />
        <div className="min-w-0 flex-1">
          <h3 className="t-card">Site Brain coverage</h3>
          <p className="t-body-sm mt-1.5 text-text-tertiary">
            Concierge can answer confidently across {BRAIN.coverage}% of what visitors ask about.
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-line pt-4">
        {[
          { label: "Approved", value: BRAIN.approvedCount, tone: "text-success" },
          { label: "Needs review", value: BRAIN.needsReviewCount, tone: "text-warning" },
          { label: "Missing", value: BRAIN.missingCount, tone: "text-text-muted" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className="text-[12.5px] text-text-secondary">{row.label}</dt>
            <dd className={cx("text-[13px] font-semibold tabular-nums", row.tone)}>{row.value}</dd>
          </div>
        ))}
      </dl>

      <LinkButton href={`/sites/${siteId}/brain`} variant="secondary" size="sm" block className="mt-4">
        Open Site Brain
      </LinkButton>
    </Card>
  );
}

/** The single clearest thing the owner should do next. */
function NextStepCard({ siteId }: { siteId: string }) {
  const newConversations = CONVERSATIONS.filter((c) => c.status === "new").length;
  return (
    <Card className="border-accent-line bg-accent-subtle p-5">
      <p className="t-eyebrow text-accent-ink">Suggested next step</p>
      <h3 className="t-card mt-2.5">Answer the questions your site keeps missing</h3>
      <p className="t-body-sm mt-2 text-text-secondary">
        Five questions came up repeatedly this month that Concierge could not answer. Adding them to Site
        Brain is the fastest way to lift your conversion rate.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <LinkButton href={`/sites/${siteId}/insights`} size="sm">
          Review the gaps
        </LinkButton>
        {newConversations > 0 && (
          <LinkButton href={`/sites/${siteId}/conversations`} variant="tertiary" size="sm">
            {newConversations} new conversation
          </LinkButton>
        )}
      </div>
    </Card>
  );
}
