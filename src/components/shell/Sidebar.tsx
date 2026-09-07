"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConciergeMark, ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { SiteSwitcher } from "@/components/shell/SiteSwitcher";
import { BellIcon, HelpIcon, PanelIcon, SearchIcon, SettingsIcon } from "@/components/icons";
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
  const { sidebarCollapsed, toggleSidebar, setMobileNavOpen, setCommandOpen } = useWorkspace();
  const collapsed = sidebarCollapsed;

  return (
    <nav
      aria-label="Workspace"
      style={{ width: collapsed ? "var(--sidebar-rail-w)" : "var(--sidebar-w)" }}
      className="sticky top-0 flex h-dvh shrink-0 flex-col self-start bg-surface transition-[width] duration-[var(--dur-base)] ease-[var(--ease-out-cg)]"
    >
      {/* Brand ---------------------------------------------------------- */}
      <div
        className={cx(
          "flex h-[84px] shrink-0 items-center",
          collapsed ? "justify-center px-2" : "pl-4 pr-3",
        )}
      >
        <Link href={`/sites/${siteId}/overview`} className="mr-auto rounded-lg" aria-label="Concierge">
          {collapsed ? <ConciergeMark size={30} /> : <ConciergeWordmark />}
        </Link>
        {!collapsed && (
          <>
            <IconButton label="Search Concierge" size={34} onClick={() => setCommandOpen(true)}>
              <SearchIcon size={20} />
            </IconButton>
            <IconButton label="Collapse sidebar" size={34} onClick={toggleSidebar} className="hidden lg:inline-flex">
              <PanelIcon size={20} />
            </IconButton>
          </>
        )}
      </div>

      {/* Which website this workspace is scoped to ---------------------- */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <SiteSwitcher siteId={siteId} />
        </div>
      )}

      {/* Destinations --------------------------------------------------- */}
      <div className="cg-scroll min-h-0 flex-1 overflow-y-auto px-3">
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
              <p className="mb-1 flex h-[38px] items-center px-2.5 text-[15px] text-text-tertiary">
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="mx-auto mb-2 h-px w-6 bg-line" />}

            <ul className={cx("space-y-[3px]", collapsed && "flex flex-col items-center")}>
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
                      "group relative flex items-center rounded-[10px] transition-colors duration-[var(--dur-micro)]",
                      collapsed ? "h-10 w-10 justify-center" : "h-[38px] gap-3 pl-2.5 pr-2",
                      active
                        ? "bg-surface-hover font-semibold"
                        : "font-medium hover:bg-[#f7f7f7]",
                    )}
                  >
                    <Icon size={21} className="shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span className="truncate text-[15px] leading-none">{label}</span>}
                    {!collapsed && attention !== null && (
                      <span className="ml-auto shrink-0">
                        {attention === "dot" ? (
                          <span className="block h-1.5 w-1.5 rounded-full bg-danger" aria-label="Needs attention" />
                        ) : (
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[13px] font-semibold tabular-nums text-accent-ink">
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
      <div className={cx("shrink-0 py-3", collapsed ? "px-2" : "px-3")}>
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
                  "flex items-center rounded-[10px] transition-colors duration-[var(--dur-micro)]",
                  collapsed ? "h-10 w-10 justify-center" : "h-[38px] gap-3 pl-2.5 pr-2",
                  active ? "bg-surface-hover font-semibold" : "font-medium hover:bg-[#f7f7f7]",
                )}
              >
                <Icon size={21} className="shrink-0" strokeWidth={1.8} />
                {!collapsed && <span className="text-[15px] leading-none">{label}</span>}
              </Link>
            );
            return <li key={href}>{collapsed ? <Tooltip label={label}>{link}</Tooltip> : link}</li>;
          })}
        </ul>

        {!collapsed && (
          <Link
            href="/account"
            className="mt-3 flex items-center gap-3 rounded-[10px] py-2 pl-1 pr-1 transition-colors hover:bg-[#f7f7f7]"
          >
            <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-text-inverse">
              OP
            </span>
            <span className="mr-auto truncate text-[15px] font-semibold">Olaifa Promise</span>
            <span className="relative mr-1">
              <BellIcon size={21} className="text-text-primary" />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-accent" />
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
