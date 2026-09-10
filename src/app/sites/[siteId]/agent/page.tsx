"use client";

import { use, useState } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
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
  Textarea,
  Toggle,
} from "@/components/ui";
import { CheckIcon, PlusIcon, TrashIcon } from "@/components/icons";
import {
  ApprovedSticker,
  HandoffSticker,
  PendingSticker,
  RoutingSticker,
  ShieldSticker,
  SparkSticker,
} from "@/components/stickers";
import { ACTION_STICKER, MODE_STICKER } from "@/components/stickers/maps";
import { ACTIONS, AGENT, BRAIN, DESTINATIONS } from "@/lib/demo-data";
import type { AgentAutonomy, AgentMode, AgentTone } from "@/lib/types";

const MODES: { key: AgentMode; label: string; description: string }[] = [
  { key: "receptionist", label: "Receptionist", description: "Answers, books and puts people through." },
  { key: "sales-assistant", label: "Sales assistant", description: "Qualifies interest and captures leads." },
  {
    key: "customer-service",
    label: "Customer service",
    description: "Resolves first, escalates when it cannot.",
  },
  {
    key: "knowledge-assistant",
    label: "Knowledge assistant",
    description: "Explains without pushing to convert.",
  },
  { key: "custom", label: "Custom", description: "Write the role yourself." },
];

const TONES: { key: AgentTone; label: string }[] = [
  { key: "warm", label: "Warm" },
  { key: "professional", label: "Professional" },
  { key: "concise", label: "Concise" },
  { key: "friendly", label: "Friendly" },
  { key: "expert", label: "Expert" },
];

/** Scroll landmark. Replaces the sub-tabs this page used to carry. */
function GroupLabel({ children }: { children: string }) {
  return <p className="t-eyebrow pt-3 text-text-muted">{children}</p>;
}

/**
 * Persona sits beside a live preview, so a change to tone or a rule can be
 * read back before anyone commits to it.
 */
/** Ordered by how much rope the owner is handing over. */
const AUTONOMY_LEVELS: { value: AgentAutonomy; label: string; description: string }[] = [
  {
    value: "suggest",
    label: "Draft only",
    description:
      "Concierge writes what it would send and leaves it in the conversation. Nothing goes out until you send it yourself.",
  },
  {
    value: "approve",
    label: "Draft and wait for me",
    description:
      "It writes the follow-up, holds it until a sensible hour, and sends the moment you approve. Most owners start here.",
  },
  {
    value: "send",
    label: "Follow up on its own",
    description:
      "It sends without asking, within your rules and never more than once per visitor. You see every message afterwards.",
  },
];

export default function AgentPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  const [mode, setMode] = useState<AgentMode>(AGENT.mode);
  const [tone, setTone] = useState<AgentTone>(AGENT.tone);
  const [name, setName] = useState(AGENT.name);
  const [greeting, setGreeting] = useState(AGENT.greeting);
  const [rules, setRules] = useState(AGENT.rules);
  const [voice, setVoice] = useState(AGENT.voiceEnabled);
  const [autonomy, setAutonomy] = useState<AgentAutonomy>(AGENT.autonomy);
  const [dirty, setDirty] = useState(false);

  const touch =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
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
            <LinkButton href={`/sites/${siteId}/agent/preview`} variant="secondary">
              Test it
            </LinkButton>
            <Button disabled={!dirty} onClick={() => setDirty(false)}>
              {dirty ? "Save changes" : "Saved"}
            </Button>
          </>
        }
        meta={
          <AgentReadiness
            siteId={siteId}
            readyActions={readyActions.length}
            connectedRoutes={connectedRoutes}
          />
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* Identity ------------------------------------------------- */}
          <Panel className="p-6">
            <SectionHead
              title="Identity"
              hint="What visitors see before they type anything."
              className="mb-5"
            />
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
            <SectionHead
              title="Role"
              hint="Sets what Concierge leads with when intent is unclear."
              className="mb-4"
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              {MODES.map((m) => {
                const Sticker = MODE_STICKER[m.key];
                return (
                  <RadioCard
                    key={m.key}
                    selected={mode === m.key}
                    onSelect={() => touch(setMode)(m.key)}
                    label={m.label}
                    description={m.description}
                    icon={<Sticker size={30} />}
                  />
                );
              })}
            </div>
          </Panel>

          {/* Behaviour ------------------------------------------------ */}
          <GroupLabel>Behaviour</GroupLabel>

          <Panel className="p-6">
            <SectionHead
              title="Tone"
              hint="How it sounds. It never changes what it is allowed to say."
              className="mb-4"
            />
            <SegmentedControl
              label="Tone"
              value={tone}
              onChange={touch(setTone)}
              options={TONES.map((t) => ({ value: t.key, label: t.label }))}
            />
            <p className="mt-4 bg-surface-subtle p-3.5 text-[12.5px] leading-[1.6] text-text-secondary">
              <span className="t-eyebrow mb-1.5 block text-text-muted">Sounds like</span>
              {tone === "warm" &&
                "Happy to help with that — the New Patient Exam is $89 and includes a cleaning."}
              {tone === "professional" && "The New Patient Exam is $89 and includes X-rays and a cleaning."}
              {tone === "concise" && "$89. Includes X-rays and a cleaning."}
              {tone === "friendly" && "Good news — that one's $89, and it covers X-rays and a cleaning too!"}
              {tone === "expert" &&
                "The New Patient Exam is $89. It covers a full periodontal assessment, bitewing X-rays and a scale and polish."}
            </p>
          </Panel>

          <Panel className="p-6">
            <SectionHead
              title="Quick actions"
              hint="Offered as buttons when the moment fits. Only actions that are ready appear."
              action={
                <LinkButton href={`/sites/${siteId}/agent/actions`} variant="tertiary" size="sm">
                  Manage actions
                </LinkButton>
              }
              className="mb-4"
            />
            <ul className="space-y-2">
              {readyActions.map((a) => {
                const Sticker = ACTION_STICKER[a.kind];
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 border border-line bg-surface px-3.5 py-2.5 transition-colors duration-[var(--dur-micro)] hover:border-line-strong"
                  >
                    <Sticker size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium">{a.name}</span>
                      <span className="block truncate text-[12.5px] text-text-tertiary">{a.outcome}</span>
                    </span>
                    <Toggle
                      size="sm"
                      checked={AGENT.quickActions.includes(a.id)}
                      onChange={() => setDirty(true)}
                      label={`Offer ${a.name}`}
                    />
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel className="p-6">
            <SectionHead
              title="How far it may go on its own"
              hint="A visitor who leaves the page is not gone. This decides what Concierge may do about it."
              className="mb-4"
            />
            <div className="space-y-2.5">
              {AUTONOMY_LEVELS.map((level) => (
                <RadioCard
                  key={level.value}
                  selected={autonomy === level.value}
                  onSelect={() => {
                    setAutonomy(level.value);
                    setDirty(true);
                  }}
                  label={level.label}
                  description={level.description}
                />
              ))}
            </div>
            <p className="mt-4 border-t border-line pt-4 text-[11.5px] leading-[1.5] text-text-tertiary">
              Whatever you pick, Concierge only writes to someone who gave you their details in the
              conversation, never sends between 21:00 and 08:00, and stops the moment they ask it to.
            </p>
          </Panel>

          <Panel className="p-6">
            <SectionHead
              title="Voice"
              hint="Lets a visitor talk instead of type. Answers stay grounded in Site Brain."
              className="mb-4"
            />
            <div className="flex items-center gap-3 bg-surface-subtle px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium">Talk to Concierge</p>
                <p className="mt-0.5 text-[11.5px] text-text-tertiary">
                  Premium feature. Voice always confirms before moving a visitor into a route.
                </p>
              </div>
              <Toggle checked={voice} onChange={touch(setVoice)} label="Enable voice" />
            </div>
          </Panel>

          {/* Rules & limits ------------------------------------------- */}
          <GroupLabel>Rules &amp; limits</GroupLabel>

          <Panel className="p-6">
            <SectionHead
              title="How it should behave"
              hint="Instructions layered on top of your approved knowledge."
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  leading={<PlusIcon size={13} />}
                  onClick={() => setDirty(true)}
                >
                  Add rule
                </Button>
              }
              className="mb-4"
            />
            <ul className="space-y-3">
              {rules.map((r, i) => (
                <li key={r} className="flex items-start gap-3 rounded-xl bg-surface-subtle px-3.5 py-2.5">
                  <CheckIcon size={14} className="mt-0.5 shrink-0 text-success" strokeWidth={2.2} />
                  <span className="min-w-0 flex-1 text-[12.5px] leading-[1.55]">{r}</span>
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
            <ul className="space-y-3">
              {AGENT.neverPromise.map((r) => (
                <li
                  key={r}
                  className="flex items-start gap-3 border border-danger-line bg-danger-soft px-3.5 py-3"
                >
                  <ShieldSticker size={26} className="shrink-0" />
                  <span className="min-w-0 flex-1 text-[12.5px] leading-[1.55]">{r}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3.5 text-[12.5px] text-text-tertiary">
              These came from your approved Site Brain. Edit them there so the change applies everywhere.
            </p>
          </Panel>

          <Panel className="p-6">
            <SectionHead title="Hand off to a person when" className="mb-4" />
            <ul className="space-y-2">
              {AGENT.escalationTriggers.map((r) => (
                <li key={r} className="flex items-center gap-3 border border-line bg-surface px-3.5 py-2.5">
                  <HandoffSticker size={26} className="shrink-0" />
                  <span className="min-w-0 flex-1 text-[12.5px] leading-[1.55]">{r}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Live preview rail ------------------------------------------ */}
        <aside className="lg:sticky lg:top-[76px] lg:self-start">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-divider px-4 py-2.5">
              <p className="t-eyebrow text-text-muted">Live preview</p>
              <Badge tone="neutral" className="ml-auto">
                Simulation
              </Badge>
            </div>
            <div className="space-y-3 bg-surface-subtle p-4">
              <div className="w-fit max-w-[92%] bg-surface px-3.5 py-2.5">
                <p className="text-[11.5px] leading-[1.5]">{greeting}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {readyActions.slice(0, 3).map((a) => (
                  <span key={a.id} className="bg-surface px-2.5 py-1 text-[12px] text-text-secondary">
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-divider p-4">
              <LinkButton href={`/sites/${siteId}/agent/preview`} variant="secondary" size="sm" block>
                Run a full test
              </LinkButton>
            </div>
          </Card>
        </aside>
      </div>
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
      href: `/sites/${siteId}/agent/brain`,
    },
    BRAIN.missingCount > 0 && {
      label: `${BRAIN.missingCount} topic with no source`,
      href: `/sites/${siteId}/agent/brain`,
    },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <Card className="p-5">
      {/* Two halves that each take what is left over, so the three facts spread
          across the right of the card instead of bunching beside the sentence
          and leaving a third of the row empty. */}
      <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
        <div className="flex min-w-[320px] flex-1 items-center gap-4">
          <RadialGauge
            value={confidence}
            label="Agent confidence"
            tone={confidence >= 80 ? "success" : "accent"}
            size={58}
          />
          <div className="min-w-0">
            <p className="t-card">Autonomous when confident, human when it matters</p>
            <p className="t-body-sm mt-1 text-text-tertiary">
              Concierge answers on its own {confidence}% of the time and hands off the rest.
            </p>
          </div>
        </div>

        <dl className="grid min-w-[320px] flex-1 grid-cols-3 gap-x-6 gap-y-4">
          {[
            { Sticker: ApprovedSticker, label: "Knowledge", value: `${BRAIN.approvedCount} approved` },
            { Sticker: SparkSticker, label: "Actions", value: `${readyActions} ready` },
            { Sticker: RoutingSticker, label: "Routing", value: `${connectedRoutes} connected` },
          ].map(({ Sticker, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-2.5">
              <Sticker size={30} />
              <div className="min-w-0">
                <dt className="t-eyebrow text-text-muted">{label}</dt>
                <dd className="mt-1 truncate text-[12.5px] font-semibold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      {gaps.length > 0 && (
        <div className="w-full border-t border-divider pt-4">
          <p className="t-eyebrow mb-2 text-text-muted">Finish these to raise confidence</p>
          <ul className="flex flex-wrap gap-2">
            {gaps.map((g) => (
              <li key={g.label}>
                <LinkButton
                  href={g.href}
                  variant="secondary"
                  size="md"
                  className="gap-2 pl-2"
                  leading={<PendingSticker size={20} />}
                >
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
