import type { Metadata } from "next";
import { Badge, Card, LinkButton } from "@/components/ui";
import {
  AgentFrame,
  InsightsFrame,
  LeadFrame,
  OverviewFrame,
  ProductFrame,
  RoutingFrame,
  SiteBrainFrame,
} from "@/components/marketing/ProductFrames";
import {
  ActionsIcon,
  ArrowRight,
  BrainIcon,
  CheckIcon,
  ConversationsIcon,
  InsightsIcon,
  RoutingIcon,
  ShieldIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";

export const metadata: Metadata = {
  title: "Concierge — a website agent that can take action",
  description:
    "Concierge learns your business from your own website, answers visitor questions from knowledge you approve, completes real actions like bookings and quotes, and routes high-intent visitors to the right person.",
  openGraph: {
    title: "Concierge — a website agent that can take action",
    description:
      "Your website answers questions, guides visitors, completes actions and brings in the right person with context intact.",
    type: "website",
    siteName: "Concierge",
  },
};

/* ============================================================================
   Built last, on purpose. Every screen below is the real product UI rendered
   from the same components as the workspace — not a mockup of it.
   ========================================================================== */

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <LogoStrip />
      <Narrative />
      <BrainSection />
      <AgentSection />
      <ActionsSection />
      <RoutingSection />
      <InsightsSection />
      <PagesSection />
      <TrustSection />
      <Pricing />
      <FinalCta />
    </main>
  );
}

/* ---- Section furniture --------------------------------------------------- */

function Section({
  id,
  children,
  className,
  tone = "canvas",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: "canvas" | "surface";
}) {
  return (
    <section
      id={id}
      className={cx(
        "px-5 py-24 lg:px-8 lg:py-32",
        tone === "surface" && "bg-surface",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[1180px]">{children}</div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  body: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cx(align === "center" ? "mx-auto max-w-[62ch] text-center" : "max-w-[54ch]", className)}>
      <p className="t-eyebrow text-accent-ink">{eyebrow}</p>
      <h2 className="t-display mt-3.5 text-[32px] sm:text-[40px]">{title}</h2>
      <p className="t-body mt-4 text-[15px] leading-[1.6] text-text-tertiary">{body}</p>
    </div>
  );
}

/* ---- Hero ---------------------------------------------------------------- */

function Hero() {
  return (
    <section className="px-5 pb-20 pt-20 lg:px-8 lg:pb-28 lg:pt-28">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mx-auto max-w-[780px] text-center">
          <Badge tone="accent" className="mb-6">
            Answer · Guide · Act · Connect · Learn
          </Badge>
          <h1 className="t-display mx-auto max-w-[16ch] text-[38px] sm:text-[54px] lg:text-[62px]">
            Your website should respond in real time.
          </h1>
          <p className="mx-auto mt-6 max-w-[52ch] text-[16px] leading-[1.6] text-text-tertiary">
            Concierge learns your business from your own pages, answers visitors from knowledge you approve, finishes
            real jobs like bookings and quotes, and brings in the right person with the context intact.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/create-account" size="lg" trailing={<ArrowRight size={16} />}>
              Install Concierge
            </LinkButton>
            <LinkButton href="/onboarding" variant="secondary" size="lg">
              See it learn a website
            </LinkButton>
          </div>
          <p className="mt-4 text-[13.5px] text-text-tertiary">
            No card needed · Live in under 10 minutes · Works on any website
          </p>
        </div>

        {/* The actual product, not a picture of it. */}
        <div className="mt-14 lg:mt-20">
          <ProductFrame label="The Concierge overview dashboard" className="mx-auto max-w-[1000px]">
            <OverviewFrame />
          </ProductFrame>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="bg-surface px-5 py-14 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <p className="text-center text-[13.5px] text-text-tertiary">
          Works with the tools your business already runs on
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {["Gmail", "Slack", "Calendly", "Stripe", "HubSpot", "WhatsApp", "Zapier", "Webhooks"].map((n) => (
            <li key={n} className="text-[14px] font-medium tracking-[-0.01em] text-text-muted">
              {n}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---- The five-step narrative --------------------------------------------- */

const STEPS = [
  {
    Icon: BrainIcon,
    title: "It understands your business",
    body: "Concierge reads your public pages and builds a Site Brain — the facts, prices, policies and rules it is allowed to use.",
  },
  {
    Icon: ConversationsIcon,
    title: "It understands your visitor",
    body: "Every conversation is read for intent: are they pricing you up, ready to book, or in trouble and needing a person?",
  },
  {
    Icon: ActionsIcon,
    title: "It takes action",
    body: "Booking a time, preparing a quote, taking a number. Concierge finishes the job rather than describing it.",
  },
  {
    Icon: RoutingIcon,
    title: "It brings in the right person",
    body: "When a human is needed, the right one hears about it in seconds — with the transcript and page context attached.",
  },
  {
    Icon: InsightsIcon,
    title: "It tells you what it learned",
    body: "Every question your website could not answer, ranked. That list is the fastest route to a better conversion rate.",
  },
];

function Narrative() {
  return (
    <Section id="how">
      <SectionIntro
        eyebrow="How it works"
        title="Five things happen on every visit."
        body="Concierge is not a chatbot bolted to a page. It is a layer that understands, decides, acts and reports back."
        align="center"
      />
      <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map(({ Icon, title, body }, i) => (
          <li key={title}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-subtle text-accent">
                <Icon size={16} />
              </span>
              <span className="t-eyebrow text-text-muted">Step {i + 1}</span>
            </div>
            <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.015em]">{title}</h3>
            <p className="mt-2 text-[15px] leading-[1.6] text-text-tertiary">{body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ---- Feature sections, each showing the real surface ---------------------- */

function Split({
  reverse,
  intro,
  frame,
  points,
}: {
  reverse?: boolean;
  intro: React.ReactNode;
  frame: React.ReactNode;
  points?: string[];
}) {
  return (
    <div className={cx("grid items-center gap-12 lg:grid-cols-2 lg:gap-16", reverse && "lg:[&>*:first-child]:order-2")}>
      <div>
        {intro}
        {points && (
          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3">
                <CheckIcon size={15} className="mt-0.5 shrink-0 text-success" strokeWidth={2.2} />
                <span className="text-[14px] leading-[1.6] text-text-secondary">{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>{frame}</div>
    </div>
  );
}

function BrainSection() {
  return (
    <Section id="brain" tone="surface">
      <Split
        intro={
          <SectionIntro
            eyebrow="Site Brain"
            title="It only says what you approved."
            body="Concierge reads your website and turns it into reviewable knowledge. You approve, edit or forbid each item — and it will hand off rather than guess at anything else."
          />
        }
        points={[
          "Every answer traces back to a page or something you wrote.",
          "Confidence is shown on each item, so weak sources are obvious.",
          "Never-promise rules are hard limits the tone cannot override.",
          "Re-learn on a schedule; your approvals survive the update.",
        ]}
        frame={
          <ProductFrame label="Site Brain, showing approved and unapproved knowledge" chrome="plain">
            <SiteBrainFrame />
          </ProductFrame>
        }
      />
    </Section>
  );
}

function AgentSection() {
  return (
    <Section id="agent">
      <Split
        reverse
        intro={
          <SectionIntro
            eyebrow="The Agent"
            title="Autonomous when confident. Human when it matters."
            body="Concierge answers on its own when the knowledge is solid, and steps aside the moment a visitor needs a person. You can watch it work before a single visitor sees it."
          />
        }
        points={[
          "Test it against real questions before you go live.",
          "Every reply shows its sources and its confidence.",
          "Pick a role — receptionist, sales, support — in one click.",
          "Voice is available where speaking beats typing.",
        ]}
        frame={
          <ProductFrame label="A live Concierge conversation with sources and confidence" chrome="plain">
            <AgentFrame />
          </ProductFrame>
        }
      />
    </Section>
  );
}

function ActionsSection() {
  return (
    <Section id="actions" tone="surface">
      <SectionIntro
        eyebrow="Actions"
        title="Answering is the floor, not the ceiling."
        body="A chatbot describes your booking page. Concierge books the appointment, prepares the quote, and takes the number — then tells the right person it happened."
        align="center"
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          ["Book an appointment", "Offers real availability, collects what your team needs, creates the request."],
          ["Request a quote", "Captures scope and budget for work that needs a human price."],
          ["Request a call", "The fastest handoff. Number plus page context, in seconds."],
          ["Capture contact details", "A light touch when someone is interested but not ready."],
          ["Take a payment", "Deposits and booking fees through your connected checkout."],
          ["Book a consultation", "For anything you will not quote sight unseen."],
        ].map(([title, body]) => (
          <Card key={title} className="p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <ActionsIcon size={15} />
            </span>
            <h3 className="mt-3.5 text-[16px] font-semibold tracking-[-0.015em]">{title}</h3>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-text-tertiary">{body}</p>
          </Card>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-center">
        <ProductFrame label="A qualified lead captured by Concierge" chrome="plain">
          <LeadFrame />
        </ProductFrame>
        <div>
          <h3 className="t-section">Qualification happens while they talk.</h3>
          <p className="t-body mt-3 text-[15px] leading-[1.6] text-text-tertiary">
            Concierge works out what someone wants, roughly what it is worth and how soon they need it — then scores
            them, so your team knows who to call first.
          </p>
        </div>
      </div>
    </Section>
  );
}

function RoutingSection() {
  return (
    <Section id="routing">
      <Split
        intro={
          <SectionIntro
            eyebrow="Routing"
            title="The right person, in seconds."
            body="Rules read like sentences, not code. If a visitor is in pain, ring the phone. If a lead is worth more than three thousand, tell the front desk. Everything else follows a default you set once."
          />
        }
        points={[
          "Email, Slack, SMS, webhooks and your CRM.",
          "Test any route before you rely on it.",
          "Every handoff is logged, with what happened to it.",
          "A failing destination never breaks the visitor experience.",
        ]}
        frame={
          <ProductFrame label="Routing rules in Concierge" chrome="plain">
            <RoutingFrame />
          </ProductFrame>
        }
      />
    </Section>
  );
}

function InsightsSection() {
  return (
    <Section id="insights" tone="surface">
      <Split
        reverse
        intro={
          <SectionIntro
            eyebrow="Insights"
            title="Your website is telling you what customers want."
            body="The most valuable report in Concierge is the list of questions your site could not answer. Each one is a customer who did not get what they came for — and a gap you can close in a minute."
          />
        }
        points={[
          "Every unanswered question, ranked by how often it came up.",
          "Answer it once and Concierge uses it immediately.",
          "See which intents convert and which quietly do not.",
          "No re-crawl, no reinstall, no developer.",
        ]}
        frame={
          <ProductFrame label="Insights showing questions the website could not answer" chrome="plain">
            <InsightsFrame />
          </ProductFrame>
        }
      />
    </Section>
  );
}

function PagesSection() {
  return (
    <Section id="pages">
      <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <SectionIntro
          eyebrow="Concierge Pages"
          title="No website? Start with one that already thinks."
          body="Pages gives you a hosted site with the Agent, Site Brain, actions and routing already wired in. Pick a template, answer a few questions, publish."
        />
        <LinkButton href="/create-account" variant="secondary" size="lg" trailing={<ArrowRight size={15} />}>
          Start with Pages
        </LinkButton>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["A real website", "Hero, services, pricing, FAQs and contact — published on your own subdomain or domain."],
          ["The Agent included", "Answering from the same approved knowledge as any other Concierge site."],
          ["One place to change things", "Edit a section, publish, done. The Agent updates with it."],
        ].map(([t, b]) => (
          <Card key={t} className="p-5">
            <h3 className="text-[16px] font-semibold tracking-[-0.015em]">{t}</h3>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-text-tertiary">{b}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function TrustSection() {
  return (
    <Section tone="surface">
      <SectionIntro
        eyebrow="Control"
        title="It cannot make things up."
        body="The reason owners trust Concierge on a live website is that it is bounded by design. Approved knowledge in, grounded answers out, an honest handoff when it does not know."
        align="center"
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          ["Approved knowledge only", "Nothing reaches a visitor until you have read it and said yes."],
          ["Never-promise rules", "Hard limits on price, coverage and anything you will not commit to."],
          ["Public pages only", "Concierge never reads behind a login and never stores payment details."],
          ["Full audit trail", "Every answer shows what it came from and how confident it was."],
        ].map(([t, b]) => (
          <div key={t}>
            <ShieldIcon size={17} className="text-success" />
            <h3 className="mt-3.5 text-[16px] font-semibold tracking-[-0.015em]">{t}</h3>
            <p className="mt-1.5 text-[13px] leading-[1.6] text-text-tertiary">{b}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---- Pricing ------------------------------------------------------------- */

const PLANS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    body: "For trying Concierge on one website.",
    features: ["1 website", "100 conversations a month", "Site Brain and Agent", "Email routing"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Growth",
    price: "$99",
    cadence: "per month",
    body: "For businesses running on their website.",
    features: [
      "5 websites",
      "Unlimited conversations",
      "All actions, including payments",
      "Slack, SMS, webhooks and CRM",
      "Routing rules and delivery history",
      "Insights and unanswered questions",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Scale",
    price: "Talk to us",
    cadence: "",
    body: "For agencies and multi-location businesses.",
    features: ["Unlimited websites", "Agency workspace", "Client roll-up reporting", "SSO and audit logs", "Priority support"],
    cta: "Book a call",
    featured: false,
  },
];

function Pricing() {
  return (
    <Section id="pricing">
      <SectionIntro
        eyebrow="Pricing"
        title="Clear capability. Clear availability."
        body="Every plan includes Site Brain, the Agent and approved-knowledge answering. You pay for scale, not for the parts that make it trustworthy."
        align="center"
      />
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANS.map((p) => (
          <Card
            key={p.name}
            className={cx("flex flex-col p-6", p.featured && "border-ink shadow-md ring-1 ring-ink")}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-semibold">{p.name}</h3>
              {p.featured && <Badge tone="accent">Most popular</Badge>}
            </div>
            <p className="mt-4 flex items-baseline gap-1.5">
              <span className="t-num text-[32px] leading-none">{p.price}</span>
              {p.cadence && <span className="text-[14px] text-text-tertiary">{p.cadence}</span>}
            </p>
            <p className="mt-3 text-[13px] leading-[1.6] text-text-tertiary">{p.body}</p>
            <ul className="mt-7 space-y-4">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <CheckIcon size={14} className="mt-0.5 shrink-0 text-success" strokeWidth={2.2} />
                  <span className="text-[14px] leading-[1.6] text-text-secondary">{f}</span>
                </li>
              ))}
            </ul>
            <LinkButton
              href="/create-account"
              variant={p.featured ? "primary" : "secondary"}
              size="lg"
              block
              className="mt-7"
            >
              {p.cta}
            </LinkButton>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-[46ch] text-center">
        <h2 className="t-display text-[34px] sm:text-[46px]">
          Your website already has the visitors.
        </h2>
        <p className="mx-auto mt-5 max-w-[46ch] text-[16px] leading-[1.6] text-text-tertiary">
          Give it the ability to answer them, help them, and hand the good ones to you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/create-account" size="lg" trailing={<ArrowRight size={16} />}>
            Install Concierge
          </LinkButton>
          <LinkButton href="/sign-in" variant="secondary" size="lg">
            Sign in
          </LinkButton>
        </div>
        <p className="mt-4 text-[13.5px] text-text-tertiary">
          Add a URL, approve what it learned, paste one line of script.
        </p>
      </div>
    </section>
  );
}
