"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge, Button, Field, Input, Spinner } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { CheckIcon, ExternalIcon, GlobeIcon } from "@/components/icons";
import { checkSubdomain, currentlyPublished, publishSite, takeDown } from "@/server/publish-actions";
import { PAGES_DOMAIN } from "@/lib/publishing.client";
import type { PageDocument } from "@/lib/types";

/* ============================================================================
   PUBLISH
   ----------------------------------------------------------------------------
   The address is the decision, so it is the whole of this dialog. Everything
   else — which pages go, what the visitor sees — is already settled by the
   document, and re-asking about it here would just be a second place to get it
   wrong.

   Availability is checked as they type and again on submit. The first is for
   the owner, so they are not typing hopefully into a name someone else holds;
   the second is because the first is a guess about the past.
   ========================================================================== */

type Live = { subdomain: string; url: string; publishedAt: string } | null;

export function PublishDialog({
  open,
  onClose,
  siteId,
  siteName,
  suggestion,
  document,
  draftPageCount,
}: {
  open: boolean;
  onClose: () => void;
  siteId: string;
  siteName: string;
  suggestion: string;
  document: PageDocument;
  draftPageCount: number;
}) {
  const [subdomain, setSubdomain] = useState(suggestion);
  const [live, setLive] = useState<Live>(null);
  /* The last name the server ruled on, and its verdict. Whether a check is in
     flight is derived from this rather than stored: two pieces of state that
     have to agree eventually disagree, and here they would disagree exactly
     when a slow response landed after the owner had typed on. */
  const [verdict, setVerdict] = useState<{ value: string; problem: string | null } | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [result, setResult] = useState<Live>(null);
  const [pending, startTransition] = useTransition();

  const checking = verdict === null || verdict.value !== subdomain;
  const problem = failure ?? (checking ? null : verdict.problem);

  /* What is live now, so the dialog can say "republish" rather than pretending
     this is the first time. */
  useEffect(() => {
    if (open === false) return;
    let cancelled = false;
    void currentlyPublished(siteId).then((found) => {
      if (cancelled) return;
      setLive(found);
      if (found !== null) setSubdomain(found.subdomain);
    });
    return () => {
      cancelled = true;
    };
  }, [open, siteId]);

  /* Debounced, because every keystroke is a round trip otherwise. */
  useEffect(() => {
    if (open === false) return;
    const timer = setTimeout(() => {
      void checkSubdomain({ siteId, subdomain }).then((res) => {
        setVerdict({ value: subdomain, problem: res.ok ? null : (res.reason ?? "That address will not work.") });
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [subdomain, siteId, open]);

  const publishable = problem === null && checking === false && subdomain.length > 0;

  const run = () =>
    startTransition(async () => {
      const res = await publishSite({ siteId, subdomain, document });
      if (res.ok) {
        setResult({ subdomain: res.subdomain, url: res.url, publishedAt: res.publishedAt });
        setLive({ subdomain: res.subdomain, url: res.url, publishedAt: res.publishedAt });
        setFailure(null);
      } else {
        setFailure(res.reason);
      }
    });

  const close = () => {
    setResult(null);
    onClose();
  };

  if (result !== null) {
    return (
      <Modal
        open={open}
        onClose={close}
        eyebrow="Published"
        title={`${siteName} is live`}
        description="Anyone with the address can see it now. Publishing again replaces it."
        footer={
          <Button onClick={close} leading={<CheckIcon size={13} strokeWidth={2.4} />}>
            Done
          </Button>
        }
      >
        <div className="flex items-center gap-3 border border-line-strong bg-surface-subtle p-4">
          <GlobeIcon size={17} className="shrink-0 text-text-tertiary" />
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-[13px] font-medium underline underline-offset-2"
          >
            {result.url.replace("https://", "")}
          </a>
          <ExternalIcon size={14} className="shrink-0 text-text-muted" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow={live === null ? "Publish" : "Republish"}
      title={live === null ? `Put ${siteName} online` : `Update ${siteName}`}
      description={
        live === null
          ? "Choose the address visitors will use. You can change it later."
          : "This replaces what is live now. The address stays yours unless you change it."
      }
      footer={
        <>
          {live !== null && (
            <Button
              variant="tertiary"
              onClick={() =>
                startTransition(async () => {
                  await takeDown(siteId);
                  setLive(null);
                })
              }
            >
              Take offline
            </Button>
          )}
          <Button variant="secondary" onClick={close} data-modal-close>
            Cancel
          </Button>
          <Button variant="accent" disabled={!publishable || pending} onClick={run}>
            {pending ? "Publishing…" : live === null ? "Publish" : "Republish"}
          </Button>
        </>
      }
    >
      <ModalSection title="Address">
        <Field
          label="Your web address"
          htmlFor="publish-subdomain"
          error={problem ?? undefined}
          hint={problem === null ? `Visitors will go to ${subdomain || "yourname"}.${PAGES_DOMAIN}` : undefined}
        >
          <div className="flex items-stretch">
            <Input
              id="publish-subdomain"
              value={subdomain}
              spellCheck={false}
              autoCapitalize="none"
              onChange={(e) => {
                setFailure(null);
                setSubdomain(e.target.value.toLowerCase().trim());
              }}
            />
            <span className="flex shrink-0 items-center border border-l-0 border-line-strong bg-surface-subtle px-3 text-[12px] text-text-tertiary">
              .{PAGES_DOMAIN}
            </span>
          </div>
        </Field>

        <p className="mt-2 flex h-4 items-center gap-1.5 text-[11.5px] text-text-tertiary">
          {checking ? (
            <>
              <Spinner size={12} /> Checking…
            </>
          ) : problem === null ? (
            <>
              <CheckIcon size={12} strokeWidth={2.4} className="text-success" />
              <span className="text-success">That address is free.</span>
            </>
          ) : null}
        </p>
      </ModalSection>

      <ModalSection title="What goes live" hint="Drafts stay behind until you publish them.">
        <ul className="border border-line-strong">
          {document.pages.map((page) => (
            <li
              key={page.id}
              className="flex items-center gap-2.5 border-b border-divider px-3.5 py-2.5 last:border-b-0"
            >
              <span className="min-w-0 flex-1 truncate text-[12.5px]">
                {page.title}
                <span className="ml-2 text-text-tertiary">
                  {page.slug === "" ? "/" : `/${page.slug}`}
                </span>
              </span>
              {page.published ? (
                <Badge tone="approved">Live</Badge>
              ) : (
                <Badge tone="review">Draft</Badge>
              )}
            </li>
          ))}
        </ul>
        {draftPageCount === document.pages.length && (
          <p className="mt-2.5 text-[12.5px] text-danger">
            Every page is still a draft, so there would be nothing to show.
          </p>
        )}
      </ModalSection>
    </Modal>
  );
}
