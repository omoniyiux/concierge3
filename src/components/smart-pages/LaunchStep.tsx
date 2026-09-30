"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertIcon,
  ArrowRight,
  CheckIcon,
  ChevronLeft,
  CodeIcon,
  CopyIcon,
  EditIcon,
  ExternalIcon,
  GlobeIcon,
  LinkIcon,
  PagesIcon,
  SparkIcon,
} from "@/components/icons";
import { Button, Field, Input, LinkButton, Panel, SegmentedControl, Spinner } from "@/components/ui";
import { cx } from "@/lib/cx";
import { installSnippet } from "@/lib/install";
import { stockImageCount } from "@/lib/stock-photos";
import { CAPABILITIES, agentOf, capabilityDef, capabilityState, hasCapability, homeHero, primaryCapability } from "@/lib/page-agent";
import { dispatch } from "@/lib/pages-editor";
import { PAGES_DOMAIN, checkSubdomainShape, suggestSubdomain } from "@/lib/publishing.client";
import { createSite, markPublished } from "@/lib/sim/store";
import { displayName } from "@/lib/starters";
import { applyChanges, describeChange, interpret } from "@/lib/vibe";
import type { PageDocument } from "@/lib/types";
import { checkSubdomain, publishSite } from "@/server/publish-actions";
import { AgentTest } from "./AgentControls";
import { ChangeCard, ChatComposer } from "./Chat";
import { DEFAULT_HOURS, StepHeader } from "./shared";
import { BrowserFrame, PhoneFrame, SitePreview } from "./SitePreview";

/* ============================================================================
   PREVIEW AND PUBLISH
   ----------------------------------------------------------------------------
   The finished page, the agent on it, and the four ways to put it somewhere.
   The site does not exist in the workspace until the owner picks one of
   those — previewing is free, and nothing lands in their site list that they
   did not choose to keep.
   ========================================================================== */

type View = "desktop" | "mobile" | "test";
type Target = "subdomain" | "domain" | "embed" | "draft";

type Outcome =
  | { kind: "live"; url: string; domain?: string }
  | { kind: "embed" };

const TARGETS: { id: Target; label: string; hint: string; icon: ReactNode }[] = [
  { id: "subdomain", label: "Concierge address", hint: "", icon: <GlobeIcon size={15} /> },
  { id: "domain", label: "Your own domain", hint: "Use an address you already own", icon: <LinkIcon size={15} /> },
  { id: "embed", label: "Embed on an existing site", hint: "Add the agent with one snippet", icon: <CodeIcon size={15} /> },
  { id: "draft", label: "Save as draft", hint: "Keep it private and keep editing", icon: <EditIcon size={15} /> },
];

const LAUNCH_SUGGESTIONS = ["Make it more premium", "Add a booking button", "Make the hero shorter", "Add a promotion"];

export function LaunchStep({
  document: doc,
  siteId,
  onChange,
  onBack,
}: {
  document: PageDocument;
  siteId: string;
  onChange: (doc: PageDocument) => void;
  onBack: () => void;
}) {
  const router = useRouter();
  const business = doc.brief?.business;
  const name = business ? displayName(business) : "Your business";
  const [view, setView] = useState<View>("desktop");
  const [target, setTarget] = useState<Target>("subdomain");
  const [subdomain, setSubdomain] = useState(() => suggestSubdomain(name));
  const [domain, setDomain] = useState("");
  const [verdict, setVerdict] = useState<{ value: string; problem: string | null } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [lastEdit, setLastEdit] = useState<{ reply: string; changes: string[] } | null>(null);
  const [pending, startTransition] = useTransition();

  const facts = { name, url: `${subdomain || "yourbusiness"}.${PAGES_DOMAIN}`, openingHours: DEFAULT_HOURS() };
  const needsAddress = target === "subdomain" || target === "domain";
  const checking = needsAddress && (verdict === null || verdict.value !== subdomain);
  const shape = checkSubdomainShape(subdomain);
  const problem = failure ?? (shape.ok ? (checking ? null : verdict?.problem ?? null) : shape.reason);
  const domainOk = target !== "domain" || /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain.trim());
  const publishable = !needsAddress || (problem === null && !checking && domainOk);

  /* Availability, debounced. A database that cannot be reached is not a clash,
     so it does not block — publishing will say what went wrong if it does. */
  useEffect(() => {
    if (!needsAddress || !shape.ok) return;
    const timer = setTimeout(() => {
      checkSubdomain({ siteId, subdomain })
        .then((res) => setVerdict({ value: subdomain, problem: res.ok ? null : (res.reason ?? "That address will not work.") }))
        .catch(() => setVerdict({ value: subdomain, problem: null }));
    }, 350);
    return () => clearTimeout(timer);
  }, [subdomain, siteId, needsAddress, shape.ok]);

  /** Write the site into the workspace, and hand its document to the editor. */
  const create = () => {
    const url = `${subdomain}.${PAGES_DOMAIN}`;
    createSite({ id: siteId, name, url, subdomain, openingHours: facts.openingHours }, doc);
    dispatch({ type: "load", doc, site: { id: siteId, name, url, subdomain, openingHours: facts.openingHours } });
  };

  const editorHref = `/sites/${siteId}/pages/${doc.pages[0]?.id}/edit`;

  const go = () =>
    startTransition(async () => {
      setFailure(null);
      if (target === "draft") {
        create();
        router.push(editorHref);
        return;
      }
      if (target === "embed") {
        create();
        setOutcome({ kind: "embed" });
        return;
      }
      create();
      try {
        const res = await publishSite({ siteId, subdomain, site: facts, document: doc });
        if (!res.ok) {
          setFailure(res.reason);
          return;
        }
        markPublished(siteId, res.url);
        setOutcome({ kind: "live", url: res.url, domain: target === "domain" ? domain.trim().toLowerCase() : undefined });
      } catch {
        setFailure("Publishing is not available right now. Your site is saved as a draft — try again from the editor.");
      }
    });

  const edit = (text: string) => {
    const { changes, reply } = interpret(text, doc, name);
    if (changes.length > 0) onChange(applyChanges(doc, changes, name));
    setLastEdit({ reply, changes: changes.map(describeChange) });
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <StepHeader
          eyebrow="Step 5 of 5 · Launch"
          title="Preview and publish your smart page"
          description="Take a final look, test the agent the way a visitor would, and put it live."
        />
        {!outcome && (
          <Button variant="tertiary" onClick={onBack} leading={<ChevronLeft size={15} />}>
            Back to agent setup
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* The page ----------------------------------------------------------- */}
        <div className="min-w-0">
          <SegmentedControl
            label="Preview"
            value={view}
            onChange={setView}
            options={[
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "Mobile" },
              { value: "test", label: "Test the agent" },
            ]}
          />

          <div className="mt-4">
            {view === "desktop" && (
              <div className="flex items-end gap-4">
                <BrowserFrame url={facts.url} className="min-w-0 flex-1">
                  <SitePreview document={doc} site={facts} aspect={1280 / 820} agentOpen interactive />
                </BrowserFrame>
                <PhoneFrame className="hidden w-[190px] shrink-0 lg:block">
                  <SitePreview document={doc} site={facts} device="mobile" aspect={390 / 780} interactive />
                </PhoneFrame>
              </div>
            )}
            {view === "mobile" && (
              <div className="flex justify-center bg-surface-sunken py-8">
                <PhoneFrame className="w-[330px]">
                  <SitePreview document={doc} site={facts} device="mobile" aspect={390 / 780} agentOpen interactive />
                </PhoneFrame>
              </div>
            )}
            {view === "test" && (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                <AgentTest document={doc} siteName={name} className="h-[520px]" />
                <PhoneFrame className="hidden self-start lg:block">
                  <SitePreview document={doc} site={facts} device="mobile" aspect={390 / 800} agentOpen />
                </PhoneFrame>
              </div>
            )}
          </div>

          {!outcome && (
            <Panel className="mt-4 p-4">
              <p className="mb-2.5 flex items-center gap-2 text-[12.5px] font-medium">
                <SparkIcon size={14} className="text-accent" />
                Quick edits
                <span className="font-normal text-text-tertiary">— describe a change and it lands on the page and the agent.</span>
              </p>
              <ChatComposer onSend={edit} suggestions={LAUNCH_SUGGESTIONS} placeholder="Make the hero shorter, add a promotion…" />
              {lastEdit && (
                <div className="mt-3">
                  <p className="text-[12px] text-text-secondary">{lastEdit.reply}</p>
                  {lastEdit.changes.length > 0 && <ChangeCard changes={lastEdit.changes} />}
                </div>
              )}
            </Panel>
          )}
        </div>

        {/* Where it goes ------------------------------------------------------- */}
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-[calc(var(--topbar-h)+24px)] xl:self-start">
          {outcome ? (
            <Done
              outcome={outcome}
              name={name}
              siteId={siteId}
              editorHref={editorHref}
              subdomain={subdomain}
            />
          ) : (
            <Panel className="p-5">
              <p className="t-section">Publish your page</p>
              <p className="mt-1 text-[12px] text-text-tertiary">Choose how you want to make it live.</p>

              <ul className="mt-4 space-y-2" role="radiogroup" aria-label="Where to publish">
                {TARGETS.map((t) => {
                  const selected = t.id === target;
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          setTarget(t.id);
                          setFailure(null);
                        }}
                        className={cx(
                          "flex w-full items-center gap-3 border p-3 text-left transition-[border-color,box-shadow]",
                          selected ? "border-ink ring-1 ring-ink" : "border-line hover:border-line-hover",
                        )}
                      >
                        <span
                          className={cx(
                            "flex h-4 w-4 shrink-0 items-center justify-center border",
                            selected ? "border-ink bg-ink" : "border-line-hover bg-surface",
                          )}
                          aria-hidden
                        >
                          {selected && <span className="h-1.5 w-1.5 bg-white" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-[12.5px] font-medium">
                            {t.label}
                            {t.id === "subdomain" && (
                              <span className="bg-accent-soft px-1.5 py-px text-[10px] font-semibold text-accent-ink">
                                Recommended
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[11.5px] text-text-tertiary">
                            {t.id === "subdomain" ? `${subdomain || "yourbusiness"}.${PAGES_DOMAIN}` : t.hint}
                          </span>
                        </span>
                        <span className="shrink-0 text-text-muted">{t.icon}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {needsAddress && (
                <div className="mt-4 space-y-3">
                  {target === "domain" && (
                    <Field label="Your domain" htmlFor="launch-domain" hint="You'll get the one DNS record to add once it's published.">
                      <Input
                        id="launch-domain"
                        value={domain}
                        placeholder="www.yourbusiness.com"
                        spellCheck={false}
                        autoCapitalize="none"
                        onChange={(e) => setDomain(e.target.value)}
                      />
                    </Field>
                  )}
                  <Field
                    label={target === "domain" ? "Concierge address (while DNS connects)" : "Your web address"}
                    htmlFor="launch-subdomain"
                    error={problem ?? undefined}
                  >
                    <div className="flex items-stretch">
                      <Input
                        id="launch-subdomain"
                        value={subdomain}
                        spellCheck={false}
                        autoCapitalize="none"
                        onChange={(e) => {
                          setFailure(null);
                          setSubdomain(e.target.value.toLowerCase().trim());
                        }}
                      />
                      <span className="flex shrink-0 items-center border border-l-0 border-line-strong bg-surface-subtle px-2.5 text-[11.5px] text-text-tertiary">
                        .{PAGES_DOMAIN}
                      </span>
                    </div>
                  </Field>
                  <p className="flex h-4 items-center gap-1.5 text-[11.5px] text-text-tertiary">
                    {checking && shape.ok ? (
                      <>
                        <Spinner size={12} /> Checking…
                      </>
                    ) : problem === null && shape.ok ? (
                      <span className="flex items-center gap-1.5 text-success">
                        <CheckIcon size={12} strokeWidth={2.4} />
                        That address is free.
                      </span>
                    ) : null}
                  </p>
                </div>
              )}

              {failure && <p className="mt-3 text-[12px] text-danger">{failure}</p>}

              <Button
                block
                size="lg"
                variant="accent"
                className="mt-4"
                disabled={!publishable || pending}
                loading={pending}
                onClick={go}
                trailing={<ArrowRight size={15} />}
              >
                {target === "draft" ? "Save draft and open editor" : target === "embed" ? "Create site and get snippet" : "Publish page"}
              </Button>
            </Panel>
          )}

          <Readiness document={doc} />
        </aside>
      </div>
    </div>
  );
}

/* ---- Before: what is ready, read off the document --------------------------- */

function Readiness({ document: doc }: { document: PageDocument }) {
  const agent = agentOf(doc);
  const primary = primaryCapability(doc);
  const cta = homeHero(doc)?.content.cta?.label;
  const on = CAPABILITIES.filter((c) => hasCapability(agent, c.id));
  const capturing = hasCapability(agent, "leads") || hasCapability(agent, "contact") || hasCapability(agent, "promotions");
  const setup = CAPABILITIES.filter((c) => capabilityState(doc, c.id).state === "needs-setup");
  const stock = stockImageCount(doc);

  const rows: { ok: boolean; title: string; detail: string }[] = [
    { ok: true, title: "Mobile ready", detail: "Lays out for phones as well as desktops" },
    { ok: on.length > 0, title: "Agent on every page", detail: `${on.length} ${on.length === 1 ? "capability" : "capabilities"} switched on` },
    {
      ok: capturing,
      title: capturing ? "Lead capture ready" : "No lead capture",
      detail: capturing ? "Details land in Leads" : "Switch on Capture leads to keep the enquiries",
    },
    {
      ok: Boolean(cta && primary),
      title: "Main button connected",
      detail: cta && primary ? `“${cta}” opens ${capabilityDef(primary).label.toLowerCase()}` : "The main button does not open an action",
    },
    ...setup.map((c) => ({ ok: false, title: `${c.label} needs setup`, detail: capabilityState(doc, c.id).note })),
    ...(stock > 0
      ? [
          {
            ok: false,
            title: `${stock} template ${stock === 1 ? "photo" : "photos"}`,
            detail: "Free-licence stand-ins. Swap in your own before you publish — visitors expect your work.",
          },
        ]
      : []),
    { ok: true, title: "Powered by Concierge", detail: "A small signature in the widget and footer" },
  ];

  return (
    <Panel className="p-5">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.title} className="flex items-start gap-3">
            <span
              className={cx(
                "mt-px flex h-5 w-5 shrink-0 items-center justify-center",
                row.ok ? "bg-success-soft text-success" : "bg-review-soft text-review",
              )}
            >
              {row.ok ? <CheckIcon size={11} strokeWidth={2.6} /> : <AlertIcon size={11} />}
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-medium">{row.title}</span>
              <span className="block text-[11.5px] text-text-tertiary">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-divider pt-4 text-[12px] leading-[1.55] text-text-secondary">
        <span className="font-medium text-accent-ink">Your website is ready to respond 24/7.</span> Visitors become
        conversations, and conversations become customers.
      </p>
    </Panel>
  );
}

/* ---- After ------------------------------------------------------------------- */

function Done({
  outcome,
  name,
  siteId,
  editorHref,
  subdomain,
}: {
  outcome: Outcome;
  name: string;
  siteId: string;
  editorHref: string;
  subdomain: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (key: string, text: string) => {
    void navigator.clipboard?.writeText(text).then(() => setCopied(key));
  };

  return (
    <Panel className="cg-enter p-5">
      <span className="flex h-9 w-9 items-center justify-center bg-success text-white">
        <CheckIcon size={17} strokeWidth={2.6} />
      </span>
      <p className="t-section mt-4">{outcome.kind === "embed" ? `${name} is ready to embed` : `${name} is live`}</p>

      {outcome.kind === "live" && (
        <>
          <p className="mt-1 text-[12px] text-text-tertiary">Anyone with the address can see it now. Publishing again replaces it.</p>
          <a
            href={outcome.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center gap-2.5 border border-line-strong bg-surface-subtle p-3 text-[12.5px] font-medium hover:border-ink"
          >
            <GlobeIcon size={15} className="shrink-0 text-text-tertiary" />
            <span className="min-w-0 flex-1 truncate underline underline-offset-2">{outcome.url.replace("https://", "")}</span>
            <ExternalIcon size={13} className="shrink-0 text-text-muted" />
          </a>

          {outcome.domain && (
            <div className="mt-4">
              <p className="text-[12.5px] font-medium">Connect {outcome.domain}</p>
              <p className="mt-1 text-[11.5px] leading-[1.5] text-text-tertiary">
                Add this record where you bought the domain. Until it resolves, the Concierge address keeps working.
              </p>
              <dl className="mt-2.5 grid grid-cols-[64px_minmax(0,1fr)] border border-line-strong text-[11.5px]">
                <dt className="border-b border-divider bg-surface-subtle px-2.5 py-2 text-text-tertiary">Type</dt>
                <dd className="t-mono border-b border-divider px-2.5 py-2">CNAME</dd>
                <dt className="border-b border-divider bg-surface-subtle px-2.5 py-2 text-text-tertiary">Name</dt>
                <dd className="t-mono border-b border-divider px-2.5 py-2">
                  {outcome.domain.split(".").length > 2 ? outcome.domain.split(".")[0] : "@"}
                </dd>
                <dt className="bg-surface-subtle px-2.5 py-2 text-text-tertiary">Value</dt>
                <dd className="t-mono flex items-center gap-2 px-2.5 py-2">
                  <span className="min-w-0 flex-1 truncate">
                    {subdomain}.{PAGES_DOMAIN}
                  </span>
                  <button
                    type="button"
                    aria-label="Copy value"
                    onClick={() => copy("cname", `${subdomain}.${PAGES_DOMAIN}`)}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    {copied === "cname" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                  </button>
                </dd>
              </dl>
            </div>
          )}
        </>
      )}

      {outcome.kind === "embed" && (
        <>
          <p className="mt-1 text-[12px] text-text-tertiary">
            Paste this before the closing <code className="t-mono">&lt;/body&gt;</code> tag on your current site. The agent
            you configured appears on every page.
          </p>
          <pre className="t-mono mt-4 overflow-x-auto whitespace-pre border border-line-strong bg-surface-subtle p-3 text-[11px] leading-[1.6]">
            {installSnippet(siteId)}
          </pre>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            leading={copied === "snippet" ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
            onClick={() => copy("snippet", installSnippet(siteId))}
          >
            {copied === "snippet" ? "Copied" : "Copy snippet"}
          </Button>
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-divider pt-4">
        <LinkButton href={editorHref} leading={<EditIcon size={14} />}>
          Open the editor
        </LinkButton>
        <LinkButton href={`/sites/${siteId}/pages`} variant="secondary" leading={<PagesIcon size={14} />}>
          Go to your site
        </LinkButton>
      </div>
      <p className="mt-3 text-[11.5px] text-text-tertiary">
        Change the page and the agent any time with{" "}
        <Link href={editorHref} className="underline underline-offset-2 hover:text-text-primary">
          Ask Concierge
        </Link>{" "}
        in the editor.
      </p>
    </Panel>
  );
}
