"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { CheckIcon, ChevronDown, DotIcon, SearchIcon } from "@/components/icons";
import Link from "next/link";
import { cx } from "@/lib/cx";

export { cx } from "@/lib/cx";

/* ============================================================================
   BUTTON — ink is primary. Orange is reserved for the single moment on a
   surface where Concierge itself is acting or being launched.
   ========================================================================== */

type Variant = "primary" | "secondary" | "tertiary" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-ink text-text-inverse hover:bg-ink-hover active:bg-ink-pressed disabled:bg-surface-sunken disabled:text-text-disabled",
  secondary:
    "bg-surface text-text-primary border border-line-strong hover:border-line-hover hover:bg-surface-subtle active:bg-surface-hover disabled:text-text-disabled disabled:border-line disabled:bg-surface",
  tertiary:
    "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-sunken disabled:text-text-disabled",
  accent:
    "bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed disabled:bg-surface-sunken disabled:text-text-disabled",
  danger:
    "bg-danger text-white hover:brightness-110 active:brightness-95 disabled:bg-surface-sunken disabled:text-text-disabled",
};

const SIZE: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[12.5px] gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-[13px] gap-1.5 rounded-[9px]",
  lg: "h-10 px-4 text-[14px] gap-2 rounded-[10px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, block, leading, trailing, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "relative inline-flex shrink-0 select-none items-center justify-center font-medium",
        "transition-[background-color,border-color,color,opacity] duration-[var(--dur-micro)] ease-[var(--ease-out-cg)]",
        "disabled:cursor-not-allowed",
        VARIANT[variant],
        SIZE[size],
        block && "w-full",
        className,
      )}
      {...rest}
    >
      {loading && <Spinner className="absolute" />}
      <span className={cx("contents", loading && "opacity-0")}>
        {leading}
        {children}
        {trailing}
      </span>
    </button>
  );
});

/** Navigation that looks like a button. Keeps anchors out of <button>. */
export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  block,
  leading,
  trailing,
  className,
  children,
  external,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  children: ReactNode;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = cx(
    "relative inline-flex shrink-0 select-none items-center justify-center font-medium",
    "transition-[background-color,border-color,color,opacity] duration-[var(--dur-micro)] ease-[var(--ease-out-cg)]",
    VARIANT[variant],
    SIZE[size],
    block && "w-full",
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} {...rest}>
        {leading}
        {children}
        {trailing}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {leading}
      {children}
      {trailing}
    </Link>
  );
}

export function Spinner({ className, size = 15 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={cx("animate-spin", className)} aria-hidden>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.8" opacity="0.22" fill="none" />
      <path d="M14.3 8A6.3 6.3 0 0 0 8 1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Icon-only control. Always carries an accessible label. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: number; tone?: "default" | "muted" }
>(function IconButton({ label, size = 30, tone = "muted", className, children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      style={{ width: size, height: size }}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors duration-[var(--dur-micro)]",
        tone === "muted" ? "text-text-tertiary" : "text-text-primary",
        "hover:bg-surface-hover hover:text-text-primary active:bg-surface-sunken",
        "disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});

/* ============================================================================
   SURFACES — a card must earn its border.
   ========================================================================== */

/**
 * Surfaces separate from the canvas by colour, not by a border. White on grey,
 * generously rounded, no shadow. A card must earn its place on the page.
 */
export function Card({
  className,
  interactive,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cx(
        "rounded-[18px] bg-surface",
        interactive && "transition-colors duration-[var(--dur-micro)] hover:bg-[#fafafa]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Panel({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("rounded-[18px] bg-surface", className)} {...rest}>
      {children}
    </div>
  );
}

/** Section head used inside panels: title, optional hint, optional action. */
export function SectionHead({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="t-section">{title}</h2>
        {hint && <p className="t-body-sm mt-1 text-text-tertiary">{hint}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ============================================================================
   FORM CONTROLS
   ========================================================================== */

const FIELD_BASE =
  "w-full rounded-[9px] border border-line-strong bg-surface text-[13.5px] text-text-primary " +
  "placeholder:text-text-muted transition-[border-color,box-shadow] duration-[var(--dur-micro)] " +
  "focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/8 " +
  "disabled:bg-surface-subtle disabled:text-text-disabled";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cx(FIELD_BASE, "h-10 px-3", className)} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cx(FIELD_BASE, "min-h-[84px] resize-y px-3 py-2 leading-[1.5]", className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <div className="relative">
        <select ref={ref} className={cx(FIELD_BASE, "h-10 appearance-none pl-3 pr-9", className)} {...rest}>
          {children}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary"
        />
      </div>
    );
  },
);

export function SearchInput({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cx("relative", className)}>
      <SearchIcon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input className={cx(FIELD_BASE, "h-10 pl-9 pr-3")} {...rest} />
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-[15px] font-medium text-text-primary">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[13px] text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[14px] text-text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const w = size === "sm" ? 34 : 40;
  const h = size === "sm" ? 20 : 23;
  const k = size === "sm" ? 14 : 17;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{ width: w, height: h }}
      className={cx(
        "relative shrink-0 rounded-full transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-cg)]",
        checked ? "bg-ink" : "bg-surface-sunken",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <span
        style={{ width: k, height: k, transform: `translateX(${checked ? w - k - 3 : 3}px)` }}
        className="absolute top-1/2 left-0 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-cg)]"
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-colors duration-[var(--dur-micro)]",
        checked ? "border-ink/25 bg-surface-subtle" : "border-line bg-surface hover:border-line-strong",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cx(
          "mt-px flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
          checked ? "border-ink bg-ink text-white" : "border-line-strong bg-surface",
        )}
      >
        {checked && <CheckIcon size={12} strokeWidth={2.6} />}
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium">{label}</span>
        {description && <span className="mt-0.5 block text-[13.5px] leading-[1.45] text-text-tertiary">{description}</span>}
      </span>
    </button>
  );
}

export function RadioCard({
  selected,
  onSelect,
  label,
  description,
  icon,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-[var(--dur-micro)]",
        selected
          ? "border-ink bg-surface shadow-xs ring-1 ring-ink"
          : "border-line bg-surface hover:border-line-strong",
      )}
    >
      {icon && (
        <span className={cx("mt-px shrink-0", selected ? "text-accent" : "text-text-tertiary")}>{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{label}</span>
        {description && (
          <span className="mt-1 block text-[13px] leading-[1.5] text-text-tertiary">{description}</span>
        )}
      </span>
    </button>
  );
}

/* ============================================================================
   NAVIGATION WITHIN A SURFACE
   ========================================================================== */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex items-center gap-1 border-b border-divider">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cx(
              "relative -mb-px flex h-10 items-center gap-2 px-3 text-[14px] font-medium transition-colors duration-[var(--dur-micro)]",
              active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cx(
                  "rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums",
                  active ? "bg-ink text-text-inverse" : "bg-surface-sunken text-text-tertiary",
                )}
              >
                {t.count}
              </span>
            )}
            {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-ink" />}
          </button>
        );
      })}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex items-center gap-0.5 rounded-[10px] bg-surface-subtle p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cx(
              "h-8 rounded-lg px-3.5 text-[15px] font-medium transition-all duration-[var(--dur-micro)]",
              active ? "bg-surface text-text-primary shadow-xs" : "text-text-tertiary hover:text-text-primary",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   STATUS — colour is never the only signal.
   ========================================================================== */

const TONES = {
  neutral: "bg-surface-subtle text-text-secondary",
  approved: "bg-approved-soft text-approved",
  review: "bg-review-soft text-review",
  restricted: "bg-restricted-soft text-restricted",
  accent: "bg-accent-soft text-accent-ink",
  info: "bg-info-soft text-info",
  live: "bg-approved-soft text-approved",
} as const;

export type Tone = keyof typeof TONES;

export function Badge({
  tone = "neutral",
  dot,
  pulse,
  children,
  className,
}: {
  tone?: Tone;
  dot?: boolean;
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex h-[24px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[15px] font-medium",
        TONES[tone],
        className,
      )}
    >
      {dot && <DotIcon size={6} className={pulse ? "cg-live-dot" : undefined} />}
      {children}
    </span>
  );
}

/** A metric with its change. Never a bare number without context. */
export function Stat({
  label,
  value,
  delta,
  hint,
  className,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  className?: string;
}) {
  const up = (delta ?? 0) > 0;
  const flat = delta === 0 || delta === undefined;
  return (
    <div className={className}>
      <p className="t-eyebrow text-text-muted">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="t-num text-[26px] leading-none">{value}</span>
        {!flat && (
          <span
            className={cx("text-[15px] font-medium tabular-nums", up ? "text-success" : "text-danger")}
          >
            {up ? "↑" : "↓"} {Math.abs(delta!)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[14px] text-text-tertiary">{hint}</p>}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "ink",
  height = 6,
}: {
  value: number;
  max?: number;
  label: string;
  tone?: "ink" | "accent" | "success";
  height?: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const bg = tone === "accent" ? "bg-accent" : tone === "success" ? "bg-success" : "bg-ink";
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{ height }}
      className="w-full overflow-hidden rounded-full bg-surface-sunken"
    >
      <div
        className={cx("h-full rounded-full transition-[width] duration-[var(--dur-large)] ease-[var(--ease-out-cg)]", bg)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ============================================================================
   EMPTY / LOADING / ERROR
   Each answers: what is this, why does it matter, what do I do next.
   ========================================================================== */

export function EmptyState({
  icon,
  title,
  body,
  action,
  secondaryAction,
  className,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex flex-col items-center px-6 py-12 text-center", className)}>
      {icon && (
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-[18px] bg-surface-subtle text-text-tertiary">
          {icon}
        </div>
      )}
      <h3 className="t-section max-w-[28ch]">{title}</h3>
      <p className="t-body mt-2.5 max-w-[46ch] text-text-tertiary">{body}</p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

/** Loading copy always says who is working and on what. */
export function WorkingState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="flex items-center gap-3" role="status">
      <Spinner className="text-accent" size={16} />
      <div>
        <p className="text-[14px] font-medium">
          {title}
          <TypingDots />
        </p>
        {detail && <p className="mt-0.5 text-[13px] text-text-tertiary">{detail}</p>}
      </div>
    </div>
  );
}

export function TypingDots() {
  return (
    <span className="ml-1 inline-flex gap-[3px] align-middle" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-[3px] w-[3px] rounded-full bg-current"
          style={{ animation: `cg-typing 1.3s ${i * 0.15}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("cg-skeleton rounded-md", className)} />;
}

/** Errors state what happened, why, and the one thing that fixes it. */
export function ErrorState({
  title,
  reason,
  remedy,
  action,
  className,
}: {
  title: string;
  reason: string;
  remedy?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("rounded-xl border border-danger-line bg-danger-soft p-5", className)} role="alert">
      <p className="text-[15px] font-semibold text-danger">{title}</p>
      <p className="t-body-sm mt-1.5 text-text-secondary">{reason}</p>
      {remedy && <p className="t-body-sm mt-1 text-text-secondary">{remedy}</p>}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}

/* ============================================================================
   TOOLTIP — icon-only controls and truncated text only.
   ========================================================================== */

export function Tooltip({
  label,
  side = "right",
  children,
}: {
  label: string;
  side?: "right" | "top" | "bottom";
  children: ReactNode;
}) {
  const pos =
    side === "right"
      ? "left-[calc(100%+8px)] top-1/2 -translate-y-1/2"
      : side === "top"
        ? "bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2"
        : "top-[calc(100%+8px)] left-1/2 -translate-x-1/2";
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cx(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[15px] font-medium text-text-inverse",
          "opacity-0 shadow-md transition-opacity duration-[var(--dur-micro)] group-hover/tip:opacity-100 group-focus-within/tip:opacity-100",
          pos,
        )}
      >
        {label}
      </span>
    </span>
  );
}
