"use client";

import { useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Panel,
  SearchInput,
  SegmentedControl,
} from "@/components/ui";
import {
  AlertIcon,
  CodeIcon,
  IntegrationsIcon,
  LeadsIcon,
  MailIcon,
  PhoneIcon,
  PlusIcon,
  RefreshIcon,
} from "@/components/icons";
import {
  CalendlyLogo,
  GmailLogo,
  HubspotLogo,
  SalesforceLogo,
  SlackLogo,
  StripeLogo,
  WhatsAppLogo,
  ZapierLogo,
} from "@/components/integrations/BrandLogos";
import { cx } from "@/lib/cx";
import { INTEGRATIONS } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";
import type { Integration, IntegrationCategory } from "@/lib/types";
import type { Tone } from "@/components/ui";

const LOGO: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  i_slack: SlackLogo,
  i_calendly: CalendlyLogo,
  i_stripe: StripeLogo,
  i_hubspot: HubspotLogo,
  i_salesforce: SalesforceLogo,
  i_whatsapp: WhatsAppLogo,
  i_zapier: ZapierLogo,
  i_email: GmailLogo,
};

const FALLBACK_ICON: Record<string, typeof MailIcon> = {
  i_sms: PhoneIcon,
  i_webhook: CodeIcon,
  i_api: CodeIcon,
  i_paypal: LeadsIcon,
  i_make: RefreshIcon,
};

const STATUS: Record<Integration["status"], { tone: Tone; label: string }> = {
  connected: { tone: "approved", label: "Connected" },
  available: { tone: "neutral", label: "Available" },
  "coming-soon": { tone: "neutral", label: "Coming soon" },
  error: { tone: "restricted", label: "Needs attention" },
};

const CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  routing: "Routing",
  messaging: "Messaging",
  scheduling: "Scheduling",
  payments: "Payments",
  crm: "CRM",
  automation: "Automation",
  developer: "Developer",
};

type Filter = "all" | "connected" | IntegrationCategory;

export default function IntegrationsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEGRATIONS.filter((i) => {
      if (filter === "connected" && i.status !== "connected") return false;
      if (filter !== "all" && filter !== "connected" && i.category !== filter) return false;
      if (q && !`${i.name} ${i.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  const connected = INTEGRATIONS.filter((i) => i.status === "connected");
  const broken = INTEGRATIONS.filter((i) => i.status === "error");

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Integrations"
        title="The tools Concierge works through"
        description="Connect a tool once and every agent, action and routing rule on this site can use it."
        actions={<Button leading={<PlusIcon size={15} />}>Connect a custom endpoint</Button>}
        meta={
          broken.length > 0 ? (
            <Card className="flex flex-wrap items-center gap-3 border-danger-line bg-danger-soft p-4">
              <AlertIcon size={17} className="shrink-0 text-danger" />
              <p className="min-w-0 flex-1 text-[13px]">
                <span className="font-medium">{broken[0].name} stopped responding.</span>{" "}
                <span className="text-text-secondary">
                  Anything that depends on it is queued rather than lost.
                </span>
              </p>
              <Button size="sm" variant="secondary">
                Reconnect
              </Button>
            </Card>
          ) : (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
              <span className="text-[13px]">
                <span className="font-medium">{connected.length}</span>{" "}
                <span className="text-text-tertiary">connected</span>
              </span>
              <span className="text-[13px]">
                <span className="font-medium">{INTEGRATIONS.length - connected.length}</span>{" "}
                <span className="text-text-tertiary">available</span>
              </span>
            </div>
          )
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search integrations"
          className="min-w-[200px] flex-1 sm:max-w-[300px]"
          aria-label="Search integrations"
        />
        <SegmentedControl
          label="Filter integrations"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "connected", label: "Connected" },
            { value: "routing", label: "Routing" },
            { value: "crm", label: "CRM" },
          ]}
        />
      </div>

      {list.length === 0 ? (
        <Panel>
          <EmptyState
            icon={<IntegrationsIcon size={19} />}
            title="Nothing matches"
            body="If the tool you need is not here, a webhook or the API will connect Concierge to almost anything."
            action={<Button variant="secondary">Read the developer docs</Button>}
          />
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((integration) => (
            <IntegrationCard key={integration.id} integration={integration} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function IntegrationCard({ integration: i }: { integration: Integration }) {
  const Logo = LOGO[i.id];
  const Fallback = FALLBACK_ICON[i.id] ?? IntegrationsIcon;
  const s = STATUS[i.status];
  const soon = i.status === "coming-soon";

  return (
    <Card className={cx("flex flex-col p-5", soon && "bg-surface-subtle/60", i.status === "error" && "border-danger-line")}>
      <div className="flex items-start gap-3">
        <span
          className={cx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface",
            soon && "opacity-55",
          )}
        >
          {Logo ? <Logo size={20} /> : <Fallback size={17} className="text-text-secondary" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="t-card">{i.name}</h3>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-text-tertiary">{i.description}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Badge tone={s.tone} dot={i.status === "connected"}>
          {s.label}
        </Badge>
        <Badge tone="neutral">{CATEGORY_LABEL[i.category]}</Badge>
      </div>

      {i.accountLabel && (
        <p className="mt-3 truncate text-[12px] text-text-tertiary">
          {i.accountLabel}
          {i.lastSyncAt && ` · synced ${relativeTime(i.lastSyncAt)}`}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        {i.status === "connected" && (
          <>
            <Button size="sm" variant="secondary">
              Configure
            </Button>
            <Button size="sm" variant="tertiary">
              Disconnect
            </Button>
          </>
        )}
        {i.status === "available" && <Button size="sm">Connect</Button>}
        {i.status === "error" && <Button size="sm">Reconnect</Button>}
        {soon && (
          <Button size="sm" variant="secondary" disabled>
            Coming soon
          </Button>
        )}
      </div>
    </Card>
  );
}
