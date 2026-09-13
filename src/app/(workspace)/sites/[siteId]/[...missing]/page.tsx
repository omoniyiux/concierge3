import { notFound } from "next/navigation";

/**
 * Static segments beat a catch-all, so this only ever runs for a path that
 * matches no real surface. Without it an unknown URL under a site falls all
 * the way through to the workspace-level 404 and loses the shell; with it the
 * site's own not-found renders inside the rail.
 */
export default function MissingSiteRoute() {
  notFound();
}
