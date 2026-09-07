import { Badge, Card } from "@/components/ui";
import { BarList, RadialGauge, Sparkline } from "@/components/ui/charts";
import { ConciergeMark } from "@/components/shell/ConciergeMark";
import {
  ActionsIcon,
  AgentIcon,
  BrainIcon,
  CheckIcon,
  ConversationsIcon,
  InsightsIcon,
  LeadsIcon,
  MailIcon,
  PhoneIcon,
  RoutingIcon,
  ShieldIcon,
  SourceIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { INTENTS, METRICS } from "@/lib/demo-data";
import { INTENT_LABEL } from "@/lib/format";

/* ============================================================================
   PRODUCT FRAMES
   Reusable presentation pieces built from the same components and tokens the
   workspace uses. The marketing site therefore shows the actual product, not a
   drawing of it — and it can never drift out of date.
   ========================================================================== */

/** App-window chrome. Wraps any real product composition. */
export function ProductFrame({
  label,
  children,
  className,
  chrome = "app",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  chrome?: "app" | "plain";
}) {
  return (
    <div
      className={cx(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-lg",
        className,
      )}
      role="img"
      aria-label={label}
    >
      {chrome === "app" && (
        <div className="flex items-center gap-2 border-b border-line bg-surface-subtle px-3.5 py-2.5">
          <span className="flex gap-1.5" aria-hidden>
            {["#E8E8E3", "#E8E8E3", "#E8E8E3"].map((c, i) => (
              <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
            ))}
          </span>
          <span className="ml-2 flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-text-muted">
            <ConciergeMark size={11} />
            app.poweredbyconcierge.com
          </span>
        </div>
      )}
      <div className="bg-canvas">{children}</div>
    </div>
  );
}

/* ---- Site Brain ---------------------------------------------------------- */

export function SiteBrainFrame() {
  const rows = [
    { title: "Business summary", cat: "Business", status: "approved", conf: 94, src: "About page" },
    { title: "Human escalation rules", cat: "Rules", status: "approved", conf: 96, src: "Owner interview" },
    { title: "Treatment pricing", cat: "Pricing", status: "review", conf: 58, src: "Pricing page" },
    { title: "Things to never promise", cat: "Restrictions", status: "approved", conf: 97, src: "Owner interview" },
    { title: "Parking and access", cat: "FAQs", status: "missing", conf: 0, src: "No source yet" },
  ] as const;

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center gap-3.5">
          <RadialGauge value={86} label="Approved knowledge" tone="accent" size={46} />
          <div>
            <p className="text-[13px] font-semibold">Ready to answer</p>
            <p className="text-[11.5px] text-text-tertiary">38 of 42 items approved</p>
          </div>
        </div>
        <dl className="flex gap-6">
          {[
            ["Approved", "38", "text-success"],
            ["Review", "3", "text-warning"],
            ["Missing", "1", "text-text-muted"],
          ].map(([l, v, c]) => (
            <div key={l}>
              <dt className="t-eyebrow text-text-muted">{l}</dt>
              <dd className={cx("t-num mt-1 text-[16px]", c)}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li
            key={r.title}
            className={cx(
              "flex items-center gap-3 rounded-lg border bg-surface px-3.5 py-2.5",
              r.status === "review" ? "border-warning-line" : "border-line",
              r.status === "missing" && "border-dashed",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate text-[12.5px] font-medium">{r.title}</span>
                <Badge
                  tone={r.status === "approved" ? "approved" : r.status === "review" ? "review" : "neutral"}
                  dot={r.status !== "missing"}
                >
                  {r.status === "approved" ? "Approved" : r.status === "review" ? "Needs review" : "Missing"}
                </Badge>
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-[11px] text-text-tertiary">
                <SourceIcon size={10} />
                {r.src}
                {r.conf > 0 && <span>· {r.conf}% confidence</span>}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- Agent conversation -------------------------------------------------- */

export function AgentFrame() {
  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-[9px] font-semibold text-text-inverse">
            C+
          </span>
          <p className="text-[12px] font-medium">Northlane Concierge</p>
          <Badge tone="approved" dot pulse className="ml-auto">
            Live
          </Badge>
        </div>

        <div className="space-y-3.5 p-4">
          <Bubble side="agent">Hi — I can help with appointments, treatments and pricing. What brings you in?</Bubble>
          <Bubble side="visitor">Do you do payment plans for Invisalign?</Bubble>
          <div>
            <Bubble side="agent">
              We do. Invisalign starts at $3,900 and financing is available from $149 a month. The free consultation
              includes a 3D scan, so you would get an exact figure before committing.
            </Bubble>
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px] text-text-tertiary">
              <span className="inline-flex items-center gap-1 text-success">
                <ShieldIcon size={10} />
                Invisalign programme
              </span>
              <span className="inline-flex items-center gap-1 text-success">
                <ShieldIcon size={10} />
                Treatment pricing
              </span>
              <span>91% confidence</span>
            </p>
          </div>
          <Bubble side="visitor">That&rsquo;s helpful. How soon could I come in?</Bubble>
          <div>
            <Bubble side="agent">
              Consultations run Monday to Thursday. Would a morning or an afternoon suit you better?
            </Bubble>
            <p className="mt-1.5 flex items-center gap-1.5 text-[10.5px]">
              <Badge tone="accent" dot>
                Action
              </Badge>
              <span className="text-text-tertiary">Book an appointment</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, children }: { side: "visitor" | "agent"; children: React.ReactNode }) {
  return (
    <div
      className={cx(
        "w-fit max-w-[84%] rounded-xl px-3 py-2 text-[12px] leading-[1.55]",
        side === "agent"
          ? "rounded-tl-sm border border-line bg-surface-subtle"
          : "ml-auto rounded-tr-sm bg-ink text-text-inverse",
      )}
    >
      {children}
    </div>
  );
}

/* ---- Lead ---------------------------------------------------------------- */

export function LeadFrame() {
  return (
    <div className="p-5">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13.5px] font-semibold">Maya Robinson</p>
              <Badge tone="restricted">hot</Badge>
            </div>
            <p className="mt-0.5 text-[11.5px] text-text-tertiary">maya.robinson@gmail.com · Austin, TX</p>
          </div>
          <div className="text-right">
            <p className="t-num text-[24px] leading-none">92</p>
            <p className="mt-1 text-[10.5px] text-text-tertiary">lead score</p>
          </div>
        </div>

        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div className="h-full w-[92%] rounded-full bg-success" />
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
          {[
            ["Wants", "Invisalign consultation"],
            ["Budget", "$3,900–5,000"],
            ["Urgency", "This week"],
            ["Routed to", "Front desk · Email"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-line pb-1.5">
              <dt className="text-[11px] text-text-tertiary">{k}</dt>
              <dd className="truncate text-[11.5px] font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3.5 flex items-center gap-1.5 text-[11px] text-success">
          <CheckIcon size={11} strokeWidth={2.4} />
          Reached your team 4 seconds after she asked
        </p>
      </Card>
    </div>
  );
}

/* ---- Routing ------------------------------------------------------------- */

export function RoutingFrame() {
  const rules = [
    { name: "Emergencies", cond: ["Intent", "is", "Wants a person"], dest: "Emergency line", Icon: PhoneIcon },
    { name: "Cosmetic enquiries", cond: ["Service", "contains", "veneers"], dest: "Cosmetic team", Icon: ConversationsIcon },
    { name: "High-value leads", cond: ["Lead value", "is over", "$3,000"], dest: "Front desk", Icon: MailIcon },
  ];
  return (
    <div className="space-y-2.5 p-5">
      {rules.map((r, i) => (
        <Card key={r.name} className="p-3.5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line bg-surface-subtle text-[10px] font-semibold tabular-nums text-text-tertiary">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold">{r.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="t-eyebrow text-text-muted">If</span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-subtle px-2 py-1 text-[11px]">
                  <span className="text-text-tertiary">{r.cond[0]}</span>
                  <span className="text-text-muted">{r.cond[1]}</span>
                  <span className="font-medium">{r.cond[2]}</span>
                </span>
                <span className="text-text-muted" aria-hidden>
                  →
                </span>
                <span className="t-eyebrow text-text-muted">Then</span>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-medium">
                  <r.Icon size={11} className="text-text-tertiary" />
                  {r.dest}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---- Insights ------------------------------------------------------------ */

export function InsightsFrame() {
  const gaps = [
    ["Is teeth whitening covered under a dental plan?", 14],
    ["Do you treat children under 5?", 11],
    ["Where do I park?", 9],
  ] as const;

  return (
    <div className="p-5">
      <Card className="border-accent-line bg-accent-subtle p-4">
        <p className="t-eyebrow text-accent-ink">The gap worth closing</p>
        <p className="mt-2 text-[15px] font-semibold leading-[1.3]">
          47 visitors asked something your site could not answer
        </p>
      </Card>

      <ul className="mt-3 space-y-2">
        {gaps.map(([q, n]) => (
          <li key={q} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium">&ldquo;{q}&rdquo;</span>
              <span className="mt-0.5 block text-[11px] text-text-tertiary">Asked {n} times</span>
            </span>
            <span className="shrink-0 rounded-md bg-ink px-2 py-1 text-[10.5px] font-medium text-text-inverse">
              Answer it
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-xl border border-line bg-surface p-3.5">
        <p className="t-eyebrow mb-2 text-text-muted">What visitors came for</p>
        <BarList
          items={INTENTS.slice(0, 4).map((i) => ({
            label: INTENT_LABEL[i.intent],
            value: i.count,
            sub: `${i.conversionRate}% reached an action`,
          }))}
        />
      </div>
    </div>
  );
}

/* ---- Overview ------------------------------------------------------------ */

export function OverviewFrame() {
  const headline = METRICS.filter((m) => ["conversations", "leads", "actions", "conversion"].includes(m.key));

  return (
    <div className="flex">
      {/* A real slice of the sidebar, at product scale. */}
      <div className="hidden w-[150px] shrink-0 flex-col border-r border-line bg-surface py-3 sm:flex">
        {[
          { label: "Overview", Icon: InsightsIcon, active: true },
          { label: "Site Brain", Icon: BrainIcon, badge: "4" },
          { label: "Agent", Icon: AgentIcon },
          { label: "Conversations", Icon: ConversationsIcon, badge: "1" },
          { label: "Leads", Icon: LeadsIcon },
          { label: "Actions", Icon: ActionsIcon },
          { label: "Routing", Icon: RoutingIcon },
        ].map(({ label, Icon, active, badge }) => (
          <span
            key={label}
            className={cx(
              "relative mx-2 flex h-7 items-center gap-2 rounded-md px-2 text-[11.5px]",
              active ? "bg-surface-hover font-medium" : "text-text-secondary",
            )}
          >
            {active && <span className="absolute -left-2 top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-r bg-accent" />}
            <Icon size={13} />
            {label}
            {badge && (
              <span className="ml-auto rounded-full bg-accent-soft px-1.5 text-[9.5px] font-semibold text-accent-ink">
                {badge}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1 p-5">
        <p className="t-eyebrow text-text-muted">Overview</p>
        <h3 className="mt-1.5 text-[19px] font-semibold tracking-[-0.02em]">Northlane Dental</h3>

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
          {headline.map((m) => (
            <div key={m.key} className="bg-surface p-2.5">
              <p className="t-eyebrow text-[9.5px] text-text-muted">{m.label}</p>
              <p className="t-num mt-1.5 text-[16px] leading-none">
                {m.format === "percent" ? `${m.value}%` : m.value.toLocaleString()}
              </p>
              <div className="mt-1.5 flex items-end justify-between">
                <span className={cx("text-[10px] font-medium", m.delta > 0 ? "text-success" : "text-danger")}>
                  {m.delta > 0 ? "↑" : "↓"} {Math.abs(m.delta)}%
                </span>
                <Sparkline points={m.series} tone="ink" width={34} height={14} className="opacity-45" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1.5">
          {[
            ["Practice CRM is not delivering", "restricted"],
            ["3 knowledge items need review", "review"],
            ["5 questions your site could not answer", "accent"],
          ].map(([title, tone]) => (
            <div key={title} className="flex items-center gap-2.5 rounded-lg border border-line bg-surface px-3 py-2">
              <span
                className={cx(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  tone === "restricted" ? "bg-danger" : tone === "review" ? "bg-warning" : "bg-accent",
                )}
              />
              <span className="min-w-0 flex-1 truncate text-[11.5px]">{title}</span>
              <span className="shrink-0 text-[10.5px] text-text-muted" aria-hidden>
                →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
