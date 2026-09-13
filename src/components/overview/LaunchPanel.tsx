"use client";

import Link from "next/link";
import { Card, LinkButton, Panel, ProgressBar } from "@/components/ui";
import { InstallSticker, LiveSticker, KnowledgeSticker, RoutingSticker } from "@/components/stickers";
import { ArrowRight, CheckIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import type { LaunchStep } from "@/lib/health";

/* ============================================================================
   BEFORE THERE IS ANYTHING TO SHOW
   A workspace on day one has no conversations, no leads and no value to
   report, and a dashboard of zeroes reads as a product that does not work.
   These two panels take that space instead: what is left to do, and — once
   nothing is left — what is now true and what happens next.
   ========================================================================== */

export function LaunchPanel({
  steps,
  progress,
  siteName,
}: {
  steps: LaunchStep[];
  progress: number;
  siteName: string;
}) {
  const remaining = steps.filter((s) => !s.done).length;
  const current = steps.find((s) => s.current);

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-divider p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0 max-w-[52ch]">
            <p className="t-eyebrow text-accent-ink">Getting {siteName} live</p>
            <h2 className="t-feature mt-2.5">
              {remaining === 1
                ? "One thing left before Concierge can answer"
                : `${remaining} things left before Concierge can answer`}
            </h2>
            <p className="t-body mt-2.5 text-text-secondary">
              Nothing is offered to a visitor until all six are true. You can stop and come back — your
              progress is kept.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="t-num text-[27px] leading-none">{progress}%</p>
            <p className="mt-1.5 text-[12px] text-text-tertiary">complete</p>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={progress} label="Launch progress" tone="accent" height={5} />
        </div>
      </div>

      <ol className="divide-y divide-divider">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className={cx(
              "flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4",
              step.current && "bg-accent-subtle",
            )}
          >
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-semibold tabular-nums",
                step.done
                  ? "bg-success text-white"
                  : step.current
                    ? "bg-ink text-text-inverse"
                    : "bg-surface-sunken text-text-tertiary",
              )}
            >
              {step.done ? <CheckIcon size={13} strokeWidth={2.6} /> : i + 1}
            </span>

            <div className="min-w-[200px] flex-1">
              <p className={cx("text-[12.5px] font-medium", step.done && "text-text-tertiary line-through")}>
                {step.label}
              </p>
              {!step.done && (
                <p className="mt-1 text-[12px] leading-[1.5] text-text-tertiary">{step.blurb}</p>
              )}
            </div>

            {step.current ? (
              <LinkButton href={step.href} size="sm" trailing={<ArrowRight size={13} />}>
                {step.cta}
              </LinkButton>
            ) : step.done ? (
              <span className="text-[11.5px] font-medium text-success">Done</span>
            ) : (
              <Link
                href={step.href}
                className="text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary"
              >
                Open
              </Link>
            )}
          </li>
        ))}
      </ol>

      {current && (
        <div className="border-t border-divider bg-surface-subtle px-6 py-4">
          <p className="text-[12px] leading-[1.5] text-text-secondary">
            <span className="font-medium text-text-primary">Next: {current.label}.</span> {current.blurb}
          </p>
        </div>
      )}
    </Panel>
  );
}

/* ---- Live, but nobody has arrived yet ------------------------------------- */

/**
 * The gap between finishing setup and the first real visitor is where a new
 * customer decides whether they bought something real. It gets a page that
 * says plainly: it is on, here is how to prove it, here is what will happen.
 */
export function WaitingPanel({ siteId, siteUrl }: { siteId: string; siteUrl: string }) {
  return (
    <>
      <Card className="border-accent-line bg-accent-subtle p-6">
        <div className="flex flex-wrap items-start gap-5">
          <LiveSticker size={44} className="shrink-0" />
          <div className="min-w-0 max-w-[54ch] flex-1">
            <p className="t-eyebrow text-accent-ink">Live</p>
            <h2 className="t-feature mt-2.5">Concierge is answering on {siteUrl}</h2>
            <p className="t-body mt-2.5 text-text-secondary">
              Nobody has started a conversation yet. That is normal on the first day — the launcher only
              appears to real visitors, and most businesses see their first one within a few hours of traffic.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <LinkButton href={`/sites/${siteId}/agent/preview`} trailing={<ArrowRight size={13} />}>
                Try it as a visitor
              </LinkButton>
              <LinkButton href={`/sites/${siteId}/brain`} variant="secondary">
                Review what it knows
              </LinkButton>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          {
            Sticker: KnowledgeSticker,
            title: "It answers from your approved knowledge",
            body: "Only what you have approved in Site Brain. When it does not know, it says so and offers a person.",
          },
          {
            Sticker: RoutingSticker,
            title: "You hear about anything worth hearing about",
            body: "The moment someone is worth talking to, your destinations get the conversation and the context.",
          },
          {
            Sticker: InstallSticker,
            title: "Nothing else to install",
            body: "Knowledge, tone, actions and routing all update live. You never touch the script again.",
          },
        ].map(({ Sticker, title, body }) => (
          <Card key={title} className="p-5">
            <Sticker size={30} />
            <p className="t-card mt-3.5">{title}</p>
            <p className="t-body-sm mt-2 leading-[1.5] text-text-tertiary">{body}</p>
          </Card>
        ))}
      </div>
    </>
  );
}
