"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { AgentPreview } from "@/components/agent/AgentPreview";
import { EyeIcon } from "@/components/icons";
import { AGENT } from "@/lib/demo-data";

/* ============================================================================
   TRY IT, FROM WHEREVER YOU CHANGED IT
   ----------------------------------------------------------------------------
   The daily loop for a new owner is: change something, then check the agent
   now says the right thing. Until this existed, those two halves lived on
   different pages and most people never closed the loop — they approved
   knowledge and hoped.

   Any surface that changes behaviour can open this, and hand it the question
   its change was about. Seeded, the sheet opens already asking it.
   ========================================================================== */

export type TryItAnswer = {
  a: string;
  verdict: { kind: "answer" | "action" | "handoff" | "refusal"; note: string };
  cites?: string[];
  confidence: number;
};

export function TryItSheet({
  open,
  onClose,
  seedQuestion,
  extraAnswers,
  title = "Try it as a visitor",
  description = "A real run against your approved knowledge. Nothing here reaches a visitor or counts as a conversation.",
}: {
  open: boolean;
  onClose: () => void;
  seedQuestion?: string;
  extraAnswers?: Record<string, TryItAnswer>;
  title?: string;
  description?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} size="lg" eyebrow="Preview" title={title} description={description}>
      <AgentPreview
        greeting={AGENT.greeting}
        compact
        seedQuestion={seedQuestion}
        extraAnswers={extraAnswers}
      />
    </Modal>
  );
}

/** The button and its sheet in one, for surfaces that just need the control. */
export function TryItButton({
  seedQuestion,
  extraAnswers,
  children = "Try it as a visitor",
  variant = "secondary",
  size = "sm",
  className,
}: {
  seedQuestion?: string;
  extraAnswers?: Record<string, TryItAnswer>;
  children?: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        leading={<EyeIcon size={13} />}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <TryItSheet
        open={open}
        onClose={() => setOpen(false)}
        seedQuestion={seedQuestion}
        extraAnswers={extraAnswers}
      />
    </>
  );
}
