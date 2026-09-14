"use client";

import { Suspense, use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { IntegrationsSettings } from "@/components/integrations/IntegrationsSettings";
import { BillingSection } from "@/components/billing/BillingSection";
import { TeamSection } from "@/components/settings/TeamSection";
import { InstallGuides } from "@/components/settings/InstallGuides";
import { InstallHub } from "@/components/settings/InstallHub";
import { AuditLog } from "@/components/audit/HistorySheet";
import { AgencySettings } from "@/components/settings/AgencySettings";
import { DataRights } from "@/components/settings/DataRights";
import { installSnippet } from "@/lib/install";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { Button, Field, Input, LinkButton, Panel, SectionHead, Select, Toggle } from "@/components/ui";
import {
  AgentIcon,
  BillingIcon,
  BrainIcon,
  CheckIcon,
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
import { ORG } from "@/lib/demo-data";
import { useSite } from "@/lib/sim/store";

const SECTIONS = [
  { key: "general", label: "General", Icon: SettingsIcon },
  { key: "appearance", label: "Appearance", Icon: AgentIcon },
  { key: "install", label: "Install", Icon: InstallIcon },
  { key: "integrations", label: "Integrations", Icon: IntegrationsIcon },
  { key: "team", label: "Team", Icon: TeamIcon },
  { key: "notifications", label: "Notifications", Icon: MailIcon },
  { key: "security", label: "Security & data", Icon: ShieldIcon },
  { key: "billing", label: "Plan & billing", Icon: BillingIcon },
  // Only an agency has clients to brand anything for.
  ...(ORG.isAgency ? ([{ key: "agency", label: "Agency", Icon: TeamIcon }] as const) : []),
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
  // The live site, not the seed constant: the install check writes to the
  // world, and this page has to show the result of the button it just ran.
  const site = useSite(siteId);
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
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const snippet = installSnippet(site.id);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings"
        title={site.name}
        description="Everything about how this site behaves. Changes take effect straight away — you never reinstall the script."
      />

      <div className="grid items-start gap-8 lg:grid-cols-[196px_1fr]">
        {/* Pinned so the section list stays put while the panel scrolls. */}
        <nav
          aria-label="Settings sections"
          className="min-w-0 lg:sticky lg:top-0 lg:max-h-dvh lg:self-start lg:overflow-y-auto lg:pb-6"
        >
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
                <Button
                  variant="danger"
                  size="sm"
                  leading={<TrashIcon size={13} />}
                  onClick={() => setDeleting(true)}
                >
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
              {/* The snippet is the last resort, not the first offer. */}
              <InstallHub site={site} snippet={snippet} />
              <InstallGuides snippet={snippet} />
            </>
          )}

          {section === "team" && <TeamSection siteId={siteId} />}

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
                <p className="mt-4 flex items-center gap-2 bg-surface-subtle p-3.5 text-[12px] text-text-secondary">
                  <LockIcon size={14} className="shrink-0 text-text-tertiary" />
                  Concierge never reads pages behind a login, and never stores payment details.
                </p>
              </Panel>

              {/* What a person can ask you for, and get. */}
              <DataRights siteId={siteId} />

              {/* Who changed what, kept for the life of the account. */}
              <AuditLog siteId={siteId} />
            </>
          )}

          {section === "integrations" && <IntegrationsSettings />}

          {section === "billing" && <BillingSection siteId={siteId} />}

          {section === "agency" && <AgencySettings />}
        </div>
      </div>

      {/* Deleting a site is the one action here that cannot be undone, so it
          asks for the name rather than for a click. */}
      <Modal
        open={deleting}
        size="sm"
        onClose={() => {
          setDeleting(false);
          setConfirmName("");
        }}
        eyebrow="Danger zone"
        title={`Delete ${site.name}?`}
        description="The Agent stops answering immediately. Conversations, leads and knowledge are removed permanently after 30 days."
        footer={
          <>
            <Button
              variant="tertiary"
              onClick={() => {
                setDeleting(false);
                setConfirmName("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmName.trim() !== site.name}
              leading={<TrashIcon size={13} />}
              onClick={() => {
                setDeleting(false);
                setConfirmName("");
              }}
            >
              Delete this site
            </Button>
          </>
        }
      >
        <ModalSection>
          <ul className="space-y-2 text-[12.5px] leading-[1.5] text-text-secondary">
            <li>The script on {site.url} stops responding within a minute.</li>
            <li>Routing destinations and integrations stay connected to your other sites.</li>
            <li>Invoices and billing history are kept, because you may still need them.</li>
          </ul>
        </ModalSection>
        <ModalSection>
          <Field label={`Type “${site.name}” to confirm`} htmlFor="confirm-delete">
            <Input
              id="confirm-delete"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={site.name}
            />
          </Field>
        </ModalSection>
      </Modal>
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
    <div className="flex items-center gap-4 rounded-xl bg-surface-subtle px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium">{title}</p>
        {description && <p className="mt-0.5 text-[12px] leading-[1.45] text-text-tertiary">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}
