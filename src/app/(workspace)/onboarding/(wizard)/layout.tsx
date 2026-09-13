"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { CheckIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { DEFAULT_SITE_ID } from "@/lib/demo-data";
import { STEPS, isStepKey, stepHref, stepIndex } from "@/lib/onboarding";
import { WizardProvider, clearWizard } from "@/lib/onboarding-state";

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

  function saveAndExit() {
    clearWizard();
    router.push(`/sites/${DEFAULT_SITE_ID}/overview`);
  }

  return (
    <WizardProvider>
      <div className="flex min-h-dvh flex-col">
        {/* Wizard chrome: quiet, and always shows where you are ------------ */}
        <header className="sticky top-0 z-20 border-b border-divider bg-canvas/85 backdrop-blur">
          <div className="mx-auto flex h-[var(--topbar-h)] w-full max-w-[1120px] items-center gap-4 px-5 lg:px-8">
            <ConciergeWordmark />
            <ol className="ml-4 hidden items-center gap-1 md:flex">
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
              onClick={saveAndExit}
              className="ml-auto hidden text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary md:block"
            >
              Save and exit
            </button>
          </div>
        </header>

        <main className="flex-1 px-5 py-12 lg:px-8">{children}</main>
      </div>
    </WizardProvider>
  );
}
