import { redirect } from "next/navigation";

/**
 * Only `/edit` existed, so the natural parent URL — the one you get by
 * deleting `/edit`, or by a link built from a page id alone — 404'd. Editing
 * is the only thing you can do to a page, so this is that.
 */
export default async function PageRoot({
  params,
}: {
  params: Promise<{ siteId: string; pageId: string }>;
}) {
  const { siteId, pageId } = await params;
  redirect(`/sites/${siteId}/pages/${pageId}/edit`);
}
