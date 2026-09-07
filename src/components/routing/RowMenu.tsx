"use client";

import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui";
import { MoreIcon } from "@/components/icons";
import { cx } from "@/lib/cx";

/* ============================================================================
   ROW MENU
   ----------------------------------------------------------------------------
   The overflow menu behind a "…". Closes on outside click, on Escape, and on
   choosing something — the three ways a person expects to get out of a menu.
   ========================================================================== */

export type MenuItem = { label: string; onSelect: () => void; danger?: boolean };

export function RowMenu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <IconButton
        label={label}
        size={28}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className={cx(open && "bg-surface-hover text-text-primary")}
      >
        <MoreIcon size={15} />
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+4px)] z-40 min-w-[176px] border border-line-strong bg-surface py-1 shadow-md"
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className={cx(
                "block w-full px-3.5 py-2 text-left text-[12.5px] transition-colors",
                item.danger
                  ? "text-danger hover:bg-danger-soft"
                  : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
