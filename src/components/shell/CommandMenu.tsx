"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AgentsIcon,
  ChatIcon,
  GridIcon,
  HomeIcon,
  SearchIcon,
  SlidersIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { useWorkspace } from "@/lib/workspace";
import { CONNECTORS, THREADS } from "@/lib/data";

type Entry = {
  id: string;
  label: string;
  group: string;
  Icon: typeof HomeIcon;
  run: () => void;
};

/** Global command surface — ⌘K. It searches the workspace, it does not
 *  turn every keystroke into an AI request. */
export function CommandMenu() {
  const { searchOpen } = useWorkspace();
  // Mounting only while open keeps the query and selection fresh without
  // reconciling state in an effect.
  return searchOpen ? <CommandPalette /> : null;
}

function CommandPalette() {
  const { setSearchOpen, setActiveThread, setChatMode, setPhoneModalOpen } = useWorkspace();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const entries = useMemo<Entry[]>(() => {
    const go = (href: string) => () => {
      router.push(href);
      setSearchOpen(false);
    };
    return [
      { id: "home", label: "Home", group: "Go to", Icon: HomeIcon, run: go("/home") },
      { id: "agents", label: "Agents", group: "Go to", Icon: AgentsIcon, run: go("/agents") },
      { id: "connectors", label: "Connectors & MCPs", group: "Go to", Icon: GridIcon, run: go("/connectors") },
      { id: "account", label: "Account settings", group: "Go to", Icon: SlidersIcon, run: go("/account") },
      {
        id: "whatsapp",
        label: "Connect WhatsApp",
        group: "Go to",
        Icon: WhatsAppIcon,
        run: () => {
          setPhoneModalOpen(true);
          setSearchOpen(false);
        },
      },
      ...THREADS.map((t) => ({
        id: `thread-${t.id}`,
        label: t.title,
        group: "Conversations",
        Icon: ChatIcon,
        run: () => {
          setActiveThread(t.id);
          setChatMode("docked");
          setSearchOpen(false);
        },
      })),
      ...CONNECTORS.slice(0, 12).map((c) => ({
        id: `conn-${c.id}`,
        label: c.name,
        group: "Connectors",
        Icon: GridIcon,
        run: go("/connectors"),
      })),
    ];
  }, [router, setSearchOpen, setActiveThread, setChatMode, setPhoneModalOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 8);
    return entries.filter((e) => e.label.toLowerCase().includes(q)).slice(0, 10);
  }, [entries, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const grouped = results.reduce<Record<string, Entry[]>>((acc, e) => {
    (acc[e.group] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[14vh]">
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setSearchOpen(false)}
        className="absolute inset-0 bg-black/15 backdrop-blur-[3px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Symphony"
        className="sym-enter relative w-full max-w-[560px] overflow-hidden rounded-2xl bg-surface shadow-xl"
      >
        <div className="flex h-[56px] items-center gap-3 border-b border-line px-4">
          <SearchIcon size={20} className="shrink-0 text-text-tertiary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
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
            placeholder="Search Symphony"
            aria-label="Search Symphony"
            className="h-full flex-1 bg-transparent text-[16px] outline-none placeholder:text-text-muted"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[11px] font-medium text-text-muted">
            ESC
          </kbd>
        </div>

        <div className="sym-scroll max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-[14px] text-text-tertiary">
              Nothing matches &ldquo;{query}&rdquo; yet. Try an agent, a conversation or a connector.
            </p>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-3 pb-1 pt-2 text-[12px] font-semibold uppercase tracking-wide text-text-muted">
                  {group}
                </p>
                {items.map((e) => {
                  const idx = results.indexOf(e);
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onMouseEnter={() => setCursor(idx)}
                      onClick={e.run}
                      className={`flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[14px] ${
                        idx === cursor ? "bg-surface-hover" : ""
                      }`}
                    >
                      <e.Icon size={18} className="text-text-secondary" />
                      {e.label}
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
