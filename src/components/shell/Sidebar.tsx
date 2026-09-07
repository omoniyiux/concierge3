"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConciergeMark, ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { HelpIcon, PanelIcon, SettingsIcon } from "@/components/icons";
import { IconButton, Tooltip} from "@/components/ui";
import { cx } from "@/lib/cx";
import { NAV } from "@/lib/nav";
import { useWorkspace } from "@/lib/workspace";
import { BRAIN, CONVERSATIONS, DESTINATIONS } from "@/lib/demo-data";

/** Counts that earn a dot in the nav. Only surfaces that need the owner. */
function attentionFor(slug: string): number | "dot" | null {
  if (slug === "brain") return BRAIN.needsReviewCount + BRAIN.missingCount || null;
  if (slug === "conversations") return CONVERSATIONS.filter((c) => c.status === "new").length || null;
  if (slug === "routing") return DESTINATIONS.some((d) => d.status === "failing") ? "dot" : null;
  return null;
}

export function Sidebar({ siteId }: { siteId: string }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setMobileNavOpen } = useWorkspace();
  const collapsed = sidebarCollapsed;

  return (
    <nav
      aria-label="Workspace"
      style={{ width: collapsed ? "var(--sidebar-rail-w)" : "var(--sidebar-w)" }}
      className="flex h-full shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out-cg)]"
    >
      {/* Brand ---------------------------------------------------------- */}
      <div
        className={cx(
          "flex h-[var(--topbar-h)] shrink-0 items-center border-b border-line",
          collapsed ? "justify-center px-2" : "pl-4 pr-2",
        )}
      >
        <Link href="/overview" className="mr-auto rounded-lg" aria-label="Concierge">
          {collapsed ? <ConciergeMark size={24} /> : <ConciergeWordmark />}
        </Link>
        {!collapsed && (
          <IconButton label="Collapse sidebar" size={28} onClick={toggleSidebar} className="hidden lg:inline-flex">
            <PanelIcon size={16} />
          </IconButton>
        )}
      </div>

      {/* Destinations --------------------------------------------------- */}
      <div className="cg-scroll min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {collapsed && (
          <div className="mb-2 flex justify-center">
            <Tooltip label="Expand sidebar">
              <IconButton label="Expand sidebar" size={34} onClick={toggleSidebar}>
                <PanelIcon size={16} />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {NAV.map((group, gi) => (
          <div key={group.label ?? "root"} className={gi > 0 ? "mt-5" : ""}>
            {group.label && !collapsed && (
              <p className="t-eyebrow mb-1.5 px-2.5 text-text-muted">{group.label}</p>
            )}
            {group.label && collapsed && <div className="mx-auto mb-2 h-px w-6 bg-line" />}

            <ul className={cx("space-y-0.5", collapsed && "flex flex-col items-center")}>
              {group.items.map(({ slug, label, Icon }) => {
                const href = `/sites/${siteId}/${slug}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const attention = attentionFor(slug);

                const link = (
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileNavOpen(false)}
                    className={cx(
                      "group relative flex items-center rounded-lg transition-colors duration-[var(--dur-micro)]",
                      collapsed ? "h-9 w-9 justify-center" : "h-9 gap-2.5 px-2.5",
                      active
                        ? "bg-surface-hover font-medium text-text-primary"
                        : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                    )}
                  >
                    {/* Active marker in Concierge orange — the one place it
                        appears in navigation. */}
                    {active && (
                      <span className="absolute -left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-accent" />
                    )}
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && <span className="truncate text-[13.5px]">{label}</span>}
                    {!collapsed && attention !== null && (
                      <span className="ml-auto shrink-0">
                        {attention === "dot" ? (
                          <span className="block h-1.5 w-1.5 rounded-full bg-danger" aria-label="Needs attention" />
                        ) : (
                          <span className="rounded-full bg-accent-soft px-1.5 py-px text-[11px] font-semibold tabular-nums text-accent-ink">
                            {attention}
                          </span>
                        )}
                      </span>
                    )}
                    {collapsed && attention !== null && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                );

                return (
                  <li key={slug} className={collapsed ? "" : "px-0"}>
                    {collapsed ? <Tooltip label={label}>{link}</Tooltip> : link}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* System --------------------------------------------------------- */}
      <div className={cx("shrink-0 border-t border-line py-2", collapsed ? "px-2" : "px-2")}>
        <ul className={cx("space-y-0.5", collapsed && "flex flex-col items-center")}>
          {[
            { href: `/sites/${siteId}/settings`, label: "Settings", Icon: SettingsIcon },
            { href: "/help", label: "Help", Icon: HelpIcon },
          ].map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href);
            const link = (
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileNavOpen(false)}
                className={cx(
                  "flex items-center rounded-lg transition-colors duration-[var(--dur-micro)]",
                  collapsed ? "h-9 w-9 justify-center" : "h-9 gap-2.5 px-2.5",
                  active
                    ? "bg-surface-hover font-medium text-text-primary"
                    : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
                )}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="text-[13.5px]">{label}</span>}
              </Link>
            );
            return <li key={href}>{collapsed ? <Tooltip label={label}>{link}</Tooltip> : link}</li>;
          })}
        </ul>
      </div>
    </nav>
  );
}
