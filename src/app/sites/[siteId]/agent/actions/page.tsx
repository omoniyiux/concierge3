"use client";

import { use } from "react";
import { ActionsWorkbench } from "@/components/actions/ActionsWorkbench";

/** The same surface, reached from inside the Agent rather than the rail. */
export default function AgentActionsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  return <ActionsWorkbench siteId={siteId} eyebrow="Agent" />;
}
