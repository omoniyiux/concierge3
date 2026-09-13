"use client";

import { Card, LinkButton, ProgressBar } from "@/components/ui";
import { AlertIcon, ArrowRight, CheckIcon, InfoIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { HEALTH_COPY, type HealthSeverity, type SiteHealth } from "@/lib/health";

/* ============================================================================
   IS IT STILL WORKING?
   A site does not usually stop working loudly. The script comes off in a
   redesign, a webhook starts bouncing, the knowledge ages against a business
   that has moved on — and the first anyone hears of it is a quiet month.

   This is the standing answer to that, on the page an owner already opens.
   ========================================================================== */

const SEVERITY: Record<HealthSeverity, { ink: string; wash: string; Icon: typeof AlertIcon }> = {
  critical: { ink: "text-danger", wash: "bg-danger-soft", Icon: AlertIcon },
  warn: { ink: "text-warning", wash: "bg-warning-soft", Icon: AlertIcon },
  watch: { ink: "text-info", wash: "bg-info-soft", Icon: InfoIcon },
  good: { ink: "text-success", wash: "bg-success-soft", Icon: CheckIcon },
};

const BAND_TONE: Record<SiteHealth["band"], { tone: "success" | "accent" | "ink"; ink: string }> = {
  healthy: { tone: "success", ink: "text-success" },
  watch: { tone: "accent", ink: "text-warning" },
  "at-risk": { tone: "accent", ink: "text-danger" },
};

export function HealthCard({ health }: { health: SiteHealth }) {
  const copy = HEALTH_COPY[health.band];
  const band = BAND_TONE[health.band];

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4 p-6">
        <div className="min-w-0 max-w-[46ch]">
          <p className="t-eyebrow text-text-muted">Service health</p>
          <h2 className={cx("t-feature mt-2.5", band.ink)}>{copy.label}</h2>
          <p className="t-body mt-2.5 text-text-secondary">{copy.line}</p>
        </div>
        <div className="w-[168px] shrink-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="t-num text-[27px] leading-none">{health.score}</span>
            <span className="text-[11.5px] text-text-tertiary">of 100</span>
          </div>
          <div className="mt-3">
            <ProgressBar value={health.score} label="Service health" tone={band.tone} height={5} />
          </div>
        </div>
      </div>

      {health.signals.length === 0 ? (
        <div className="flex items-center gap-3 border-t border-divider bg-success-soft px-6 py-4">
          <CheckIcon size={15} className="shrink-0 text-success" strokeWidth={2.4} />
          <p className="text-[12.5px] text-text-secondary">
            The script is answering, every destination is delivering, and your knowledge is current.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-divider border-t border-divider">
          {health.signals.map((s) => {
            const v = SEVERITY[s.severity];
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4">
                <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center", v.wash, v.ink)}>
                  <v.Icon size={15} />
                </span>
                <div className="min-w-[200px] flex-1">
                  <p className="text-[12.5px] font-medium">{s.title}</p>
                  <p className="mt-1 text-[12px] leading-[1.5] text-text-tertiary">{s.detail}</p>
                </div>
                <LinkButton
                  href={s.href}
                  size="sm"
                  variant={s.severity === "critical" ? "primary" : "secondary"}
                  trailing={<ArrowRight size={13} />}
                >
                  {s.actionLabel}
                </LinkButton>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
