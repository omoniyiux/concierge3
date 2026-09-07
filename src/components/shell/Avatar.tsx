/** Profile portrait placeholder — neutral, and it never carries meaning alone. */
export function Avatar({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="Olaifa Promise">
        <defs>
          <linearGradient id="sym-av-bg" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#5A4C63" />
            <stop offset="1" stopColor="#2A2230" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" fill="url(#sym-av-bg)" />
        <path d="M2 64c3.5-13 14-20 30-20s26.5 7 30 20H2Z" fill="#C0392B" />
        <circle cx="32" cy="29" r="12" fill="#8A5638" />
        <path
          d="M20.6 25.5C21.2 18.6 26 14.5 32 14.5s10.8 4.1 11.4 11c-2.6-4.2-6.5-6.3-11.4-6.3s-8.8 2.1-11.4 6.3Z"
          fill="#1F1A20"
        />
      </svg>
    </span>
  );
}
