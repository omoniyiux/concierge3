import Image from "next/image";
import Link from "next/link";
import { PageContainer } from "@/components/shell/AppShell";
import { AppStoreBadge, GooglePlayBadge } from "@/components/icons/brands";
import { ArrowUpRightIcon, PencilIcon } from "@/components/icons";
import { Button, Card, DidntLoadCard } from "@/components/ui";
import { USER } from "@/lib/data";
import { ConnectToolsMosaic } from "@/components/home/ConnectToolsMosaic";
import { PageIssueBanner } from "@/components/home/PageIssueBanner";

export const metadata = { title: "Home · Symphony" };

function greeting(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomePage() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return (
    <PageContainer className="pb-20 pt-[72px]">
      {/* What matters first: who you are, and what day it is ------- */}
      <header className="flex items-center justify-between gap-6">
        <h1 className="type-display min-w-0 text-[26px] leading-[1.1] sm:text-[31px]">
          {greeting(now.getHours())}, {USER.firstName}
        </h1>
        <p
          className="type-display shrink-0 text-right text-[36px] leading-[0.82] tracking-[-0.045em] sm:text-[48px]"
          aria-label={`Today is ${day}.${month}`}
        >
          {day}.
          <br />
          {month}
        </p>
      </header>

      {/* Mobile app ------------------------------------------------ */}
      <section className="mt-[30px] flex flex-wrap items-start justify-between gap-x-8 gap-y-7">
        <div>
          <p className="text-[13.5px] text-text-primary">Keep up to date with your agents from anywhere</p>
          <p className="mt-2.5 text-[14px] font-bold">Download Symphony mobile app</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a href="#" aria-label="Download on the App Store" className="rounded-lg">
              <AppStoreBadge />
            </a>
            <a href="#" aria-label="Get it on Google Play" className="rounded-lg">
              <GooglePlayBadge />
            </a>
          </div>
        </div>

        <div className="shrink-0 rounded-2xl bg-surface p-4">
          <Image
            src="/app-qr.svg"
            alt="Scan to download the Symphony mobile app"
            width={144}
            height={144}
            className="h-[128px] w-[128px]"
          />
        </div>
      </section>

      {/* Connect tools --------------------------------------------- */}
      <section className="mt-[46px]">
        <Link
          href="/connectors"
          className="group block w-full max-w-[318px] rounded-2xl border border-brand bg-[#e6f8db] px-5 py-6 transition-colors hover:bg-[#d9fbb9]"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="type-display max-w-[136px] text-[21px] leading-[1.22]">
                Connect your tools to one Symphony
              </h2>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium underline underline-offset-[3px]">
                Connect tools
                <ArrowUpRightIcon size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
            <ConnectToolsMosaic />
          </div>
        </Link>
      </section>

      {/* Something didn't load — say so, and offer the next action -- */}
      <div className="mt-[46px]">
        <PageIssueBanner />
      </div>

      {/* Widgets ---------------------------------------------------- */}
      <div className="mt-4 grid grid-cols-1 gap-[19px] lg:grid-cols-[1fr_326px]">
        <div className="flex flex-col gap-[19px]">
          <Card className="p-6">
            <p className="text-[13.5px] font-bold">Two quick questions</p>
            <h2 className="type-display mt-4 text-[27px] leading-[1.1]">Tell me about your business</h2>
            <p className="mt-3 text-[13.5px] text-text-secondary">
              A few answers tailor your team to how you actually work. It takes about a minute.
            </p>
            <Button size="lg" className="mt-6 h-[44px] text-[13.5px]">
              Answer the questions
            </Button>
          </Card>

          <DidntLoadCard
            reason="We couldn’t load this just now — it’ll retry on the next refresh."
            className="min-h-[196px]"
          />
          <DidntLoadCard className="min-h-[196px]" />
        </div>

        <div className="flex flex-col gap-[19px]">
          <DidntLoadCard className="min-h-[246px]" />

          <Card className="p-6">
            <p className="text-[13.5px] font-bold">Weekly pulse</p>
            <h2 className="type-display mt-4 text-[27px] leading-[1.12]">One connection unlocks your weekly numbers</h2>
            <p className="mt-4 text-[13.5px] leading-[1.5] text-text-secondary">
              Bookings, sales, payments or forms. Any one of them gives your week a scoreboard.
              Connect one and this card fills with your real figures.
            </p>
            <Button size="lg" className="mt-6 h-[44px] text-[13.5px]">
              Connect a data source
            </Button>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="secondary" size="lg" className="h-[44px] text-[13.5px]" leading={<PencilIcon size={16} />}>
          Edit widgets
        </Button>
      </div>
    </PageContainer>
  );
}
