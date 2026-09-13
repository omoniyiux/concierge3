"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConciergeMark, ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { SiteSwitcher } from "@/components/shell/SiteSwitcher";
import { Avatar } from "@/components/shell/Avatar";
import { CloseIcon, HelpIcon, PanelIcon, SearchIcon, SettingsIcon } from "@/components/icons";
import { NotificationBell } from "@/components/shell/NotificationCentre";
import { IconButton, Tooltip } from "@/components/ui";
import { cx } from "@/lib/cx";
import { NAV } from "@/lib/nav";
import { useWorkspace } from "@/lib/workspace";
import { useBrain, useConversations, useDestinations } from "@/lib/sim/store";

type Attention = number | "dot" | null;

/**
 * Only surfaces that actually need the owner earn a mark in the nav — and
 * only for the site being looked at. A badge counting another site's queue is
 * worse than no badge at all.
 *
 * Read from the world, not from the fixtures. Off the fixtures these numbers
 * were frozen: approving the last knowledge item left "4" sitting on the rail,
 * disagreeing with the bell two rows below it, which was already live.
 *
 * Site Brain and Routing are tabs on the Agent now, so their counts roll up
 * onto that one row — nothing that wanted the owner stopped asking for them.
 */
function useAttention(siteId: string): Record<string, Attention> {
  const brain = useBrain(siteId);
  const conversations = useConversations(siteId);
  const destinations = useDestinations(siteId);

  const brainQueue = brain.needsReviewCount + brain.missingCount;
  const routingFailing = destinations.some((d) => d.status === "failing");

  return {
    // A failing destination is louder than a review queue, so it wins the row.
    agent: routingFailing ? "dot" : brainQueue || null,
    conversations: conversations.filter((c) => c.status === "new").length || null,
  };
}

/**
 * @param onClose  Supplied only by the mobile drawer. The close control then
 *   sits in the brand row itself, on the same baseline and the same gutter as
 *   search — floating it over the row from the shell left it half a row high.
 */
export function Sidebar({ siteId, onClose }: { siteId: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { sidebarCollapsed: collapsed, toggleSidebar, setMobileNavOpen, setCommandOpen } = useWorkspace();
  const attention = useAttention(siteId);

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
            {/* Takes the collapse button's place on a phone, where there is no
                rail to collapse to. */}
            {onClose && (
              <IconButton label="Close navigation" size={32} onClick={onClose} className="lg:hidden">
                <CloseIcon size={18} />
              </IconButton>
            )}
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
          <div key={gi} className={gi > 0 ? "mt-5" : "mt-1"}>
            {group.label && !collapsed && (
              <p className="flex h-[30px] items-center px-2.5 text-[13.5px] text-text-tertiary">
                {group.label}
              </p>
            )}
            {group.label && collapsed && <div className="mx-auto my-2 h-px w-6 bg-line" />}

            <ul className={cx("space-y-1", collapsed && "flex flex-col items-center")}>
              {group.items.map(({ path, label, Icon }) => {
                const href = `/sites/${siteId}/${path}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const mark = attention[path] ?? null;

                const link = (
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMobileNavOpen(false)}
                    className={cx("relative", rowBase, rowState(active))}
                  >
                    <Icon size={19} className="shrink-0" strokeWidth={1.7} />
                    {!collapsed && <span className="truncate text-[14px] leading-none">{label}</span>}

                    {!collapsed && mark !== null && (
                      <span className="ml-auto shrink-0">
                        {mark === "dot" ? (
                          <span
                            className="block h-1.5 w-1.5 rounded-full bg-danger"
                            aria-label="Needs attention"
                          />
                        ) : (
                          <span className="bg-accent-soft px-1.5 py-0.5 text-[11.5px] font-semibold tabular-nums text-accent-ink">
                            {mark}
                          </span>
                        )}
                      </span>
                    )}
                    {collapsed && mark !== null && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />
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
      <div className={cx("shrink-0 pb-3 pt-5", collapsed ? "px-2" : "px-3")}>
        <ul className={cx("space-y-1", collapsed && "flex flex-col items-center")}>
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
          <div className="mt-3 flex items-center gap-1 pr-1">
            <Link
              href="/account"
              className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 pl-1 transition-colors hover:bg-[#f7f7f7]"
            >
              <Avatar size={32} />
              <span className="truncate text-[14px] font-semibold">Olaifa Promise</span>
            </Link>
            <NotificationBell siteId={siteId} />
          </div>
        )}
      </div>
    </nav>
  );
}
