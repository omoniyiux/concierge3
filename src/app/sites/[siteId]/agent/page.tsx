"use client";

import { use, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { AgentPreview } from "@/components/agent/AgentPreview";
import { RadialGauge } from "@/components/ui/charts";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  LinkButton,
  Panel,
  RadioCard,
  SectionHead,
  SegmentedControl,
  Tabs,
  Textarea,
  Toggle,
} from "@/components/ui";
import {
  ActionsIcon,
  AgentIcon,
  BrainIcon,
  CheckIcon,
  LockIcon,
  PlusIcon,
  RoutingIcon,
  ShieldIcon,
  TrashIcon,
} from "@/components/icons";
import { ACTIONS, AGENT, BRAIN, DESTINATIONS } from "@/lib/demo-data";
import type { AgentMode, AgentTone } from "@/lib/types";

type Tab = "identity" | "behaviour" | "rules" | "preview";

const MODES: { key: AgentMode; label: string; description: string }[] = [
  { key: "receptionist", label: "Receptionist", description: "Answers, books and puts people through." },
  { key: "sales-assistant", label: "Sales assistant", description: "Qualifies interest and captures leads." },
  { key: "customer-service", label: "Customer service", description: "Resolves first, escalates when it cannot." },
  { key: "knowledge-assistant", label: "Knowledge assistant", description: "Explains without pushing to convert." },
  { key: "custom", label: "Custom", description: "Write the role yourself." },
];

const TONES: { key: AgentTone; label: string }[] = [
  { key: "warm", label: "Warm" },
  { key: "professional", label: "Professional" },
  { key: "concise", label: "Concise" },
  { key: "friendly", label: "Friendly" },
  { key: "expert", label: "Expert" },
];

/**
 * Agent configuration sits beside a live preview, so a change to tone or a
 * rule can be tested before anyone commits to it.
 */
export default function AgentPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [tab, setTab] = useState<Tab>("identity");
  const [mode, setMode] = useState<AgentMode>(AGENT.mode);
  const [tone, setTone] = useState<AgentTone>(AGENT.tone);
  const [name, setName] = useState(AGENT.name);
  const [greeting, setGreeting] = useState(AGENT.greeting);
  const [rules, setRules] = useState(AGENT.rules);
  const [voice, setVoice] = useState(AGENT.voiceEnabled);
  const [dirty, setDirty] = useState(false);

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setDirty(true);
  };

  const readyActions = ACTIONS.filter((a) => a.readiness === "ready");
  const connectedRoutes = DESTINATIONS.filter((d) => d.status === "connected").length;

  return (
    <PageContainer wide>
      <PageHeader
        eyebrow="Agent"
        title={name}
        description="How Concierge introduces itself, what it leads with, and the lines it will not cross. Approved knowledge always wins over tone."
        actions={
          <>
            <Button variant="secondary" onClick={() => setTab("preview")}>
              Test it
            </Button>
            <Button disabled={!dirty} onClick={() => setDirty(false)}>
              {dirty ? "Save changes" : "Saved"}
            </Button>
          </>
        }
        meta={<AgentReadiness siteId={siteId} readyActions={readyActions.length} connectedRoutes={connectedRoutes} />}
      />

      <Tabs
        label="Agent settings"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "identity", label: "Identity" },
          { value: "behaviour", label: "Behaviour" },
          { value: "rules", label: "Rules & limits" },
          { value: "preview", label: "Preview" },
        ]}
      />

      {tab === "preview" ? (
        <div className="mt-6">
          <AgentPreview greeting={greeting} />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {tab === "identity" && (
              <>
                <Panel className="p-6">
                  <SectionHead title="Identity" hint="What visitors see before they type anything." className="mb-5" />
                  <div className="space-y-5">
                    <Field label="Agent name" htmlFor="agent-name" hint="Shown at the top of the conversation.">
                      <Input id="agent-name" value={name} onChange={(e) => touch(setName)(e.target.value)} />
                    </Field>
                    <Field
                      label="Opening line"
                      htmlFor="agent-greeting"
                      hint="Say what you can help with. Short beats clever."
                    >
                      <Textarea
                        id="agent-greeting"
                        value={greeting}
                        onChange={(e) => touch(setGreeting)(e.target.value)}
                        className="min-h-[80px]"
                      />
                    </Field>
                  </div>
                </Panel>

                <Panel className="p-6">
                  <SectionHead title="Role" hint="Sets what Concierge leads with when intent is unclear." className="mb-4" />
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {MODES.map((m) => (
                      <RadioCard
                        key={m.key}
                        selected={mode === m.key}
                        onSelect={() => touch(setMode)(m.key)}
                        label={m.label}
                        description={m.description}
                        icon={<AgentIcon size={16} />}
                      />
                    ))}
                  </div>
                </Panel>
              </>
            )}

            {tab === "behaviour" && (
              <>
                <Panel className="p-6">
                  <SectionHead title="Tone" hint="How it sounds. It never changes what it is allowed to say." className="mb-4" />
                  <SegmentedControl
                    label="Tone"
                    value={tone}
                    onChange={touch(setTone)}
                    options={TONES.map((t) => ({ value: t.key, label: t.label }))}
                  />
                  <p className="mt-4 rounded-lg border border-line bg-surface-subtle p-3.5 text-[13px] leading-[1.55] text-text-secondary">
                    <span className="t-eyebrow mb-1.5 block text-text-muted">Sounds like</span>
                    {tone === "warm" && "Happy to help with that — the New Patient Exam is $89 and includes a cleaning."}
                    {tone === "professional" && "The New Patient Exam is $89 and includes X-rays and a cleaning."}
                    {tone === "concise" && "$89. Includes X-rays and a cleaning."}
                    {tone === "friendly" && "Good news — that one's $89, and it covers X-rays and a cleaning too!"}
                    {tone === "expert" && "The New Patient Exam is $89. It covers a full periodontal assessment, bitewing X-rays and a scale and polish."}
                  </p>
                </Panel>

                <Panel className="p-6">
                  <SectionHead
                    title="Quick actions"
                    hint="Offered as buttons when the moment fits. Only actions that are ready appear."
                    action={
                      <LinkButton href={`/sites/${siteId}/actions`} variant="tertiary" size="sm">
                        Manage actions
                      </LinkButton>
                    }
                    className="mb-4"
                  />
                  <ul className="space-y-2">
                    {readyActions.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center gap-3 rounded-lg border border-line px-3.5 py-2.5"
                      >
                        <ActionsIcon size={15} className="shrink-0 text-text-tertiary" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-medium">{a.name}</span>
                          <span className="block truncate text-[12px] text-text-tertiary">{a.outcome}</span>
                        </span>
                        <Toggle
                          size="sm"
                          checked={AGENT.quickActions.includes(a.id)}
                          onChange={() => setDirty(true)}
                          label={`Offer ${a.name}`}
                        />
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel className="p-6">
                  <SectionHead
                    title="Voice"
                    hint="Lets a visitor talk instead of type. Answers stay grounded in Site Brain."
                    className="mb-4"
                  />
                  <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-subtle px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium">Talk to Concierge</p>
                      <p className="mt-0.5 text-[12.5px] text-text-tertiary">
                        Premium feature. Voice always confirms before moving a visitor into a route.
                      </p>
                    </div>
                    <Toggle checked={voice} onChange={touch(setVoice)} label="Enable voice" />
                  </div>
                </Panel>
              </>
            )}

            {tab === "rules" && (
              <>
                <Panel className="p-6">
                  <SectionHead
                    title="How it should behave"
                    hint="Instructions layered on top of your approved knowledge."
                    action={
                      <Button size="sm" variant="secondary" leading={<PlusIcon size={13} />} onClick={() => setDirty(true)}>
                        Add rule
                      </Button>
                    }
                    className="mb-4"
                  />
                  <ul className="space-y-2">
                    {rules.map((r, i) => (
                      <li key={r} className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-3">
                        <CheckIcon size={14} className="mt-0.5 shrink-0 text-success" strokeWidth={2.2} />
                        <span className="min-w-0 flex-1 text-[13px] leading-[1.5]">{r}</span>
                        <button
                          type="button"
                          aria-label={`Remove rule ${i + 1}`}
                          onClick={() => {
                            setRules((prev) => prev.filter((x) => x !== r));
                            setDirty(true);
                          }}
                          className="shrink-0 text-text-muted transition-colors hover:text-danger"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </Panel>

                <Panel className="border-danger-line p-6">
                  <SectionHead
                    title="Never promise"
                    hint="Hard limits. Concierge refuses and offers a handoff rather than risk being wrong."
                    className="mb-4"
                  />
                  <ul className="space-y-2">
                    {AGENT.neverPromise.map((r) => (
                      <li key={r} className="flex items-start gap-3 rounded-lg border border-danger-line bg-danger-soft px-3.5 py-3">
                        <LockIcon size={14} className="mt-0.5 shrink-0 text-danger" />
                        <span className="min-w-0 flex-1 text-[13px] leading-[1.5]">{r}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3.5 text-[12px] text-text-tertiary">
                    These came from your approved Site Brain. Edit them there so the change applies everywhere.
                  </p>
                </Panel>

                <Panel className="p-6">
                  <SectionHead title="Hand off to a person when" className="mb-4" />
                  <ul className="space-y-2">
                    {AGENT.escalationTriggers.map((r) => (
                      <li key={r} className="flex items-start gap-3 rounded-lg border border-line px-3.5 py-3">
                        <RoutingIcon size={14} className="mt-0.5 shrink-0 text-text-tertiary" />
                        <span className="min-w-0 flex-1 text-[13px] leading-[1.5]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </>
            )}
          </div>

          {/* Live preview rail ------------------------------------------ */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
                <p className="t-eyebrow text-text-muted">Live preview</p>
                <Badge tone="neutral" className="ml-auto">
                  Simulation
                </Badge>
              </div>
              <div className="space-y-3 bg-surface-subtle p-4">
                <div className="w-fit max-w-[92%] rounded-xl rounded-tl-sm border border-line bg-surface px-3.5 py-2.5">
                  <p className="text-[12.5px] leading-[1.55]">{greeting}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {readyActions.slice(0, 3).map((a) => (
                    <span
                      key={a.id}
                      className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11.5px] text-text-secondary"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t border-line p-4">
                <Button variant="secondary" size="sm" block onClick={() => setTab("preview")}>
                  Run a full test
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </PageContainer>
  );
}

/* ---- Readiness ----------------------------------------------------------- */

function AgentReadiness({
  siteId,
  readyActions,
  connectedRoutes,
}: {
  siteId: string;
  readyActions: number;
  connectedRoutes: number;
}) {
  const confidence = Math.round(AGENT.confidence * 100);
  const gaps = [
    BRAIN.needsReviewCount > 0 && {
      label: `${BRAIN.needsReviewCount} knowledge items unapproved`,
      href: `/sites/${siteId}/brain`,
    },
    BRAIN.missingCount > 0 && { label: `${BRAIN.missingCount} topic with no source`, href: `/sites/${siteId}/brain` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <Card className="flex flex-wrap items-center gap-x-8 gap-y-5 p-5">
      <div className="flex items-center gap-4">
        <RadialGauge value={confidence} label="Agent confidence" tone={confidence >= 80 ? "success" : "accent"} size={54} />
        <div className="max-w-[34ch]">
          <p className="t-card">Autonomous when confident, human when it matters</p>
          <p className="t-body-sm mt-0.5 text-text-tertiary">
            Concierge answers on its own {confidence}% of the time and hands off the rest.
          </p>
        </div>
      </div>

      <dl className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <div>
          <dt className="t-eyebrow text-text-muted">Knowledge</dt>
          <dd className="mt-1.5 flex items-center gap-1.5 text-[14px] font-medium">
            <BrainIcon size={14} className="text-text-tertiary" />
            {BRAIN.approvedCount} approved
          </dd>
        </div>
        <div>
          <dt className="t-eyebrow text-text-muted">Actions</dt>
          <dd className="mt-1.5 flex items-center gap-1.5 text-[14px] font-medium">
            <ActionsIcon size={14} className="text-text-tertiary" />
            {readyActions} ready
          </dd>
        </div>
        <div>
          <dt className="t-eyebrow text-text-muted">Routing</dt>
          <dd className="mt-1.5 flex items-center gap-1.5 text-[14px] font-medium">
            <RoutingIcon size={14} className="text-text-tertiary" />
            {connectedRoutes} connected
          </dd>
        </div>
      </dl>

      {gaps.length > 0 && (
        <div className="w-full border-t border-line pt-4">
          <p className="t-eyebrow mb-2 text-text-muted">Finish these to raise confidence</p>
          <ul className="flex flex-wrap gap-2">
            {gaps.map((g) => (
              <li key={g.label}>
                <LinkButton href={g.href} variant="secondary" size="sm" leading={<ShieldIcon size={13} />}>
                  {g.label}
                </LinkButton>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
