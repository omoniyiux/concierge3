"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageContainer } from "@/components/shell/AppShell";
import { ConnectorGraph } from "@/components/connectors/ConnectorGraph";
import { ChevronLeft, PlusIcon, SearchIcon } from "@/components/icons";
import { Button, EmptyState, Segmented } from "@/components/ui";
import { AVAILABLE_COUNT, CONNECTORS, type Connector } from "@/lib/data";

export default function ConnectorsPage() {
  const [tab, setTab] = useState<"tools" | "channels">("tools");
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONNECTORS;
    return CONNECTORS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <PageContainer className="pb-24 pt-[72px]">
      <Link
        href="/account"
        className="-ml-1 inline-flex items-center gap-1 rounded-lg px-1 py-1 text-[13.5px] transition-opacity hover:opacity-70"
      >
        <ChevronLeft size={16} />
        Back
      </Link>

      <h1 className="type-display mt-[26px] text-[38px] leading-[1.05]">Connectors &amp; MCPs</h1>
      <p className="mt-5 text-[13.5px] text-text-primary">
        View and manage integrations with external tools that help your agents run your business.
      </p>

      <div className="mt-[46px] flex h-[390px] items-center rounded-[20px] bg-surface px-4">
        <ConnectorGraph />
      </div>

      {/* Controls -------------------------------------------------- */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented
          label="Connector type"
          value={tab}
          onChange={setTab}
          options={[
            { value: "tools", label: "Tools" },
            { value: "channels", label: "Channels" },
          ]}
        />

        <div className="relative ml-auto min-w-[240px] flex-1 sm:max-w-[400px]">
          <label htmlFor="connector-search" className="sr-only">
            Search connectors
          </label>
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            id="connector-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connectors"
            className="h-[46px] w-full rounded-xl bg-surface pl-11 pr-4 text-[14px] outline-none ring-1 ring-transparent transition-shadow placeholder:text-text-tertiary focus:ring-ink"
          />
        </div>

        <Button size="lg" className="h-[46px] text-[14px]" leading={<PlusIcon size={17} />}>
          Connect an MCP server
        </Button>
      </div>

      <p className="mt-4 text-[13.5px] text-text-secondary">
        {tab === "tools"
          ? "The apps and data your agents work through. Connect a new one and any agent can start using it."
          : "The places your agents can reach you and your customers. Connect a channel to open the conversation."}
      </p>

      {/* Directory -------------------------------------------------- */}
      {tab === "channels" ? (
        <EmptyState
          title="No channels connected yet"
          body="Channels are how your agents talk to you and your customers — WhatsApp, SMS, email. Connect one and your team can start the conversation."
          action={<Button size="lg">Connect WhatsApp</Button>}
        />
      ) : results.length === 0 ? (
        <EmptyState
          title={`Nothing matches “${query}”`}
          body="Try a different name, or connect your own MCP server to bring a tool Symphony doesn’t list yet."
          action={
            <Button variant="secondary" size="lg" onClick={() => setQuery("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <h2 className="mt-7 text-[16px] font-bold">
            Available to connect · {query ? results.length : AVAILABLE_COUNT}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c) => (
              <ConnectorCard key={c.id} connector={c} />
            ))}
          </ul>
        </>
      )}
    </PageContainer>
  );
}

function ConnectorCard({ connector }: { connector: Connector }) {
  const { Mark, name, description } = connector;
  const [state, setState] = useState<"idle" | "connecting" | "connected">("idle");

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-4">
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px] bg-[#f5f5f5]">
        <Mark size={23} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold leading-tight">{name}</p>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.35] text-text-secondary">
          {description}
        </p>
      </div>

      <Button
        variant={state === "connected" ? "secondary" : "secondary"}
        size="md"
        className="h-[36px] shrink-0 px-4 text-[13px]"
        loading={state === "connecting"}
        disabled={state === "connected"}
        onClick={() => {
          setState("connecting");
          setTimeout(() => setState("connected"), 1100);
        }}
      >
        {state === "connected" ? "Connected" : "Connect"}
      </Button>
    </li>
  );
}
