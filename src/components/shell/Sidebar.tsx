"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SymphonyMark, SymphonyWordmark } from "@/components/icons/SymphonyMark";
import {
  AgentsIcon,
  BellIcon,
  ChatIcon,
  ChevronUp,
  HistoryIcon,
  HomeIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PlusIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { IconButton, ProgressBar, Tooltip } from "@/components/ui";
import { THREADS, USER } from "@/lib/data";
import { useWorkspace } from "@/lib/workspace";
import { Avatar } from "@/components/shell/Avatar";

type NavItem = {
  href: string;
  label: string;
  Icon: typeof HomeIcon;
  trailing?: "new-chat";
};

const NAV: NavItem[] = [
  { href: "/chat", label: "Chat", Icon: ChatIcon, trailing: "new-chat" },
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/agents", label: "Agents", Icon: AgentsIcon },
  { href: "/whatsapp", label: "Connect WhatsApp", Icon: WhatsAppIcon },
];

/* ==================================================================
   EXPANDED SIDEBAR — 260px
   ================================================================== */

export function Sidebar() {
  const pathname = usePathname();
  const { toggleSidebar, setSearchOpen, setPhoneModalOpen, activeThread, setActiveThread } =
    useWorkspace();
  const [historyOpen, setHistoryOpen] = useState(true);

  return (
    <nav
      aria-label="Workspace"
      className="flex h-full w-[260px] shrink-0 flex-col border-r border-line bg-surface"
    >
      {/* Header ---------------------------------------------------- */}
      <div className="flex h-[84px] shrink-0 items-center gap-1 pl-4 pr-2.5">
        <Link href="/home" className="mr-auto rounded-lg" aria-label="Symphony home">
          <SymphonyWordmark />
        </Link>
        <IconButton label="Search Symphony" size={32} onClick={() => setSearchOpen(true)}>
          <SearchIcon size={20} />
        </IconButton>
        <IconButton label="Collapse sidebar" size={32} onClick={toggleSidebar}>
          <PanelLeftIcon size={20} />
        </IconButton>
      </div>

      {/* Primary navigation ---------------------------------------- */}
      <ul className="space-y-[4px] px-3">
        {NAV.map(({ href, label, Icon, trailing }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="relative">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  if (href === "/whatsapp") {
                    e.preventDefault();
                    setPhoneModalOpen(true);
                  }
                }}
                className={[
                  "flex h-[34px] items-center gap-3 rounded-[10px] pl-2.5 pr-2 transition-colors duration-[120ms]",
                  active
                    ? "bg-surface-hover font-semibold"
                    : "font-medium hover:bg-[#f4f4f4] active:bg-surface-hover",
                ].join(" ")}
              >
                <Icon size={20} className="shrink-0" />
                <span className="truncate text-[14px] leading-none">{label}</span>
              </Link>
              {trailing === "new-chat" && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2">
                  <IconButton label="New chat" size={28}>
                    <PlusIcon size={19} />
                  </IconButton>
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Spaces ----------------------------------------------------- */}
      <div className="mt-7 px-3">
        <div className="flex h-[34px] items-center pl-2.5 pr-1">
          <h2 className="mr-auto text-[14px] font-medium text-text-tertiary">Spaces</h2>
          <IconButton label="Create a space" size={28} tone="muted">
            <PlusIcon size={19} />
          </IconButton>
        </div>
        <button
          type="button"
          className="mt-1 flex h-[46px] w-full items-center gap-3 rounded-[10px] pl-1 pr-2 text-left transition-colors hover:bg-[#f4f4f4]"
        >
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-dashed border-line-strong text-text-tertiary">
            <PlusIcon size={18} />
          </span>
          <span className="text-[14px] text-text-tertiary">Create a space</span>
        </button>
      </div>

      {/* Chat history ---------------------------------------------- */}
      <div className="mt-7 flex min-h-0 flex-1 flex-col px-3">
        <button
          type="button"
          onClick={() => setHistoryOpen((v) => !v)}
          aria-expanded={historyOpen}
          className="flex h-[34px] shrink-0 items-center gap-3 rounded-[10px] pl-2.5 pr-2 transition-colors hover:bg-[#f4f4f4]"
        >
          <HistoryIcon size={20} className="shrink-0" />
          <span className="mr-auto text-[14px] font-semibold leading-none">Chat History</span>
          <ChevronUp
            size={17}
            className={`text-text-tertiary transition-transform duration-[180ms] ${
              historyOpen ? "" : "rotate-180"
            }`}
          />
        </button>

        {historyOpen && (
          <ul className="sym-scroll mt-1 min-h-0 flex-1 space-y-[2px] overflow-y-auto pb-2">
            {THREADS.map((t) => {
              const active = t.id === activeThread;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setActiveThread(t.id)}
                    aria-current={active ? "true" : undefined}
                    className={[
                      "flex h-[34px] w-full items-center rounded-[10px] px-2.5 text-left transition-colors duration-[120ms]",
                      active ? "bg-surface-hover" : "hover:bg-[#f4f4f4]",
                    ].join(" ")}
                  >
                    <span className="truncate text-[14px] leading-none">{t.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Plan + profile -------------------------------------------- */}
      <div className="shrink-0 px-3 pb-3">
        <PlanCard />
        <div className="mt-2 flex items-center gap-2.5 rounded-[10px] py-1.5 pl-1 pr-1">
          <Avatar size={34} />
          <Link href="/account" className="mr-auto truncate text-[14px] font-semibold">
            {USER.name}
          </Link>
          <span className="relative">
            <IconButton label="Notifications" size={32}>
              <BellIcon size={20} />
            </IconButton>
            <span
              className="pointer-events-none absolute right-[5px] top-[4px] h-2.5 w-2.5 rounded-full border-2 border-surface bg-notify"
              aria-hidden
            />
            <span className="sr-only">You have unread notifications</span>
          </span>
        </div>
      </div>
    </nav>
  );
}

function PlanCard() {
  return (
    <div className="rounded-2xl bg-surface-subtle p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-bold">{USER.plan}</p>
        <Link
          href="/account"
          className="inline-flex h-[30px] items-center rounded-[9px] bg-brand px-3 text-[13px] font-semibold text-ink transition-colors hover:bg-brand-hover active:bg-brand-pressed"
        >
          Upgrade
        </Link>
      </div>
      <p className="mt-3 text-[13px] text-text-primary">
        {USER.monthlyUsed} of {USER.monthlyTotal} monthly credits used
      </p>
      <div className="mt-2.5">
        <ProgressBar
          value={USER.monthlyUsed}
          max={USER.monthlyTotal}
          label="Monthly credits used"
        />
      </div>
    </div>
  );
}

/* ==================================================================
   COLLAPSED RAIL — 60px. Nothing becomes unreachable when collapsed;
   every icon keeps its label in a tooltip.
   ================================================================== */

export function SidebarRail() {
  const pathname = usePathname();
  const { toggleSidebar, setSearchOpen, setPhoneModalOpen } = useWorkspace();

  return (
    <nav
      aria-label="Workspace"
      className="group/rail flex h-full w-[60px] shrink-0 flex-col items-center border-r border-line bg-surface py-4"
    >
      <Link href="/home" aria-label="Symphony home" className="mb-6 rounded-xl">
        <SymphonyMark size={38} />
      </Link>

      <Tooltip label="Expand sidebar">
        <IconButton label="Expand sidebar" size={40} onClick={toggleSidebar}>
          <PanelRightIcon size={20} />
        </IconButton>
      </Tooltip>

      <ul className="mt-2 flex flex-col items-center gap-1">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Tooltip label={label}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    if (href === "/whatsapp") {
                      e.preventDefault();
                      setPhoneModalOpen(true);
                    }
                  }}
                  className={[
                    "flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors duration-[120ms]",
                    active ? "bg-surface-hover" : "hover:bg-[#f4f4f4]",
                  ].join(" ")}
                >
                  <Icon size={21} />
                </Link>
              </Tooltip>
            </li>
          );
        })}
        <li>
          <Tooltip label="Search Symphony">
            <IconButton label="Search Symphony" size={40} onClick={() => setSearchOpen(true)}>
              <SearchIcon size={21} />
            </IconButton>
          </Tooltip>
        </li>
      </ul>

      <div className="mt-4 h-px w-8 bg-line" />

      <div className="mt-auto flex flex-col items-center gap-3">
        <span className="relative">
          <IconButton label="Notifications" size={40}>
            <BellIcon size={21} />
          </IconButton>
          <span
            className="pointer-events-none absolute right-[7px] top-[6px] h-2.5 w-2.5 rounded-full border-2 border-surface bg-notify"
            aria-hidden
          />
        </span>
        <Link href="/account" aria-label="Account settings" className="rounded-full">
          <Avatar size={34} />
        </Link>
      </div>
    </nav>
  );
}
