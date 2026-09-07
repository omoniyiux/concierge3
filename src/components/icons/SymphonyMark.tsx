/**
 * The Symphony mark: a ring of specialists that resolves from square to
 * round as it travels — the agents circling Maestro.
 */
export function SymphonyMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect width="300" height="300" rx="76" fill="#B9FD82" />
      <g fill="#333333">
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

/** Wordmark lock-up used in the expanded sidebar, with its lime bracket. */
export function SymphonyWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <span className="relative flex items-center">
        <span
          aria-hidden
          className="absolute -left-[7px] top-1/2 h-[38px] w-[10px] -translate-y-1/2 rounded-l-full border-y-2 border-l-2 border-brand"
        />
        <SymphonyMark size={30} title="Symphony" />
      </span>
      <span className="type-display text-[21px] leading-none tracking-[-0.045em]">Symphony</span>
      <span
        aria-hidden
        className="ml-0.5 h-[34px] w-[9px] rounded-r-full border-y-2 border-r-2 border-brand"
      />
    </div>
  );
}
