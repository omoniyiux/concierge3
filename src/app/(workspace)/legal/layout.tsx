import Link from "next/link";
import type { ReactNode } from "react";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { LEGAL_DOCS } from "@/lib/legal";

/**
 * Reachable from the signup consent line, so it carries no product chrome and
 * nothing that could be mistaken for a step in a flow — just the wordmark back
 * to where you came from, the three documents, and the text.
 */
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="bg-surface">
        <div className="mx-auto flex w-full max-w-[880px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-6 lg:px-8">
          <Link href="/" aria-label="Concierge home">
            <ConciergeWordmark />
          </Link>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-1">
            {LEGAL_DOCS.map((d) => (
              <Link
                key={d.slug}
                href={`/legal/${d.slug}`}
                className="px-2.5 py-1.5 text-[12.5px] text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
              >
                {d.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mx-auto w-full max-w-[880px] px-5 py-10 lg:px-8">
        <p className="t-body-sm border-t border-divider pt-6 text-text-tertiary">
          © {new Date().getFullYear()} Concierge ·{" "}
          <Link href="/help" className="hover:text-text-primary">
            Help
          </Link>
        </p>
      </footer>
    </div>
  );
}
