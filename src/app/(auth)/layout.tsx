import Link from "next/link";
import type { ReactNode } from "react";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";

/**
 * Auth sits on the same warm canvas as the product, with a single quiet panel.
 * The right rail explains what Concierge is for people arriving cold.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="flex flex-1 flex-col px-5 py-8 sm:px-8">
        <Link href="/" className="w-fit rounded-lg" aria-label="Concierge">
          <ConciergeWordmark />
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>
        <p className="text-[14px] text-text-tertiary">
          <Link href="/legal/terms" className="hover:text-text-primary">
            Terms
          </Link>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          <Link href="/legal/privacy" className="hover:text-text-primary">
            Privacy
          </Link>
          <span className="mx-2" aria-hidden>
            ·
          </span>
          <Link href="/legal/ai-disclosure" className="hover:text-text-primary">
            AI disclosure
          </Link>
        </p>
      </div>

      <aside className="hidden w-[46%] max-w-[620px] flex-col justify-center border-l border-divider bg-surface px-14 lg:flex">
        <p className="t-eyebrow text-accent-ink">What Concierge does</p>
        <h2 className="t-page mt-3 max-w-[20ch]">Your website stops being a brochure.</h2>
        <ol className="mt-8 space-y-5">
          {[
            ["Learns", "Reads your public pages and builds a Site Brain you approve."],
            ["Answers", "Replies from approved knowledge only — it will not guess."],
            ["Acts", "Books, quotes, takes a number and finishes the job."],
            ["Routes", "Puts high-intent visitors in front of the right person, fast."],
            ["Learns again", "Tells you every question your site could not answer."],
          ].map(([title, body], i) => (
            <li key={title} className="flex gap-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-[14.5px] font-semibold tabular-nums text-text-tertiary">
                {i + 1}
              </span>
              <span>
                <span className="block text-[14px] font-medium">{title}</span>
                <span className="mt-0.5 block text-[15px] leading-[1.6] text-text-tertiary">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
