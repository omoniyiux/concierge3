"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, Button, IconButton } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import {
  AlertIcon,
  CheckIcon,
  ChevronUp,
  CloseIcon,
  PlayIcon,
  RefreshIcon,
  SparkIcon,
} from "@/components/icons";
import { cx } from "@/lib/cx";
import { useSim } from "@/lib/sim/store";
import { INJECTIONS } from "@/lib/sim/engine";
import { SCENARIOS } from "@/lib/sim/world";

/* ============================================================================
   THE SIMULATION CONTROL
   ----------------------------------------------------------------------------
   There is no backend yet, so this is the backend's control room: start time
   moving, jump to a business on its first day or its ninetieth, and make the
   awkward things happen on purpose — the webhook falling over, the script
   coming off the site, a hot lead at eleven at night.

   It sits over the workspace rather than inside it, and says plainly that it
   is a simulation, because the one thing worse than a demo is a demo somebody
   mistakes for production.
   ========================================================================== */

const SPEEDS = [1, 4, 20];

function PauseIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function SimBar() {
  const { world, running, speed, setRunning, setSpeed, loadScenario, reset, makeItHappen } = useSim();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const timer = useRef<number>(0);

  // Space bar plays and pauses, the way every other timeline does.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /INPUT|TEXTAREA|SELECT/.test(el.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setRunning(!running);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [running, setRunning]);

  function announce(message: string) {
    setFlash(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setFlash(null), 3200);
  }

  const when = new Date(world.now);
  const clock = when.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4">
        <div className="pointer-events-auto w-full max-w-[640px]">
          {flash && (
            <p className="cg-enter mb-2 flex items-center gap-2 border border-line-strong bg-surface px-3.5 py-2 text-[12px] shadow-lg">
              <CheckIcon size={13} className="shrink-0 text-success" strokeWidth={2.4} />
              {flash}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 border border-line-strong bg-surface px-3 py-2.5 shadow-xl">
            <Badge tone="accent">Simulation</Badge>

            <button
              type="button"
              onClick={() => setRunning(!running)}
              aria-label={running ? "Pause time" : "Start time"}
              className={cx(
                "flex h-8 w-8 shrink-0 items-center justify-center transition-colors",
                running ? "bg-ink text-text-inverse" : "bg-accent-solid text-white",
              )}
            >
              {running ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            </button>

            <div className="flex items-center gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-pressed={speed === s}
                  className={cx(
                    "h-8 border px-2 text-[11px] font-medium transition-colors",
                    speed === s
                      ? "border-ink bg-ink text-text-inverse"
                      : "border-line-strong bg-surface text-text-secondary hover:border-ink",
                  )}
                >
                  {s}×
                </button>
              ))}
            </div>

            <span className="t-num min-w-0 flex-1 truncate px-1 text-[12px] tabular-nums text-text-secondary">
              {clock}
            </span>

            <Button size="sm" variant="secondary" leading={<SparkIcon size={13} />} onClick={() => setPanel(true)}>
              Make something happen
            </Button>

            <IconButton
              label={open ? "Hide simulation settings" : "Show simulation settings"}
              size={30}
              onClick={() => setOpen((o) => !o)}
            >
              <ChevronUp size={16} className={cx("transition-transform", open && "rotate-180")} />
            </IconButton>
          </div>

          {open && (
            <div className="cg-enter mt-2 border border-line-strong bg-surface p-4 shadow-xl">
              <p className="t-eyebrow text-text-muted">Start from</p>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-3">
                {SCENARIOS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      loadScenario(s.key);
                      announce(`Loaded “${s.label}”. Press play to let time run.`);
                      setOpen(false);
                    }}
                    className={cx(
                      "border p-3 text-left transition-colors",
                      world.scenario === s.key
                        ? "border-ink ring-1 ring-ink"
                        : "border-line-strong hover:border-ink",
                    )}
                  >
                    <span className="block text-[12.5px] font-medium">{s.label}</span>
                    <span className="mt-1 block text-[11.5px] leading-[1.45] text-text-tertiary">
                      {s.blurb}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-divider pt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  leading={<RefreshIcon size={13} />}
                  onClick={() => {
                    reset();
                    announce("Everything reset. Nothing you did is kept.");
                  }}
                >
                  Reset the world
                </Button>
                <p className="min-w-0 flex-1 text-[11.5px] leading-[1.45] text-text-tertiary">
                  Everything you change is kept in this browser — approvals, connections, replies — and
                  survives a reload. Space bar starts and stops time.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- Make something happen ------------------------------------- */}
      <Modal
        open={panel}
        onClose={() => setPanel(false)}
        eyebrow="Simulation"
        title="Make something happen"
        description="The moments that matter most are the ones you cannot wait around for. Each of these lands immediately, everywhere it should."
        footer={
          <Button variant="tertiary" onClick={() => setPanel(false)}>
            Close
          </Button>
        }
      >
        <ModalSection>
          <ul className="space-y-2">
            {INJECTIONS.map((i) => {
              const bad = i.key.includes("down") || i.key.includes("lost");
              return (
                <li key={i.key}>
                  <button
                    type="button"
                    onClick={() => {
                      makeItHappen(i.key);
                      setPanel(false);
                      announce(`${i.label} — look at Overview, the bell and the ledger.`);
                    }}
                    className="flex w-full items-start gap-3 border border-line-strong bg-surface p-3.5 text-left transition-colors hover:border-ink"
                  >
                    <span
                      className={cx(
                        "mt-px flex h-7 w-7 shrink-0 items-center justify-center",
                        bad ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent-ink",
                      )}
                    >
                      {bad ? <AlertIcon size={14} /> : <SparkIcon size={14} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-medium">{i.label}</span>
                      <span className="mt-0.5 block text-[12px] leading-[1.45] text-text-tertiary">
                        {i.detail}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </ModalSection>

        <p className="mt-5 flex items-start gap-2.5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
          <CloseIcon size={14} className="mt-px shrink-0 text-text-tertiary" />
          None of this reaches a real person. No message is sent, no webhook is called, and no number is
          dialled — it is all this browser.
        </p>
      </Modal>
    </>
  );
}
