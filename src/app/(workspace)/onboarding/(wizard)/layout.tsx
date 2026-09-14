"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { CheckIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { DEFAULT_SITE_ID } from "@/lib/demo-data";
import { STEPS, isStepKey, stepHref, stepIndex } from "@/lib/onboarding";
import { WizardProvider } from "@/lib/onboarding-state";

/**
 * A route group, so the wizard chrome and its state wrap the steps without
 * `(wizard)` appearing in the URL — and without reaching `/onboarding/pages`,
 * which is a sibling route that has nothing to do with this flow.
 */
export default function WizardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const current = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const index = isStepKey(current) ? stepIndex(current) : 0;

  return (
    <WizardProvider>
      <div className="flex min-h-dvh flex-col">
        {/* Wizard chrome: quiet, and always shows where you are ------------ */}
        <header className="sticky top-0 z-20 border-b border-divider bg-canvas/85 backdrop-blur">
          <div className="mx-auto flex h-[var(--topbar-h)] w-full max-w-[1120px] items-center gap-4 px-5 lg:px-8">
            <ConciergeWordmark />
            <ol className="ml-4 hidden items-center gap-1 md:flex lg:hidden">
              {STEPS.map((s, i) => {
                const state = i < index ? "done" : i === index ? "active" : "todo";
                const chip = (
                  <span
                    className={cx(
                      "flex h-6 items-center gap-1.5 px-2 text-[13px] font-medium transition-colors",
                      state === "active"
                        ? "bg-ink text-text-inverse"
                        : state === "done"
                          ? "text-success"
                          : "text-text-disabled",
                    )}
                  >
                    {state === "done" && <CheckIcon size={11} strokeWidth={2.6} />}
                    {s.label}
                  </span>
                );
                return (
                  <li key={s.key} className="flex items-center gap-1">
                    {/* A step you have finished is a place you can go back to.
                        It was previously inert, so correcting the website you
                        typed meant restarting the flow. */}
                    {state === "done" ? (
                      <Link href={stepHref(s.key)} aria-label={`Back to ${s.label}`}>
                        {chip}
                      </Link>
                    ) : (
                      <span aria-current={state === "active" ? "step" : undefined}>{chip}</span>
                    )}
                    {i < STEPS.length - 1 && <span className="h-px w-3 bg-line" />}
                  </li>
                );
              })}
            </ol>
            <span className="ml-auto text-[11.5px] text-text-tertiary md:hidden">
              Step {index + 1} of {STEPS.length}
            </span>
            <button
              type="button"
              onClick={() => router.push(`/sites/${DEFAULT_SITE_ID}/overview`)}
              className="ml-auto hidden text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary md:block"
            >
              Save and exit
            </button>
          </div>
        </header>

        {/* Two columns from lg, the way the auth screens are built. A 560px
            column alone in a 1400px window read as a mistake — the step sat in
            the top-left of an empty page. The rail carries the same seven
            steps the top strip does, so that strip stands down at lg rather
            than saying it twice. */}
        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-[1120px] gap-16 px-5 py-12 lg:px-8">
            <div className="min-w-0 flex-1">{children}</div>

            <aside className="hidden w-[280px] shrink-0 lg:block" aria-hidden>
              <p className="t-eyebrow text-text-muted">Setting up</p>
              <ol className="mt-4 space-y-0 border-t border-divider">
                {STEPS.map((s, i) => {
                  const state = i < index ? "done" : i === index ? "active" : "todo";
                  return (
                    <li key={s.key} className="flex gap-3 border-b border-divider py-3">
                      <span
                        className={cx(
                          "mt-px flex h-5 w-5 shrink-0 items-center justify-center text-[11px] font-semibold tabular-nums",
                          state === "done"
                            ? "bg-success-soft text-success"
                            : state === "active"
                              ? "bg-ink text-text-inverse"
                              : "bg-surface-subtle text-text-disabled",
                        )}
                      >
                        {state === "done" ? <CheckIcon size={11} strokeWidth={2.6} /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={cx(
                            "block text-[12.5px] font-medium",
                            state === "todo" ? "text-text-disabled" : "text-text-primary",
                          )}
                        >
                          {s.label}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] leading-[1.5] text-text-tertiary">
                          {s.blurb}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-4 text-[11.5px] leading-[1.55] text-text-tertiary">
                Nothing goes live until you approve what Concierge learned.
              </p>
            </aside>
          </div>
        </main>
      </div>
    </WizardProvider>
  );
}
