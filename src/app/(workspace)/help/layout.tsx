import type { ReactNode } from "react";
import Link from "next/link";
import { HelpHeader } from "@/components/help/HelpHeader";

export default function HelpLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <HelpHeader />
      {children}
      <footer className="border-t border-divider bg-surface">
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-7 lg:px-8">
          <p className="t-body-sm text-text-tertiary">
            Documentation for Concierge. Updated as the product changes.
          </p>
          <div className="ml-auto flex items-center gap-4">
            <Link href="/help/docs" className="t-body-sm text-text-secondary hover:text-text-primary">
              All guides
            </Link>
            <Link
              href="/help/video-tutorials"
              className="t-body-sm text-text-secondary hover:text-text-primary"
            >
              Video tutorials
            </Link>
            <a
              href="mailto:support@poweredbyconcierge.com"
              className="t-body-sm text-text-secondary hover:text-text-primary"
            >
              Contact support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
