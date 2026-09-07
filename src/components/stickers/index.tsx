/* ============================================================================
   STICKERS
   Chunky, outlined, slightly dimensional — the friendly counterweight to the
   line icons used in navigation. Drawn in-house so nothing here carries a
   third-party licence, and so they sit on Concierge's own palette.

   Use them sparingly: one per statement, at moments where the product is
   telling you something rather than offering a control.
   ========================================================================== */

type P = { size?: number; className?: string };
const box = (s: number) => ({
  width: s,
  height: s,
  viewBox: "0 0 64 64",
  fill: "none" as const,
  "aria-hidden": true as const,
});

const STROKE = "#1A1A1A";

/** Live — a beacon putting out signal. */
export function LiveSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M20 46h24l-4-19H24l-4 19Z" fill="#B7E4C7" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M24 27h16l-1.4 6.6H25.4L24 27Z" fill="#7BC99B" />
      <circle cx="32" cy="21" r="5.4" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
      <path d="M43 12.5a13 13 0 0 1 0 17M21 12.5a13 13 0 0 0 0 17" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 47h30" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Site Brain — a stack of what the business knows. */
export function KnowledgeSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M14 40.5 32 48l18-7.5" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" fill="#FFD9AE" />
      <path d="M14 32.5 32 40l18-7.5" fill="#FFC07A" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 17 50 24.5 32 32l-18-7.5L32 17Z" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="32" cy="24.5" r="2.6" fill={STROKE} />
    </svg>
  );
}

/** Install — the snippet, on a chip. */
export function InstallSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="11" y="17" width="42" height="30" rx="6" fill="#D9E4FF" stroke={STROKE} strokeWidth="2.6" />
      <path d="M11 25h42" stroke={STROKE} strokeWidth="2.6" />
      <circle cx="17.5" cy="21" r="1.7" fill={STROKE} />
      <circle cx="23.5" cy="21" r="1.7" fill={STROKE} />
      <path d="m26 32-5 4.5 5 4.5M38 32l5 4.5-5 4.5M34.5 30.5l-5 12" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Routing — handing the request onward. */
export function RoutingSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M52 15 12 29l16 6 6 15 18-35Z" fill="#FFC9C2" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M52 15 28 35l6 15 18-35Z" fill="#FF8B7A" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M52 15 28 35" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** A conversation that went well. */
export function ChatSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M12 22a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v11a6 6 0 0 1-6 6H26l-9 7v-7h-1a4 4 0 0 1-4-4V22Z" fill="#FFD9AE" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M23 26h14M23 32h9" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="47" cy="19" r="6" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
    </svg>
  );
}

/** A lead worth calling. */
export function LeadSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="28" cy="23" r="8" fill="#FFD9AE" stroke={STROKE} strokeWidth="2.6" />
      <path d="M13 48a15 15 0 0 1 26-10.4" fill="#FFC07A" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="45" cy="41" r="9" fill="#B7E4C7" stroke={STROKE} strokeWidth="2.6" />
      <path d="m41 41 3 3 5.5-5.5" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Something needs a person. */
export function AlertSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M32 13 53 47H11L32 13Z" fill="#FFC9C2" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M32 26v10" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="41" r="2.1" fill={STROKE} />
    </svg>
  );
}

/** An opportunity the product spotted. */
export function SparkSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M28 10l4.4 11.6L44 26l-11.6 4.4L28 42l-4.4-11.6L12 26l11.6-4.4L28 10Z" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M46 34l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z" fill="#FFD9AE" stroke={STROKE} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Semantic aliases. Surfaces reach for meaning ("this needs review"), not
   for a drawing ("a triangle"), so the vocabulary stays stable if the art
   is ever redrawn.
   ------------------------------------------------------------------------- */
export const WarningSticker = AlertSticker;
export const ReviewSticker = KnowledgeSticker;
export const OpportunitySticker = SparkSticker;

/** Nothing needs the owner — used when the attention list is empty. */
export function AllClearSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="32" cy="32" r="19" fill="#B7E4C7" stroke={STROKE} strokeWidth="2.6" />
      <path d="m23 32.5 6.5 6.5L42 26.5" stroke={STROKE} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
