import Link from "next/link";
import { ConciergeWordmark } from "@/components/shell/ConciergeMark";
import { Card, LinkButton } from "@/components/ui";
import { ArrowRight, BrainIcon, CodeIcon, InstallIcon, RoutingIcon } from "@/components/icons";

export const metadata = { title: "Help" };

const TOPICS = [
  { Icon: InstallIcon, title: "Installing Concierge", body: "The script, platform guides and what to do when it is not detected." },
  { Icon: BrainIcon, title: "Site Brain", body: "How Concierge learns, what approval means, and how to fix a wrong answer." },
  { Icon: RoutingIcon, title: "Routing", body: "Destinations, rules, testing a route and reading delivery history." },
  { Icon: CodeIcon, title: "Developers", body: "The API, webhook payloads and building your own integration." },
];

export default function HelpPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-divider bg-surface px-6 py-4 lg:px-8">
        <div className="mx-auto flex w-full max-w-[900px] items-center">
          <Link href="/" className="rounded-lg" aria-label="Concierge home">
            <ConciergeWordmark />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[900px] px-5 py-14 lg:px-8">
        <p className="t-eyebrow text-accent-ink">Help</p>
        <h1 className="t-page mt-2.5">How can we help?</h1>
        <p className="t-body mt-3 max-w-[52ch] text-text-tertiary">
          Setup guides, how Concierge decides what to say, and what to do when something is not behaving.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TOPICS.map(({ Icon, title, body }) => (
            <Card key={title} interactive className="p-5">
              <Icon size={18} className="text-text-tertiary" />
              <h2 className="t-card mt-3.5">{title}</h2>
              <p className="t-body-sm mt-1.5 text-text-tertiary">{body}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-8 flex flex-wrap items-center gap-4 p-5">
          <p className="min-w-0 flex-1 text-[13.5px]">
            <span className="font-medium">Still stuck?</span>{" "}
            <span className="text-text-tertiary">Send us the site and what you expected to happen.</span>
          </p>
          <LinkButton href="mailto:support@poweredbyconcierge.com" external variant="secondary" size="sm" trailing={<ArrowRight size={13} />}>
            Contact support
          </LinkButton>
        </Card>
      </main>
    </div>
  );
}
