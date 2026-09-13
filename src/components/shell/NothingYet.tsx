"use client";

import { LinkButton, Panel } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { InstallSticker, LiveSticker } from "@/components/stickers";

/* ============================================================================
   NOTHING HERE YET — AND THAT IS NOT A BUG
   A new site has no conversations, no leads and no return, and every list in
   the workspace will be empty for a day or two. An empty list that explains
   itself and points at the one thing left to do is the difference between
   "this is working, wait" and "I have bought something broken".
   ========================================================================== */

export function NothingYet({
  siteId,
  /** Whether the site still has setup steps outstanding. */
  setupComplete,
  noun,
  body,
}: {
  siteId: string;
  setupComplete: boolean;
  /** What this surface would have listed: "conversations", "leads", "return". */
  noun: string;
  body: string;
}) {
  const Sticker = setupComplete ? LiveSticker : InstallSticker;

  return (
    <Panel className="p-8 sm:p-10">
      <div className="mx-auto flex max-w-[52ch] flex-col items-center text-center">
        <Sticker size={44} />
        <h2 className="t-feature mt-5">
          {setupComplete ? `No ${noun} yet` : `Concierge is not answering yet`}
        </h2>
        <p className="t-body mt-3 text-text-secondary">
          {setupComplete
            ? body
            : `There are no ${noun} because Concierge is not live on your site yet. Finish the setup and this fills itself.`}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {setupComplete ? (
            <>
              <LinkButton href={`/sites/${siteId}/agent/preview`} trailing={<ArrowRight size={13} />}>
                Try it as a visitor
              </LinkButton>
              <LinkButton href={`/sites/${siteId}/brain`} variant="secondary">
                Review what it knows
              </LinkButton>
            </>
          ) : (
            <LinkButton href={`/sites/${siteId}/overview`} trailing={<ArrowRight size={13} />}>
              Finish setting up
            </LinkButton>
          )}
        </div>
      </div>
    </Panel>
  );
}
