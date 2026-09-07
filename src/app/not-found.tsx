import Link from "next/link";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas px-5 py-8 lg:px-8">
      <Link href="/" className="w-fit" aria-label="Concierge home">
        <ConciergeWordmark />
      </Link>
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-[44ch] text-center">
          <p className="t-eyebrow text-text-muted">404</p>
          <h1 className="t-page mt-2.5">This page does not exist</h1>
          <p className="t-body mt-3 text-text-primary">
            The link may be out of date, or the site it pointed at may have been removed.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <LinkButton href="/">Go to the homepage</LinkButton>
            <LinkButton href="/help" variant="secondary">
              Get help
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
