"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import { cx } from "@/lib/cx";
import { tabClass, tabCountClass } from "@/components/ui";
import { useBrain, useDestinations } from "@/lib/sim/store";

/**
 * The Agent is one object with several facets — who it is, what it knows,
 * what it can do, where it sends people. They used to be five sidebar
 * destinations; they are tabs on one surface now, so the sidebar can stay
 * short and the relationship between them is visible.
 */
export default function AgentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = use(params);
  const pathname = usePathname();
  const base = `/sites/${siteId}/agent`;

  // These used to read the module-level fixtures, which are not scoped to a
  // site at all: every site showed Northlane's queue, and neither number moved
  // when the owner actually cleared it.
  const brain = useBrain(siteId);
  const destinations = useDestinations(siteId);

  const tabs: { href: string; label: string; badge?: number | "dot" }[] = [
    { href: base, label: "Persona" },
    {
      href: `${base}/brain`,
      label: "Site Brain",
      badge: brain.needsReviewCount + brain.missingCount || undefined,
    },
    { href: `${base}/actions`, label: "Actions" },
    {
      href: `${base}/routing`,
      label: "Routing",
      badge: destinations.some((d) => d.status === "failing") ? "dot" : undefined,
    },
    { href: `${base}/preview`, label: "Preview" },
  ];

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-divider bg-canvas/85 backdrop-blur-md">
        {/* Same max width and the same gutters as PageContainer, so the first
            tab lines up with the page title underneath it. It used to be
            sm:px-8 lg:px-10 against the body's sm:px-7 lg:px-9 — 4px out at
            every breakpoint above mobile. */}
        <nav
          aria-label="Agent"
          style={{ maxWidth: "var(--content-max)" }}
          className="cg-no-scrollbar mx-auto flex w-full items-center gap-1.5 overflow-x-auto px-5 pb-4 pt-4 sm:px-7 lg:px-9"
        >
          {tabs.map(({ href, label, badge }) => {
            const active = href === base ? pathname === base : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={tabClass(active)}
              >
                {label}
                {badge === "dot" && (
                  <span
                    className={cx(
                      "h-1.5 w-1.5 rounded-full",
                      active ? "bg-white" : "bg-danger",
                      "cg-live-dot",
                    )}
                  />
                )}
                {typeof badge === "number" && <span className={tabCountClass(active)}>{badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </>
  );
}
