import { AppShell } from "@/components/shell/AppShell";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  return <AppShell siteId={siteId}>{children}</AppShell>;
}
