import { PageContainer } from "@/components/shell/AppShell";
import { Skeleton } from "@/components/ui";

/**
 * Every workspace surface opens with the same furniture — eyebrow, title, one
 * sentence, then content — so the fallback is that furniture with the words
 * taken out. The shell around it stays interactive, which is the point: the
 * rail and the site switcher keep working while a surface is still arriving.
 */
export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-8">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3.5 h-8 w-[min(28ch,80%)]" />
        <Skeleton className="mt-4 h-4 w-[min(52ch,95%)]" />
      </div>
      <div className="space-y-3" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </PageContainer>
  );
}
