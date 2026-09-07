"use client";

import Link from "next/link";
import { AlertIcon, ArrowRight, BrainIcon, RoutingIcon, SparkIcon } from "@/components/icons";
import { Badge } from "@/components/ui";
import { cx } from "@/lib/cx";
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
  { tone: Tone; label: string; Icon: typeof AlertIcon }
> = {
  urgent: { tone: "restricted", label: "Needs fixing", Icon: AlertIcon },
  review: { tone: "review", label: "Needs review", Icon: BrainIcon },
  opportunity: { tone: "accent", label: "Opportunity", Icon: SparkIcon },
};

/**
 * The one block on Overview that is allowed to interrupt. Every row says what
 * happened, why it matters and offers exactly one way to resolve it.
 */
export function AttentionList({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-surface px-5 py-6">
        <p className="text-[13.5px] font-medium">Nothing needs you right now.</p>
        <p className="t-body-sm mt-1 text-text-tertiary">
          Concierge is answering from approved knowledge and every route is delivering.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {items.map((item) => {
        const { tone, label, Icon } = SEVERITY[item.severity];
        return (
          <li key={item.id}>
            <Link
              href={item.href}
              className="group flex items-start gap-3.5 px-5 py-4 transition-colors duration-[var(--dur-micro)] hover:bg-surface-subtle"
            >
              <span
                className={cx(
                  "mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  item.severity === "urgent"
                    ? "bg-danger-soft text-danger"
                    : item.severity === "review"
                      ? "bg-warning-soft text-warning"
                      : "bg-accent-soft text-accent-ink",
                )}
              >
                <Icon size={15} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[13.5px] font-medium">{item.title}</span>
                  <Badge tone={tone}>{label}</Badge>
                </span>
                <span className="t-body-sm mt-1 block text-text-tertiary">{item.detail}</span>
              </span>

              <span className="ml-2 hidden shrink-0 items-center gap-1.5 self-center text-[12.5px] font-medium text-text-secondary transition-colors group-hover:text-text-primary sm:flex">
                {item.actionLabel}
                <ArrowRight size={14} className="transition-transform duration-[var(--dur-micro)] group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export { RoutingIcon };
