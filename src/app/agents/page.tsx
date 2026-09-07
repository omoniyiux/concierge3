"use client";

import { Button } from "@/components/ui";
import { useWorkspace } from "@/lib/workspace";

const STEPS = [
  "Tell the Maestro about your business and goals",
  "Get a custom team of agents built for your success",
  "Find growth opportunities your team is ready to act on",
];

/**
 * Agents — empty state. It explains what this area is, why it's empty,
 * and exactly what happens next.
 */
export default function AgentsPage() {
  const { setChatMode } = useWorkspace();

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-[840px] text-center">
        <h1 className="type-display text-[26px] leading-[1.15] sm:text-[31px]">A team that grows with your business</h1>

        <ol className="mt-12 grid grid-cols-1 gap-8 text-left sm:grid-cols-3 sm:gap-12">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3.5">
              <span
                className="mt-px flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-white"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="text-[13.5px] leading-[1.45]">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <Button size="lg" className="h-[44px] px-5 text-[13.5px]" onClick={() => setChatMode("expanded")}>
            Start Building a Team
          </Button>
        </div>
      </div>
    </div>
  );
}
