import { AppShell } from "@/components/shell/AppShell";
import { SiteGuard } from "@/components/shell/SiteGuard";
import { SimProvider } from "@/lib/sim/store";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  return (
    // Everything inside the workspace reads from the simulated backend, so a
    // change made on one surface is true on all of them — and survives a
    // reload — before any API exists.
    <SimProvider siteId={siteId}>
      {/* The guard lives inside the provider because only the world knows
          which sites exist — the fixtures do not include the ones the owner
          built here. */}
      <SiteGuard siteId={siteId}>
        <AppShell siteId={siteId}>{children}</AppShell>
      </SiteGuard>
    </SimProvider>
  );
}
