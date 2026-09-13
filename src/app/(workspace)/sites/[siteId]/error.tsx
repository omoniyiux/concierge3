"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { Button, ErrorState, LinkButton } from "@/components/ui";

/**
 * Sits below `sites/[siteId]/layout.tsx`, so the rail, the site switcher and
 * the command menu survive a thrown surface — the owner loses one page, not
 * the workspace. `retry()` re-renders this boundary's children rather than
 * reloading the document, so a transient failure costs nothing.
 *
 * The digest is the only thing that ties what the owner saw to a server log,
 * so it is shown rather than swallowed: in production the message itself is a
 * generic placeholder.
 */
export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { siteId } = useParams<{ siteId: string }>();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Something went wrong"
        title="This surface did not load"
        description="The rest of your workspace is unaffected. Nothing you had saved has been lost."
      />
      <ErrorState
        title="The page stopped while it was loading"
        reason={error.message || "The surface failed before it could render."}
        remedy="Trying again usually clears it. If it keeps happening, send us the reference below."
        action={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={() => retry()}>Try again</Button>
            <LinkButton href={`/sites/${siteId}/overview`} variant="secondary">
              Back to overview
            </LinkButton>
            <LinkButton href="/help" variant="tertiary">
              Get help
            </LinkButton>
          </div>
        }
      />
      {error.digest && (
        <p className="mt-4 text-[11.5px] text-text-tertiary">
          Reference <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </PageContainer>
  );
}
