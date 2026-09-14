"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
  Panel,
  SectionHead,
  Spinner,
} from "@/components/ui";
import { AgentIcon, CheckIcon, ChevronLeft, GlobeIcon, PagesIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { ORG, SITES } from "@/lib/demo-data";
import { dispatch } from "@/lib/pages-editor";
import { createSite } from "@/lib/sim/store";
import { PAGES_DOMAIN, checkSubdomainShape, suggestSubdomain } from "@/lib/publishing.client";
import { STARTERS, buildDocument, type Starter } from "@/lib/starters";
import { checkSubdomain } from "@/server/publish-actions";

/* ============================================================================
   NEW CONCIERGE PAGES
   ----------------------------------------------------------------------------
   Four questions: what the business is called, what kind of business it is,
   where it should live, and whether there is an existing site worth learning
   from. Everything else an owner might be asked here is a decision they will
   make better once they can see a page, so it waits for the editor.

   The starter is the load-bearing answer. It decides which pages exist, which
   sections are on them, and what the Agent will be asked to do — none of which
   a blank canvas can prompt for.
   ========================================================================== */

const newSiteId = () => `site_${crypto.randomUUID().slice(0, 8)}`;

export default function NewPagesSite() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [starterId, setStarterId] = useState(STARTERS[0].id);
  const [subdomain, setSubdomain] = useState("");
  const [touchedSubdomain, setTouchedSubdomain] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverProblem, setServerProblem] = useState<string | null>(null);

  const starter = STARTERS.find((s) => s.id === starterId) ?? STARTERS[0];

  /* The address follows the name until the owner takes it over. Editing it
     once should stop it being rewritten under their cursor. */
  const effectiveSubdomain = touchedSubdomain ? subdomain : suggestSubdomain(businessName);
  const shape = checkSubdomainShape(effectiveSubdomain);
  const subdomainProblem =
    effectiveSubdomain.length === 0 ? null : shape.ok ? serverProblem : shape.reason;

  const namedOk = businessName.trim().length > 1;
  const ready = namedOk && effectiveSubdomain.length > 0 && subdomainProblem === null && confirmed;

  const pageCount = useMemo(() => starter.pages.length, [starter]);

  const start = async () => {
    setBusy(true);
    setServerProblem(null);

    const siteId = newSiteId();
    const taken = await checkSubdomain({ siteId, subdomain: effectiveSubdomain });
    if (taken.ok === false) {
      setServerProblem(taken.reason ?? "That address will not work.");
      setBusy(false);
      return;
    }

    const document = buildDocument({ starter, siteId, businessName: businessName.trim() });
    const site = {
      id: siteId,
      subdomain: effectiveSubdomain,
      name: businessName.trim(),
      url: `${effectiveSubdomain}.${PAGES_DOMAIN}`,
      /* Mon–Fri, nine to five, until the owner says otherwise in settings. */
      openingHours: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        days: [null, ...Array(5).fill({ opens: 540, closes: 1020 }), null],
      },
    };

    /* The site has to exist in the world before we navigate into it. Loading
       the editor alone was not enough: the workspace only knew about the
       fixture sites, so the URL this flow pushes to answered 404. */
    createSite(site, document);
    dispatch({ type: "load", doc: document, site });

    router.push(`/sites/${siteId}/pages/${document.pages[0].id}/edit`);
  };

  return (
    <div
      style={{ maxWidth: "var(--content-max)" }}
      className="mx-auto w-full px-5 pb-24 pt-16 sm:px-7 lg:px-9"
    >
      {/* A dead end otherwise: this flow is reached from the site list and from
          the Pages surface, and had no way back to either. */}
      <Link
        href="/sites"
        className="mb-7 inline-flex items-center gap-1.5 text-[12.5px] text-text-tertiary transition-colors hover:text-text-primary"
      >
        <ChevronLeft size={15} />
        All sites
      </Link>

      <header className="mb-8">
        <p className="t-eyebrow text-text-muted">Concierge Pages</p>
        <h1 className="t-page mt-2.5">Create a Pages site</h1>
        <p className="t-body mt-3 max-w-[62ch] text-text-primary">
          A hosted website with the Agent already on it, for a business that does not have a site yet.
          You can change everything once it is built.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* The form ------------------------------------------------------- */}
        <div className="min-w-0 space-y-4">
          <Panel className="p-6">
            <SectionHead
              title="The business"
              hint="Name it the way customers say it, not the way it is registered."
              className="mb-4"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name" htmlFor="business-name" className="sm:col-span-2">
                <Input
                  id="business-name"
                  value={businessName}
                  placeholder="Atlas Moving Co."
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </Field>

              <Field
                label="Existing website"
                htmlFor="source-url"
                hint="Only if there is one worth learning from. Leave it blank to start fresh."
                className="sm:col-span-2"
              >
                <Input
                  id="source-url"
                  value={sourceUrl}
                  placeholder="https://current-site.com"
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </Field>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHead
              title="What kind of business"
              hint="This sets the starting pages. Nothing here is locked in."
              className="mb-4"
            />
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {STARTERS.map((option) => (
                <li key={option.id}>
                  <StarterCard
                    starter={option}
                    selected={option.id === starterId}
                    onSelect={() => setStarterId(option.id)}
                  />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-6">
            <SectionHead
              title="The address"
              hint="You can point your own domain at it later."
              className="mb-4"
            />
            <Field
              label="Web address"
              htmlFor="subdomain"
              error={subdomainProblem ?? undefined}
              hint={
                subdomainProblem === null && effectiveSubdomain.length > 0
                  ? `Visitors will go to ${effectiveSubdomain}.${PAGES_DOMAIN}`
                  : undefined
              }
            >
              <div className="flex items-stretch">
                <Input
                  id="subdomain"
                  value={effectiveSubdomain}
                  placeholder="yourbusiness"
                  spellCheck={false}
                  autoCapitalize="none"
                  onChange={(e) => {
                    setTouchedSubdomain(true);
                    setServerProblem(null);
                    setSubdomain(e.target.value.toLowerCase().trim());
                  }}
                />
                <span className="flex shrink-0 items-center border border-l-0 border-line-strong bg-surface-subtle px-3 text-[12px] text-text-tertiary">
                  .{PAGES_DOMAIN}
                </span>
              </div>
            </Field>
          </Panel>

          <Panel className="p-6">
            <Checkbox
              checked={confirmed}
              onChange={setConfirmed}
              label="I own this business, or I am authorised to set it up"
              description="Concierge will not answer a visitor until you have approved what it may say."
            />

            {serverProblem !== null && (
              <p className="mt-3 text-[12.5px] text-danger">{serverProblem}</p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button disabled={!ready || busy} onClick={() => void start()}>
                {busy ? "Building…" : "Build the site"}
              </Button>
              {busy && <Spinner size={14} />}
              <span className="text-[11.5px] text-text-tertiary">
                {ready
                  ? `${pageCount} page${pageCount === 1 ? "" : "s"} will open in the editor.`
                  : "Name the business, pick an address and confirm to continue."}
              </span>
            </div>
          </Panel>
        </div>

        {/* What happens next ---------------------------------------------- */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Panel className="p-5">
            <p className="t-eyebrow mb-3 text-text-muted">You are building</p>
            <p className="text-[13px] font-medium">{starter.name}</p>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-text-tertiary">
              {starter.description}
            </p>

            <p className="t-eyebrow mb-2 mt-5 text-text-muted">Starts with</p>
            <ul className="flex flex-wrap gap-1.5">
              {starter.pages.map((page) => (
                <li key={page.slug}>
                  <span className="inline-flex items-center gap-1.5 border border-line-strong px-2 py-1 text-[11.5px]">
                    <PagesIcon size={12} className="text-text-tertiary" />
                    {page.title}
                  </span>
                </li>
              ))}
            </ul>

            <p className="t-eyebrow mb-2 mt-5 text-text-muted">Concierge will help with</p>
            <ul className="space-y-1.5">
              {starter.helpsWith.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[12.5px] leading-[1.5]">
                  <AgentIcon size={13} className="mt-0.5 shrink-0 text-text-tertiary" />
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <p className="t-eyebrow mb-3 text-text-muted">Then</p>
            <ol className="space-y-2.5">
              {[
                "Edit the pages until they read like you.",
                "Publish, and the address goes live immediately.",
                "Approve what the Agent may say before it answers anyone.",
              ].map((step, i) => (
                <li key={step} className="flex items-start gap-2.5 text-[12.5px] leading-[1.5]">
                  <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center bg-surface-sunken text-[10px] font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </Panel>

          <Panel className="p-5">
            <p className="flex items-center gap-2 text-[12.5px] font-medium">
              <GlobeIcon size={14} className="text-text-tertiary" />
              Already have a website?
            </p>
            <p className="mt-1.5 text-[12.5px] leading-[1.55] text-text-tertiary">
              Add the Agent to it instead — no rebuild, one tag.
            </p>
            <Link
              href="/onboarding"
              className="mt-3 inline-block text-[12.5px] underline underline-offset-2 hover:text-text-primary"
            >
              Add Concierge to an existing site
            </Link>
          </Panel>

          <p className="px-1 text-[11.5px] text-text-tertiary">
            {ORG.name} is using {SITES.length} of {ORG.siteLimit} sites.
          </p>
        </aside>
      </div>
    </div>
  );
}

/** One trade. The category line does most of the choosing. */
function StarterCard({
  starter,
  selected,
  onSelect,
}: {
  starter: Starter;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        "flex h-full w-full flex-col border p-3.5 text-left transition-colors",
        selected
          ? "border-ink bg-surface-subtle"
          : "border-line-strong hover:border-line-hover hover:bg-surface-subtle",
      )}
    >
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="block text-[12.5px] font-medium">{starter.name}</span>
          <span className="mt-0.5 block text-[11.5px] leading-[1.45] text-text-tertiary">
            {starter.category}
          </span>
        </span>
        {selected && <CheckIcon size={14} strokeWidth={2.4} className="mt-0.5 shrink-0" />}
      </span>
      <span className="mt-2.5">
        <Badge tone="neutral">
          {starter.pages.length} page{starter.pages.length === 1 ? "" : "s"}
        </Badge>
      </span>
    </button>
  );
}
