/* ============================================================================
   ATTENTION STICKERS
   Dimensional, warm and specific — a broken connection, a page under review,
   an idea worth chasing. Soft gradients with a lighter top face and a darker
   base give them weight without a drop shadow.

   Drawn in-house: nothing here needs a licence or an attribution line. If you
   would rather use purchased art, drop the SVGs in /public/stickers and swap
   the bodies — the call sites take a `size` prop and nothing else.
   ========================================================================== */

type P = { size?: number; className?: string };
const box = (s: number) => ({
  width: s,
  height: s,
  viewBox: "0 0 72 72",
  fill: "none" as const,
  "aria-hidden": true as const,
});

/** Needs fixing — the cable pulled out of the socket. Reads at 36px, which a
 *  broken-chain motif does not. */
export function BrokenLinkSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <defs>
        <linearGradient id="cg-brk-socket" x1="8" y1="20" x2="30" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB3A5" />
          <stop offset="1" stopColor="#E2503C" />
        </linearGradient>
        <linearGradient id="cg-brk-plug" x1="44" y1="20" x2="66" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9585" />
          <stop offset="1" stopColor="#D8422E" />
        </linearGradient>
      </defs>

      {/* socket, left */}
      <rect x="6" y="23" width="22" height="26" rx="7" fill="url(#cg-brk-socket)" />
      <rect x="24" y="30" width="8" height="5" rx="2.5" fill="#E2503C" />
      <rect x="24" y="37" width="8" height="5" rx="2.5" fill="#E2503C" />
      <path d="M13 29a4 4 0 0 1 4-3" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" opacity=".7" />

      {/* plug, right, pulled clear */}
      <rect x="44" y="23" width="22" height="26" rx="7" fill="url(#cg-brk-plug)" />
      <rect x="40" y="30" width="8" height="5" rx="2.5" fill="#D8422E" />
      <rect x="40" y="37" width="8" height="5" rx="2.5" fill="#D8422E" />

      {/* the gap, and the spark across it */}
      <path
        d="M37 27.5 33.5 36l5 1.5L35 45"
        stroke="#FFC46B"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Needs review — a page waiting to be read and approved. */
export function ReviewSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <defs>
        <linearGradient id="cg-rev-page" x1="16" y1="10" x2="52" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE6BE" />
          <stop offset="1" stopColor="#EFB25E" />
        </linearGradient>
        <linearGradient id="cg-rev-lens" x1="36" y1="34" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFF0D4" stopOpacity=".8" />
        </linearGradient>
      </defs>

      <path
        d="M17 15a5 5 0 0 1 5-5h17.6L52 22.6V57a5 5 0 0 1-5 5H22a5 5 0 0 1-5-5V15Z"
        fill="url(#cg-rev-page)"
      />
      <path d="M39.6 10 52 22.6H43a3.4 3.4 0 0 1-3.4-3.4V10Z" fill="#FFF3DD" />
      <path d="M25 30h18M25 38h13" stroke="#C98A2E" strokeWidth="3.2" strokeLinecap="round" opacity=".55" />

      <circle cx="44" cy="44" r="12" fill="url(#cg-rev-lens)" stroke="#C98A2E" strokeWidth="3.6" />
      <path d="m53 53 6.5 6.5" stroke="#C98A2E" strokeWidth="5" strokeLinecap="round" />
      <path d="M39 40a6.5 6.5 0 0 1 5-2.6" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Opportunity — the idea sitting in the gap. */
export function IdeaSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <defs>
        <linearGradient id="cg-idea-a" x1="22" y1="8" x2="50" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC46B" />
          <stop offset="1" stopColor="#F58A16" />
        </linearGradient>
        <linearGradient id="cg-idea-glass" x1="26" y1="12" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M36 8a18 18 0 0 1 11 32.2c-1.4 1.1-2.2 2.7-2.2 4.4V47H27.2v-2.4c0-1.7-.8-3.3-2.2-4.4A18 18 0 0 1 36 8Z"
        fill="url(#cg-idea-a)"
      />
      <path
        d="M36 8a18 18 0 0 0-11 32.2c1.4 1.1 2.2 2.7 2.2 4.4V47h6V26.5L28.6 20a1.8 1.8 0 0 1 2.6-2.5L36 22.2V8Z"
        fill="url(#cg-idea-glass)"
      />
      <path
        d="M36 47V26.6M36 26.6l-5.6-5.6M36 26.6l5.6-5.6"
        stroke="#FFF6E6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <rect x="27" y="49" width="18" height="6.4" rx="3.2" fill="#D97A0B" />
      <rect x="29.6" y="57.6" width="12.8" height="6" rx="3" fill="#B9640A" />

      <path
        d="M58 20h5M55.5 10.5 59 7M14 20H9M16.5 10.5 13 7"
        stroke="#FFC46B"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
