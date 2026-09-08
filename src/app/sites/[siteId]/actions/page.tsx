"use client";

import { use } from "react";
import { ActionsWorkbench } from "@/components/actions/ActionsWorkbench";

/** Actions as a destination of its own. Same surface as the Agent's tab. */
export default function ActionsPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  return <ActionsWorkbench siteId={siteId} eyebrow="Actions" />;
}
