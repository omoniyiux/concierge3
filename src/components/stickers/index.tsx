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
      <path
        d="M20 46h24l-4-19H24l-4 19Z"
        fill="#B7E4C7"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M24 27h16l-1.4 6.6H25.4L24 27Z" fill="#7BC99B" />
      <circle cx="32" cy="21" r="5.4" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="M43 12.5a13 13 0 0 1 0 17M21 12.5a13 13 0 0 0 0 17"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M17 47h30" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Site Brain — a stack of what the business knows. */
export function KnowledgeSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M14 40.5 32 48l18-7.5"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="#FFD9AE"
      />
      <path
        d="M14 32.5 32 40l18-7.5"
        fill="#FFC07A"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M32 17 50 24.5 32 32l-18-7.5L32 17Z"
        fill="#FF9A3C"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
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
      <path
        d="m26 32-5 4.5 5 4.5M38 32l5 4.5-5 4.5M34.5 30.5l-5 12"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Routing — handing the request onward. */
export function RoutingSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M52 15 12 29l16 6 6 15 18-35Z"
        fill="#FFC9C2"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M52 15 28 35l6 15 18-35Z"
        fill="#FF8B7A"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M52 15 28 35" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** A conversation that went well. */
export function ChatSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M12 22a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v11a6 6 0 0 1-6 6H26l-9 7v-7h-1a4 4 0 0 1-4-4V22Z"
        fill="#FFD9AE"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
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
      <path
        d="M13 48a15 15 0 0 1 26-10.4"
        fill="#FFC07A"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="45" cy="41" r="9" fill="#B7E4C7" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="m41 41 3 3 5.5-5.5"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Something needs a person. */
export function AlertSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M32 13 53 47H11L32 13Z"
        fill="#FFC9C2"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M32 26v10" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="41" r="2.1" fill={STROKE} />
    </svg>
  );
}

/** An opportunity the product spotted. */
export function SparkSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M28 10l4.4 11.6L44 26l-11.6 4.4L28 42l-4.4-11.6L12 26l11.6-4.4L28 10Z"
        fill="#FF9A3C"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M46 34l2 5.4 5.4 2-5.4 2-2 5.4-2-5.4-5.4-2 5.4-2 2-5.4Z"
        fill="#FFD9AE"
        stroke={STROKE}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
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
      <path
        d="m23 32.5 6.5 6.5L42 26.5"
        stroke={STROKE}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================================
   ROLE STICKERS — one per Agent persona.
   ========================================================================== */

/** Receptionist — the desk bell. */
export function ReceptionistSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M15 41a17 17 0 0 1 34 0H15Z"
        fill="#FFD9AE"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M22 41a10 10 0 0 1 20 0H22Z" fill="#FFC07A" />
      <rect x="10" y="41" width="44" height="7" rx="3.5" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
      <circle cx="32" cy="21" r="4" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
      <path d="M13 53h38" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Sales assistant — demand going up and to the right. */
export function SalesSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="11" y="36" width="11" height="14" rx="2" fill="#FFD9AE" stroke={STROKE} strokeWidth="2.6" />
      <rect x="26" y="28" width="11" height="22" rx="2" fill="#FFC07A" stroke={STROKE} strokeWidth="2.6" />
      <rect x="41" y="18" width="11" height="32" rx="2" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
      <path d="M8 54h48" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M46.5 8.5 51 13l-4.5 4.5"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 20a26 26 0 0 1 35-7" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Customer service — someone wearing the headset. */
export function SupportSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M14 34v-3a18 18 0 0 1 36 0v3" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <rect x="7" y="30" width="13" height="19" rx="6" fill="#BFE3FF" stroke={STROKE} strokeWidth="2.6" />
      <rect x="44" y="30" width="13" height="19" rx="6" fill="#7FC4F5" stroke={STROKE} strokeWidth="2.6" />
      <path d="M50 49v2a5 5 0 0 1-5 5h-6" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="34" cy="56" r="4" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
    </svg>
  );
}

/** Knowledge assistant — the open book. */
export function BookSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M32 21c-4.5-4-11.5-6-18-5v29c6.5-1 13.5 1 18 5V21Z"
        fill="#DDE7FF"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M32 21c4.5-4 11.5-6 18-5v29c-6.5-1-13.5 1-18 5V21Z"
        fill="#B7CCFA"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M32 21v29" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M21 27h5M21 34h5" stroke={STROKE} strokeWidth="2.2" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

/** Custom — write it yourself. */
export function PencilSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M18 42 40 20l6 6-22 22-9 3 3-9Z"
        fill="#FFD9AE"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="m40 20 5-5a4.2 4.2 0 0 1 6 6l-5 5-6-6Z"
        fill="#FF9A3C"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="m15 45 4 4" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M13 56h38" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/* ============================================================================
   ACTION STICKERS — one per kind of job Concierge can finish.
   ========================================================================== */

/** Booking — a date being held. */
export function CalendarSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="9" y="16" width="46" height="38" rx="5" fill="#DDE7FF" stroke={STROKE} strokeWidth="2.6" />
      <path d="M9 27h46" stroke={STROKE} strokeWidth="2.6" />
      <path d="M11 21a5 5 0 0 1 5-5h32a5 5 0 0 1 5 5v6H11v-6Z" fill="#7FA8F5" />
      <path d="M21 10v9M43 10v9" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="m23 41 6 6 13-13"
        stroke={STROKE}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Quote — a priced document. */
export function QuoteSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M14 13a5 5 0 0 1 5-5h17l14 14v30a5 5 0 0 1-5 5H19a5 5 0 0 1-5-5V13Z"
        fill="#FFE9A8"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M36 8l14 14H40a4 4 0 0 1-4-4V8Z"
        fill="#FFD25E"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M22 32h20M22 40h13" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" opacity=".55" />
      <circle cx="46" cy="45" r="10" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="M49 41h-4a2.5 2.5 0 0 0 0 5h2a2.5 2.5 0 0 1 0 5h-4M46 39v12"
        stroke={STROKE}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Call — the fastest handoff. */
export function PhoneSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <g transform="translate(4.5 4.5) scale(2.29)">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"
          fill="#B7E4C7"
          stroke={STROKE}
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="47" cy="17" r="6" fill="#3FA96F" stroke={STROKE} strokeWidth="2.6" />
    </svg>
  );
}

/** Lead capture — details worth keeping. */
export function ContactSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="8" y="15" width="48" height="34" rx="5" fill="#EDE7FF" stroke={STROKE} strokeWidth="2.6" />
      <circle cx="24" cy="28" r="6" fill="#B3A2F2" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="M15 42a9 9 0 0 1 18 0"
        fill="#B3A2F2"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M39 27h10M39 35h7" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Payment — money taken up front. */
export function PaymentSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="7" y="18" width="50" height="30" rx="5" fill="#C4EDE6" stroke={STROKE} strokeWidth="2.6" />
      <path d="M7 25h50v7H7z" fill="#5FC3AE" />
      <path d="M7 25h50M7 32h50" stroke={STROKE} strokeWidth="2.6" />
      <rect x="14" y="38" width="14" height="4.5" rx="2.25" fill={STROKE} opacity=".55" />
      <circle cx="46" cy="41" r="3.4" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.2" />
    </svg>
  );
}

/** Offer — a promotion at the right moment. */
export function TagSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M31 10h17a5 5 0 0 1 5 5v17a4 4 0 0 1-1.2 2.9L33 53.6a4 4 0 0 1-5.7 0L10.4 36.7a4 4 0 0 1 0-5.7l17.7-19.8A4 4 0 0 1 31 10Z"
        fill="#FFD1E3"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="43" cy="21" r="4.4" fill="#F0709F" stroke={STROKE} strokeWidth="2.6" />
      <path d="m24 34 10 10" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

/** Video — a remote consultation. */
export function VideoSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="7" y="20" width="34" height="26" rx="6" fill="#DED5FF" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="M43 29.5 55 22v22l-12-7.5v-7Z"
        fill="#A48CF0"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="30" r="4" fill="#A48CF0" stroke={STROKE} strokeWidth="2.2" />
    </svg>
  );
}

/* ============================================================================
   DESTINATION STICKERS — where a routed request actually lands.
   ========================================================================== */

/** Email — the envelope, on its way. */
export function MailSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="7" y="16" width="50" height="34" rx="5" fill="#DDE7FF" stroke={STROKE} strokeWidth="2.6" />
      <path d="M8 19 32 36 56 19" fill="#7FA8F5" stroke={STROKE} strokeWidth="2.6" strokeLinejoin="round" />
      <path
        d="m10 47 15-12M54 47 39 35"
        stroke={STROKE}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity=".45"
      />
    </svg>
  );
}

/** Webhook — two ends of a connection, plugged together. */
export function WebhookSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="8" y="24" width="23" height="17" rx="5" fill="#DED5FF" stroke={STROKE} strokeWidth="2.6" />
      <rect x="33" y="24" width="23" height="17" rx="5" fill="#A48CF0" stroke={STROKE} strokeWidth="2.6" />
      <path d="M31 32.5h2" stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      <path d="M15 24v-7M24 24v-7M40 41v7M49 41v7" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/** Inbox — the tray it drops into. */
export function InboxSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M11 33 17 14h30l6 19v13a4 4 0 0 1-4 4H15a4 4 0 0 1-4-4V33Z"
        fill="#FFE9A8"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M11 33h11a3.5 3.5 0 0 1 3.5 3.5A3.5 3.5 0 0 0 29 40h6a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 1 42 33h11"
        fill="#FFD25E"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================================
   LIMIT & OUTCOME STICKERS
   ========================================================================== */

/** A hard limit — the shield that says no. */
export function ShieldSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M32 8l20 7.5V30c0 12.5-8.2 21-20 25-11.8-4-20-12.5-20-25V15.5L32 8Z"
        fill="#FFC9C2"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M32 8l20 7.5V30c0 12.5-8.2 21-20 25V8Z" fill="#FF8B7A" />
      <path d="M23 31h18" stroke={STROKE} strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );
}

/** Handing the visitor to a person. */
export function HandoffSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path d="M20 20a17 17 0 0 1 24 0" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="m39 14 5.5 5.5-6 4"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="33" r="7" fill="#FFD9AE" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="M5 54a12 12 0 0 1 24 0Z"
        fill="#FFC07A"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="47" cy="33" r="7" fill="#B7E4C7" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="M35 54a12 12 0 0 1 24 0Z"
        fill="#7BC99B"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** High intent — the one worth calling first. */
export function FlameSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M32 7c10 9 15 16 15 23a15 15 0 0 1-30 0c0-5 2-9.5 6-13.5.6 4 2.6 7 5 8.5C26 19 27.5 12.5 32 7Z"
        fill="#FF9A3C"
        stroke={STROKE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M32 33c4 4.5 6 7.5 6 10.5a6 6 0 0 1-12 0c0-3 2-6 6-10.5Z"
        fill="#FFD25E"
        stroke={STROKE}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A score out of a hundred. */
export function TargetSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="32" cy="32" r="21" fill="#DDE7FF" stroke={STROKE} strokeWidth="2.6" />
      <circle cx="32" cy="32" r="13" fill="#7FA8F5" stroke={STROKE} strokeWidth="2.6" />
      <circle cx="32" cy="32" r="5" fill="#FF9A3C" stroke={STROKE} strokeWidth="2.6" />
    </svg>
  );
}

/** Approved and in use. */
export function ApprovedSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="32" cy="32" r="20" fill="#B7E4C7" stroke={STROKE} strokeWidth="2.6" />
      <circle cx="32" cy="32" r="13" fill="#7BC99B" />
      <path
        d="m24 32.5 6 6L42 26"
        stroke={STROKE}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Waiting on a person to read it. */
export function PendingSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="32" cy="32" r="20" fill="#FFE9A8" stroke={STROKE} strokeWidth="2.6" />
      <path d="M32 19v13l9 6" stroke={STROKE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Something with no source behind it. */
export function GapSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="32" cy="32" r="20" fill="#EDEDED" stroke={STROKE} strokeWidth="2.6" strokeDasharray="6 5" />
      <path
        d="M26 26a6.2 6.2 0 0 1 11.6 3c0 4-5.6 4.4-5.6 8"
        stroke={STROKE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="43" r="2.3" fill={STROKE} />
    </svg>
  );
}

/** Off limits — restricted knowledge. */
export function RestrictedSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="14" y="29" width="36" height="25" rx="5" fill="#FFC9C2" stroke={STROKE} strokeWidth="2.6" />
      <path d="M22 29v-6a10 10 0 0 1 20 0v6" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="32" cy="41" r="4" fill="#E2503C" stroke={STROKE} strokeWidth="2.2" />
    </svg>
  );
}

/** Follow-up work, on a board. Distinct from the paper plane, which is a
 *  message in flight rather than a task waiting to be picked up. */
export function TaskSticker({ size = 44, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="12" y="12" width="40" height="44" rx="5" fill="#DED5FF" stroke={STROKE} strokeWidth="2.6" />
      <rect x="23" y="7" width="18" height="10" rx="3" fill="#A48CF0" stroke={STROKE} strokeWidth="2.6" />
      <path
        d="m20 30 4 4 8-8"
        stroke={STROKE}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M37 30h8" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M20 44h25" stroke={STROKE} strokeWidth="2.6" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}
