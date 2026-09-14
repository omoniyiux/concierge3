"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteMark, ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { SiteStatusBadge } from "@/components/shell/SiteSwitcher";
import { StickerStats } from "@/components/ui/StickerStats";
import {
  Badge,
  Button,
  Card,
  LinkButton,
  Panel,
  SearchInput,
  SegmentedControl,
} from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui";
import { ArrowRight, ChevronLeft, PlusIcon } from "@/components/icons";
import { LiveSticker, SalesSticker, AlertSticker, ContactSticker } from "@/components/stickers";
import { cx } from "@/lib/cx";
import {
  ORG,
  brainFor,
  conversationsFor,
  destinationsFor,
  gapsFor,
  ledgerFor,
} from "@/lib/demo-data";
import { launchChecklist, launchProgress, siteHealth, HEALTH_COPY } from "@/lib/health";
import { createAgentSite, useWorld } from "@/lib/sim/store";
import { siteIdFor, tidyUrl } from "@/lib/onboarding";
import { money } from "@/lib/format";

/* ============================================================================
   THE PORTFOLIO
   ----------------------------------------------------------------------------
   An agency does not have one site, it has twenty, and the question it opens
   the morning with is "which of these needs me today" — not "how did
   Northlane do". Until now the product could only be entered one site at a
   time, which is exactly why `isAgency` sat in the model unused.

   This is the other door: every site on one page, sorted by what is wrong
   with it, with the money each one returned beside it.
   ========================================================================== */

type Sort = "attention" | "value" | "name";

export default function PortfolioPage() {
  const [sort, setSort] = useState<Sort>("attention");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  // Every site in the world, including ones added through setup. This list is
  // the first place an owner looks after connecting a website, and it used to
  // show only the four fixtures however many they had added.
  const sites = useWorld().sites;

  const rows = useMemo(() => {
    const built = sites.map((site) => {
      const brain = brainFor(site.id);
      const destinations = destinationsFor(site.id);
      const conversations = conversationsFor(site.id);
      const health = siteHealth({
        site,
        brain,
        destinations,
        conversations,
        gaps: gapsFor(site.id).filter((g) => g.status === "open"),
        siteId: site.id,
      });
      const steps = launchChecklist(site, brain, destinations, site.id);
      const ledger = ledgerFor(site.id);
      return {
        site,
        health,
        progress: launchProgress(steps),
        live: steps.every((s) => s.done),
        conversations: conversations.length,
        ledger,
      };
    });

    const q = query.trim().toLowerCase();
    const filtered = q
      ? built.filter((r) => `${r.site.name} ${r.site.url}`.toLowerCase().includes(q))
      : built;

    return [...filtered].sort((a, b) => {
      if (sort === "value") return b.ledger.confirmedValue - a.ledger.confirmedValue;
      if (sort === "name") return a.site.name.localeCompare(b.site.name);
      return a.health.score - b.health.score;
    });
    // `sites` belongs here: without it the list is computed once and a site
    // added while this page is open never appears, which is the whole bug.
  }, [sites, sort, query]);

  const needing = rows.filter((r) => r.health.band !== "healthy").length;
  const confirmed = rows.reduce((n, r) => n + r.ledger.confirmedValue, 0);
  const conversations = rows.reduce((n, r) => n + r.conversations, 0);

  return (
    <main className="cg-scroll h-dvh overflow-y-auto bg-canvas">
      <div
        style={{ maxWidth: "var(--content-max)" }}
        className="mx-auto w-full px-5 pb-24 pt-16 sm:px-7 lg:px-9"
      >
        {/* This page has no rail, so without this there is no way out of it
            except the browser's own Back — and no way back to the site you
            were working in. */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <Link href="/" aria-label="Concierge home">
            <ConciergeWordmark />
          </Link>
          <BackToSite />
        </div>

        <header className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="min-w-0 max-w-[58ch]">
            <p className="t-eyebrow text-text-muted">{ORG.isAgency ? "Agency" : "Workspace"}</p>
            <h1 className="t-page mt-2.5">{ORG.name}</h1>
            <p className="t-body mt-3 text-text-primary">
              {ORG.isAgency
                ? "Every client site in one place, sorted by what needs you first."
                : "Every site in this workspace, sorted by what needs you first."}
            </p>
          </div>
          <Button leading={<PlusIcon size={15} />} onClick={() => setAdding(true)}>
            {ORG.isAgency ? "Add a client" : "Add a site"}
          </Button>
        </header>

        <div className="mt-8">
          <StickerStats
            columns={4}
            items={[
              {
                Sticker: LiveSticker,
                value: `${rows.filter((r) => r.live).length}/${rows.length}`,
                label: "Live",
                detail: "Answering visitors now",
              },
              {
                Sticker: AlertSticker,
                value: needing,
                label: "Need attention",
                detail: "Something has drifted or stopped",
                tone: needing > 0 ? "text-warning" : undefined,
              },
              {
                Sticker: ContactSticker,
                value: conversations,
                label: "Conversations",
                detail: "Across every site this period",
              },
              {
                Sticker: SalesSticker,
                value: money(confirmed, "USD"),
                label: "Confirmed",
                detail: "Settled money, not projected",
              },
            ]}
          />
        </div>

        <div className="mb-4 mt-8 flex flex-wrap items-center gap-3">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sites"
            aria-label="Search sites"
            className="min-w-[200px] flex-1 sm:max-w-[280px]"
          />
          <SegmentedControl
            label="Sort sites"
            value={sort}
            onChange={setSort}
            options={[
              { value: "attention", label: "Needs me first" },
              { value: "value", label: "By return" },
              { value: "name", label: "A–Z" },
            ]}
          />
        </div>

        <Panel className="divide-y divide-divider">
          {rows.map(({ site, health, progress, live, conversations: count, ledger }) => (
            <div key={site.id} className="flex flex-wrap items-center gap-x-5 gap-y-4 p-5 sm:p-6">
              <SiteMark name={site.name} size={38} />

              <div className="min-w-[190px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/sites/${site.id}/overview`}
                    className="text-[13px] font-semibold transition-colors hover:text-accent-ink"
                  >
                    {site.name}
                  </Link>
                  <SiteStatusBadge site={site} />
                </div>
                <p className="mt-1 truncate text-[12px] text-text-tertiary">{site.url}</p>
                {!live && (
                  <p className="mt-1.5 text-[11.5px] text-text-secondary">
                    Setting up · {progress}% complete
                  </p>
                )}
              </div>

              <div className="w-[136px]">
                <p className="t-eyebrow text-text-muted">Health</p>
                <p
                  className={cx(
                    "mt-1.5 text-[12.5px] font-medium",
                    health.band === "healthy"
                      ? "text-success"
                      : health.band === "watch"
                        ? "text-warning"
                        : "text-danger",
                  )}
                >
                  {HEALTH_COPY[health.band].label}
                </p>
                {health.headline && (
                  <p className="mt-1 line-clamp-2 text-[11.5px] leading-[1.4] text-text-tertiary">
                    {health.headline.title}
                  </p>
                )}
              </div>

              <div className="w-[96px]">
                <p className="t-eyebrow text-text-muted">Chats</p>
                <p className="t-num mt-1.5 text-[15px] leading-none">{count}</p>
              </div>

              <div className="w-[116px]">
                <p className="t-eyebrow text-text-muted">Confirmed</p>
                <p className="t-num mt-1.5 text-[15px] leading-none">
                  {money(ledger.confirmedValue, site.currency)}
                </p>
              </div>

              <LinkButton
                href={`/sites/${site.id}/overview`}
                size="sm"
                variant={health.band === "at-risk" ? "primary" : "secondary"}
                trailing={<ArrowRight size={13} />}
              >
                Open
              </LinkButton>
            </div>
          ))}
        </Panel>

        {ORG.isAgency && (
          <Card className="mt-6 flex flex-wrap items-center gap-4 p-5">
            <Badge tone="accent">Agency</Badge>
            <p className="min-w-0 flex-1 text-[12.5px] leading-[1.5] text-text-secondary">
              Reports, emails and the launcher can all carry your brand rather than ours.
            </p>
            <LinkButton
              href={`/sites/${sites[0].id}/settings?section=agency`}
              variant="secondary"
              size="sm"
              trailing={<ArrowRight size={13} />}
            >
              Agency settings
            </LinkButton>
          </Card>
        )}
      </div>

      <AddSiteModal open={adding} onClose={() => setAdding(false)} />
    </main>
  );
}

function AddSiteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const sites = useWorld().sites;
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [product, setProduct] = useState("agent");
  const [working, setWorking] = useState(false);

  const host = tidyUrl(url);
  const valid = name.trim().length > 1 && host !== null;

  /**
   * This used to run a 700ms spinner, clear the fields and close — so adding a
   * site looked like it worked and left no site behind. A Pages site needs a
   * starter and a document, so that product hands off to the flow that builds
   * them rather than half-creating one here.
   */
  function addSite() {
    if (!host) return;
    setWorking(true);
    if (product === "pages") {
      router.push("/onboarding/pages");
      return;
    }
    const id = siteIdFor(host);
    createAgentSite({ id, name: name.trim(), url: host });
    onClose();
    setName("");
    setUrl("");
    setWorking(false);
    router.push(`/sites/${id}/overview`);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow={ORG.isAgency ? "Add a client" : "Add a site"}
      title={ORG.isAgency ? "Set up a new client" : "Add another site"}
      description={`${sites.length} of ${ORG.siteLimit} sites used on the ${ORG.plan} plan. Concierge reads the website first, and nothing goes live until you approve what it learned.`}
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={working}
            disabled={!valid}
            onClick={addSite}
          >
            Start reading the site
          </Button>
        </>
      }
    >
      <ModalSection>
        <div className="grid gap-4">
          <Field label="Business name" htmlFor="new-site-name">
            <Input
              id="new-site-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Riverside Physio"
            />
          </Field>
          <Field
            label="Website"
            htmlFor="new-site-url"
            hint="Concierge reads the public pages only, and never anything behind a login."
          >
            <Input
              id="new-site-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="riversidephysio.com"
            />
          </Field>
          <Field label="Product" htmlFor="new-site-product">
            <Select id="new-site-product" value={product} onChange={(e) => setProduct(e.target.value)}>
              <option value="agent">Concierge Agent — on their existing website</option>
              <option value="pages">Concierge Pages — a hosted site with the Agent included</option>
            </Select>
          </Field>
        </div>
      </ModalSection>
    </Modal>
  );
}

/**
 * Back to wherever you came from, and only when there is a there to go back
 * to — landing on /sites directly should not offer a Back that does nothing.
 * History length can only be read on the client, so it is read after mount.
 */
const NO_SUBSCRIBE = () => () => {};

function BackToSite() {
  const router = useRouter();
  // A client-only fact, read the way client-only facts are meant to be read:
  // false on the server and on the first paint, so hydration matches, then the
  // real answer. No setState in an effect, and nothing to re-render on.
  const canGoBack = useSyncExternalStore(
    NO_SUBSCRIBE,
    () => window.history.length > 1,
    () => false,
  );

  if (!canGoBack) return null;
  return (
    <Button variant="tertiary" size="sm" leading={<ChevronLeft size={15} />} onClick={() => router.back()}>
      Back
    </Button>
  );
}
