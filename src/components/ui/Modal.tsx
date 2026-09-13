"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/icons";
import { IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";

/* ============================================================================
   MODAL
   The one shape every flow in the product interrupts you with: a square white
   surface on a dimmed canvas, an eyebrow saying which surface you are still
   on, a title, and at most two actions at the foot.

   It is a dialog rather than a drawer because everything it carries is a
   decision you finish and leave — connect this, invite them, answer that.
   On a phone it sits to the bottom of the screen and takes the full width,
   so the actions stay under the thumb.
   ========================================================================== */

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  description,
  children,
  footer,
  size = "md",
  flush,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** The body owns its own scrolling. For panelled contents whose columns each
      scroll independently, so the dialog itself never grows a second scrollbar. */
  flush?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  // Escape closes, and focus moves into the dialog so the keyboard follows
  // the eye. The page behind it stops scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => {
      const first = panel.current?.querySelector<HTMLElement>(
        "input, textarea, select, button:not([data-modal-close])",
      );
      first?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const width =
    size === "sm"
      ? "sm:max-w-[420px]"
      : size === "lg"
        ? "sm:max-w-[720px]"
        : size === "xl"
          ? "sm:max-w-[980px]"
          : "sm:max-w-[560px]";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close"
        data-modal-close
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "cg-enter relative flex max-h-[90dvh] w-full flex-col border border-line-strong bg-surface shadow-xl",
          width,
        )}
      >
        <header className={cx("flex items-start gap-4 px-6 pt-6", flush ? "pb-4" : "pb-5")}>
          <div className="min-w-0 flex-1">
            {eyebrow && <p className="t-eyebrow mb-2 text-text-muted">{eyebrow}</p>}
            <h2 className="t-feature">{title}</h2>
            {description && <p className="t-body mt-2 max-w-[52ch] text-text-secondary">{description}</p>}
          </div>
          <IconButton label="Close" size={32} onClick={onClose} data-modal-close className="-mr-1.5 -mt-1">
            <CloseIcon size={16} />
          </IconButton>
        </header>

        {children && (
          <div
            className={cx(
              "min-h-0 flex-1",
              flush ? "overflow-hidden" : "cg-scroll overflow-y-auto px-6 pb-6",
            )}
          >
            {children}
          </div>
        )}

        {footer && (
          <footer className="flex flex-wrap items-center justify-end gap-2.5 border-t border-divider px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** A labelled block inside a modal body. Keeps every flow spaced the same. */
export function ModalSection({
  title,
  hint,
  children,
  className,
}: {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("mt-5 first:mt-0", className)}>
      {title && <p className="t-eyebrow text-text-muted">{title}</p>}
      {hint && <p className="t-body-sm mt-1.5 text-text-tertiary">{hint}</p>}
      <div className={cx(title || hint ? "mt-3" : "")}>{children}</div>
    </section>
  );
}

/** The running list of steps a connect-style flow walks through. */
export function StepList({ steps, done }: { steps: string[]; done: number }) {
  return (
    <ol className="space-y-2.5">
      {steps.map((s, i) => {
        const complete = i < done;
        const current = i === done;
        return (
          <li key={s} className="flex items-start gap-3">
            <span
              className={cx(
                "mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center text-[10px] font-semibold tabular-nums",
                complete
                  ? "bg-success text-white"
                  : current
                    ? "bg-ink text-text-inverse"
                    : "bg-surface-sunken text-text-tertiary",
              )}
            >
              {complete ? "✓" : i + 1}
            </span>
            <span
              className={cx(
                "text-[12.5px] leading-[1.5]",
                complete ? "text-text-tertiary line-through" : current ? "font-medium" : "text-text-tertiary",
              )}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
