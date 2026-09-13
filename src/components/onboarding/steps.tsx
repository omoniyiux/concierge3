"use client";

import { useState } from "react";
import { KnowledgeCard } from "@/components/brain/KnowledgeCard";
import {
  AgentIcon,
  ArrowRight,
  CheckIcon,
  ChevronLeft,
  CodeIcon,
  CopyIcon,
  GlobeIcon,
  InstallIcon,
  MailIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { Badge, Button, Card, Checkbox, Field, Input, RadioCard, Textarea, Toggle } from "@/components/ui";
import { cx } from "@/lib/cx";
import type { AgentMode, KnowledgeItem, KnowledgeStatus } from "@/lib/types";

/* ============================================================================
   THE STEPS THEMSELVES
   Lifted out of the wizard page when each step became its own route. They are
   deliberately routing-free: every one takes `onNext`/`onBack` and leaves the
   navigating to whoever rendered it.
   ========================================================================== */

/* ---- Shared step furniture ---------------------------------------------- */

function StepShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  width = "narrow",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "narrow" | "wide";
}) {
  return (
    <div className={cx("mx-auto w-full", width === "wide" ? "max-w-[880px]" : "max-w-[560px]")}>
      <p className="t-eyebrow text-accent-ink">{eyebrow}</p>
      <h1 className="t-page mt-2.5">{title}</h1>
      <p className="t-body mt-3 text-text-primary">{description}</p>
      <div className="mt-8">{children}</div>
      {footer && <div className="mt-8 flex items-center gap-3 border-t border-divider pt-6">{footer}</div>}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="tertiary" onClick={onClick} leading={<ChevronLeft size={15} />}>
      Back
    </Button>
  );
}

/* ---- 1 · Website --------------------------------------------------------- */

export function WebsiteStep({
  url,
  setUrl,
  authorized,
  setAuthorized,
  onNext,
}: {
  url: string;
  setUrl: (v: string) => void;
  authorized: boolean;
  setAuthorized: (v: boolean) => void;
  onNext: () => void;
}) {
  const valid = /\./.test(url.replace(/^https?:\/\//, "").trim());

  return (
    <StepShell
      eyebrow="Step 1"
      title="Which website should Concierge learn?"
      description="Concierge reads your public pages to understand what you sell, what you charge and what you promise. It only ever reads pages a visitor could reach."
    >
      <Field
        label="Website address"
        htmlFor="site-url"
        hint="You can change this later, and add more sites at any time."
      >
        <div className="relative">
          <GlobeIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <Input
            id="site-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="northlanedental.com"
            className="h-11 pl-9 text-[12.5px]"
            autoFocus
          />
        </div>
      </Field>

      <div className="mt-4">
        <Checkbox
          checked={authorized}
          onChange={setAuthorized}
          label="I own this website or I am authorised to configure it"
          description="Concierge starts reading only after you confirm this."
        />
      </div>

      <Card className="mt-6 border-line bg-surface-subtle p-4">
        <p className="flex items-center gap-2 text-[12.5px] font-medium">
          <ShieldIcon size={14} className="text-success" />
          What Concierge will not do
        </p>
        <ul className="mt-2.5 space-y-1.5 text-[11.5px] leading-[1.5] text-text-secondary">
          <li>· It will not read anything behind a login.</li>
          <li>· It will not answer visitors until you approve what it learned.</li>
          <li>· It will not invent facts about your business.</li>
        </ul>
      </Card>

      <div className="mt-8 flex items-center gap-3">
        <Button
          size="lg"
          disabled={!valid || !authorized}
          onClick={onNext}
          trailing={<ArrowRight size={16} />}
        >
          Start learning
        </Button>
        <p className="text-[11.5px] text-text-tertiary">Takes about a minute.</p>
      </div>

      <p className="mt-8 border-t border-divider pt-6 text-[12.5px] text-text-tertiary">
        No website yet?{""}
        <button type="button" className="font-medium text-text-primary underline underline-offset-2">
          Start with Concierge Pages
        </button>
        {""}
        and get a site with the Agent already on it.
      </p>
    </StepShell>
  );
}

/* ---- 3 · Review ---------------------------------------------------------- */

export function ReviewStep({
  items,
  onStatus,
  onBody,
  onNext,
  onBack,
}: {
  items: KnowledgeItem[];
  onStatus: (id: string, s: KnowledgeStatus) => void;
  onBody: (id: string, b: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const required = items.filter((i) => i.required);
  const optional = items.filter((i) => !i.required);
  const approved = items.filter((i) => i.status === "approved").length;
  const needsReview = items.filter((i) => i.status === "needs-review").length;
  const missing = items.filter((i) => i.status === "missing").length;
  const requiredDone = required.every((i) => i.status === "approved");

  const approveAllSafe = () => {
    items
      .filter((i) => i.status === "needs-review" && i.confidence >= 0.8)
      .forEach((i) => onStatus(i.id, "approved"));
  };
  const safeCount = items.filter((i) => i.status === "needs-review" && i.confidence >= 0.8).length;

  return (
    <StepShell
      width="wide"
      eyebrow="Step 3"
      title="Approve what Concierge is allowed to say"
      description="This is your Site Brain. Concierge answers only from what you approve here — it will hand off rather than guess."
      footer={
        <>
          <BackButton onClick={onBack} />
          <Button
            size="lg"
            className="ml-auto"
            disabled={!requiredDone}
            onClick={onNext}
            trailing={<ArrowRight size={16} />}
          >
            {requiredDone
              ? "Continue to Agent"
              : `Approve ${required.filter((i) => i.status !== "approved").length} required items`}
          </Button>
        </>
      }
    >
      {/* The three numbers that matter --------------------------------- */}
      <div className="grid grid-cols-3 gap-3 overflow-hidden bg-transparent">
        {[
          { label: "Approved", value: approved, tone: "text-success" },
          { label: "Need review", value: needsReview, tone: "text-warning" },
          { label: "Missing", value: missing, tone: "text-text-muted" },
        ].map((s) => (
          <div key={s.label} className="bg-surface p-4">
            <p className="t-eyebrow text-text-muted">{s.label}</p>
            <p className={cx("t-num mt-2 text-[15.5px] leading-none", s.tone)}>{s.value}</p>
          </div>
        ))}
      </div>

      {safeCount > 0 && (
        <Card className="mt-4 flex flex-wrap items-center gap-3 border-accent-line bg-accent-subtle p-4">
          <SparkIcon size={16} className="shrink-0 text-accent" />
          <p className="min-w-0 flex-1 text-[11.5px]">
            <span className="font-medium">{safeCount} items came back with high confidence.</span>
            {""}
            <span className="text-text-secondary">
              You can approve those in one go and review the rest by hand.
            </span>
          </p>
          <Button size="sm" variant="secondary" onClick={approveAllSafe}>
            Approve {safeCount} safe items
          </Button>
        </Card>
      )}

      <section className="mt-8">
        <h2 className="t-section">Required</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">
          Concierge will not go live until these seven are approved.
        </p>
        <div className="mt-4 space-y-3">
          {required.map((item) => (
            <KnowledgeCard key={item.id} item={item} onStatusChange={onStatus} onBodyChange={onBody} />
          ))}
        </div>
      </section>

      <section className="mt-9">
        <h2 className="t-section">Everything else</h2>
        <p className="t-body-sm mt-1 text-text-tertiary">
          Optional, but each one is a question Concierge can answer without a handoff.
        </p>
        <div className="mt-4 space-y-3">
          {optional.map((item) => (
            <KnowledgeCard key={item.id} item={item} onStatusChange={onStatus} onBodyChange={onBody} />
          ))}
        </div>
      </section>
    </StepShell>
  );
}

/* ---- 4 · Agent ----------------------------------------------------------- */

const MODES: { key: AgentMode; label: string; description: string }[] = [
  {
    key: "receptionist",
    label: "Receptionist",
    description: "Answers, books and puts people through. Best for appointment-led businesses.",
  },
  {
    key: "sales-assistant",
    label: "Sales assistant",
    description: "Qualifies interest and captures high-intent leads for your team.",
  },
  {
    key: "customer-service",
    label: "Customer service",
    description: "Resolves questions first, escalates when it cannot.",
  },
  {
    key: "knowledge-assistant",
    label: "Knowledge assistant",
    description: "Explains what you do without pushing for a conversion.",
  },
];

export function AgentStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<AgentMode>("receptionist");
  const [greeting, setGreeting] = useState(
    "Hi — I can help with appointments, treatments and pricing at Northlane Dental. What brings you in?",
  );

  return (
    <StepShell
      eyebrow="Step 4"
      title="Give the Agent a job"
      description="This sets what Concierge leads with. Every setting here can be tuned later, and none of it overrides your approved rules."
      footer={
        <>
          <BackButton onClick={onBack} />
          <Button size="lg" className="ml-auto" onClick={onNext} trailing={<ArrowRight size={16} />}>
            Continue to Routing
          </Button>
        </>
      }
    >
      <fieldset>
        <legend className="t-eyebrow mb-3 text-text-muted">What should it do first?</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {MODES.map((m) => (
            <RadioCard
              key={m.key}
              selected={mode === m.key}
              onSelect={() => setMode(m.key)}
              label={m.label}
              description={m.description}
              icon={<AgentIcon size={17} />}
            />
          ))}
        </div>
      </fieldset>

      <div className="mt-5">
        <Field
          label="Opening line"
          htmlFor="greeting"
          hint="The first thing a visitor sees. Keep it short and say what you can help with."
        >
          <Textarea
            id="greeting"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
            className="min-h-[76px]"
          />
        </Field>
      </div>

      <Card className="mt-6 p-4">
        <p className="t-eyebrow text-text-muted">Carried over from your Site Brain</p>
        <ul className="mt-3 space-y-2 text-[11.5px] leading-[1.5] text-text-secondary">
          <li className="flex gap-2">
            <ShieldIcon size={13} className="mt-0.5 shrink-0 text-success" />
            Never diagnose a condition, quote a final price, or confirm insurance coverage.
          </li>
          <li className="flex gap-2">
            <ShieldIcon size={13} className="mt-0.5 shrink-0 text-success" />
            Hand off immediately when a visitor reports pain, swelling or bleeding.
          </li>
        </ul>
        <p className="mt-3 text-[12.5px] text-text-tertiary">
          These came from the rules you approved. They cannot be overridden by the Agent&rsquo;s tone.
        </p>
      </Card>
    </StepShell>
  );
}

/* ---- 5 · Routing --------------------------------------------------------- */

export function RoutingStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("frontdesk@northlanedental.com");
  const [connected, setConnected] = useState(false);
  const [tested, setTested] = useState(false);
  const [moments, setMoments] = useState<Record<string, boolean>>({
    "specialist-requested": true,
    "call-requested": true,
    "high-intent": true,
    "conversation-started": false,
  });

  const MOMENT_LABELS: Record<string, string> = {
    "specialist-requested": "A visitor asks to speak to someone",
    "call-requested": "A visitor asks for a call back",
    "high-intent": "Concierge spots a strong lead",
    "conversation-started": "Any conversation starts",
  };

  return (
    <StepShell
      eyebrow="Step 5"
      title="Where should high-intent visitors go?"
      description="When Concierge cannot finish the job itself, it needs a person to hand to. One destination is enough to launch."
      footer={
        <>
          <BackButton onClick={onBack} />
          <Button
            size="lg"
            className="ml-auto"
            disabled={!connected}
            onClick={onNext}
            trailing={<ArrowRight size={16} />}
          >
            Continue to Preview
          </Button>
        </>
      }
    >
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-surface-subtle-subtle text-text-secondary">
            <MailIcon size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-card">Email</p>
            <p className="text-[11.5px] text-text-tertiary">The inbox your team already checks.</p>
          </div>
          {connected && (
            <Badge tone="approved" dot>
              Connected
            </Badge>
          )}
        </div>

        <div className="mt-5">
          <Field label="Send requests to" htmlFor="routing-email">
            <Input
              id="routing-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={connected}
            />
          </Field>
        </div>

        <fieldset className="mt-5">
          <legend className="t-eyebrow mb-2.5 text-text-muted">Tell this inbox when</legend>
          <div className="space-y-3">
            {Object.entries(MOMENT_LABELS).map(([key, label]) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-surface-subtle px-3.5 py-3"
              >
                <span className="text-[11.5px]">{label}</span>
                <Toggle
                  size="sm"
                  checked={!!moments[key]}
                  onChange={(v) => setMoments((m) => ({ ...m, [key]: v }))}
                  label={label}
                />
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          {!connected ? (
            <Button onClick={() => setConnected(true)}>Connect email</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setTested(true)} disabled={tested}>
                {tested ? "Test delivered" : "Send a test"}
              </Button>
              {tested && (
                <p className="flex items-center gap-1.5 text-[12px] text-success">
                  <CheckIcon size={13} strokeWidth={2.4} /> Arrived in 2 seconds
                </p>
              )}
            </>
          )}
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {["Slack", "SMS", "Webhook", "Telegram"].map((name) => (
          <button
            key={name}
            type="button"
            className="rounded-xl bg-surface-subtle px-3 py-2.5 text-[12px] text-text-secondary transition-colors hover:border-line-strong hover:text-text-primary"
          >
            + {name}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[11.5px] text-text-tertiary">
        You can add more destinations and build routing rules once you are live.
      </p>
    </StepShell>
  );
}

/* ---- 6 · Preview --------------------------------------------------------- */

const SAMPLE_TESTS = [
  { q: "How much does a new patient exam cost?", kind: "Answer" },
  { q: "Can I book for Thursday morning?", kind: "Action" },
  { q: "I want to speak to someone.", kind: "Handoff" },
  { q: "Will my insurance cover a crown?", kind: "Safe refusal" },
];

export function PreviewStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [run, setRun] = useState<string[]>([]);

  return (
    <StepShell
      width="wide"
      eyebrow="Step 6"
      title="See what a visitor would get"
      description="This is a simulation against your approved Site Brain. Nothing here reaches a real customer."
      footer={
        <>
          <BackButton onClick={onBack} />
          <Button size="lg" className="ml-auto" onClick={onNext} trailing={<ArrowRight size={16} />}>
            Continue to Install
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div>
          <p className="t-eyebrow mb-3 text-text-muted">Try these first</p>
          <ul className="space-y-3">
            {SAMPLE_TESTS.map((t) => {
              const done = run.includes(t.q);
              return (
                <li key={t.q}>
                  <button
                    type="button"
                    onClick={() => setRun((r) => (r.includes(t.q) ? r : [...r, t.q]))}
                    className={cx(
                      "w-full border p-3 text-left transition-colors",
                      done
                        ? "border-success-line bg-approved-soft"
                        : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {done && <CheckIcon size={13} className="shrink-0 text-success" strokeWidth={2.4} />}
                      <span className="text-[12.5px] font-medium">{t.q}</span>
                    </span>
                    <span className="mt-1 block text-[11.5px] text-text-tertiary">Checks: {t.kind}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12.5px] text-text-tertiary">
            {run.length} of {SAMPLE_TESTS.length} launch checks run
          </p>
        </div>

        <PreviewPane run={run} />
      </div>
    </StepShell>
  );
}

function PreviewPane({ run }: { run: string[] }) {
  const RESPONSES: Record<string, { body: string; meta: string; tone: "approved" | "accent" | "review" }> = {
    "How much does a new patient exam cost?": {
      body: "The New Patient Exam is $89 and includes X-rays and a cleaning. It is the usual starting point if you have not been seen here before.",
      meta: "Answered from Treatment pricing · 91% confidence",
      tone: "approved",
    },
    "Can I book for Thursday morning?": {
      body: "I can put in a request for Thursday morning. Could I take your name and a number so the front desk can confirm the exact time?",
      meta: "Triggered Book an appointment · routed to Front desk",
      tone: "accent",
    },
    "I want to speak to someone.": {
      body: "Of course. I can have the front desk call you back — what number should they use?",
      meta: "Handoff · routed to Front desk · Email",
      tone: "accent",
    },
    "Will my insurance cover a crown?": {
      body: "I am not able to confirm insurance coverage — the front desk checks that against your specific plan. I can pass your details on so they can look it up.",
      meta: "Refused safely · Never-promise rule applied",
      tone: "review",
    },
  };

  return (
    <div className="overflow-hidden bg-surface">
      <div className="flex items-center gap-2.5 border-b border-divider px-4 py-2.5">
        <span className="flex h-6 w-6 items-center justify-center bg-ink text-[9.5px] font-semibold text-text-inverse">
          C+
        </span>
        <p className="text-[12.5px] font-medium">Northlane Concierge</p>
        <Badge tone="neutral" className="ml-auto">
          Simulation
        </Badge>
      </div>

      <div className="min-h-[320px] space-y-4 p-4">
        <div className="max-w-[85%] rounded-xl bg-surface-subtle px-3.5 py-2.5">
          <p className="text-[12.5px] leading-[1.55]">
            Hi — I can help with appointments, treatments and pricing at Northlane Dental. What brings you in?
          </p>
        </div>

        {run.length === 0 && (
          <p className="pt-8 text-center text-[12.5px] text-text-tertiary">
            Pick a test on the left to see the exact reply a visitor would get.
          </p>
        )}

        {run.map((q) => {
          const r = RESPONSES[q];
          return (
            <div key={q} className="space-y-3">
              <div className="ml-auto max-w-[85%] bg-ink px-3.5 py-2.5">
                <p className="text-[12.5px] leading-[1.55] text-text-inverse">{q}</p>
              </div>
              <div className="max-w-[88%]">
                <div className="rounded-xl bg-surface-subtle px-3.5 py-2.5">
                  <p className="text-[12.5px] leading-[1.55]">{r.body}</p>
                </div>
                <p
                  className={cx(
                    "mt-1.5 text-[12px]",
                    r.tone === "review"
                      ? "text-warning"
                      : r.tone === "accent"
                        ? "text-accent-ink"
                        : "text-success",
                  )}
                >
                  {r.meta}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- 7 · Install --------------------------------------------------------- */

const SNIPPET = `<script src="https://cdn.poweredbyconcierge.com/agent.js"
 data-site="site_northlane"defer></script>`;

export function InstallStep({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [detected, setDetected] = useState(false);

  return (
    <StepShell
      eyebrow="Step 7"
      title="Put Concierge on your site"
      description="One line, before the closing body tag. Everything you configure from here updates live — you never reinstall."
      footer={
        <>
          <BackButton onClick={onBack} />
          <Button
            size="lg"
            className="ml-auto"
            disabled={!detected}
            onClick={onDone}
            trailing={<ArrowRight size={16} />}
          >
            {detected ? "Go to your dashboard" : "Waiting for the script"}
          </Button>
        </>
      }
    >
      <div className="overflow-hidden bg-surface">
        <div className="flex items-center gap-2 border-b border-divider px-4 py-2.5">
          <CodeIcon size={14} className="text-text-muted" />
          <p className="t-eyebrow text-text-muted">Your install snippet</p>
          <Button
            size="sm"
            variant="tertiary"
            className="ml-auto"
            leading={<CopyIcon size={13} />}
            onClick={() => {
              navigator.clipboard?.writeText(SNIPPET).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <pre className="t-mono overflow-x-auto bg-surface-subtle p-4 leading-[1.7] text-text-secondary">
          {SNIPPET}
        </pre>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {["WordPress", "Shopify", "Webflow"].map((p) => (
          <button
            key={p}
            type="button"
            className="rounded-xl bg-surface-subtle px-3 py-2.5 text-left text-[12px] transition-colors hover:border-line-strong"
          >
            <span className="block font-medium">{p}</span>
            <span className="mt-0.5 block text-[11.5px] text-text-tertiary">Step-by-step guide</span>
          </button>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-center gap-3">
          <span
            className={cx(
              "flex h-9 w-9 shrink-0 items-center justify-center",
              detected ? "bg-approved-soft text-success" : "bg-surface-subtle text-text-tertiary",
            )}
          >
            {detected ? <CheckIcon size={17} strokeWidth={2.4} /> : <InstallIcon size={17} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="t-card">{detected ? "Concierge is on your site" : "Not detected yet"}</p>
            <p className="t-body-sm mt-0.5 text-text-tertiary">
              {detected
                ? "The script is loading on northlanedental.com. Your Agent is live."
                : "Add the snippet, publish, then check. Nothing goes live until the script is found."}
            </p>
          </div>
          <Button
            variant={detected ? "tertiary" : "secondary"}
            loading={checking}
            onClick={() => {
              setChecking(true);
              setTimeout(() => {
                setChecking(false);
                setDetected(true);
              }, 1400);
            }}
          >
            {detected ? "Check again" : "Check install"}
          </Button>
        </div>
      </Card>
    </StepShell>
  );
}
