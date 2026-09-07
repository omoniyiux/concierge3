"use client";

import { useState, type ComponentType } from "react";
import { Button, Panel, SectionHead } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { ArrowRight, CheckIcon, ClockIcon, CopyIcon } from "@/components/icons";
import {
  CustomHtmlLogo,
  ShopifyLogo,
  SquarespaceLogo,
  WebflowLogo,
  WixLogo,
  WordPressLogo,
} from "@/components/integrations/BrandLogos";

/* ============================================================================
   PLATFORM GUIDES
   Six cards, each carrying the platform's own mark — an owner finds their
   website by recognising the logo, not by reading six names in a grid. Each
   one opens the actual steps, because a card that says "2 minute guide" and
   then does nothing is worse than no card at all.
   ========================================================================== */

export type Guide = {
  name: string;
  Logo: ComponentType<{ size?: number; className?: string }>;
  minutes: number;
  where: string;
  steps: string[];
};

export const GUIDES: Guide[] = [
  {
    name: "WordPress",
    Logo: WordPressLogo,
    minutes: 2,
    where: "Appearance → Theme File Editor, or any header/footer plugin",
    steps: [
      "In your dashboard, open Appearance → Theme File Editor and select footer.php.",
      "Paste the snippet immediately before the closing </body> tag.",
      "Update the file. If your theme is managed, use a plugin like WPCode and paste it into the Footer box instead.",
      "Load your site in a new tab — the launcher appears bottom right within a few seconds.",
    ],
  },
  {
    name: "Shopify",
    Logo: ShopifyLogo,
    minutes: 2,
    where: "Online Store → Themes → Edit code → theme.liquid",
    steps: [
      "From admin, go to Online Store → Themes and choose Edit code on your live theme.",
      "Open layout/theme.liquid.",
      "Paste the snippet just above </body> and save.",
      "Preview the storefront. Concierge reads your product and policy pages automatically on first load.",
    ],
  },
  {
    name: "Webflow",
    Logo: WebflowLogo,
    minutes: 2,
    where: "Project settings → Custom code → Footer code",
    steps: [
      "Open Project settings → Custom code.",
      "Paste the snippet into Footer code (before </body>).",
      "Save changes, then publish the site — custom code only runs on published domains.",
      "Open the published URL to confirm the launcher is there.",
    ],
  },
  {
    name: "Squarespace",
    Logo: SquarespaceLogo,
    minutes: 2,
    where: "Settings → Advanced → Code injection",
    steps: [
      "Go to Settings → Advanced → Code injection.",
      "Paste the snippet into the Footer field.",
      "Save. Code injection requires a Business plan or above on Squarespace.",
      "Reload your site in a private window to see it as a visitor would.",
    ],
  },
  {
    name: "Wix",
    Logo: WixLogo,
    minutes: 2,
    where: "Settings → Custom code → Add custom code",
    steps: [
      "Open Settings → Custom code from your Wix dashboard.",
      "Choose Add custom code and paste the snippet.",
      "Set it to load on All pages, and place it in Body — end.",
      "Apply, then publish the site.",
    ],
  },
  {
    name: "Custom HTML",
    Logo: CustomHtmlLogo,
    minutes: 1,
    where: "Your own template, before </body>",
    steps: [
      "Paste the snippet into your base template, immediately before the closing </body> tag.",
      "Deploy as you normally would — the script is async and adds nothing to your critical path.",
      "If you run a Content Security Policy, allow cdn.poweredbyconcierge.com as a script-src.",
      "Hit your site and confirm the launcher renders.",
    ],
  },
];

export function InstallGuides({ snippet }: { snippet: string }) {
  const [open, setOpen] = useState<Guide | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <Panel className="p-5 sm:p-6">
      <SectionHead title="Platform guides" hint="Step-by-step for the usual suspects." className="mb-4" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GUIDES.map((g) => (
          <button
            key={g.name}
            type="button"
            onClick={() => setOpen(g)}
            className="group flex items-center gap-3 border border-line-strong bg-surface p-3.5 text-left transition-colors hover:border-ink"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-subtle">
              <g.Logo size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-medium">{g.name}</span>
              <span className="mt-0.5 flex items-center gap-1 text-[11.5px] text-text-tertiary">
                <ClockIcon size={11} />
                {g.minutes} minute guide
              </span>
            </span>
            <ArrowRight
              size={14}
              className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5"
            />
          </button>
        ))}
      </div>

      <Modal
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        eyebrow="Install"
        title={open ? `Add Concierge to ${open.name}` : ""}
        description={open?.where}
        footer={
          <Button onClick={() => setOpen(null)} leading={<CheckIcon size={13} />}>
            Done
          </Button>
        }
      >
        {open && (
          <>
            <ModalSection title="Your snippet">
              <div className="border border-line-strong">
                <div className="flex items-center gap-2 border-b border-divider px-3.5 py-2">
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
                <pre className="t-mono overflow-x-auto bg-surface-subtle p-4 leading-[1.7] text-text-secondary">
                  {snippet}
                </pre>
              </div>
            </ModalSection>

            <ModalSection title={`${open.steps.length} steps`}>
              <ol className="space-y-3">
                {open.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center bg-ink text-[10px] font-semibold tabular-nums text-text-inverse">
                      {i + 1}
                    </span>
                    <span className="text-[12.5px] leading-[1.55]">{s}</span>
                  </li>
                ))}
              </ol>
            </ModalSection>

            <p className="mt-5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
              You only ever paste this once. Appearance, knowledge and routing all update live from here — the
              script never needs replacing.
            </p>
          </>
        )}
      </Modal>
    </Panel>
  );
}
