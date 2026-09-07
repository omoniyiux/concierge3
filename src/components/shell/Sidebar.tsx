"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConciergeMark, ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { SiteSwitcher } from "@/components/shell/SiteSwitcher";
import { BellIcon, HelpIcon, PanelIcon, SearchIcon, SettingsIcon } from "@/components/icons";
import { IconButton, Tooltip } from "@/components/ui";
import { cx } from "@/lib/cx";
import { NAV } from "@/lib/nav";
import { useWorkspace } from "@/lib/workspace";
import { BRAIN, CONVERSATIONS, DESTINATIONS } from "@/lib/demo-data";

/** Only surfaces that actually need the owner earn a mark in the nav. */
function attentionFor(path: string): number | "dot" | null {
  if (path === "brain") return BRAIN.needsReviewCount + BRAIN.missingCount || null;
  if (path === "conversations") return CONVERSATIONS.filter((c) => c.status === "new").length || null;
  if (path === "routing") return DESTINATIONS.some((d) => d.status === "failing") ? "dot" : null;
  return null;
}

export function Sidebar({ siteId }: { siteId: string }) {
  const pathname = usePathname();
  const { sidebarCollapsed: collapsed, toggleSidebar, setMobileNavOpen, setCommandOpen } = useWorkspace();

  const rowBase = collapsed
    ? "flex h-9 w-9 items-center justify-center transition-colors duration-[var(--dur-micro)]"
    : "flex h-[34px] items-center gap-3 pl-2.5 pr-2 transition-colors duration-[var(--dur-micro)]";

  const rowState = (active: boolean) =>
    active ? "bg-surface-hover font-semibold" : "font-medium hover:bg-[#f7f7f7]";

  return (
    <nav
      aria-label="Workspace"
      style={{ width: collapsed ? "var(--sidebar-rail-w)" : "var(--sidebar-w)" }}
      className="flex h-full min-h-dvh shrink-0 flex-col self-stretch bg-surface transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out-cg)]"
    >
      {/* Brand ---------------------------------------------------------- */}
      <div
        className={cx(
          "flex h-[72px] shrink-0 items-center",
          collapsed ? "justify-center px-2" : "pl-4 pr-2.5",
        )}
      >
        {/* mr-auto only when expanded — in the rail it fights justify-center
            and pushes the mark off the icon column. */}
        <Link
          href={`/sites/${siteId}/overview`}
          className={cx(!collapsed && "mr-auto")}
          aria-label="Concierge"
        >
          {collapsed ? <ConciergeMark size={26} /> : <ConciergeWordmark />}
        </Link>
        {!collapsed && (
          <>
            <IconButton label="Search Concierge" size={32} onClick={() => setCommandOpen(true)}>
              <SearchIcon size={18} />
            </IconButton>
            <IconButton
              label="Collapse sidebar"
              size={32}
              onClick={toggleSidebar}
              className="hidden lg:inline-flex"
            >
              <PanelIcon size={18} />
            </IconButton>
          </>
        )}
      </div>

      {/* Which website this workspace is scoped to ----------------------- */}
      {!collapsed && (
        <div className="px-3 pb-2">
          <SiteSwitcher siteId={siteId} />
        </div>
      )}

      {/* Destinations ---------------------------------------------------- */}
      <div className="cg-scroll min-h-0 flex-1 overflow-y-auto px-3">
        {collapsed && (
          <div className="mb-2 flex justify-center">
            <Tooltip label="Expand sidebar">
              <IconButton label="Expand sidebar" size={34} onClick={toggleSidebar}>
                <PanelIcon size={18} />
              </IconButton>
            </Tooltip>
          </div>
        )}

        {NAV.map((group, gi) => (
          <div key={group.label ?? "root"} className={gi > 0 ? "mt-4" : ""}>
            {group.label && !collapsed && (
              <p className="flex h-[30px] items-center px-2.5 text-[13.5px] text-text-tertiary">
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="mx-auto my-2 h-px w-6 bg-line" />}

            <ul className={cx("space-y-0.5", collapsed && "flex flex-col items-center")}>
              {group.items.map(({ path, label, Icon }) => {
                const href = `/sites/${siteId}/${path}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const attention = attentionFor(path);

                const link = (
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileNavOpen(false)}
                    className={cx("relative", rowBase, rowState(active))}
                  >
                    <Icon size={19} className="shrink-0" strokeWidth={1.7} />
                    {!collapsed && <span className="truncate text-[14px] leading-none">{label}</span>}

                    {!collapsed && attention !== null && (
                      <span className="ml-auto shrink-0">
                        {attention === "dot" ? (
                          <span className="block h-1.5 w-1.5 bg-danger" aria-label="Needs attention" />
                        ) : (
                          <span className="bg-accent-soft px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums text-accent-ink">
                            {attention}
                          </span>
                        )}
                      </span>
                    )}
                    {collapsed && attention !== null && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-accent" />
                    )}
                  </Link>
                );

                return <li key={path}>{collapsed ? <Tooltip label={label}>{link}</Tooltip> : link}</li>;
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* System ---------------------------------------------------------- */}
      <div className={cx("shrink-0 pb-3", collapsed ? "px-2" : "px-3")}>
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
                className={cx(rowBase, rowState(active))}
              >
                <Icon size={19} className="shrink-0" strokeWidth={1.7} />
                {!collapsed && <span className="text-[14px] leading-none">{label}</span>}
              </Link>
            );
            return <li key={href}>{collapsed ? <Tooltip label={label}>{link}</Tooltip> : link}</li>;
          })}
        </ul>

        {!collapsed && (
          <Link
            href="/account"
            className="mt-2 flex items-center gap-2.5 py-1.5 pl-1 pr-1 transition-colors hover:bg-[#f7f7f7]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-ink text-[11.5px] font-semibold text-text-inverse">
              OP
            </span>
            <span className="mr-auto truncate text-[14px] font-semibold">Olaifa Promise</span>
            <span className="relative mr-1">
              <BellIcon size={19} className="text-text-primary" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 border-2 border-surface bg-accent" />
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
