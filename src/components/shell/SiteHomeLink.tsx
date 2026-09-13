"use client";

import { useParams } from "next/navigation";
import { LinkButton } from "@/components/ui";

/** Back to the site you were in, for surfaces that cannot take params. */
export function SiteHomeLink() {
  const { siteId } = useParams<{ siteId: string }>();
  if (!siteId) return <LinkButton href="/sites">Back to your sites</LinkButton>;
  return <LinkButton href={`/sites/${siteId}/overview`}>Back to overview</LinkButton>;
}
