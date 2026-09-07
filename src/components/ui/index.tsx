"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

/* ==================================================================
   BUTTON
   One clear primary action per surface. Primary is ink (black);
   `brand` is reserved for upgrade/commercial moments only.
   ================================================================== */

type Variant = "primary" | "secondary" | "tertiary" | "brand" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-hover active:bg-ink-pressed disabled:bg-[#e2e2e2] disabled:text-text-disabled",
  secondary:
    "bg-surface text-text-primary border border-line-strong hover:bg-[#fafafa] active:bg-surface-subtle disabled:text-text-disabled disabled:border-line",
  tertiary:
    "bg-transparent text-text-primary hover:bg-surface-hover active:bg-[#e0dfdf] disabled:text-text-disabled",
  brand:
    "bg-brand text-ink hover:bg-brand-hover active:bg-brand-pressed disabled:bg-[#e9e9e9] disabled:text-text-disabled",
  danger:
    "bg-danger text-white hover:brightness-95 active:brightness-90 disabled:bg-[#e2e2e2] disabled:text-text-disabled",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 px-3 text-[12px] rounded-lg gap-1.5",
  md: "h-9 px-3.5 text-[13px] rounded-lg gap-2",
  lg: "h-11 px-4 text-[13.5px] rounded-[10px] gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  pill?: boolean;
  block?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    pill = false,
    block = false,
    leading,
    trailing,
    className = "",
    children,
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "relative inline-flex shrink-0 items-center justify-center font-semibold",
        "transition-[background-color,color,border-color,opacity] duration-[120ms] ease-[var(--ease-out-symphony)]",
        "disabled:cursor-not-allowed select-none",
        VARIANT[variant],
        SIZE[size],
        pill ? "!rounded-full" : "",
        block ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {loading && <Spinner className="absolute" />}
      <span className={loading ? "contents opacity-0" : "contents"}>
        {leading}
        {children}
        {trailing}
      </span>
    </button>
  );
});

function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className={`animate-spin ${className}`} aria-hidden>
      <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="2" opacity="0.25" fill="none" />
      <path d="M14.4 8A6.4 6.4 0 0 0 8 1.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Compact square icon button — always needs an accessible label. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: number; tone?: "default" | "muted" }
>(function IconButton({ label, size = 34, tone = "default", className = "", children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      title={label}
      aria-label={label}
      style={{ width: size, height: size }}
      className={[
        "inline-flex items-center justify-center rounded-lg transition-colors duration-[120ms]",
        tone === "muted" ? "text-text-tertiary" : "text-text-primary",
        "hover:bg-surface-hover active:bg-[#e0dfdf] disabled:text-text-disabled disabled:hover:bg-transparent",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
});

/* ==================================================================
   SURFACES
   ================================================================== */

export function Card({
  className = "",
  as: Tag = "div",
  children,
  ...rest
}: {
  className?: string;
  as?: "div" | "section" | "article" | "li";
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-2xl bg-surface ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ==================================================================
   FORM CONTROLS
   ================================================================== */

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={[
          "h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-[14px]",
          "placeholder:text-text-muted",
          "transition-[border-color,box-shadow] duration-[120ms]",
          "focus:border-ink focus:outline-none focus:ring-2 focus:ring-black/5",
          "disabled:bg-surface-subtle disabled:text-text-disabled",
          className,
        ].join(" ")}
        {...rest}
      />
    );
  },
);

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-[180ms] ease-[var(--ease-out-symphony)]",
        checked ? "bg-ink" : "bg-[#dcdcdc]",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      <span
        className={[
          // left-0 anchors the knob: a button's UA text-align would
          // otherwise centre its static position and throw the travel off.
          "absolute left-0 top-[3px] h-5 w-5 rounded-full bg-white shadow-sm",
          "transition-transform duration-[180ms] ease-[var(--ease-out-symphony)]",
          checked ? "translate-x-[23px]" : "translate-x-[3px]",
        ].join(" ")}
      />
    </button>
  );
}

/** Segmented control — Tools / Channels. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex items-center gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={[
              "h-[46px] min-w-[97px] rounded-xl px-7 text-[14px] font-semibold",
              "transition-colors duration-[120ms]",
              active
                ? "bg-ink text-white"
                : "bg-surface text-text-tertiary hover:bg-[#fafafa] hover:text-text-primary",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ==================================================================
   DATA DISPLAY
   ================================================================== */

export function ProgressBar({
  value,
  max = 100,
  label,
  tone = "ink",
}: {
  value: number;
  max?: number;
  label: string;
  tone?: "ink" | "brand";
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="h-[7px] w-full overflow-hidden rounded-full bg-surface-sunken"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-[300ms] ease-[var(--ease-out-symphony)] ${
          tone === "brand" ? "bg-brand" : "bg-ink"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const STATUS_TONE = {
  working: { dot: "bg-[#0C6EFC]", text: "text-[#0C6EFC]", bg: "bg-[#E8F1FF]" },
  waiting: { dot: "bg-[#E39112]", text: "text-[#9A5F00]", bg: "bg-[#FFF4E2]" },
  approval: { dot: "bg-[#674FE6]", text: "text-[#4E38C4]", bg: "bg-[#EEEBFC]" },
  completed: { dot: "bg-success", text: "text-success", bg: "bg-[#E6F6F1]" },
  failed: { dot: "bg-danger", text: "text-danger", bg: "bg-danger-soft" },
  offline: { dot: "bg-text-muted", text: "text-text-tertiary", bg: "bg-surface-subtle" },
} as const;

export type StatusKind = keyof typeof STATUS_TONE;

/** Status is never colour alone — the dot always travels with a label. */
export function StatusPill({ kind, children }: { kind: StatusKind; children: ReactNode }) {
  const tone = STATUS_TONE[kind];
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold ${tone.bg} ${tone.text}`}
    >
      <span className={`h-[6px] w-[6px] rounded-full ${tone.dot}`} aria-hidden />
      {children}
    </span>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full bg-surface-subtle px-2.5 text-[12px] font-semibold text-text-secondary ${className}`}
    >
      {children}
    </span>
  );
}

/* ==================================================================
   LOADING / EMPTY / ERROR
   Because this is an AI product, the waiting state has to say who is
   working and on what — never "Loading…".
   ================================================================== */

/** The Symphony ring, rotating — used wherever a widget is still resolving. */
export function RingLoader({ size = 62 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" className="sym-loader" aria-hidden>
      <g fill="#DCDCDC">
        <rect x="129" y="41" width="40" height="40" rx="7" />
        <circle cx="208" cy="88" r="11.5" />
        <circle cx="233" cy="148" r="16.5" />
        <circle cx="211" cy="212" r="14.5" />
        <rect x="133" y="222" width="36" height="36" rx="11" />
        <rect x="71" y="192" width="38" height="38" rx="11" />
        <rect x="39" y="130" width="36" height="36" rx="10" />
        <rect x="66" y="66" width="40" height="40" rx="9" />
      </g>
    </svg>
  );
}

/** Contextual working state: who is doing what, right now. */
export function WorkingState({ agent, task }: { agent: string; task: string }) {
  return (
    <div className="flex items-center gap-3 text-[14px] text-text-tertiary" role="status">
      <RingLoader size={26} />
      <span>
        <span className="font-semibold text-text-primary">{agent}</span> {task}
        <TypingDots />
      </span>
    </div>
  );
}

export function TypingDots() {
  return (
    <span className="ml-1 inline-flex gap-[3px] align-baseline" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-[3px] w-[3px] rounded-full bg-current"
          style={{ animation: `sym-typing 1.3s ${i * 0.16}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-[#e6e6e6] ${className}`} />;
}

/**
 * The product's own failure card. It says what happened, why, and what
 * happens next — never "Error".
 */
export function DidntLoadCard({
  reason = "Something went wrong on our side — it will retry on the next refresh.",
  className = "",
}: {
  reason?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col justify-between rounded-2xl bg-[#e9e9e9] p-6 ${className}`} role="status">
      <RingLoader />
      <div className="mt-8">
        <p className="text-[27px] leading-tight tracking-[-0.02em]">
          <span className="type-display leading-[1.1]">This</span>{" "}
          <span className="type-serif">didn&rsquo;t load</span>
        </p>
        <p className="mt-2 max-w-[34ch] text-[13px] leading-[1.45] text-text-tertiary">{reason}</p>
      </div>
    </div>
  );
}

/** Empty states explain what the area is, why it's empty, what's next. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[46ch] py-16 text-center">
      <h2 className="type-display text-[24px] leading-[1.15]">{title}</h2>
      <p className="mt-3 text-[13.5px] leading-[1.55] text-text-tertiary">{body}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* ==================================================================
   TOOLTIP — for icon-only controls and truncated text only.
   ================================================================== */

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-md transition-opacity duration-[120ms] group-hover/tt:opacity-100 group-focus-within/tt:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
