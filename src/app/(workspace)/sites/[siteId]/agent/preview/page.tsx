"use client";

import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { AgentPreview } from "@/components/agent/AgentPreview";
import { AGENT } from "@/lib/demo-data";

/** A full-width run of the agent, using the same greeting Persona sets. */
export default function AgentPreviewPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Agent"
        title="Test the agent"
        description="A real run against your approved knowledge. Nothing said here reaches a visitor or counts as a conversation."
      />
      <AgentPreview greeting={AGENT.greeting} />
    </PageContainer>
  );
}
