import Link from "next/link";
import type { ReactNode } from "react";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { LinkButton } from "@/components/ui";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#brain", label: "Site Brain" },
  { href: "/#actions", label: "Actions" },
  { href: "/#pricing", label: "Pricing" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-[62px] w-full max-w-[1180px] items-center gap-8 px-5 lg:px-8">
          <Link href="/" className="rounded-lg" aria-label="Concierge home">
            <ConciergeWordmark />
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="rounded-md px-2.5 py-1.5 text-[13px] text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LinkButton href="/sign-in" variant="tertiary" size="md" className="hidden sm:inline-flex">
              Sign in
            </LinkButton>
            <LinkButton href="/create-account" size="md">
              Get started
            </LinkButton>
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-14 lg:px-8">
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            <div className="min-w-[240px] flex-1">
              <ConciergeWordmark />
              <p className="t-body-sm mt-3.5 max-w-[34ch] text-text-tertiary">
                A website agent that understands your business, answers from what you approve, and brings the right
                person in when it matters.
              </p>
            </div>
            {[
              { title: "Product", links: ["How it works", "Site Brain", "Actions", "Routing", "Concierge Pages", "Pricing"] },
              { title: "Developers", links: ["Documentation", "API reference", "Webhooks", "Install guides", "Status"] },
              { title: "Company", links: ["About", "Security", "AI disclosure", "Privacy", "Terms"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="t-eyebrow text-text-muted">{col.title}</p>
                <ul className="mt-3.5 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <span className="text-[13px] text-text-secondary transition-colors hover:text-text-primary">
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-12 border-t border-line pt-6 text-[12px] text-text-tertiary">
            © {new Date().getFullYear()} Concierge. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
