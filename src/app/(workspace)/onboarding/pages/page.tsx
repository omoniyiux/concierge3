"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { CheckIcon, SparkIcon } from "@/components/icons";
import { AgentStep, BusinessStep, GoalStep, TemplateStep } from "@/components/smart-pages/GuidedSteps";
import { Generating } from "@/components/smart-pages/Generating";
import { LaunchStep } from "@/components/smart-pages/LaunchStep";
import { VibeCreate } from "@/components/smart-pages/VibeCreate";
import { cx } from "@/lib/cx";
import {
  buildSmartDocument,
  displayName,
  draftForGoal,
  draftForTemplate,
  draftFromDocument,
  type SmartDraft,
} from "@/lib/starters";
import type { PageDocument } from "@/lib/types";

/* ============================================================================
   CONCIERGE PAGES — LAUNCH A SMART WEBSITE
   ----------------------------------------------------------------------------
   Not a page builder: a website with the AI agent already built in. There are
   two ways in, and they meet in the middle.

   - Guided Flow asks four questions — goal, template, business, agent — with
     the real page drawn beside every one of them.
   - Vibe Chat takes a sentence and drafts all four answers at once, then lets
     the owner refine by talking, or drop into the guided steps with
     everything filled in.

   Both produce the same `PageDocument` the existing editor, renderer and
   publisher already work with, so nothing downstream had to change to accept
   a page made this way. Nothing is written to the workspace until the owner
   chooses where the page goes on the last step.
   ========================================================================== */

type Mode = "guided" | "vibe";
type Step = "goal" | "template" | "business" | "agent" | "generating" | "launch";

const STEPS: { key: Step; label: string }[] = [
  { key: "goal", label: "Goal" },
  { key: "template", label: "Template" },
  { key: "business", label: "Business" },
  { key: "agent", label: "Agent" },
  { key: "launch", label: "Launch" },
];

const stepIndex = (step: Step) => (step === "generating" ? 4 : STEPS.findIndex((s) => s.key === step));

export default function LaunchSmartPage() {
  const [siteId] = useState(() => `site_${crypto.randomUUID().slice(0, 8)}`);
  const [mode, setMode] = useState<Mode>("guided");
  const [step, setStep] = useState<Step>("goal");
  const [draft, setDraft] = useState<SmartDraft>(() => draftForGoal("opportunities"));
  /* The generated page. Built once at Generate (or Apply plan) and edited from
     then on, so quick edits on the last step are not lost to a rebuild. */
  const [page, setPage] = useState<PageDocument | null>(null);
  const [pending, setPending] = useState<PageDocument | null>(null);
  const [vibeDoc, setVibeDoc] = useState<PageDocument | null>(null);

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const generate = (doc: PageDocument) => {
    setPending(doc);
    go("generating");
  };

  const finishGenerating = useCallback(() => {
    setPage(pending);
    setStep("launch");
    window.scrollTo({ top: 0 });
  }, [pending]);

  const inCreation = step !== "generating" && step !== "launch";
  const current = stepIndex(step);
  const businessName = displayName((pending ?? page)?.brief?.business ?? draft.brief.business);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-divider bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-[var(--topbar-h)] w-full max-w-[1320px] items-center gap-4 px-5 lg:px-8">
          <Link href="/sites" aria-label="Concierge — all sites" className="shrink-0">
            <ConciergeWordmark className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
          </Link>
          <span className="hidden h-4 w-px bg-line-strong sm:block" aria-hidden />
          <span className="hidden text-[12px] text-text-tertiary sm:block">Pages</span>

          {inCreation && (
            <div role="tablist" aria-label="How to build" className="mx-auto flex border border-line-strong bg-surface p-0.5">
              {(
                [
                  { id: "guided", label: "Guided flow" },
                  { id: "vibe", label: "Vibe chat" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={mode === m.id}
                  onClick={() => setMode(m.id)}
                  className={cx(
                    "flex h-8 items-center gap-1.5 whitespace-nowrap px-2.5 text-[12px] font-medium transition-colors sm:px-3.5",
                    mode === m.id ? "bg-ink text-text-inverse" : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {m.id === "vibe" && <SparkIcon size={13} className={mode === m.id ? "text-accent" : undefined} />}
                  {m.label}
                </button>
              ))}
            </div>
          )}

          <Link
            href="/sites"
            className={cx(
              "whitespace-nowrap text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary",
              !inCreation && "ml-auto",
            )}
          >
            <span className="hidden sm:inline">Save and </span>exit
          </Link>
        </div>
      </header>

      {/* Where you are. Guided only: Vibe Chat has no steps to be on. */}
      {(mode === "guided" || !inCreation) && (
        <nav aria-label="Progress" className="border-b border-divider bg-surface">
          <ol className="cg-no-scrollbar mx-auto flex w-full max-w-[1320px] items-center gap-1 overflow-x-auto px-5 py-2.5 lg:px-8">
            {STEPS.map((s, i) => {
              const state = i < current ? "done" : i === current ? "active" : "todo";
              const reachable = state === "done" && inCreation;
              const chip = (
                <span
                  className={cx(
                    "flex h-7 items-center gap-2 px-2 text-[12px] font-medium transition-colors",
                    state === "active" ? "text-text-primary" : state === "done" ? "text-text-secondary" : "text-text-disabled",
                  )}
                >
                  <span
                    className={cx(
                      "flex h-5 w-5 items-center justify-center text-[10.5px] font-semibold tabular-nums",
                      state === "done"
                        ? "bg-success-soft text-success"
                        : state === "active"
                          ? "bg-accent text-ink"
                          : "bg-surface-subtle",
                    )}
                  >
                    {state === "done" ? <CheckIcon size={11} strokeWidth={2.6} /> : i + 1}
                  </span>
                  {s.label}
                </span>
              );
              return (
                <li key={s.key} className="flex shrink-0 items-center gap-1">
                  {reachable ? (
                    <button type="button" onClick={() => go(s.key)} className="hover:bg-surface-subtle">
                      {chip}
                    </button>
                  ) : (
                    <span aria-current={state === "active" ? "step" : undefined}>{chip}</span>
                  )}
                  {i < STEPS.length - 1 && <span className="h-px w-6 bg-line-strong" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-5 pb-24 pt-10 lg:px-8">
        {/* Vibe Chat stays mounted while the owner looks at the guided steps,
            so switching back finds the conversation where they left it. */}
        {inCreation && (
          <div className={mode === "vibe" ? undefined : "hidden"}>
            <VibeCreate
              siteId={siteId}
              document={vibeDoc}
              onDocument={setVibeDoc}
              onApply={generate}
              onEditManually={(doc) => {
                setDraft(draftFromDocument(doc, displayName(doc.brief?.business ?? draft.brief.business)));
                setMode("guided");
                go("business");
              }}
            />
          </div>
        )}

        {inCreation && mode === "guided" && (
          <>
            {step === "goal" && (
              <GoalStep
                draft={draft}
                onGoal={(goal) => setDraft((d) => draftForGoal(goal, d))}
                onNext={() => go("template")}
              />
            )}
            {step === "template" && (
              <TemplateStep
                draft={draft}
                onTemplate={(id) => setDraft((d) => draftForTemplate(id, d))}
                onBack={() => go("goal")}
                onNext={() => go("business")}
              />
            )}
            {step === "business" && (
              <BusinessStep
                draft={draft}
                siteId={siteId}
                onChange={setDraft}
                onBack={() => go("template")}
                onNext={() => go("agent")}
              />
            )}
            {step === "agent" && (
              <AgentStep
                draft={draft}
                siteId={siteId}
                onAgent={(agent) => setDraft((d) => ({ ...d, agent }))}
                onBack={() => go("business")}
                onGenerate={() => generate(buildSmartDocument(draft, siteId))}
              />
            )}
          </>
        )}

        {step === "generating" && <Generating businessName={businessName} onDone={finishGenerating} />}

        {step === "launch" && page && (
          <LaunchStep
            document={page}
            siteId={siteId}
            onChange={setPage}
            onBack={() => {
              /* Back into the steps with what the page now says, so the agent
                 the owner just tested is the one they find there. */
              setDraft(draftFromDocument(page, businessName));
              setMode("guided");
              go("agent");
            }}
          />
        )}
      </main>
    </div>
  );
}
