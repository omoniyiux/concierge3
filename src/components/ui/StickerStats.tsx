import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui";
import { cx } from "@/lib/cx";

/* ============================================================================
   STICKER STATS
   The Overview status strip, generalised: a row of facts told as sticker,
   figure, what it is, then why it matters. Split by rules rather than boxed
   into separate cards, so a set of numbers reads as one statement.

   Used wherever a page opens on four or five counts — Leads, Actions, Site
   Brain — so those headers all behave the same way.
   ========================================================================== */

export type StickerStatItem = {
  Sticker: ComponentType<{ size?: number; className?: string }>;
  /** The figure itself. Kept as a node so a unit can ride along with it. */
  value: ReactNode;
  label: string;
  detail?: string;
  /** Text colour class for the figure, when the figure carries a status. */
  tone?: string;
  /** Optional trailing row — a delta and a sparkline, where one earns its place. */
  trend?: ReactNode;
};

export function StickerStats({
  items,
  className,
  columns = 4,
}: {
  items: StickerStatItem[];
  className?: string;
  columns?: 3 | 4 | 5;
}) {
  const cols =
    columns === 5
      ? "sm:grid-cols-2 lg:grid-cols-5"
      : columns === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <Card className={cx("grid grid-cols-1", cols, className)}>
      {items.map(({ Sticker, value, label, detail, tone, trend }, i) => (
        <div
          key={label}
          className={cx(
            "px-5 py-5",
            // Rules between cells, never around the group.
            i > 0 && "border-t border-divider sm:border-t-0 sm:border-l",
            columns === 4 && i === 2 && "sm:border-l-0 sm:border-t lg:border-t-0 lg:border-l",
          )}
        >
          <Sticker size={32} />
          <p className={cx("t-num mt-3.5 text-[22px] leading-none", tone)}>{value}</p>
          <p className="mt-2 text-[12.5px] font-semibold leading-[1.3]">{label}</p>
          {detail && <p className="mt-1 text-[11.5px] leading-[1.45] text-text-tertiary">{detail}</p>}
          {trend}
        </div>
      ))}
    </Card>
  );
}
