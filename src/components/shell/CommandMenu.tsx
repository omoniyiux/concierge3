"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useEffect } from "react";
import { ArrowRight, SearchIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { CONVERSATIONS, INTEGRATIONS, LEADS, SITES } from "@/lib/demo-data";
import { useWorkspace } from "@/lib/workspace";

type Entry = { id: string; label: string; sub?: string; group: string; run: () => void };

export function CommandMenu({ siteId }: { siteId: string }) {
  const { commandOpen } = useWorkspace();
  return commandOpen ? <Palette siteId={siteId} /> : null;
}

function Palette({ siteId }: { siteId: string }) {
  const { setCommandOpen } = useWorkspace();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const entries = useMemo<Entry[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
      setCommandOpen(false);
    };
    return [
      ...ALL_NAV_ITEMS.map((n) => ({
        id: `nav-${n.slug}`,
        label: n.label,
        group: "Go to",
        run: go(`/sites/${siteId}/${n.slug}`),
      })),
      { id: "nav-settings", label: "Settings", group: "Go to", run: go(`/sites/${siteId}/settings`) },
      { id: "nav-onboard", label: "Add a website", group: "Actions", run: go("/onboarding") },
      ...SITES.filter((s) => s.id !== siteId).map((s) => ({
        id: `site-${s.id}`,
        label: s.name,
        sub: s.url,
        group: "Switch site",
        run: go(`/sites/${s.id}/overview`),
      })),
      ...CONVERSATIONS.slice(0, 6).map((c) => ({
        id: `conv-${c.id}`,
        label: c.visitorName,
        sub: c.preview,
        group: "Conversations",
        run: go(`/sites/${siteId}/conversations?c=${c.id}`),
      })),
      ...LEADS.slice(0, 5).map((l) => ({
        id: `lead-${l.id}`,
        label: l.name,
        sub: l.service ?? "Lead",
        group: "Leads",
        run: go(`/sites/${siteId}/leads?l=${l.id}`),
      })),
      ...INTEGRATIONS.slice(0, 8).map((i) => ({
        id: `int-${i.id}`,
        label: i.name,
        sub: i.description,
        group: "Integrations",
        run: go(`/sites/${siteId}/integrations`),
      })),
    ];
  }, [router, setCommandOpen, siteId]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries.filter((e) => e.group === "Go to" || e.group === "Actions").slice(0, 9);
    return entries
      .filter((e) => e.label.toLowerCase().includes(needle) || e.sub?.toLowerCase().includes(needle))
      .slice(0, 12);
  }, [entries, q]);

  const grouped = results.reduce<Record<string, Entry[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setCommandOpen(false)}
        className="absolute inset-0 bg-ink/20 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Concierge"
        className="cg-enter relative w-full max-w-[560px] overflow-hidden rounded-2xl bg-surface shadow-xl"
      >
        <div className="flex h-12 items-center gap-2.5 border-b border-divider px-3.5">
          <SearchIcon size={17} className="shrink-0 text-text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setCursor((c) => Math.min(c + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setCursor((c) => Math.max(c - 1, 0));
              }
              if (e.key === "Enter") results[cursor]?.run();
            }}
            placeholder="Search sites, conversations, leads and settings"
            aria-label="Search Concierge"
            className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded border border-line px-1.5 py-px text-[11px] text-text-muted">ESC</kbd>
        </div>

        <div className="cg-scroll max-h-[48vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <p className="px-3 py-10 text-center text-[14px] text-text-tertiary">
              Nothing matches &ldquo;{q}&rdquo;. Try a site, a visitor name or a settings page.
            </p>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="t-eyebrow px-2.5 pb-1 pt-2 text-text-muted">{group}</p>
                {items.map((e) => {
                  const idx = results.indexOf(e);
                  const active = idx === cursor;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onMouseEnter={() => setCursor(idx)}
                      onClick={e.run}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left",
                        active ? "bg-surface-hover" : "",
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{e.label}</span>
                        {e.sub && <span className="block truncate text-[14px] text-text-tertiary">{e.sub}</span>}
                      </span>
                      {active && <ArrowRight size={14} className="shrink-0 text-text-muted" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
