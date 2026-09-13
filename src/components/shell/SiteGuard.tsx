"use client";

import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { useHydrated, useWorld } from "@/lib/sim/store";

/**
 * Refuses a site id that belongs to no site — once, here, rather than in every
 * surface.
 *
 * This used to be a `siteExists` check in the server layout, against the
 * fixtures. That made a site built by the setup flow impossible to open: it
 * lives in the world, in this browser, and the server has never heard of it,
 * so the editor the flow pushed you to answered 404.
 *
 * The wait for `hydrated` is the whole trick. Until the stored world is back,
 * an unknown id is not yet a wrong one, and 404ing on it would refuse every
 * site the owner has ever made the moment they reload.
 */
export function SiteGuard({ siteId, children }: { siteId: string; children: ReactNode }) {
  const hydrated = useHydrated();
  const world = useWorld();

  if (hydrated && !world.sites.some((s) => s.id === siteId)) notFound();

  return <>{children}</>;
}
