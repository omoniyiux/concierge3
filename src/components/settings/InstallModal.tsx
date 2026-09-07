"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { CheckIcon, ClockIcon, CopyIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { installSnippet } from "@/lib/install";
import { GUIDES } from "./InstallGuides";

/* ============================================================================
   INSTALL, WITHOUT LEAVING THE PAGE
   ----------------------------------------------------------------------------
   Installing is one paste. Sending an owner off to a settings screen to do it
   loses the thing they were looking at and makes a two-minute job feel like a
   configuration project, so the whole of it happens here.

   The platform guides expand in place rather than opening a second dialog.
   Stacked modals give you two backdrops, an Escape key that means two
   different things, and no clear way back — and there is nothing here that
   needs the extra layer.
   ========================================================================== */

export function InstallModal({
  open,
  onClose,
  siteId,
  siteName,
}: {
  open: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
}) {
  const snippet = installSnippet(siteId);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const copy = () => {
    navigator.clipboard?.writeText(snippet).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Install"
      title={`Add Concierge to ${siteName}`}
      description="One tag, pasted once. Everything after this updates from the workspace — the script never needs replacing."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} data-modal-close>
            Close
          </Button>
          <Button variant="accent" leading={<CopyIcon size={13} />} onClick={copy}>
            {copied ? "Copied" : "Copy the snippet"}
          </Button>
        </>
      }
    >
      <ModalSection title="Your snippet" hint="Paste it just before the closing body tag.">
        <div className="border border-line-strong">
          <div className="flex items-center gap-2 border-b border-divider px-3.5 py-2">
            <p className="t-eyebrow text-text-muted">HTML</p>
            <Button
              size="sm"
              variant="tertiary"
              className="ml-auto"
              leading={copied ? <CheckIcon size={13} strokeWidth={2.4} /> : <CopyIcon size={13} />}
              onClick={copy}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <pre className="t-mono overflow-x-auto bg-surface-subtle p-4 leading-[1.7] text-text-secondary">
            {snippet}
          </pre>
        </div>
      </ModalSection>

      <ModalSection title="Where does it go?" hint="Pick your platform for the exact steps.">
        <ul className="border border-line-strong">
          {GUIDES.map((guide) => {
            const isOpen = expanded === guide.name;
            return (
              <li key={guide.name} className="border-b border-divider last:border-b-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : guide.name)}
                  className={cx(
                    "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors",
                    isOpen ? "bg-surface-subtle" : "hover:bg-surface-subtle",
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-surface-subtle">
                    <guide.Logo size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-medium">{guide.name}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-[11.5px] text-text-tertiary">
                      <ClockIcon size={11} />
                      {guide.minutes} minute guide
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={cx(
                      "shrink-0 text-[11px] text-text-muted transition-transform",
                      isOpen && "rotate-90",
                    )}
                  >
                    &rsaquo;
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-divider px-3.5 py-4">
                    <p className="mb-3 text-[11.5px] text-text-tertiary">{guide.where}</p>
                    <ol className="space-y-3">
                      {guide.steps.map((step, i) => (
                        <li key={step} className="flex items-start gap-3">
                          <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center bg-ink text-[10px] font-semibold tabular-nums text-text-inverse">
                            {i + 1}
                          </span>
                          <span className="text-[12.5px] leading-[1.55]">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </ModalSection>

      <p className="mt-5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
        Concierge will not answer a single visitor until you approve what it may say. Installing the tag
        only lets it see the page.
      </p>
    </Modal>
  );
}
