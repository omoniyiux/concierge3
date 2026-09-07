"use client";

import { Suspense, use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { IntegrationsSettings } from "@/components/integrations/IntegrationsSettings";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  LinkButton,
  Panel,
  SectionHead,
  Select,
  Toggle,
} from "@/components/ui";
import {
  AgentIcon,
  BillingIcon,
  BrainIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  GlobeIcon,
  InstallIcon,
  IntegrationsIcon,
  LockIcon,
  MailIcon,
  SettingsIcon,
  ShieldIcon,
  TeamIcon,
  TrashIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { ORG, TEAM, getSite } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";

const SECTIONS = [
  { key: "general", label: "General", Icon: SettingsIcon },
  { key: "appearance", label: "Appearance", Icon: AgentIcon },
  { key: "install", label: "Install", Icon: InstallIcon },
  { key: "integrations", label: "Integrations", Icon: IntegrationsIcon },
  { key: "team", label: "Team", Icon: TeamIcon },
  { key: "notifications", label: "Notifications", Icon: MailIcon },
  { key: "security", label: "Security & data", Icon: ShieldIcon },
  { key: "billing", label: "Plan & billing", Icon: BillingIcon },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

const ACCENTS = [
  { name: "Concierge", hex: "#FF7A00" },
  { name: "Ink", hex: "#0A0A0A" },
  { name: "Forest", hex: "#1C7A4E" },
  { name: "Ocean", hex: "#2C5AA0" },
  { name: "Plum", hex: "#7A2F63" },
];

export default function SettingsPage({ params }: { params: Promise<{ siteId: string }> }) {
  return (
    <Suspense>
      <Settings params={params} />
    </Suspense>
  );
}

/** Settings uses sub-navigation rather than one very long page. */
function Settings({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const site = getSite(siteId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("section");
  const initial = SECTIONS.some((s) => s.key === requested) ? (requested as SectionKey) : "general";
  const [section, setSection] = useState<SectionKey>(initial);

  /** Keeps the section deep-linkable, so the command palette can jump into one. */
  const openSection = (key: SectionKey) => {
    setSection(key);
    router.replace(
      key === "general" ? `/sites/${siteId}/settings` : `/sites/${siteId}/settings?section=${key}`,
      {
        scroll: false,
      },
    );
  };
  const [accent, setAccent] = useState("#FF7A00");
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="https://cdn.poweredbyconcierge.com/agent.js"\n data-site="${site.id}"defer></script>`;

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Settings"
        title={site.name}
        description="Everything about how this site behaves. Changes take effect straight away — you never reinstall the script."
      />

      <div className="grid gap-8 lg:grid-cols-[196px_1fr]">
        <nav aria-label="Settings sections">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map(({ key, label, Icon }) => {
              const active = key === section;
              return (
                <li key={key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => openSection(key)}
                    aria-current={active ? "true" : undefined}
                    className={cx(
                      "flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-[11.5px] transition-colors",
                      active
                        ? "bg-surface-hover font-medium text-text-primary"
                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          {section === "general" && (
            <>
              <Panel className="p-6">
                <SectionHead title="Site" hint="What this website is and where it lives." className="mb-5" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Site name" htmlFor="s-name">
                    <Input id="s-name" defaultValue={site.name} />
                  </Field>
                  <Field label="Public URL" htmlFor="s-url">
                    <Input id="s-url" defaultValue={site.url} />
                  </Field>
                  <Field label="Product" htmlFor="s-product" className="sm:col-span-2">
                    <Select id="s-product" defaultValue={site.product}>
                      <option value="agent">Concierge Agent — on your existing website</option>
                      <option value="pages">Concierge Pages — a hosted site with the Agent included</option>
                    </Select>
                  </Field>
                </div>
              </Panel>

              <Panel className="p-6">
                <SectionHead
                  title="Knowledge"
                  hint="How often Concierge re-reads your site to catch changes."
                  className="mb-5"
                />
                <div className="space-y-3">
                  <SettingRow
                    title="Re-learn automatically"
                    description="Concierge checks weekly and flags only what changed. Your approvals stay put."
                    control={<Toggle checked onChange={() => undefined} label="Re-learn automatically" />}
                  />
                  <SettingRow
                    title="Answer from suggested knowledge"
                    description="Off by default. When off, Concierge uses approved items only."
                    control={
                      <Toggle
                        checked={false}
                        onChange={() => undefined}
                        label="Answer from suggested knowledge"
                      />
                    }
                  />
                </div>
                <LinkButton
                  href={`/sites/${siteId}/agent/brain`}
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  leading={<BrainIcon size={13} />}
                >
                  Open Site Brain
                </LinkButton>
              </Panel>

              <Panel className="border-danger-line p-6">
                <SectionHead
                  title="Delete this site"
                  hint="The Agent stops answering immediately and all conversations are removed after 30 days."
                  className="mb-4"
                />
                <Button variant="danger" size="sm" leading={<TrashIcon size={13} />}>
                  Delete {site.name}
                </Button>
              </Panel>
            </>
          )}

          {section === "appearance" && (
            <>
              <Panel className="p-6">
                <SectionHead
                  title="Accent"
                  hint="Colours the launcher, the active states and the Concierge mark."
                  className="mb-5"
                />
                <div className="flex flex-wrap gap-2">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.hex}
                      type="button"
                      onClick={() => setAccent(a.hex)}
                      className={cx(
                        "flex items-center gap-2 border px-3 py-2 text-[12px] transition-colors",
                        accent === a.hex
                          ? "border-ink ring-1 ring-ink"
                          : "border-line hover:border-line-strong",
                      )}
                    >
                      <span className="h-4 w-4" style={{ background: a.hex }} />
                      {a.name}
                      {accent === a.hex && <CheckIcon size={13} />}
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel className="p-6">
                <SectionHead
                  title="Launcher"
                  hint="What a visitor sees before they open the conversation."
                  className="mb-5"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Launcher label" htmlFor="s-launcher">
                    <Input id="s-launcher" defaultValue="Ask Concierge" />
                  </Field>
                  <Field label="Position" htmlFor="s-pos">
                    <Select id="s-pos" defaultValue="br">
                      <option value="br">Bottom right</option>
                      <option value="bl">Bottom left</option>
                    </Select>
                  </Field>
                </div>
                <div className="mt-5 space-y-3">
                  <SettingRow
                    title="Show the Concierge mark"
                    description="A small “Powered by Concierge” badge on the launcher."
                    control={<Toggle checked onChange={() => undefined} label="Show the Concierge mark" />}
                  />
                  <SettingRow
                    title="Open automatically"
                    description="Opens after 20 seconds on pricing and services pages only."
                    control={<Toggle checked={false} onChange={() => undefined} label="Open automatically" />}
                  />
                </div>
              </Panel>
            </>
          )}

          {section === "install" && (
            <>
              <Panel className="overflow-hidden">
                <SectionHead
                  title="Your install snippet"
                  hint="One line, before the closing body tag. Everything else updates live."
                  className="p-6 pb-4"
                />
                <div className="flex items-center gap-2 border-y border-divider px-6 py-2.5">
                  <CodeIcon size={14} className="text-text-muted" />
                  <p className="t-eyebrow text-text-muted">HTML</p>
                  <Button
                    size="sm"
                    variant="tertiary"
                    className="ml-auto"
                    leading={<CopyIcon size={13} />}
                    onClick={() => {
                      navigator.clipboard?.writeText(snippet).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="t-mono overflow-x-auto bg-surface-subtle p-6 leading-[1.7] text-text-secondary">
                  {snippet}
                </pre>
              </Panel>

              <Card className="flex flex-wrap items-center gap-4 p-5">
                <span
                  className={cx(
                    "flex h-9 w-9 shrink-0 items-center justify-center",
                    site.installState === "detected"
                      ? "bg-approved-soft text-success"
                      : "bg-surface-subtle text-text-tertiary",
                  )}
                >
                  {site.installState === "detected" ? (
                    <CheckIcon size={17} strokeWidth={2.4} />
                  ) : (
                    <InstallIcon size={17} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="t-card">
                    {site.installState === "detected" ? "Concierge is on your site" : "Not detected yet"}
                  </p>
                  <p className="t-body-sm mt-0.5 text-text-tertiary">
                    Last checked {relativeTime(site.updatedAt)} on {site.url}
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Check again
                </Button>
              </Card>

              <Panel className="p-6">
                <SectionHead
                  title="Platform guides"
                  hint="Step-by-step for the usual suspects."
                  className="mb-4"
                />
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {["WordPress", "Shopify", "Webflow", "Squarespace", "Wix", "Custom HTML"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="bg-surface-subtle px-3 py-2.5 text-left text-[12px] transition-colors hover:border-line-strong"
                    >
                      <span className="block font-medium">{p}</span>
                      <span className="mt-0.5 block text-[11.5px] text-text-tertiary">2 minute guide</span>
                    </button>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {section === "team" && (
            <Panel className="overflow-hidden">
              <SectionHead
                title="Who can see what"
                hint={`${ORG.seatsUsed} of ${ORG.seatsIncluded} seats used on the ${ORG.plan} plan.`}
                action={<Button size="sm">Invite someone</Button>}
                className="p-6 pb-4"
              />
              <ul className="divide-y divide-divider border-t border-divider">
                {TEAM.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-surface-subtle text-[10px] font-semibold text-text-secondary">
                      {(m.name || m.email)
                        .split(/[\s@]/)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase())
                        .join("")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-medium">{m.name || m.email}</span>
                      <span className="block truncate text-[12.5px] text-text-tertiary">
                        {m.name ? m.email : `Invited ${m.invitedAt ? relativeTime(m.invitedAt) : ""}`}
                      </span>
                    </span>
                    <Badge tone={m.role === "owner" ? "accent" : "neutral"}>{m.role}</Badge>
                    <span className="text-[12.5px] text-text-tertiary">
                      {m.siteIds === null ? "All sites" : `${m.siteIds.length} site`}
                    </span>
                    {m.status === "invited" && <Badge tone="review">Pending</Badge>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {section === "notifications" && (
            <Panel className="p-6">
              <SectionHead
                title="What Concierge tells you about"
                hint="Routing destinations handle visitor requests. These are about the product itself."
                className="mb-5"
              />
              <div className="space-y-3">
                {[
                  ["A routing destination starts failing", true],
                  ["Concierge could not answer something three times", true],
                  ["Weekly summary of conversations and leads", true],
                  ["Someone on your team changes Site Brain", false],
                  ["Your install stops being detected", true],
                ].map(([label, on]) => (
                  <SettingRow
                    key={label as string}
                    title={label as string}
                    control={
                      <Toggle checked={on as boolean} onChange={() => undefined} label={label as string} />
                    }
                  />
                ))}
              </div>
            </Panel>
          )}

          {section === "security" && (
            <>
              <Panel className="p-6">
                <SectionHead title="Data" hint="What Concierge keeps, and for how long." className="mb-5" />
                <div className="space-y-3">
                  <SettingRow
                    title="Conversation retention"
                    description="Transcripts older than this are deleted permanently."
                    control={
                      <Select defaultValue="90" className="w-[130px]" aria-label="Conversation retention">
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="365">1 year</option>
                      </Select>
                    }
                  />
                  <SettingRow
                    title="Mask contact details in transcripts"
                    description="Phone numbers and emails are hidden from anyone without lead access."
                    control={
                      <Toggle checked={false} onChange={() => undefined} label="Mask contact details" />
                    }
                  />
                </div>
              </Panel>

              <Panel className="p-6">
                <SectionHead title="Access" className="mb-4" />
                <div className="space-y-3">
                  <SettingRow
                    title="Restrict the Agent to your domain"
                    description="The script refuses to load anywhere other than northlanedental.com."
                    control={<Toggle checked onChange={() => undefined} label="Restrict to domain" />}
                  />
                </div>
                <p className="mt-4 flex items-center gap-2 bg-surface-subtle-subtle p-3.5 text-[12px] text-text-secondary">
                  <LockIcon size={14} className="shrink-0 text-text-tertiary" />
                  Concierge never reads pages behind a login, and never stores payment details.
                </p>
              </Panel>
            </>
          )}

          {section === "integrations" && <IntegrationsSettings />}

          {section === "billing" && (
            <>
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="t-eyebrow text-text-muted">Current plan</p>
                    <p className="t-section mt-2 capitalize">{ORG.plan}</p>
                    <p className="t-body-sm mt-1.5 text-text-tertiary">
                      {ORG.siteLimit} sites · unlimited conversations · renews 1 October 2026
                    </p>
                  </div>
                  <Button variant="secondary">Change plan</Button>
                </div>
              </Card>

              <Panel className="p-6">
                <SectionHead title="This month" className="mb-5" />
                <dl className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["Conversations", "386", "Unlimited"],
                    ["SMS sent", "27", "of 250"],
                    ["Sites", "3", `of ${ORG.siteLimit}`],
                  ].map(([label, value, limit]) => (
                    <div key={label}>
                      <dt className="t-eyebrow text-text-muted">{label}</dt>
                      <dd className="t-num mt-2 text-[15.5px] leading-none">
                        {value}
                        <span className="ml-1.5 text-[11.5px] font-normal text-text-tertiary">{limit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>

              <Panel className="p-6">
                <SectionHead title="Invoices" className="mb-4" />
                <ul className="divide-y divide-divider">
                  {["1 September 2026", "1 August 2026", "1 July 2026"].map((d) => (
                    <li key={d} className="flex items-center gap-4 py-3">
                      <span className="min-w-0 flex-1 text-[11.5px]">{d}</span>
                      <span className="text-[11.5px] tabular-nums">$99.00</span>
                      <Badge tone="approved">Paid</Badge>
                      <Button size="sm" variant="tertiary">
                        Download
                      </Button>
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 bg-surface-subtle px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium">{title}</p>
        {description && <p className="mt-0.5 text-[12px] leading-[1.45] text-text-tertiary">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export { GlobeIcon };
