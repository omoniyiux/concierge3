/** The Concierge mark: a C that opens, and the plus that means it can act. */
export function ConciergeMark({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="15" fill="#0B0B0C" />
      <path
        d="M 49.835 48.059 A 24 24 0 1 1 49.835 15.941 L 43.519 21.628 A 15.5 15.5 0 1 0 43.519 42.372 Z"
        fill="#FF7A00"
      />
      <path
        d="M 49 24 H 53 V 30 H 59 V 34 H 53 V 40 H 49 V 34 H 43 V 30 H 49 Z"
        fill="#FFB347"
      />
    </svg>
  );
}

export function ConciergeWordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <ConciergeMark size={30} />
      <span
        className="text-[21px] font-bold tracking-[-0.035em]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Concierge
      </span>
    </span>
  );
}

/** Monogram used for site avatars — initials on a warm neutral tile. */
export function SiteMark({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="inline-flex shrink-0 items-center justify-center rounded-[7px] bg-surface-subtle font-semibold tracking-tight text-text-secondary"
      aria-hidden
    >
      {initials}
    </span>
  );
}
