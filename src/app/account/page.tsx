import Link from "next/link";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { Badge, Card, Field, Input, LinkButton, Panel, SectionHead } from "@/components/ui";
import { ChevronLeft } from "@/components/icons";
import { DEFAULT_SITE_ID, ORG, TEAM } from "@/lib/demo-data";

export const metadata = { title: "Account" };

export default function AccountPage() {
  const me = TEAM[0];
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-divider bg-surface px-6 py-4 lg:px-8">
        <div className="mx-auto flex w-full max-w-[760px] items-center gap-4">
          <Link href="/" className="rounded-lg" aria-label="Concierge home">
            <ConciergeWordmark />
          </Link>
          <LinkButton
            href={`/sites/${DEFAULT_SITE_ID}/overview`}
            variant="tertiary"
            size="sm"
            className="ml-auto"
            leading={<ChevronLeft size={14} />}
          >
            Back to workspace
          </LinkButton>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 py-12 lg:px-8">
        <p className="t-eyebrow text-text-muted">Account</p>
        <h1 className="t-page mt-2.5">Your profile</h1>
        <p className="t-body mt-3 text-text-tertiary">
          This is you across every organisation and website you belong to.
        </p>

        <div className="mt-9 space-y-6">
          <Panel className="p-6">
            <SectionHead title="Profile" className="mb-5" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="a-name">
                <Input id="a-name" defaultValue={me.name} />
              </Field>
              <Field label="Email" htmlFor="a-email" hint="Used for sign-in and routing.">
                <Input id="a-email" type="email" defaultValue={me.email} />
              </Field>
            </div>
          </Panel>

          <Panel className="p-6">
            <SectionHead title="Organisation" hint="You can belong to more than one." className="mb-4" />
            <Card className="flex items-center gap-3.5 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-[13px] font-semibold text-text-secondary">
                {ORG.name.split(" ").map((w) => w[0]).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">{ORG.name}</span>
                <span className="block text-[14px] text-text-tertiary">
                  {ORG.seatsUsed} of {ORG.seatsIncluded} seats · {ORG.plan} plan
                </span>
              </span>
              <Badge tone="accent">{me.role}</Badge>
            </Card>
          </Panel>

          <Panel className="border-danger-line p-6">
            <SectionHead
              title="Delete your account"
              hint="Every site you own stops answering immediately. This cannot be undone."
              className="mb-4"
            />
            <LinkButton href="/help" variant="secondary" size="sm">
              Read what happens first
            </LinkButton>
          </Panel>
        </div>
      </main>
    </div>
  );
}
