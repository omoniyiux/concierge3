"use client";

import { Card, LinkButton, ProgressBar } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import {
  AllClearSticker,
  ChatSticker,
  InstallSticker,
  KnowledgeSticker,
  RoutingSticker,
  WarningSticker,
} from "@/components/stickers";
import { BrokenLinkSticker, IdeaSticker, ReviewSticker } from "@/components/stickers/attention";
import { cx } from "@/lib/cx";
import { HEALTH_COPY, type HealthSeverity, type SiteHealth } from "@/lib/health";

/* ============================================================================
   IS IT STILL WORKING?
   A site does not usually stop working loudly. The script comes off in a
   redesign, a webhook starts bouncing, the knowledge ages against a business
   that has moved on — and the first anyone hears of it is a quiet month.

   This is the standing answer to that, on the page an owner already opens.
   ========================================================================== */

/**
 * A sticker per signal, not per severity.
 *
 * Every row used to carry the same washed ⓘ, which made a dead script and an
 * unanswered question look like the same event and left the eye nothing to
 * sort by. These name the thing that is actually wrong — the cable pulled out
 * of the socket, the page waiting to be read — the way the attention list
 * beside it already does.
 *
 * Keyed by signal id, with a severity fallback so a signal added later still
 * renders something sensible.
 */
const SIGNAL_STICKER: Record<string, typeof BrokenLinkSticker> = {
  install: InstallSticker,
  routing: BrokenLinkSticker,
  untested: RoutingSticker,
  stale: KnowledgeSticker,
  review: ReviewSticker,
  quiet: ChatSticker,
  gaps: IdeaSticker,
};

const SEVERITY_STICKER: Record<HealthSeverity, typeof BrokenLinkSticker> = {
  critical: BrokenLinkSticker,
  warn: WarningSticker,
  watch: ReviewSticker,
  good: AllClearSticker,
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
        <div className="flex items-center gap-3.5 border-t border-divider bg-success-soft px-6 py-4">
          <AllClearSticker size={30} className="shrink-0" />
          <p className="text-[12.5px] text-text-secondary">
            The script is answering, every destination is delivering, and your knowledge is current.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-divider border-t border-divider">
          {health.signals.map((s) => {
            const Sticker = SIGNAL_STICKER[s.id] ?? SEVERITY_STICKER[s.severity];
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-6 py-4">
                <Sticker size={32} className="shrink-0" />
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
