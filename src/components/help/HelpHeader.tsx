"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { ChevronLeft } from "@/components/icons";
import { cx } from "@/lib/cx";

const SECTIONS = [
  { href: "/help", label: "Help" },
  { href: "/help/docs", label: "Docs" },
  { href: "/help/video-tutorials", label: "Video" },
];

/**
 * One bar across every help surface. The back control is history-aware —
 * Help is reached from inside the workspace as often as from a link, so
 * sending everyone to the same fixed page would be wrong half the time.
 */
export function HelpHeader() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-divider bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-[60px] w-full max-w-[1080px] items-center gap-3 px-5 lg:px-8">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) router.back();
            else router.push("/");
          }}
          className={cx(
            "-ml-2 inline-flex h-8 shrink-0 items-center gap-1.5 px-2 text-[12px] font-medium text-text-secondary",
            "transition-colors duration-[var(--dur-micro)] hover:bg-surface-subtle hover:text-text-primary",
          )}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <span aria-hidden className="h-4 w-px bg-line-strong" />

        <Link href="/help" aria-label="Concierge help">
          <ConciergeWordmark />
        </Link>

        <nav aria-label="Help sections" className="ml-auto flex items-center gap-1">
          {SECTIONS.map((s) => {
            const active = s.href === "/help" ? pathname === "/help" : pathname.startsWith(s.href);
            return (
              <Link
                key={s.href}
                href={s.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "px-2.5 py-1.5 text-[12px] transition-colors duration-[var(--dur-micro)]",
                  active
                    ? "font-medium text-text-primary underline decoration-accent decoration-2 underline-offset-[7px]"
                    : "text-text-tertiary hover:text-text-primary",
                )}
              >
                {s.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
