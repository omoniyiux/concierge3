"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AgentsIcon, ChatIcon, HomeIcon, SearchIcon, WhatsAppIcon } from "@/components/icons";
import { useWorkspace } from "@/lib/workspace";

const ITEMS = [
  { href: "/chat", label: "Chat", Icon: ChatIcon },
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/agents", label: "Agents", Icon: AgentsIcon },
  { href: "/whatsapp", label: "WhatsApp", Icon: WhatsAppIcon },
];

/**
 * Mobile keeps Maestro first-class: the conversation is a full-height
 * surface, and navigation drops to the bottom bar rather than shrinking
 * the desktop sidebar.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { setSearchOpen, setPhoneModalOpen, chatMode } = useWorkspace();

  if (chatMode === "expanded") return null;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex h-[62px] items-stretch border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            onClick={(e) => {
              if (href === "/whatsapp") {
                e.preventDefault();
                setPhoneModalOpen(true);
              }
            }}
            className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-[3px] ${
              active ? "text-text-primary" : "text-text-muted"
            }`}
          >
            <Icon size={22} />
            <span className="text-[11px] font-medium">{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-[3px] text-text-muted"
      >
        <SearchIcon size={22} />
        <span className="text-[11px] font-medium">Search</span>
      </button>
    </nav>
  );
}
