"use client";

import Link from "next/link";
import { ArrowRight, RoutingIcon } from "@/components/icons";
import { CheckIcon } from "@/components/icons";
import { BrokenLinkSticker, IdeaSticker, ReviewSticker } from "@/components/stickers/attention";
import { Badge } from "@/components/ui";
import type { Tone } from "@/components/ui";

export type AttentionItem = {
  id: string;
  /** What happened. */
  title: string;
  /** Why it matters, in one line. */
  detail: string;
  /** The single next action. */
  actionLabel: string;
  href: string;
  severity: "urgent" | "review" | "opportunity";
};

const SEVERITY: Record<
  AttentionItem["severity"],
  { tone: Tone; label: string; Sticker: typeof BrokenLinkSticker }
> = {
  urgent: { tone: "restricted", label: "Needs fixing", Sticker: BrokenLinkSticker },
  review: { tone: "review", label: "Needs review", Sticker: ReviewSticker },
  opportunity: { tone: "accent", label: "Opportunity", Sticker: IdeaSticker },
};

/**
 * The one block on Overview that is allowed to interrupt. Every row says what
 * happened, why it matters and offers exactly one way to resolve it.
 */
export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-start gap-4 border border-line-strong bg-surface px-5 py-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-approved-soft text-success">
          <CheckIcon size={17} />
        </span>
        <div className="min-w-0">
          <p className="text-[12.5px] font-medium">Nothing needs you right now.</p>
          <p className="t-body-sm mt-1 text-text-tertiary">
            Concierge is answering from approved knowledge and every route is delivering.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line-strong overflow-hidden border border-line-strong bg-surface">
      {items.map((item) => {
        const { tone, label, Sticker } = SEVERITY[item.severity];
        return (
          <li key={item.id}>
            {/* No fill change on hover — repainting a whole row grey reads as a
                banding glitch. The action label and arrow carry the state. */}
            <Link
              href={item.href}
              className="group flex items-start gap-4 px-6 py-4 transition-colors duration-[var(--dur-micro)]"
            >
              <Sticker size={38} className="-mt-1 shrink-0" />

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[12.5px] font-semibold">{item.title}</span>
                  <Badge tone={tone}>{label}</Badge>
                </span>
                <span className="t-body mt-2 block max-w-[68ch] text-text-tertiary">{item.detail}</span>
              </span>

              <span className="ml-2 hidden shrink-0 items-center gap-1.5 self-center text-[13px] font-medium text-text-secondary transition-colors group-hover:text-text-primary sm:flex">
                {item.actionLabel}
                <ArrowRight
                  size={14}
                  className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { RoutingIcon };
