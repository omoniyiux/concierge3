"use client";

import { useState, type ComponentType } from "react";
import { Badge, Button, Card, Field, Input, Panel, SectionHead, Textarea } from "@/components/ui";
import { Modal, ModalSection, StepList } from "@/components/ui/Modal";
import {
  CustomHtmlLogo,
  ShopifyLogo,
  SquarespaceLogo,
  WebflowLogo,
  WixLogo,
  WordPressLogo,
} from "@/components/integrations/BrandLogos";
import { CheckIcon, CodeIcon, CopyIcon, MailIcon, RefreshIcon, ShieldIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import type { Site } from "@/lib/types";

/* ============================================================================
   GETTING THE SCRIPT ONTO THE SITE
   ----------------------------------------------------------------------------
   This is where signups die. Setup ends with "paste this before the closing
   body tag", and a great many owners cannot do that — they do not have the
   login, or the site was built by a nephew four years ago.

   So the snippet is no longer the first offer. The first offer is the app for
   whatever the site is built with, because an owner who can install a plugin
   from their own dashboard does not need us at all. Then handing it to
   someone who can. Then, last, the snippet.
   ========================================================================== */

type PlatformKey = NonNullable<Site["platform"]>;

const PLATFORM: Record<
  PlatformKey,
  {
    label: string;
    Logo: ComponentType<{ size?: number; className?: string }>;
    /** Whether there is a one-click app in that platform's own store. */
    app: boolean;
    storeName: string;
    steps: string[];
  }
> = {
  wordpress: {
    label: "WordPress",
    Logo: WordPressLogo,
    app: true,
    storeName: "the WordPress plugin directory",
    steps: [
      "Open Plugins → Add New in your WordPress dashboard.",
      "Search for “Concierge” and choose Install, then Activate.",
      "Paste the site key below when the plugin asks for it.",
      "That is it — the launcher appears on every page.",
    ],
  },
  shopify: {
    label: "Shopify",
    Logo: ShopifyLogo,
    app: true,
    storeName: "the Shopify App Store",
    steps: [
      "Open the Concierge listing in the Shopify App Store.",
      "Choose Install app and approve the permissions it asks for.",
      "Pick the theme it should appear on — usually your live one.",
      "Concierge reads your products and policies automatically.",
    ],
  },
  webflow: {
    label: "Webflow",
    Logo: WebflowLogo,
    app: true,
    storeName: "the Webflow Apps marketplace",
    steps: [
      "Open Apps in the Webflow designer and find Concierge.",
      "Authorise it for this project.",
      "Publish the site — apps only run on published domains.",
    ],
  },
  squarespace: {
    label: "Squarespace",
    Logo: SquarespaceLogo,
    app: false,
    storeName: "code injection",
    steps: [
      "Go to Settings → Advanced → Code injection.",
      "Paste the snippet into the Footer field and save.",
      "Code injection needs a Business plan or above.",
    ],
  },
  wix: {
    label: "Wix",
    Logo: WixLogo,
    app: true,
    storeName: "the Wix App Market",
    steps: [
      "Open the Wix App Market from your dashboard and find Concierge.",
      "Add to site, then approve the permissions.",
      "Publish the site.",
    ],
  },
  custom: {
    label: "a custom site",
    Logo: CustomHtmlLogo,
    app: false,
    storeName: "your own template",
    steps: [
      "Paste the snippet before the closing body tag in your base template.",
      "Deploy as normal — the script is async and adds nothing to your critical path.",
      "Allow cdn.poweredbyconcierge.com in your CSP if you run one.",
    ],
  },
};

export function InstallHub({ site, snippet }: { site: Site; snippet: string }) {
  const platform = PLATFORM[site.platform ?? "custom"];
  const [route, setRoute] = useState<"app" | "snippet" | "handoff" | null>(null);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState<null | "found" | "missing">(null);
  const [copied, setCopied] = useState(false);
  const detected = site.installState === "detected";

  function copy(text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      {/* What we already know about the site ----------------------------- */}
      <Card className={cx("p-5 sm:p-6", detected ? "border-success-line bg-success-soft/40" : "")}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-surface">
            <platform.Logo size={24} />
          </span>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="t-card">
                {detected ? "Concierge is on your website" : `${site.url} is built with ${platform.label}`}
              </p>
              {detected && <Badge tone="approved">Answering</Badge>}
            </div>
            <p className="t-body-sm mt-1 text-text-tertiary">
              {detected
                ? `Detected on ${site.url}. You never need to touch the script again — everything updates live.`
                : `We detected ${platform.label} when we read your site, so the quickest route is ${platform.app ? `the app in ${platform.storeName}` : platform.storeName}.`}
            </p>
            {checked && (
              <p
                className={cx(
                  "cg-enter mt-2 flex items-center gap-1.5 text-[12px] font-medium",
                  checked === "found" ? "text-success" : "text-warning",
                )}
              >
                <CheckIcon size={12} strokeWidth={2.4} />
                {checked === "found"
                  ? "Checked just now — the script answered."
                  : "Checked just now — still not finding it. Give it a minute after publishing."}
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            loading={checking}
            leading={<RefreshIcon size={13} />}
            onClick={() => {
              setChecking(true);
              setChecked(null);
              setTimeout(() => {
                setChecking(false);
                setChecked(detected ? "found" : "missing");
              }, 1100);
            }}
          >
            Check now
          </Button>
        </div>
      </Card>

      {/* Three ways in, easiest first ------------------------------------ */}
      <Panel className="p-5 sm:p-6">
        <SectionHead
          title={detected ? "Other ways to install" : "Three ways to get it live"}
          hint="Pick whichever matches how your website gets changed. They all end in the same place."
          className="mb-4"
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <RouteCard
            title={platform.app ? `Install the ${platform.label} app` : `Add it in ${platform.label}`}
            detail={
              platform.app
                ? `One click from ${platform.storeName}. No code, no developer, nothing to paste.`
                : `Four short steps in your own dashboard. Nothing to install.`
            }
            badge={platform.app ? "Easiest" : "Recommended"}
            Icon={platform.Logo}
            onClick={() => setRoute("app")}
          />
          <RouteCard
            title="Send it to whoever runs the site"
            detail="We write the brief: what to paste, where it goes, and what it must not break."
            badge="No access needed"
            Icon={MailIcon}
            onClick={() => setRoute("handoff")}
          />
          <RouteCard
            title="Paste the snippet yourself"
            detail="One line before the closing body tag. You never replace it."
            Icon={CodeIcon}
            onClick={() => setRoute("snippet")}
          />
        </div>
      </Panel>

      {/* ---- The app route ---------------------------------------------- */}
      <Modal
        open={route === "app"}
        onClose={() => setRoute(null)}
        eyebrow="Install"
        title={platform.app ? `Install the ${platform.label} app` : `Add Concierge in ${platform.label}`}
        description={
          platform.app
            ? `The app is listed in ${platform.storeName}. It installs the script, keeps it updated, and removes it cleanly if you ever uninstall.`
            : `${platform.label} has no app store for this, so it is four steps in your own dashboard.`
        }
        footer={
          <>
            <Button variant="tertiary" onClick={() => setRoute(null)}>
              Close
            </Button>
            {platform.app && (
              <Button
                onClick={() => {
                  setRoute(null);
                  setChecking(true);
                  setTimeout(() => {
                    setChecking(false);
                    setChecked(detected ? "found" : "missing");
                  }, 1200);
                }}
              >
                I have installed it
              </Button>
            )}
          </>
        }
      >
        <ModalSection>
          <StepList steps={platform.steps} done={0} />
        </ModalSection>
        <ModalSection title="Your site key" hint="The app asks for this once.">
          <div className="flex flex-wrap items-center gap-2 border border-line-strong bg-surface-subtle px-3.5 py-3">
            <code className="t-mono min-w-0 flex-1 break-all">{site.id}</code>
            <Button size="sm" variant="secondary" leading={<CopyIcon size={13} />} onClick={() => copy(site.id)}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </ModalSection>
      </Modal>

      {/* ---- The handoff route ------------------------------------------ */}
      <HandoffModal
        open={route === "handoff"}
        onClose={() => setRoute(null)}
        site={site}
        snippet={snippet}
      />

      {/* ---- The snippet route ------------------------------------------ */}
      <Modal
        open={route === "snippet"}
        onClose={() => setRoute(null)}
        eyebrow="Install"
        title="Paste this once"
        description="Before the closing body tag, on every page. Appearance, knowledge and routing all update live — the script never changes."
        footer={
          <Button onClick={() => setRoute(null)} leading={<CheckIcon size={13} />}>
            Done
          </Button>
        }
      >
        <ModalSection>
          <div className="border border-line-strong">
            <div className="flex items-center gap-2 border-b border-divider px-3.5 py-2">
              <p className="t-eyebrow text-text-muted">HTML</p>
              <Button
                size="sm"
                variant="tertiary"
                className="ml-auto"
                leading={<CopyIcon size={13} />}
                onClick={() => copy(snippet)}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="t-mono overflow-x-auto bg-surface-subtle p-4 leading-[1.7] text-text-secondary">
              {snippet}
            </pre>
          </div>
        </ModalSection>
        <p className="mt-5 flex items-start gap-2.5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
          <ShieldIcon size={14} className="mt-px shrink-0 text-text-tertiary" />
          The script is async and adds nothing to your critical path. It reads nothing behind a login and
          sets no third-party cookies.
        </p>
      </Modal>
    </>
  );
}

function RouteCard({
  title,
  detail,
  badge,
  Icon,
  onClick,
}: {
  title: string;
  detail: string;
  badge?: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-full flex-col border border-line-strong bg-surface p-4 text-left transition-colors hover:border-ink"
    >
      <div className="flex items-center gap-2.5">
        <Icon size={20} className="shrink-0 text-text-secondary" />
        {badge && (
          <span className="ml-auto">
            <Badge tone="accent">{badge}</Badge>
          </span>
        )}
      </div>
      <p className="t-card mt-3.5">{title}</p>
      <p className="t-body-sm mt-2 leading-[1.5] text-text-tertiary">{detail}</p>
    </button>
  );
}

/** The brief that goes to whoever actually has the keys. */
function HandoffModal({
  open,
  onClose,
  site,
  snippet,
}: {
  open: boolean;
  onClose: () => void;
  site: Site;
  snippet: string;
}) {
  const [to, setTo] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const brief = `Hi,

Please add this one line to ${site.url}, immediately before the closing </body> tag, on every page:

${snippet}

It is an async script — it will not slow the site down, it sets no third-party cookies, and it reads nothing behind a login. Nothing else needs to change, now or later: all configuration happens outside the site.

Once it is live, reply here and I will confirm it is answering.

Thanks`;

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to.trim());

  return (
    <Modal
      open={open}
      onClose={() => {
        setSent(false);
        onClose();
      }}
      eyebrow="Install"
      title={sent ? "Sent" : "Send it to whoever runs the site"}
      description={
        sent
          ? `${to} has the instructions. We will watch ${site.url} and tell you the moment the script answers — you do not need to check.`
          : "Most owners do not paste scripts themselves, and that is fine. This is the whole brief, written so nobody has to ask a follow-up question."
      }
      footer={
        sent ? (
          <Button
            onClick={() => {
              setSent(false);
              onClose();
            }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              loading={sending}
              disabled={!valid}
              leading={<MailIcon size={13} />}
              onClick={() => {
                setSending(true);
                setTimeout(() => {
                  setSending(false);
                  setSent(true);
                }, 700);
              }}
            >
              Send instructions
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <ModalSection>
          <div className="flex items-start gap-3 border border-success-line bg-success-soft p-4">
            <CheckIcon size={16} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
            <p className="text-[12.5px] leading-[1.5] text-text-secondary">
              We check {site.url} every few minutes. The moment the script answers, you and {to} both get a
              note — and this page turns green.
            </p>
          </div>
        </ModalSection>
      ) : (
        <>
          <ModalSection>
            <Field
              label="Their email"
              htmlFor="handoff-to"
              hint="Your web developer, the agency that built it, or whoever has the login."
            >
              <Input
                id="handoff-to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="dev@agency.com"
              />
            </Field>
          </ModalSection>
          <ModalSection title="What they will get" hint="Edit it if you want to say it differently.">
            <Textarea defaultValue={brief} className="min-h-[200px]" aria-label="Instructions" />
          </ModalSection>
        </>
      )}
    </Modal>
  );
}
