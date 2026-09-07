"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import { cx } from "@/lib/cx";
import { BRAIN, DESTINATIONS } from "@/lib/demo-data";

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

  const tabs: { href: string; label: string; badge?: number | "dot" }[] = [
    { href: base, label: "Persona" },
    {
      href: `${base}/brain`,
      label: "Site Brain",
      badge: BRAIN.needsReviewCount + BRAIN.missingCount || undefined,
    },
    { href: `${base}/actions`, label: "Actions" },
    {
      href: `${base}/routing`,
      label: "Routing",
      badge: DESTINATIONS.some((d) => d.status === "failing") ? "dot" : undefined,
    },
    { href: `${base}/preview`, label: "Preview" },
  ];

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-divider bg-canvas/85 backdrop-blur-md">
        <nav
          aria-label="Agent"
          style={{ maxWidth: "1090px" }}
          className="mx-auto flex w-full items-center gap-1 overflow-x-auto px-5 sm:px-8 lg:px-10"
        >
          {tabs.map(({ href, label, badge }) => {
            const active = href === base ? pathname === base : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative flex h-12 shrink-0 items-center gap-2 px-3 text-[15px] transition-colors duration-[var(--dur-micro)]",
                  active
                    ? "font-semibold text-text-primary"
                    : "font-medium text-text-tertiary hover:text-text-primary",
                )}
              >
                {label}
                {badge === "dot" && <span className="h-1.5 w-1.5 rounded-full bg-danger" />}
                {typeof badge === "number" && (
                  <span
                    className={cx(
                      "rounded-full px-1.5 py-px text-[12px] font-semibold tabular-nums",
                      active ? "bg-ink text-text-inverse" : "bg-surface-sunken text-text-tertiary",
                    )}
                  >
                    {badge}
                  </span>
                )}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" />}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </>
  );
}
