import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { EmptyState, LinkButton } from "@/components/ui";
import { SearchIcon } from "@/components/icons";
import { SiteHomeLink } from "@/components/shell/SiteHomeLink";

/**
 * A 404 inside a site keeps the rail. The workspace-level not-found renders
 * full-bleed with only "go to the homepage", which threw an owner all the way
 * out of the site they were working in over one bad link.
 *
 * A Server Component on purpose: `not-found.js` takes no props, and the one
 * dynamic thing it needs — which site to go back to — comes from a small
 * client child rather than making this whole boundary a Client Component.
 */
export default function SiteNotFound() {
  return (
    <PageContainer>
      <PageHeader eyebrow="404" title="There is nothing at this address" />
      <EmptyState
        icon={<SearchIcon size={20} />}
        title="This page does not exist"
        body="The link may be out of date, or the thing it pointed at may have been deleted. Everything else in this site is still where you left it."
        action={<SiteHomeLink />}
        secondaryAction={
          <LinkButton href="/help" variant="secondary">
            Get help
          </LinkButton>
        }
      />
    </PageContainer>
  );
}
