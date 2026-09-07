"use client";

import Link from "next/link";
import { useState } from "react";
import { PageContainer } from "@/components/shell/AppShell";
import { Avatar } from "@/components/shell/Avatar";
import { ChevronRight, CreditIcon, PencilIcon, ShareIcon } from "@/components/icons";
import { Button, Card, ProgressBar, Toggle } from "@/components/ui";
import { USER } from "@/lib/data";

export default function AccountPage() {
  return (
    <PageContainer className="pb-24 pt-[72px]">
      <h1 className="type-display text-[38px] leading-[1.05]">Account</h1>
      <p className="mt-4 text-[13.5px] text-text-secondary">Account Settings</p>

      <div className="mt-10 grid grid-cols-1 gap-7 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-6">
          <ProfileCard />
          <PlanCard />
        </div>
        <Preferences />
      </div>
    </PageContainer>
  );
}

function ProfileCard() {
  return (
    <Card className="flex items-center gap-4 px-6 py-7">
      <Avatar size={66} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-[19px] font-medium">{USER.firstName}</p>
          <button
            type="button"
            aria-label="Edit your name"
            className="rounded-md p-1 text-text-primary transition-colors hover:bg-surface-hover"
          >
            <PencilIcon size={15} />
          </button>
        </div>
        <p className="mt-1 truncate text-[13.5px] text-text-secondary">{USER.email}</p>
      </div>
    </Card>
  );
}

function PlanCard() {
  return (
    <Card className="px-6 py-7">
      <p className="text-[16px] font-bold">{USER.plan}</p>
      <p className="mt-1.5 text-[13.5px] text-text-secondary">{USER.renews}</p>

      <div className="mt-7 space-y-5">
        <Meter
          label="Monthly"
          used={USER.monthlyUsed}
          total={USER.monthlyTotal}
        />
        <Meter label="Daily" used={USER.dailyUsed} total={USER.dailyTotal} />
      </div>

      <p className="mt-6 flex items-center gap-2 text-[12px] text-text-secondary">
        <CreditIcon size={14} className="shrink-0" />
        {USER.agentRunsLeft} free agent runs left
      </p>

      <Button variant="brand" size="lg" block className="mt-5 h-[46px] text-[14px]">
        Upgrade
      </Button>
    </Card>
  );
}

function Meter({ label, used, total }: { label: string; used: number; total: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[14px] font-bold">{label}</p>
        <p className="text-[13.5px] text-text-secondary">
          {used} of {total} credits
        </p>
      </div>
      <div className="mt-2.5">
        <ProgressBar value={used} max={total} label={`${label} credits used`} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Preferences() {
  const [darkMode, setDarkMode] = useState(false);
  const [push, setPush] = useState(false);
  const [recaps, setRecaps] = useState(true);

  return (
    <div className="space-y-[30px]">
      <Section title="Get more out of Symphony">
        <RowLink
          href="/connectors"
          title="Connectors & MCPs"
          description="The tools and channels your agents work through"
        />
        <RowLink
          href="/connectors"
          title="Symphony Packs"
          description="Share your clients' packs from your Symphony"
        />
      </Section>

      <Section title="Access & Sharing">
        <Row>
          <div className="flex items-center gap-2.5">
            <ShareIcon size={17} />
            <p className="text-[13.5px] font-medium">Share the app</p>
          </div>
          <p className="mt-1.5 text-[13.5px] text-text-secondary">
            Earn credits, agent runs and briefs for every friend who joins
          </p>
        </Row>
      </Section>

      <Section title="Preferences">
        <RowLink
          href="/account"
          title="Agent models"
          description="Choose which AI model each agent uses"
        />
        <RowToggle
          title="Dark mode"
          description="Easier on the eyes at night"
          checked={darkMode}
          onChange={setDarkMode}
        />
        <RowToggle
          title="Push notifications"
          description="Approvals and finished work"
          checked={push}
          onChange={setPush}
        />
        <RowValue title="Language" value="English" />
        <RowToggle title="Show conversation recaps" checked={recaps} onChange={setRecaps} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="[&+section]:mt-0">
      <h2 className="text-[16px] font-medium">{title}</h2>
      <div className="mt-3.5 space-y-2">{children}</div>
    </section>
  );
}

function Row({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <Card className={`px-5 py-[11px] ${className}`}>{children}</Card>;
}

function RowLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl bg-surface px-5 py-[11px] transition-colors hover:bg-[#fafafa]"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium">{title}</span>
        <span className="mt-1 block text-[13.5px] text-text-secondary">{description}</span>
      </span>
      <ChevronRight size={17} className="shrink-0 text-text-secondary" />
    </Link>
  );
}

function RowToggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium">{title}</p>
        {description && <p className="mt-1 text-[13.5px] text-text-secondary">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </Row>
  );
}

function RowValue({ title, value }: { title: string; value: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 rounded-2xl bg-surface px-5 py-[13px] text-left transition-colors hover:bg-[#fafafa]"
    >
      <span className="min-w-0 flex-1 text-[13.5px] font-medium">{title}</span>
      <span className="text-[13.5px] text-text-secondary">{value}</span>
      <ChevronRight size={17} className="shrink-0 text-text-secondary" />
    </button>
  );
}
