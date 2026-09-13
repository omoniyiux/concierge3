import { redirect } from "next/navigation";

/**
 * `/sites/<id>` is what you get from trimming a URL back, or from a link that
 * lost its tail. It used to 404. Overview is the site's front door, so send
 * people there — as a replace, so Back still leaves the site rather than
 * bouncing off this segment.
 */
export default async function SiteRootPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  redirect(`/sites/${siteId}/overview`);
}
