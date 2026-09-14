"use client";

import { Suspense, use } from "react";
import { PageContainer, PageHeader } from "@/components/shell/AppShell";
import { RoutingInbox } from "@/components/routing/RoutingInbox";
import { useDestinations, useRoutingInbox } from "@/lib/sim/store";

/* ============================================================================
   THE HANDOFF INBOX
   ----------------------------------------------------------------------------
   Its own page, because it is the one part of routing that is work rather than
   setup. It used to be the first tab on "Where visitors end up", which put
   "reply to Tomas about his chipped tooth" in the same strip as "decide where
   quote requests go" — two different jobs, on two different clocks, competing
   for the same glance.

   Everything routed lands here first, whether or not anything else is
   connected. That is what makes routing work before an owner has survived an
   OAuth screen, so it is worth a page of its own.
   ========================================================================== */

export default function InboxPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = use(params);
  return (
    <Suspense fallback={null}>
      <Inbox siteId={siteId} />
    </Suspense>
  );
}

function Inbox({ siteId }: { siteId: string }) {
  const items = useRoutingInbox(siteId);
  const destinations = useDestinations(siteId);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Agent"
        title="Handoffs waiting on you"
        description="Everything Concierge could not finish itself lands here first — whether or not you have connected anywhere else to send it."
      />
      <RoutingInbox items={items} destinations={destinations} siteId={siteId} />
    </PageContainer>
  );
}
